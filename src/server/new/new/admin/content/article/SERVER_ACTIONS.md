# Article Server Actions Guide

## Purpose

This module provides article-focused server actions for admin workflows:

- create, update, delete
- status changes (`draft | published | archived`)
- featured changes
- list/edit queries
- reorder and counter reconciliation

Use these actions as the backend contract for admin routes and server-side workflows.

## Where To Use

- Use directly in server contexts:
    - route handlers under `src/app/api/admin/content/articles/**`
    - server components or other server-only modules
- Do not call these actions directly from client components.
    - Client components should call admin API routes.

## Action Map

### `createArticle(input)`

- Use when creating a new article.
- Main changes:
    - inserts content document (`type: article`)
    - sets `publishStatus` and `publishedAt`
    - increments topic/subtopic `contentCount` only if status is `published`
    - triggers article path revalidation

### `updateArticle(articleId, input)`

- Use when editing article fields (title/body/topic/subtopic/status/etc.).
- Main changes:
    - updates article fields
    - updates `publishedAt` only on publish-state transitions
    - adjusts topic/subtopic `contentCount` when publish-state or location changes
    - triggers revalidation for old/new topic+slug paths

### `deleteArticle(articleId)`

- Use when deleting an article permanently.
- Main changes:
    - deletes article document
    - deletes related page stats and comments
    - decrements topic/subtopic `contentCount` only if article was published
    - triggers revalidation

### `changeArticlePublishStatus(articleId, status)`

- Use as the core status transition action.
- Main changes:
    - sets `publishStatus` to `draft | published | archived`
    - updates `publishedAt` according to published boundary
    - adjusts topic/subtopic `contentCount` only when crossing published boundary
    - triggers revalidation

### `setArticleStatus(articleId, status)`

- Use as the standard status API wrapper in action handlers/routes.
- Main changes:
    - validates status
    - delegates to `changeArticlePublishStatus`

### `setArticleFeatured(articleId, featured)`

- Use for explicit featured state updates.
- Main changes:
    - sets `featured: true | false`
    - updates `updatedAt`
    - triggers revalidation

### `toggleArticleFeatured(articleId)`

- Use only where toggle UX is still required.
- Main changes:
    - flips `featured`
    - delegates to `setArticleFeatured`

### `getArticles(params)`

- Use for admin listing with filters/pagination/sort.
- Main changes:
    - read-only aggregation query
    - returns rows with topic/subtopic metadata

### `getArticleForEdit(articleId)`

- Use for edit form prefill.
- Main changes:
    - read-only query
    - returns full edit payload for one article

### `reorderArticles(topicId, articleIds, subtopicId?)`

- Use for drag-and-drop/manual ordering inside a scope.
- Main changes:
    - validates all IDs belong to scope
    - updates `order` + `updatedAt` in bulk
    - triggers revalidation

### `reconcileArticleCounters()`

- Use for maintenance/backfill if counts drift.
- Main changes:
    - recomputes published article counts per topic/subtopic
    - writes corrected `contentCount`

### Bulk helpers

- `bulkSetArticleStatus(articleIds, status)`
- `bulkPublishArticles(articleIds)`
- `bulkArchiveArticles(articleIds)`
- `bulkDraftArticles(articleIds)`
- `bulkDeleteArticles(articleIds)`

Use for admin bulk operations. These iterate item-wise and stop on first failure.

## Component Usage Pattern

### Server-side caller (recommended for orchestration)

```ts
// route handler / server module
import { setArticleStatus } from '@/server/new/new/admin/content/article';

const result = await setArticleStatus(articleId, 'published');
```

### Client component caller (recommended pattern)

```ts
// client component
await fetch(`/api/admin/content/articles/${articleId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'archived' }),
});
```

## Quick Decision Guide

- Create new article: `createArticle`
- Edit article content/meta: `updateArticle`
- Change publication state: `setArticleStatus` (or `changeArticlePublishStatus` core)
- Change featured state: `setArticleFeatured`
- Bulk status/delete: bulk helpers
- Repair counts: `reconcileArticleCounters`
- Delete permanently: `deleteArticle`
