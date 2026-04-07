---
trigger: always_on
---

# description: 'Implement production-grade Next.js App Router frontend features with TypeScript and Tailwind CSS v4 design tokens, plus strong SEO and performance standards. Use when building pages/components, refactoring UI architecture, enforcing class order and token usage, applying SSG/ISR, metadata, and render optimization checks.'

# Frontend SEO Optimization

## What This Skill Produces

- Clean, minimal, modular, production-ready frontend code for Next.js App Router projects.
- Strong SEO and performance defaults for every implementation.
- A repeatable implementation workflow with decision points and completion checks.

## When To Use

- Implementing or refactoring frontend pages, sections, or reusable UI components.
- Enforcing strict TypeScript, design-token-only styling, and class ordering conventions.
- Applying SEO and rendering strategy for static-first content with selective dynamic behavior.
- Reviewing frontend code quality before merge.

## Workflow

1. Parse requirements and constraints.
2. Decide rendering strategy and data flow.
3. Define types, constants, and component boundaries.
4. Implement minimal components and hooks.
5. Apply strict Tailwind token styling and class order.
6. Apply Next.js SEO and rendering features.
7. Run performance and correctness checks.
8. Final cleanup and output validation.

## Step 1: Parse Requirements

- Identify the exact output: page, section, component, or refactor.
- Extract SEO requirements: title intent, canonical behavior, indexability, metadata scope.
- Capture interaction requirements: static display, client interaction, or mutation flow.
- Reject speculative work: implement only requested behavior.

## Step 2: Decide Rendering And Data Strategy

- Default to Server Components.
- Use Client Components only for browser APIs, local interactive state, or client-only libraries.
- For mutations, use Server Actions wrapped with a custom hook.
- For client-side fetching, use TanStack Query via dedicated custom hooks.
- Prefer SSG for stable public routes.
- Use ISR via revalidate when freshness is required.

### Project Addendum: Server Action And Hook Placement

Use this exact layering for this repository:

- Public server action implementation (`src/server/new/public/**`):
    - Return typed `IApiResponse<T>`.
    - Use helper wrappers from `src/server/new/utils/helper.ts` (`success`, `created`, `error`, `handleError`, `tryCatch`).
- Server pages (`src/app/**/page.tsx`, Server Components):
    - Call public server actions directly with `await`.
    - Optional: use `executeServerAction` / `createServerActionExecutor` from `src/lib/api.ts` for instrumentation.
- Client interactive components:
    - Read data via `useActionQuery` (`src/hooks/useActionQuery.ts`).
    - Mutate data via `useAction` (`src/hooks/useAction.ts`).
    - Use `useDebounce` (`src/hooks/useDebounce.ts`) for search/filter-driven queries.
    - Use `usePagination` / `useInfiniteScroll` (`src/hooks/usePagination.ts`) for in-memory list rendering.

Why this split:

- Hooks own UI lifecycle and cache concerns.
- Server utilities own execution instrumentation and error normalization.
- Action files own domain validation and response contracts.

Migration note:

- `useLegacyAPIAction` in `src/hooks/useAction.ts` is compatibility-only. Prefer `useAction` for new work.

## Step 3: Define Types, Constants, And Boundaries

- Add strict prop and data types.
- Never use any.
- Move static values to constants modules.
- Use typed config objects for generic components.
- Keep one component per file.
- Split subcomponents only when complexity justifies extraction.

## Step 4: Implement Minimal, Composable UI

- Use semantic HTML elements where possible.
- Keep JSX shallow and readable.
- Prefer composition over prop drilling.
- Avoid unnecessary wrappers.
- Avoid useEffect unless there is no cleaner alternative.

## Step 5: Apply Styling Rules Strictly

- Use only design-system token classes.
- Avoid hardcoded colors, spacing, and fonts.
- Keep className in one line.
- Apply class order exactly:
    1. Positioning
    2. Flex and grid
    3. Display and visibility
    4. Spacing
    5. Sizing
    6. Typography
    7. Background and border
    8. Effects
    9. Misc
- Avoid inline styles except CSS variables.

## Step 6: Apply SEO And Next.js Standards

- Export metadata and viewport in layout/page modules where applicable.
- Use generateStaticParams for SSG routes when feasible.
- Use revalidate for ISR routes when needed.
- Keep route structure clear and maintainable.
- Ensure semantic heading structure and meaningful document landmarks.

## Step 7: Performance And Render Optimization

- Reduce avoidable re-renders.
- Use memoization only with measurable benefit.
- Keep dependency arrays correct.
- Avoid inline handlers in large render trees when they trigger churn.
- Keep client bundles small by pushing logic to server boundaries.

## Step 8: Final Quality Gate

- No any types or implicit unsafe typing.
- No unused imports, variables, or dead code.
- No console logs.
- No unnecessary abstractions.
- No non-token styling shortcuts.
- No deeply nested JSX.
- No missing metadata on public routes.
- Code is minimal, modular, and production-ready.

## Decision Branches

- If interaction is read-only and cacheable: use Server Component with static-first rendering.
- If interaction requires browser state only: use a small Client Component wrapper.
- If interaction mutates server data: use Server Action and wrap in a custom hook.
- If data is shared across client surfaces: use a typed TanStack Query hook.
- If a pattern repeats across features: extract a generic typed reusable component.
- If extraction increases complexity without reuse: keep implementation local.

