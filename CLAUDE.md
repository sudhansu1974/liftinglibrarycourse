# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Create production build
npm run start    # Run production server
npm run lint     # Run ESLint
```

## Tech Stack

- **Next.js 16** with App Router (src/app/)
- **React 19** with Server Components by default
- **TypeScript 5** with strict mode
- **Tailwind CSS 4** for styling

## Architecture

This is a Next.js App Router project. Key conventions:

- **Path alias**: `@/*` maps to `./src/*`
- **Server Components**: Default for all components in src/app/
- **Client Components**: Add `"use client"` directive at top of file when needed
- **Layouts**: src/app/layout.tsx wraps all pages
- **Pages**: Each page.tsx in src/app/ directories becomes a route

## Project Structure

```
src/app/           # App Router - pages, layouts, and route handlers
public/            # Static assets served at root
```
