# Authentication Standards

## Authentication Provider

This project uses **Clerk** exclusively for all authentication.

### Rules

- **ONLY** use Clerk for authentication
- **NO** custom auth implementations (NextAuth.js, Auth.js, custom JWT, etc.)
- All Clerk configuration should be done via the Clerk Dashboard

---

## Clerk Setup

### ClerkProvider

The entire application must be wrapped with `ClerkProvider` in the root layout:

```tsx
// src/app/layout.tsx

import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Environment Variables

Required Clerk environment variables in `.env.local`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

---

## Server-Side Authentication

**ALL server-side authentication MUST use the helper function in `/lib/auth.ts`.**

### The `getCurrentUserId` Function

```tsx
// src/lib/auth.ts

import { auth } from "@clerk/nextjs/server";

export async function getCurrentUserId(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  return userId;
}
```

### Usage in Server Components

```tsx
// CORRECT: Use getCurrentUserId() for server-side auth
import { getCurrentUserId } from "@/lib/auth";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  // Use userId for data fetching...
}
```

### Usage in Data Helper Functions

```tsx
// CORRECT: Use getCurrentUserId() in /data functions
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

## Client-Side Components

### Available Clerk Components

Use these pre-built Clerk components for authentication UI:

| Component | Purpose |
|-----------|---------|
| `<SignInButton />` | Triggers sign-in flow |
| `<SignUpButton />` | Triggers sign-up flow |
| `<SignOutButton />` | Signs out the user |
| `<UserButton />` | User profile dropdown with sign-out |
| `<SignedIn>` | Renders children only when signed in |
| `<SignedOut>` | Renders children only when signed out |

### Import Location

```tsx
// Client components import from @clerk/nextjs
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
```

### Example Usage

```tsx
"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export function AuthHeader() {
  return (
    <div>
      <SignedOut>
        <SignInButton mode="modal" />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );
}
```

---

## Import Locations

| Context | Import From |
|---------|-------------|
| Server Components / Server Actions | `@clerk/nextjs/server` |
| Client Components | `@clerk/nextjs` |

### Server Import

```tsx
import { auth, currentUser } from "@clerk/nextjs/server";
```

### Client Import

```tsx
import { useUser, useAuth, SignInButton } from "@clerk/nextjs";
```

---

## Summary

| Requirement | Rule |
|-------------|------|
| Auth provider | Clerk ONLY |
| Server-side auth | Use `getCurrentUserId()` from `@/lib/auth` |
| Client-side auth | Use Clerk components from `@clerk/nextjs` |
| Custom auth | NOT allowed |
