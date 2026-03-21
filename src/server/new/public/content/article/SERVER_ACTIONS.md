# Public Article Server Actions Guide

## Purpose

This module provides public-read article server actions for static-first delivery:

- topic listing for `/articles`
- topic tree for `/articles/:topicSlug`
- article detail for `/articles/:topicSlug/:articleSlug`
- static params source for SSG/ISR

These actions are read-only and optimized for published content.

## Canonical Usage

- Use directly in server contexts:
    - page-level data loading in app routes under `src/app/(public)/articles/**`
    - shared read facade exports under `src/server/new/public` for metadata consumers (for example sitemap/rss)
- Do not use API fetches from server components for primary content rendering.
- API route handlers are optional compatibility adapters and should delegate to these actions.

## Action Map

### `getPublishedArticleTopics(params)`

- Use for the `/articles` hub page.
- Returns published topics with `contentCount > 0`.
- Backed by Topic model fields: `published`, `featured`, `order`, `updatedAt`, `contentCount`.

### `getPublishedTopicTreeBySlug(topicSlug)`

- Use for `/articles/:topicSlug` topic page (accordion/subtopic sections).
- Returns topic summary + published subtopic sections + article cards + uncategorized articles.
- Uses Topic + Subtopic + Content models in one composed read.

### `getPublishedArticleByPath(topicSlug, articleSlug)`

- Use for `/articles/:topicSlug/:articleSlug` page payload.
- Returns full public article detail including `id` (content `_id`) for stats/comments coupling.

### `getPublishedArticleById(contentId)`

- Use for API testing and id-based lookups.
- Returns same detail shape by content `_id`.

### `getPublishedArticleStaticPaths()`

- Use for `generateStaticParams()` source data.
- Returns `{ contentId, topicSlug, articleSlug }[]` for static generation and id bridging.

## Frontend Integration (Target)

Use these actions as the single read contract for article pages and metadata generation.

Required migration targets:

1. `src/app/(public)/articles/page.tsx`
    - Replace topic queries with `getPublishedArticleTopics`.
2. `src/app/(public)/articles/[topicSlug]/page.tsx`
    - Replace topic-content query with `getPublishedTopicTreeBySlug`.
3. `src/app/(public)/articles/[topicSlug]/[articleSlug]/page.tsx`
    - Replace article lookup with `getPublishedArticleByPath`.
    - Use returned `article.id` for views/likes/comments actions and API tests.

## Adapter Endpoints (Optional)

HTTP endpoints may exist for QA/Postman/integration and must remain thin wrappers:

- `GET /api/content/articles/topics`
- `GET /api/content/articles/topics/:topicSlug`
- `GET /api/content/articles/:topicSlug/:articleSlug`
- `GET /api/content/articles/id/:contentId`
- `GET /api/content/articles/static-paths`

## Model and Index Alignment

The actions are aligned with these models:

- Content: `type`, `publishStatus`, `topicId`, `subtopicId`, `slug`, `order`, `publishedAt`
- Topic: `published`, `featured`, `order`, `contentCount`, `updatedAt`
- Subtopic: `topicId`, `published`, `order`, `contentCount`, `updatedAt`

Added performance indexes for public reads:

- `Content`: `{ type, topicId, publishStatus, subtopicId, order, publishedAt }`
- `Topic`: `{ published, featured, order, updatedAt }`
- `Subtopic`: `{ topicId, published, order, updatedAt }`

## Static Delivery Strategy (SSG + ISR)

1. Use `generateStaticParams()` from `getPublishedArticleStaticPaths()`.
2. Keep page-level `revalidate` (for example, 600 for hub, 3600 for topic/article).
3. Trigger on-demand revalidation from admin publish/update flows.
4. Avoid runtime API fetch for primary article/topic content in server pages.
5. Keep only dynamic islands (views/likes/comments) as runtime endpoints/actions.
6. Prefer shared server facade imports for sitemap/rss over legacy query modules.

## Quick Decision Guide

- Build `/articles` list: `getPublishedArticleTopics`
- Build `/articles/:topicSlug`: `getPublishedTopicTreeBySlug`
- Build `/articles/:topicSlug/:articleSlug`: `getPublishedArticleByPath`
- Build static params: `getPublishedArticleStaticPaths`
- Test by id payload: `getPublishedArticleById`
