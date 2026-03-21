# Public Blog Server Actions Guide

## Purpose

This module provides public-read blog server actions for static-first delivery:

- blog listing for `/blogs`
- blog detail for `/blogs/:blogSlug`
- id lookup for shared engagement and API adapters
- static params source for SSG/ISR

These actions are read-only and optimized for published content.

## Canonical Usage

- Use directly in server contexts:
    - page-level data loading in app routes under `src/app/(public)/blogs/**`
    - shared read facade exports under `src/server/new/public` for metadata and backend composition
- Do not use API fetches from server components for primary content rendering.
- API route handlers are optional compatibility adapters and should delegate to these actions.

## Action Map

### `getPublishedBlogs(params)`

- Use for the `/blogs` listing page.
- Returns published blog cards with optional featured filtering.

### `getPublishedBlogByPath(blogSlug)`

- Use for `/blogs/:blogSlug` page payload.
- Returns full public blog detail including `id` (content `_id`) for stats/comments coupling.

### `getPublishedBlogById(contentId)`

- Use for id-based read checks and API adapter endpoints.
- Returns same detail shape by content `_id`.

### `getPublishedBlogStaticPaths()`

- Use for `generateStaticParams()` source data.
- Returns `{ contentId, blogSlug }[]` for static generation and id bridging.

## Adapter Endpoints (Optional)

HTTP endpoints may exist for QA/Postman/integration and must remain thin wrappers:

- `GET /api/content/blogs`
- `GET /api/content/blogs/:blogSlug`
- `GET /api/content/blogs/id/:contentId`
- `GET /api/content/blogs/static-paths`

Optional engagement adapters (if blogs use shared engagement):

- `GET|POST /api/content/blogs/id/:contentId/views`
- `GET|POST /api/content/blogs/id/:contentId/likes`
- `GET|POST /api/content/blogs/id/:contentId/comments`
- `POST /api/content/blogs/id/:contentId/comments/:commentId/upvote`

## Static Delivery Strategy (SSG + ISR)

1. Use `generateStaticParams()` from `getPublishedBlogStaticPaths()`.
2. Keep page-level `revalidate` for list/detail routes.
3. Trigger on-demand revalidation from admin publish/update flows.
4. Avoid runtime API fetch for primary blog content in server pages.
5. Keep only dynamic islands (views/likes/comments) as runtime endpoints/actions.

## Quick Decision Guide

- Build `/blogs` list: `getPublishedBlogs`
- Build `/blogs/:blogSlug`: `getPublishedBlogByPath`
- Build static params: `getPublishedBlogStaticPaths`
- Test by id payload: `getPublishedBlogById`
