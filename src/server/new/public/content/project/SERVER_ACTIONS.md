# Public Project Server Actions Guide

## Purpose

This module provides public-read project server actions for static-first delivery:

- project listing for `/projects`
- project detail for `/projects/:projectSlug`
- id lookup for shared engagement and API adapters
- static params source for SSG/ISR

These actions are read-only and optimized for published content.

## Canonical Usage

- Use directly in server contexts:
    - page-level data loading in app routes under `src/app/(public)/projects/**`
    - shared read facade exports under `src/server/new/public` for metadata and backend composition
- Do not use API fetches from server components for primary content rendering.
- API route handlers are optional compatibility adapters and should delegate to these actions.

## Action Map

### `getPublishedProjects(params)`

- Use for the `/projects` listing page.
- Returns published project cards with optional featured/status filtering.

### `getPublishedProjectByPath(projectSlug)`

- Use for `/projects/:projectSlug` page payload.
- Returns full public project detail including `id` (content `_id`) for stats/comments coupling.

### `getPublishedProjectById(contentId)`

- Use for id-based read checks and API adapter endpoints.
- Returns same detail shape by content `_id`.

### `getPublishedProjectStaticPaths()`

- Use for `generateStaticParams()` source data.
- Returns `{ contentId, projectSlug }[]` for static generation and id bridging.

## Adapter Endpoints (Optional)

HTTP endpoints may exist for QA/Postman/integration and must remain thin wrappers:

- `GET /api/content/projects`
- `GET /api/content/projects/:projectSlug`
- `GET /api/content/projects/id/:contentId`
- `GET /api/content/projects/static-paths`

Optional engagement adapters (if projects use shared engagement):

- `GET|POST /api/content/projects/id/:contentId/views`
- `GET|POST /api/content/projects/id/:contentId/likes`
- `GET|POST /api/content/projects/id/:contentId/comments`
- `POST /api/content/projects/id/:contentId/comments/:commentId/upvote`

## Static Delivery Strategy (SSG + ISR)

1. Use `generateStaticParams()` from `getPublishedProjectStaticPaths()`.
2. Keep page-level `revalidate` for list/detail routes.
3. Trigger on-demand revalidation from admin publish/update flows.
4. Avoid runtime API fetch for primary project content in server pages.
5. Keep only dynamic islands (views/likes/comments) as runtime endpoints/actions.

## Quick Decision Guide

- Build `/projects` list: `getPublishedProjects`
- Build `/projects/:projectSlug`: `getPublishedProjectByPath`
- Build static params: `getPublishedProjectStaticPaths`
- Test by id payload: `getPublishedProjectById`
