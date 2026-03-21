# Backend Implementation Plan (Server Actions + SEO + SSG/ISR)

## Scope

This plan is backend-only and focuses on:

- server actions architecture and completeness
- shared/commonized backend utilities
- API route coverage for testing and integration
- SEO/SSG/ISR backend delivery paths
- what is done vs what remains

---

## 1) Backend Audit Summary

## 1.1 Done (Implemented)

### Core models and indexing

- `src/server/models/Content.ts` includes content indexing for published article reads.
- `src/server/models/Topic.ts` includes published/featured/order sorting support index.
- `src/server/models/Subtopic.ts` includes topic + published + order sorting support index.
- `src/server/models/PageStats.ts` includes unique stats index on `contentId` and ranking indexes.
- `src/server/models/Comment.ts` supports parent/reply shape and moderation workflows.

### New admin server actions (modular)

- `src/server/new/admin/content/article/*` is structured and implemented.
- `src/server/new/admin/content/blog/*` is structured and implemented.
- `src/server/new/admin/content/project/*` is structured and implemented.
- `src/server/new/admin/topic/*` and `src/server/new/admin/subtopic/*` are implemented.
- Admin shared layer exists in `src/server/new/admin/shared/*` including revalidation + SEO shaping helpers.

### New public server actions (article domain)

- `src/server/new/public/content/article/*` is implemented with flat modular actions:
    - `getPublishedArticleTopics`
    - `getPublishedTopicTreeBySlug`
    - `getPublishedArticleByPath`
    - `getPublishedArticleById`
    - `getPublishedArticleStaticPaths`
- Public comments actions are implemented in `src/server/new/public/comments/*`.
- Public stats actions are implemented in `src/server/new/public/stats/*`.

### Public API namespace migration

- Canonical public article API routes are under `src/app/api/content/articles/**`.
- Legacy `src/app/api/articles/**` route handlers were removed.

### API handler helper reuse (admin)

- Shared helper reuse is active in admin APIs:
    - `src/app/api/admin/topics/_shared.ts` is re-exported by subtopic/content domains.
- This is a good base pattern for further commonization.

### Revalidation contract (server-action based)

- Revalidation is centralized through backend helper utilities in `src/server/new/utils/helper.ts`.
- Admin revalidation helpers delegate to `revalidateContent` in `src/server/new/admin/shared/revalidate.ts`.
- `src/app/api/revalidate/route.ts` has been removed to avoid split revalidation paths.

---

## 1.2 Remaining (Not Implemented or Partially Implemented)

### Public blog backend layer is missing

- `src/server/new/public/content/blog/` is empty.
- No public API routes under `src/app/api/content/blogs/**`.
- No static path action for blog pages.

### Public project backend layer is missing

- `src/server/new/public/content/project/` is empty.
- No public API routes under `src/app/api/content/projects/**`.
- No static path action for project pages (if per-project pages are required).

### Public content index is article-only

- `src/server/new/public/content/index.ts` exports only article.
- Blog and project domains are not integrated into the public content backend contract.

### Backend query compatibility gap

- Current codebase still contains many imports to legacy backend modules:
    - `@/server/queries/*`
    - `@/server/actions/*`
- In the present tree, there is no `src/server/queries` directory and no `src/server/actions` directory.
- A backend compatibility layer or migration is required to remove this contract mismatch.

### Metadata/sitemap/rss backend dependency gap

- `src/app/sitemap.ts` and `src/app/rss.xml/route.ts` import legacy query functions.
- These should be migrated to the new backend server-action/query facade to keep static metadata generation stable.

### Commonized backend utility opportunity

- Reusable validation/data-shaping logic exists but is repeated across domains (public article/comments/stats and admin).
- A unified backend utility/facade layer is not fully established yet.

---

## 2) Backend Target Architecture (End State)

## 2.1 Public read backend by content domain

- `src/server/new/public/content/article/*` (complete)
- `src/server/new/public/content/blog/*` (to implement)
- `src/server/new/public/content/project/*` (to implement)
- `src/server/new/public/content/index.ts` exports all three domains.

Each domain should provide:

- by-path read action
- by-id read action
- listing action
- static-paths action for SSG

## 2.2 Dynamic engagement backend (id-based)

- Continue id-based stats/comments with ObjectId-first operations.
- Keep atomic counters in `PageStats` using upsert + `$inc`.
- Keep moderation-first comments policy.

