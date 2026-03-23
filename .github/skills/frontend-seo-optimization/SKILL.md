---
name: frontend-seo-optimization
description: 'Implement production-grade Next.js App Router frontend features with TypeScript and Tailwind CSS v4 design tokens, plus strong SEO and performance standards. Use when building pages/components, refactoring UI architecture, enforcing class order and token usage, applying SSG/ISR, metadata, and render optimization checks.'
argument-hint: 'Describe the feature/page, route, data source, and interaction requirements.'
user-invocable: true
---

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
