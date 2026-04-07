# Public Project Server Actions Guide

## 1) Purpose and scope

This module is the canonical public read backend for project pages.

Supported public surfaces:

- projects listing page: /projects
- project detail page: /projects/:projectSlug
- id-based detail lookup for adapters/tests
- static path discovery for SSG/ISR

The module is read-only and publish-state safe.

## 2) Contract snapshot

Mandatory project read actions:

- getPublishedProjectByPath
- getPublishedProjectById
- getPublishedProjects
- getPublishedProjectStaticPaths

Contract declaration and checks:

- Local contract declaration: src/server/new/public/content/project/index.ts
- Cross-domain registry: src/server/new/public/content/readContractChecks.ts
- Shared contract helpers: src/server/new/public/content/shared/contract.ts
- Cross-domain checklist: src/server/new/public/content/READ_CONTRACT_CHECKLIST.md

Why this exists:

- Makes project domain behavior symmetrical with article/blog domains.
- Prevents future endpoint-level contract drift.

## 3) Exact implementation locations

Core actions:

- src/server/new/public/content/project/getPublishedProjects.ts
- src/server/new/public/content/project/getPublishedProjectByPath.ts
- src/server/new/public/content/project/getPublishedProjectById.ts
- src/server/new/public/content/project/getPublishedProjectStaticPaths.ts

Domain helper layer:

- src/server/new/public/content/project/shared.ts

Cross-domain shared helpers used by project:

- src/server/new/public/content/shared/helpers.ts

## 4) Action-by-action behavior and guarantees

### getPublishedProjects(params)

Use when:

- Rendering /projects listing page.

Guarantees:

- Pagination normalized through normalizePagination.
- Deterministic sort through shared stable sort helper.
- Optional featured filter.
- Optional status filter.
- Published-only rows.

Why:

- Project grids frequently paginate and filter. Stable ordering is required for consistent navigation.

### getPublishedProjectByPath(projectSlug)

Use when:

- Rendering canonical project detail page.

Guarantees:

- Published-only lookup by slug.
- Stable detail payload envelope.

### getPublishedProjectById(contentId)

Use when:

- Id adapter routes and integration checks.

Guarantees:

- Shared id parser.
- Stable 400 for invalid ids.
- Same detail envelope semantics as by-path.

### getPublishedProjectStaticPaths()

Use when:

- generateStaticParams and sitemap expansion.

Guarantees:

- Published-only rows.
- Deterministic ordering.

## 5) Professional integration examples

### A) Server page integration

Use in:

- src/app/(public)/projects/page.tsx
- src/app/(public)/projects/[projectSlug]/page.tsx

Examples:

```ts
const projectsResult = await getPublishedProjects({
    featuredOnly: false,
    status: undefined,
    pagination: { offset: 0, limit: 24 },
});
```

```ts
const projectResult = await getPublishedProjectByPath(projectSlug);
if (!projectResult.success || !projectResult.data) notFound();
```

### B) Static params integration

```ts
const pathsResult = await getPublishedProjectStaticPaths();
if (!pathsResult.success) return [];

return pathsResult.data.map((row) => ({ projectSlug: row.projectSlug }));
```

### C) Thin API adapter pattern

Use in:

- src/app/api/content/projects/\*\*

```ts
export const GET = async (_request: Request, context: { params: Promise<{ contentId: string }> }) => {
    const { contentId } = await context.params;
    return toHttp(await getPublishedProjectById(contentId));
};
```

## 6) Required usage rules

1. Use these server actions as the only public project read interface.
2. Keep API route handlers as wrappers only.
3. Do not bypass publish-state filters in page code.
4. Preserve deterministic sort for paginated/filterable grids.

## 7) Error semantics

- Invalid id inputs: 400.
- Missing or unpublished rows: null payload (or adapter-level 404 policy).
- Unexpected failures: 500 from handleError.

## 8) Why this architecture is correct

- Project routes, sitemap/static params, and id adapters now share one contract.
- Shared helper usage removes duplicated guard logic.
- Local contract declaration creates a clear maintenance boundary.
