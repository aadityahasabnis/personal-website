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
- Keep fetch and mutation logic outside presentational components.
- Avoid adding new dependencies on legacy action/query paths; use canonical `src/server/new/**` paths for new work.

// =============================================================
// PERFORMANCE RULES
// =============================================================

- Keep client boundaries small; move data work to server boundaries.
- Use ISR and static params for cacheable public pages.
- Use Suspense and lazy loading for heavy visual islands (motion/three).
- Use `React.memo`, `useMemo`, and `useCallback` only when measurable render churn exists.
- Avoid unnecessary `useEffect`; prefer derived state and event handlers.
- Keep query payloads and selected fields minimal.

// =============================================================
// NEXT.JS BEST PRACTICES (PROJECT-SPECIFIC)
// =============================================================

- Export `metadata` and `viewport` from root layout.
- Use `createPageMetadata` and `SITE_CONFIG` for route metadata.
- Use `generateStaticParams` for article/blog/project detail routes.
- Use `revalidate` strategically: frequent lists can use shorter intervals; detail pages use longer ISR windows unless requirements differ.
- Keep public search route behavior consistent: base search page indexable, query-result states noindex.
- Maintain robots/sitemap/rss consistency when adding or changing public routes.
- For JSON-LD, use utilities in `src/lib/seo.tsx` and keep schema graph composition centralized.

// =============================================================
// TYPESCRIPT RULES
// =============================================================

- No `any`.
- Use strict interfaces or type aliases for all props and action inputs/outputs.
- Keep exported function signatures explicit.
- Use discriminated unions for response contracts.
- Prefer `unknown` with narrowing in error paths.

// =============================================================
// FILE STRUCTURE
// =============================================================

- `src/app`: App Router pages, layouts, metadata routes, and API wrappers.
- `src/components`: UI, layout, sections, content, effects, and feature components.
- `src/server/new`: canonical admin/public server action modules.
- `src/lib`: cross-domain helpers (`metadata`, `seo`, auth, db, utils).
- `src/constants`: all static config and schema constants.
- `src/hooks`: reusable client hooks for query/mutation UI behavior.
- `src/app/styles`: theme/base/utilities CSS modules.
- `tests/api`: backend/API contract and hardening tests.

// =============================================================
// OUTPUT RULES
// =============================================================

- Output only required code or required file edits.
- No unused imports, variables, helpers, or wrappers.
- No console logs in production code.
- Do not duplicate existing utilities/constants.
- Keep comments short and purposeful.

// =============================================================
// THINKING PROCESS
// =============================================================

Before writing code, verify:

- Is this a Server Component by default?
- Does this follow canonical server action contracts?
- Are design tokens and class order correct?
- Is metadata/SEO impact handled for public routes?
- Can this be simpler with fewer re-renders and less client JS?

Then implement with minimal changes and deterministic behavior.