## 2.3 API contract (testability)

- Keep API test handlers under `src/app/api/content/**`.
- Build parity routes for blogs/projects similar to article style.
- Keep rich `OPTIONS` metadata as machine-readable endpoint docs.

## 2.4 SEO/SSG/ISR backend contract

- SSG source actions per type:
    - `getPublished*StaticPaths()` for article/blog/project.
- ISR:
    - type-specific revalidation helper with deterministic affected-path mapping.
- SEO feeds:
    - sitemap and rss should consume new backend data providers only.

---

## 3) Implementation Plan (Backend Only)

## Phase A - Stabilize backend contracts (highest priority)

1. Keep revalidation helper-driven only (no API fallback).
2. Introduce a small backend facade package under `src/server/new/public` (or `src/server/new/read`) that sitemap/rss and API routes can use.
3. Standardize helper usage across new server actions for consistency.

Deliverables:

- `src/server/new/utils/helper.ts` remains canonical for revalidation entrypoint
- `src/server/new/admin/shared/revalidate.ts` delegates to `revalidateContent`
- no `src/app/api/revalidate/route.ts` dependency in backend flow

## Phase B - Public blog server actions + APIs

Implement `src/server/new/public/content/blog`:

- `getPublishedBlogByPath.ts`
- `getPublishedBlogById.ts`
- `getPublishedBlogs.ts`
- `getPublishedBlogStaticPaths.ts`
- `shared.ts`
- `types.ts`
- `index.ts`
- `SERVER_ACTIONS.md`

Implement `src/app/api/content/blogs/**`:

- listing
- slug route
- id route
- static-paths route
- optional views/likes/comments id routes if blogs use same engagement model

## Phase C - Public project server actions + APIs

Implement `src/server/new/public/content/project`:

- `getPublishedProjectByPath.ts`
- `getPublishedProjectById.ts`
- `getPublishedProjects.ts`
- `getPublishedProjectStaticPaths.ts` (if project detail pages exist)
- `shared.ts`
- `types.ts`
- `index.ts`
- `SERVER_ACTIONS.md`

Implement `src/app/api/content/projects/**`:

- listing
- slug route (if detail route exists)
- id route
- static-paths route (if applicable)

## Phase D - Commonize backend helpers/actions

1. Create a shared public action helper layer for:
    - ObjectId validation
    - published-content existence guard
    - pagination normalization for public reads
    - consistent response mapping helpers
2. Consolidate API `_shared` contracts under a common content API shared module and re-export where needed.
3. Keep domain modules small and single-action-per-file.

## Phase E - SEO/SSG/ISR backend completion

1. Migrate sitemap/rss data dependencies to new backend read providers.
2. Ensure all static-path actions are wired for article/blog/project where required.
3. Ensure publish/update server actions trigger deterministic revalidation path sets.
4. Add optional cache tags (`revalidateTag`) for coarse invalidation per content type.

## Phase F - Backend tests and validation

1. Unit tests for public server actions:
    - happy path
    - invalid id/path handling
    - unpublished filtering
2. API contract tests for `src/app/api/content/**` routes.
3. Revalidation helper tests for affected-path invalidation behavior.
4. Query-plan validation for hot read paths (topic tree, article by path, listings).

---

## 4) What To Keep As-Is (Good Backend Decisions)

- Flat modular server action files in `src/server/new/public/*`.
- id-based stats/comments mutations.
- clear domain separation (article/comments/stats).
- admin shared route helper pattern via re-exported `_shared.ts` modules.
- `SERVER_ACTIONS.md` per domain for backend documentation.

---

## 5) Immediate Next Backend Tasks (Execution Order)

1. Build public blog domain server actions + APIs.
2. Build public project domain server actions + APIs.
3. Migrate sitemap/rss backend reads to new server-action providers.
4. Add backend facade for compatibility where legacy query imports remain.
5. Add backend tests for public server actions and API routes.

---

## 6) Definition of Done (Backend)

Backend is considered complete when all are true:

- public server actions exist for article/blog/project domains
- public API routes under `src/app/api/content/**` are complete and documented
- no unresolved dependency on missing legacy query/action layers
- sitemap/rss and static-path generation run only on current backend providers
- revalidation flows through server action helpers (`revalidateContent`) without API route dependency
- publish/update flows reliably revalidate all affected paths
- server action test coverage exists for core public/admin paths
