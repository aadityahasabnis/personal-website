# Blog Server Actions Guide

## Purpose

This module provides blog-focused server actions for admin workflows.

- create, update, delete
- status changes (`draft | published | archived`)
- featured changes
- list and edit queries
- bulk status and delete operations

Use these actions as the backend contract for admin routes and server-side workflows.

## Where To Use

- route handlers under `src/app/api/admin/content/blogs/**`
- server components or other server-only modules
- client components should call admin API routes instead of calling server actions directly

## Action Map

### `createBlog(input)`

- inserts content document with `type: blog`
- computes reading time when missing
- triggers blog path revalidation

### `updateBlog(blogId, input)`

- updates blog fields
- updates publish timestamps on status transitions
- triggers revalidation for old and new slug paths

### `deleteBlog(blogId)`

- deletes blog document
- deletes related `pageStats` and `comments`
- triggers revalidation

### `changeBlogPublishStatus(blogId, status)`

- sets `publishStatus` to `draft | published | archived`
- updates `publishedAt` during transitions
- triggers revalidation

### `setBlogStatus(blogId, status)`

- validates status
- delegates to `changeBlogPublishStatus`

### `setBlogFeatured(blogId, featured)`

- sets `featured: true | false`
- triggers revalidation

### `toggleBlogFeatured(blogId)`

- flips `featured`
- delegates to `setBlogFeatured`

### `getBlogs(params)`

- read-only query for admin listing with filters, pagination, and sort
- returns compact rows for table rendering

### `getBlogForEdit(blogId)`

- read-only query for edit prefill
- returns full edit payload for one blog

### Bulk helpers

- `bulkSetBlogStatus(blogIds, status)`
- `bulkPublishBlogs(blogIds)`
- `bulkArchiveBlogs(blogIds)`
- `bulkDraftBlogs(blogIds)`
- `bulkDeleteBlogs(blogIds)`

Use bulk helpers for admin bulk operations. These validate all requested ids first, then execute batched writes for better performance.

## Component Usage Pattern

### Server-side caller

```ts
import { setBlogStatus } from '@/server/new/new/admin/content/blog';

const result = await setBlogStatus(blogId, 'published');
```

### Client component caller

```ts
await fetch(`/api/admin/content/blogs/${blogId}/status`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ status: 'archived' }),
});
```

## Quick Decision Guide

- Create new blog: `createBlog`
- Edit blog content or meta: `updateBlog`
- Change publication state: `setBlogStatus`
- List blogs: `getBlogs`
- Get edit payload: `getBlogForEdit`
- Bulk status or delete: bulk helpers
