# UI Coding Standards

## Component Library

This project uses **shadcn/ui** exclusively for all UI components.

### Rules

- **ONLY** use shadcn/ui components for building the UI
- **NO** custom components should be created
- If a UI pattern is needed, find the appropriate shadcn/ui component or composition of shadcn/ui components
- Install shadcn/ui components as needed via `npx shadcn@latest add <component>`

### Available Components

Refer to the [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for the full list of available components.

## Date Formatting

All date formatting must use **date-fns**.

### Format Standard

Dates should be displayed in the following format:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Implementation

Use the `format` function from date-fns with the pattern `do MMM yyyy`:

```typescript
import { format } from "date-fns";

const formattedDate = format(new Date(), "do MMM yyyy");
// Output: "30th Jan 2026"
```

### Pattern Breakdown

- `do` - Day of month with ordinal suffix (1st, 2nd, 3rd, 4th, etc.)
- `MMM` - Abbreviated month name (Jan, Feb, Mar, etc.)
- `yyyy` - Full year (2025, 2026, etc.)