### Public Route Decision Branch (Project-Specific)

- If route is public and cacheable:
    - Implement read in server page with direct action call.
    - Use ISR/SSG strategy as required.
- If route needs client filters/search:
    - Keep initial payload server-rendered.
    - Move live filtering/query refresh to client island with `useActionQuery`.
- If route needs mutation (likes/comments/subscriptions):
    - Keep mutation in server action.
    - Trigger from client with `useAction`.
    - Invalidate related query keys.
- If same server action is orchestrated in many server contexts:
    - Use `createServerActionExecutor` to avoid repeated try/catch and metrics boilerplate.

## Output Contract

- Return only required code.
- Keep comments minimal and meaningful.
- Use this comment style only:
    - // =============================================================
    - // Section Name
    - // =============================================================
    - // Single line comment
- Do not include explanatory prose unless explicitly requested.

## Suggested Invocation Prompts

- Build a typed, reusable article card grid for the public route using design tokens and semantic markup.
- Refactor this client-heavy page to server-first with minimal client islands and ISR.
- Implement a form mutation using a Server Action wrapped in a custom hook with strict typing.
- Review this component for token compliance, class order, and SEO/performance regressions.

---

# Copilot Instructions - aadityahasabnis.com

You are working on a production-grade Next.js App Router project that is static-first, SEO-first, and backend-driven via modular server actions.

// =============================================================
// PROJECT CONTEXT
// =============================================================

- Product: personal knowledge and portfolio platform with public content and protected admin CMS.
- Stack: Next.js 16, TypeScript, Tailwind CSS v4, MongoDB/Mongoose, NextAuth v5.
- Rendering model: SSG + ISR for public content, dynamic islands for engagement, server-rendered admin.
- Backend contract: canonical server actions under `src/server/new/**` with one action per file.
- Design system: OKLCH token system in `src/app/styles/theme.css` and utilities in `src/app/styles/utilities.css`.
- Documentation authority: `.docs/*` is the source of truth.

// =============================================================
// CORE RULES
// =============================================================

- Write minimal, production-ready code only.
- Do not introduce speculative abstractions, placeholder code, or dead code.
- Prefer existing project utilities and patterns over new patterns.
- Preserve server-action-first architecture; do not move business logic into API handlers.
- Keep API routes as thin wrappers around server actions when wrappers are required.

// =============================================================
// STYLING RULES (STRICT)
// =============================================================

- Use only project tokens and semantic classes.
- Primary semantic classes: `bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-primary`.
- Accent palette: `bg-violet-*`, `text-violet-*`.
- Status palette: `bg-success`, `bg-warning`, `bg-destructive`.
- Typography tokens: `text-display`, `text-title`, `text-h1` through `text-label`.
- Radius tokens: `rounded-sm` through `rounded-4xl`.
- Shadow tokens: `shadow-glow-sm`, `shadow-glow-md`, `shadow-glow-lg`.
- Transition tokens: `transition-fast`, `transition-base`, `transition-slow`, `transition-spring`.
- Approved custom utility classes include: `glass-card`, `gradient-text`, `card-premium`, `btn-primary`, `container-narrow`, `container-wide`, `ambient-bg`, `ambient-sphere-*`, `noise-overlay`.
- Do not hardcode hex/rgb/hsl colors, spacing scales, or font stacks in components.
- Use inline styles only for CSS variables or animation transforms that cannot be expressed with utilities.

// =============================================================
// CLASSNAME ORDERING (MANDATORY)
// =============================================================

Use this order in every className string:

1. Positioning: `relative`, `absolute`, `inset-*`, `z-*`
2. Layout: `flex`, `grid`, `items-*`, `justify-*`, `gap-*`
3. Display/Visibility: `block`, `hidden`, `opacity-*`
4. Spacing: `p-*`, `px-*`, `py-*`, `m-*`
5. Sizing: `w-*`, `h-*`, `min-*`, `max-*`
6. Typography: `text-*`, `font-*`, `leading-*`, `tracking-*`
7. Background/Border: `bg-*`, `border*`, `rounded-*`
8. Effects: `shadow-*`, `backdrop-*`, `transition-*`
9. State: `hover:*`, `focus:*`, `active:*`, `disabled:*`

- Keep className values single-line.
- Do not use random class ordering.

// =============================================================
// COMPONENT ARCHITECTURE
// =============================================================

- Server Components are default.
- Add `use client` only for browser APIs, event-driven interactivity, or client-only libraries.
- Keep JSX shallow and semantic (`section`, `article`, `header`, `nav`, `main`, `button`).
- Build reusable primitives in `src/components/ui` and feature components in domain folders.
- Use `cva` for variant-heavy reusable UI patterns.
- Extract subcomponents only when reuse or readability is clear.

// =============================================================
// DATA AND STATE MANAGEMENT
// =============================================================

- For public reads, prefer canonical providers under `src/server/new/public/**`.
- For admin mutations, use canonical actions under `src/server/new/admin/**`.
- Server action contract:
    - one action per file
    - typed `IApiResponse<T>` envelopes
    - shared helpers: `success`, `created`, `error`, `handleError`
    - helper-driven revalidation via `revalidateContent`
- Admin actions must enforce auth boundaries before writes.
- TanStack Query is allowed for client caching and optimistic UI in interactive islands (stats/comments/forms).
- Keep fetch and mutation logic outside present
