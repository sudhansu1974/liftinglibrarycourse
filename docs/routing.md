# Routing Standards

## Route Structure

All application routes must be accessed via the `/dashboard` path prefix.

### Rules

- **ALL** authenticated app routes must be under `/dashboard`
- The root `/dashboard` page and **ALL** sub-pages are protected routes
- Only logged-in users can access `/dashboard/*` routes
- Unauthenticated users should be redirected to the sign-in page

---

## Protected Routes

The following routes require authentication:

| Route | Description |
|-------|-------------|
| `/dashboard` | Main dashboard page |
| `/dashboard/*` | All sub-routes under dashboard |

### Example Route Structure

```
/dashboard                    # Main dashboard (protected)
/dashboard/workout/[id]       # View/edit workout (protected)
/dashboard/workout/create     # Create new workout (protected)
/dashboard/settings           # User settings (protected)
```

---

## Route Protection via Middleware

Route protection **MUST** be implemented using Next.js middleware with Clerk's `clerkMiddleware`.

### Middleware Setup

```tsx
// middleware.ts (root of project)

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
```

### How It Works

1. `createRouteMatcher` creates a matcher for `/dashboard` and all sub-routes
2. `clerkMiddleware` intercepts all requests
3. For protected routes, `auth.protect()` checks authentication
4. Unauthenticated users are automatically redirected to Clerk's sign-in page

---

## Public Routes

Routes that do NOT require authentication:

| Route | Description |
|-------|-------------|
| `/` | Landing/home page |
| `/sign-in` | Clerk sign-in page |
| `/sign-up` | Clerk sign-up page |

---

## Summary

| Requirement | Rule |
|-------------|------|
| App routes | Must be under `/dashboard` |
| Route protection | Use Next.js middleware with Clerk |
| Protected routes | `/dashboard` and all sub-routes |
| Auth redirect | Handled automatically by `auth.protect()` |
