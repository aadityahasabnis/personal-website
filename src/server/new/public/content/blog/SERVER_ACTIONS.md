# Public Blog Server Actions Guide

## 1) Purpose and scope

This module is the canonical public read backend for blog pages.

Supported public surfaces:

- blogs listing page: /blogs
- blog detail page: /blogs/:blogSlug
- id-based detail lookup for adapters/tests
- static path discovery for SSG/ISR

The module is read-only and publish-state safe.

## 2) Contract snapshot

Mandatory blog read actions:

- getPublishedBlogByPath
- getPublishedBlogById
- getPublishedBlogs
- getPublishedBlogStaticPaths

Contract declaration and checks:

- Local contract declaration: src/server/new/public/content/blog/index.ts
- Cross-domain registry: src/server/new/public/content/readContractChecks.ts
- Shared contract helpers: src/server/new/public/content/shared/contract.ts
- Cross-domain checklist: src/server/new/public/content/READ_CONTRACT_CHECKLIST.md

Why this exists:

- Keeps listing/detail/static-path behavior consistent with article/project domains.
- Prevents silent contract drift when internal query code changes.

## 3) Exact implementation locations

Core actions:

- src/server/new/public/content/blog/getPublishedBlogs.ts
- src/server/new/public/content/blog/getPublishedBlogByPath.ts
- src/server/new/public/content/blog/getPublishedBlogById.ts
- src/server/new/public/content/blog/getPublishedBlogStaticPaths.ts

Domain helper layer:

- src/server/new/public/content/blog/shared.ts

Cross-domain shared helpers used by blog:

- src/server/new/public/content/shared/helpers.ts

## 4) Action-by-action behavior and guarantees

### getPublishedBlogs(params)

Use when:

- Rendering /blogs listing page.

Guarantees:

- Pagination normalized through normalizePagination.
- Deterministic sort through shared stable sort helper.
- Optional featured filter.
- Published-only rows.

Why:

- Deterministic sorting is required to avoid duplicate/shifted rows across pages.

### getPublishedBlogByPath(blogSlug)

Use when:

- Rendering canonical blog detail page.

Guarantees:

- Published-only lookup by slug.
- Stable detail envelope for frontend usage.

### getPublishedBlogById(contentId)

Use when:

- Id-based adapters and integration checks.

Guarantees:

- Shared content-id parsing.
- Stable 400 for invalid ids.
- Same detail envelope semantics as by-path.

### getPublishedBlogStaticPaths()

Use when:

- generateStaticParams and sitemap/feed expansion.

Guarantees:

- Published-only rows.
- Deterministic ordering.

## 5) Professional integration examples

### A) Server page integration

Use in:

- src/app/(public)/blogs/page.tsx
- src/app/(public)/blogs/[blogSlug]/page.tsx

Examples:

```ts
const listResult = await getPublishedBlogs({
    pagination: { offset: 0, limit: 30 },
    featuredOnly: false,
});
```

```ts
const detailResult = await getPublishedBlogByPath(blogSlug);
if (!detailResult.success || !detailResult.data) notFound();
```

### B) Static params integration

```ts
const pathsResult = await getPublishedBlogStaticPaths();
if (!pathsResult.success) return [];

return pathsResult.data.map((row) => ({ blogSlug: row.blogSlug }));
```

### C) Thin API adapter pattern

Use in:

- src/app/api/content/blogs/\*\*

```ts
export const GET = async (_request: Request, context: { params: Promise<{ contentId: string }> }) => {
    const { contentId } = await context.params;
    return toHttp(await getPublishedBlogById(contentId));
};
```

## 6) Required usage rules

1. Keep page data reads on server actions, not server-side fetch to API routes.
2. Keep API routes as wrappers only.
3. Preserve stable listing sort for paginated clients.
4. Keep publish-state filtering in action layer only.

## 7) Error semantics

- Invalid id inputs: 400.
- Missing or unpublished rows: null payload (or adapter-specific 404 policy).
- Unexpected failures: 500 from handleError.

## 8) Why this architecture is correct

- Blog domain now matches article/project read contract exactly.
- Shared helpers reduce duplicated query guard logic.
- Contract declaration in local index protects long-term maintainability.
