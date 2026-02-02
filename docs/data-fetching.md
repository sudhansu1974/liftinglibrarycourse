# Data Fetching Standards

## CRITICAL: Server Components Only

**ALL data fetching in this application MUST be done via Server Components.**

This is a strict requirement with no exceptions.

### Prohibited Data Fetching Methods

Do NOT fetch data using any of the following:
- Route Handlers (`app/api/*`)
- Client Components (`"use client"` files)
- `useEffect` + `fetch`
- React Query, SWR, or similar client-side fetching libraries
- Any other client-side data fetching approach

### Required Approach

```tsx
// CORRECT: Data fetching in a Server Component
// app/dashboard/page.tsx

import { getUserWorkouts } from "@/data/workouts";

export default async function DashboardPage() {
  const workouts = await getUserWorkouts();

  return <WorkoutList workouts={workouts} />;
}
```

---

## Database Queries: The `/data` Directory

**ALL database queries MUST be performed via helper functions in the `/data` directory.**

### Requirements

1. **Use Drizzle ORM** - All queries must use Drizzle ORM
2. **NO raw SQL** - Never write raw SQL queries
3. **Location** - All database helper functions live in `/data`

### Example Structure

```
src/
  data/
    workouts.ts    # Workout-related queries
    exercises.ts   # Exercise-related queries
    users.ts       # User-related queries
```

### Example Helper Function

```tsx
// src/data/workouts.ts

import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth";

export async function getUserWorkouts() {
  const userId = await getCurrentUserId();

  return db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}
```

---

## CRITICAL: User Data Isolation

**A logged-in user can ONLY access their own data. They MUST NOT be able to access any other user's data.**

### Mandatory Security Rules

1. **Always filter by userId** - Every query must include a `userId` filter
2. **Get userId from auth** - Never trust user-provided IDs from request parameters
3. **Server-side verification** - All data access is verified on the server

### Correct Pattern

```tsx
// CORRECT: Always filter by the authenticated user's ID
export async function getUserWorkout(workoutId: string) {
  const userId = await getCurrentUserId();

  return db
    .select()
    .from(workouts)
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
// WRONG: Missing user isolation - allows access to any user's data
export async function getWorkout(workoutId: string) {
  return db
    .select()
    .from(workouts)
    .where(eq(workouts.id, workoutId));  // SECURITY VULNERABILITY
}
```

---

## Summary

| Requirement | Rule |
|-------------|------|
| Data fetching | Server Components ONLY |
| Database access | `/data` helper functions ONLY |
| ORM | Drizzle ORM ONLY (no raw SQL) |
| User data | ALWAYS filter by authenticated userId |
