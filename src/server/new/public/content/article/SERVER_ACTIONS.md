# Public Article Server Actions Guide

## 1) Purpose and scope

This module is the canonical public read backend for article pages.

Supported public surfaces:

- articles hub: /articles
- topic tree page: /articles/:topicSlug
- article detail page: /articles/:topicSlug/:articleSlug
- static path discovery for SSG/ISR
- id-based detail lookup for adapters and integration tests

The module is read-only and publish-state safe.

## 2) Contract snapshot

Mandatory article read actions:

- getPublishedArticleByPath
- getPublishedArticleById
- getPublishedArticleTopics
- getPublishedArticleStaticPaths

Contract declaration and checks:

- Local contract declaration: src/server/new/public/content/article/index.ts
- Cross-domain registry: src/server/new/public/content/readContractChecks.ts
- Shared contract helpers: src/server/new/public/content/shared/contract.ts
- Cross-domain checklist: src/server/new/public/content/READ_CONTRACT_CHECKLIST.md

Why this exists:

- Prevents action-surface drift when teams refactor domain internals.
- Keeps page routes, metadata builders, and API adapters aligned to one stable read interface.

## 3) Exact implementation locations

Core actions:

- src/server/new/public/content/article/getPublishedArticleByPath.ts
- src/server/new/public/content/article/getPublishedArticleById.ts
- src/server/new/public/content/article/getPublishedArticleTopics.ts
- src/server/new/public/content/article/getPublishedTopicTreeBySlug.ts
- src/server/new/public/content/article/getPublishedArticleStaticPaths.ts

Shared domain helpers:

- src/server/new/public/content/article/shared.ts

Cross-domain shared helpers used by article:

- src/server/new/public/content/shared/helpers.ts

## 4) Action-by-action behavior and guarantees

### getPublishedArticleTopics(params)

Use when:

- Rendering /articles hub listings.

Guarantees:

- Pagination normalized through normalizePagination.
- Deterministic sort via shared stable sort helper.
- Only published topics with contentCount > 0.

Why:

- Deterministic ordering preserves pagination consistency across repeated reads.

### getPublishedTopicTreeBySlug(topicSlug)

Use when:

- Rendering /articles/:topicSlug pages with grouped subtopic sections.

Guarantees:

- Topic must be published.
- Subtopics are published-only.
- Articles are publish-state filtered.
- Output structure is stable: topic + subtopics + uncategorizedArticles.

Why:

- Topic tree shape must remain stable for server-rendered templates and tests.

### getPublishedArticleByPath(topicSlug, articleSlug)

Use when:

- Rendering canonical article detail route.

Guarantees:

- Published topic + published article required.
- Response envelope matches by-id detail shape through one shared mapper.

Why:

- Path and id lookups must not diverge in payload shape.

### getPublishedArticleById(contentId)

Use when:

- API adapter lookup.
- Integration tests and id-bridged clients.

Guarantees:

- Shared content-id parser.
- Stable 400 on invalid id.
- Returns same detail envelope as by-path action.

Why:

- Id adapters are common integration points and must mirror page payload contracts.

### getPublishedArticleStaticPaths()

Use when:

- generateStaticParams.
- sitemap/feed static route expansion.

Guarantees:

- Publish-state filtering.
- Deterministic static path order.

Why:

- Static generation must be reproducible and cache-stable.

## 5) Professional integration examples

### A) Server page integration (primary)

Use in:

- src/app/(public)/articles/[topicSlug]/[articleSlug]/page.tsx

Example:

```ts
const result = await getPublishedArticleByPath(topicSlug, articleSlug);
if (!result.success || !result.data) notFound();

const article = result.data;
// article.id can be passed to stats/comment server actions
```

### B) SSG static params integration

Use in:

- generateStaticParams for article routes

Example:

```ts
const pathsResult = await getPublishedArticleStaticPaths();
if (!pathsResult.success) return [];

return pathsResult.data.map((row) => ({
    topicSlug: row.topicSlug,
    articleSlug: row.articleSlug,
}));
```

### C) Thin API adapter integration

Use in:

- src/app/api/content/articles/\*\*

Example adapter pattern:

```ts
export const GET = async (_request: Request, context: { params: Promise<{ contentId: string }> }) => {
    const { contentId } = await context.params;
    return toHttp(await getPublishedArticleById(contentId));
};
```

## 6) Required usage rules

1. Use server actions directly in server render flows.
2. Keep API routes as wrappers only.
3. Do not reimplement publish-state filters in page code.
4. Do not add ad-hoc query utilities outside this contract for public reads.
5. Preserve stable sort keys for all paginated reads.

## 7) Error semantics

- Invalid id inputs: 400.
- Non-existent or unpublished resources: null payload (or adapter-level 404 policy, if needed).
- Unexpected failures: 500 from handleError.

## 8) Why this architecture is correct

- Static-first pages need deterministic and publish-safe read providers.
- One shared mapper prevents subtle payload drift between route variants.
- Contract declarations create explicit guardrails for future refactors.
- Shared helper reuse lowers duplication and regression risk.
