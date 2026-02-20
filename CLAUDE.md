# Picksy — Claude Code Guide

## What is Picksy
An AI-powered product recommendation tool that analyzes Reddit discussions to surface a single clear "Pick" for any purchase decision. It scans subreddits, weights sentiment, detects shill bias, and shows real-time store pricing.

## Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Validation**: Zod
- **Icons**: Lucide React

## Project Structure
```
app/
  page.tsx          # Landing page (client component)
  search/page.tsx   # Search input page
  results/page.tsx  # Search results page
  product/[id]/     # Individual product recommendation page
  api/
    analyze/        # API route: analyze Reddit threads for a query
    stores/         # API route: fetch store pricing data
components/
  landing/          # Landing page sections (hero, FAQ, features, etc.)
  shared/           # Reusable UI pieces (cards, badges, mockups)
  ui/               # shadcn/ui primitives (Button, Card, Input)
lib/
  data/products.ts  # Product data / mock data
  hooks/            # Custom React hooks (useAnimateIn, useFadeIn)
  types/landing.ts  # TypeScript types
  utils.ts          # Shared utilities (cn helper, etc.)
```

## Dev Commands
```bash
npm run dev    # Start dev server at localhost:3000
npm run build  # Production build
npm run lint   # ESLint
```

## Conventions
- Use the `cn()` utility from `lib/utils.ts` for conditional Tailwind classes
- Prefer `shadcn/ui` primitives in `components/ui/` for new interactive elements
- Keep page-level components in `app/`, reusable components in `components/`
- API routes live in `app/api/` using Next.js Route Handlers
- Validate API inputs with Zod schemas
- Brand colors: orange-600 (primary), stone-900 (dark), stone-50 (background)
- Serif font for headings, system sans for body

## Collaboration Notes
- Always pull from `main` before starting a session: `git pull origin main`
- Work on feature branches, never commit directly to `main`
- Branch naming: `feature/short-description` or `fix/short-description`
- Open a PR for review before merging, even for small changes
