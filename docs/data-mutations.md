# Data Mutations Standards

## CRITICAL: Server Actions Only

**ALL data mutations in this application MUST be done via Server Actions.**

This is a strict requirement with no exceptions.

### Prohibited Mutation Methods

Do NOT mutate data using any of the following:
- Route Handlers (`app/api/*`)
- Client-side fetch calls to external APIs
- Direct database calls from components

### Required Approach

All mutations flow through Server Actions that call data helper functions.

---

## Server Actions: Colocated `actions.ts` Files

**ALL Server Actions MUST be defined in colocated `actions.ts` files.**

### Requirements

1. **File naming** - Always name the file `actions.ts`
2. **Colocation** - Place `actions.ts` in the same directory as the page that uses it
3. **"use server" directive** - Every `actions.ts` file must start with `"use server"`

### Example Structure

```
src/app/
  dashboard/
    page.tsx       # Page component
    actions.ts     # Server actions for this page
  workouts/
    [id]/
      page.tsx
      actions.ts
```

---

## CRITICAL: Typed Parameters (NO FormData)

**Server Action parameters MUST be typed. Do NOT use `FormData` as a parameter type.**

### Why?

- Type safety at compile time
- Better IDE autocompletion
- Clearer API contracts
- Easier testing

### Correct Pattern

```tsx
// CORRECT: Typed parameters
export async function createWorkoutAction(data: {
  date: string;
  exerciseDefinitionId: number;
  sets: SetInput[];
}): Promise<ActionResult> {
  // ...
}
```

### WRONG Pattern

```tsx
// WRONG: FormData parameter
export async function createWorkoutAction(
  formData: FormData
): Promise<ActionResult> {
  // ...
}

// WRONG: Using _prevState with FormData (useActionState pattern)
export async function createWorkoutAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  // ...
}
```

### Calling Server Actions from Client Components

```tsx
"use client";

import { createWorkoutAction } from "./actions";

export function WorkoutForm() {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const result = await createWorkoutAction({
      date: "2024-01-15",
      exerciseDefinitionId: 1,
      sets: [{ weight: "100", reps: 10, isWarmup: false }],
    });

    if (!result.success) {
      // Handle error
    }
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## CRITICAL: Zod Validation

**ALL Server Actions MUST validate their arguments using Zod.**

Never trust client input. Always validate on the server.

### Requirements

1. **Define schemas** - Create Zod schemas for all action inputs
2. **Use safeParse** - Always use `safeParse` to handle validation errors gracefully
3. **Return errors** - Return validation errors to the client for display

### Complete Example

```tsx
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createWorkout } from "@/data/workouts";

// Define Zod schemas
const setSchema = z.object({
  weight: z.string().min(1, "Weight is required"),
  reps: z.coerce.number().int().positive("Reps must be positive"),
  isWarmup: z.boolean(),
});

const createWorkoutSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  exerciseDefinitionId: z.coerce.number().int().positive("Exercise is required"),
  sets: z.array(setSchema).min(1, "At least one set is required"),
});

// Define return type
export type ActionResult = {
  success: boolean;
  error?: string;
};

// Server action with typed params and Zod validation
export async function createWorkoutAction(data: {
  date: string;
  exerciseDefinitionId: number;
  sets: { weight: string; reps: number; isWarmup: boolean }[];
}): Promise<ActionResult> {
  // ALWAYS validate with Zod
  const result = createWorkoutSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || "Invalid input",
    };
  }

  try {
    // Call data helper function
    await createWorkout(
      result.data.date,
      result.data.exerciseDefinitionId,
      result.data.sets
    );

    revalidatePath("/workouts");

    return { success: true };
  } catch (error) {
    console.error("Failed to create workout:", error);
    return {
      success: false,
      error: "Failed to save workout. Please try again.",
    };
  }
}
```

---

## Database Mutations: The `/data` Directory

**ALL database mutations MUST be performed via helper functions in the `/data` directory.**

### Requirements

1. **Use Drizzle ORM** - All mutations must use Drizzle ORM
2. **NO raw SQL** - Never write raw SQL queries
3. **Location** - All database helper functions live in `/data`
4. **User isolation** - Always filter by authenticated userId

### CRITICAL: No Transactions (neon-http driver)

**This project uses the `neon-http` driver which does NOT support transactions.**

Do NOT use `db.transaction()` - it will throw an error:
```
Error: No transactions support in neon-http driver
```

Instead, perform sequential inserts directly with the `db` instance.

### Example Helper Function

```tsx
// src/data/workouts.ts
import { db } from "@/db";
import { workouts, workoutExercises, sets } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";

export async function createWorkout(
  date: string,
  exerciseDefinitionId: number,
  setsData: SetInput[]
) {
  const userId = await getCurrentUserId();

  // Sequential inserts (NO transactions with neon-http)
  const [workout] = await db
    .insert(workouts)
    .values({
      userId,
      workoutDate: date,
    })
    .returning();

  const [workoutExercise] = await db
    .insert(workoutExercises)
    .values({
      workoutId: workout.id,
      exerciseDefinitionId,
      order: 0,
    })
    .returning();

  // ... additional inserts

  return workout;
}

export async function deleteWorkout(workoutId: number) {
  const userId = await getCurrentUserId();

  // ALWAYS include userId filter for security
  return db
    .delete(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId)
      )
    );
}
```

---

## CRITICAL: User Data Isolation

**A logged-in user can ONLY mutate their own data. They MUST NOT be able to modify any other user's data.**

### Mandatory Security Rules

1. **Always filter by userId** - Every mutation must verify ownership
2. **Get userId from auth** - Never trust user-provided IDs from request parameters
3. **Server-side verification** - All mutations are verified on the server

### Correct Pattern

```tsx
// CORRECT: Always verify ownership before mutation
export async function deleteWorkout(workoutId: number) {
  const userId = await getCurrentUserId();

  return db
    .delete(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId)  // REQUIRED: User isolation
      )
    );
}
```

### WRONG Pattern

```tsx
// WRONG: Missing user isolation - allows deleting any user's data
export async function deleteWorkout(workoutId: number) {
  return db
    .delete(workouts)
    .where(eq(workouts.id, workoutId));  // SECURITY VULNERABILITY
}
```

---

## Revalidation

After successful mutations, use `revalidatePath` or `revalidateTag` to refresh cached data.

```tsx
import { revalidatePath } from "next/cache";

export async function createWorkoutAction(data: CreateWorkoutInput): Promise<ActionResult> {
  // ... validation and mutation

  revalidatePath("/dashboard");

  return { success: true };
}
```

---

## Summary

| Requirement | Rule |
|-------------|------|
| Mutation method | Server Actions ONLY |
| Action location | Colocated `actions.ts` files |
| Parameters | Typed objects (NO FormData) |
| Validation | Zod validation REQUIRED |
| Database access | `/data` helper functions ONLY |
| ORM | Drizzle ORM ONLY (no raw SQL) |
| Transactions | NOT supported (neon-http driver) |
| User data | ALWAYS filter by authenticated userId |
