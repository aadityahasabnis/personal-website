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

### New public server actions (blog + project domains)

- `src/server/new/public/content/blog/*` is implemented with flat modular actions:
    - `getPublishedBlogByPath`
    - `getPublishedBlogById`
    - `getPublishedBlogs`
    - `getPublishedBlogStaticPaths`
- `src/server/new/public/content/project/*` is implemented with flat modular actions:
    - `getPublishedProjectByPath`
    - `getPublishedProjectById`
    - `getPublishedProjects`
    - `getPublishedProjectStaticPaths`

### Public API namespace migration

- Canonical public article API routes are under `src/app/api/content/articles/**`.
- Added direct article slug resolver route at `src/app/api/content/articles/[articleSlug]/route.ts` to close the previously empty folder gap.
- Canonical public blog API routes are under `src/app/api/content/blogs/**`.
- Canonical public project API routes are under `src/app/api/content/projects/**`.
- Legacy `src/app/api/articles/**` route handlers were removed.

### Public engagement route parity (id-based)

- Article/blog/project domains all expose id-based views/likes/comment routes under `src/app/api/content/**`.
- Shared public stats actions are reused for all three content domains.
- Shared public comments actions are reused for all three content domains.

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

Current snapshot (2026-03-21):

- Public content API coverage exists for article/blog/project domains under `src/app/api/content/**`.
- Route diagnostics are clean for the `content/articles` namespace.
- Remaining work is now concentrated in legacy import migration, SEO feed migration, helper commonization, and backend test coverage.

### Public read-facade adoption is partial

- `src/server/new/public/content/index.ts` now exports article/blog/project.
- Some application consumers still use legacy query imports instead of the new public facade.

### Backend query compatibility gap

- Current codebase still contains many imports to legacy backend modules:
    - `@/server/queries/*`
    - `@/server/actions/*`
- In the present tree, there is no `src/server/queries` directory and no `src/server/actions` directory.
- A migration is required to remove this contract mismatch, but it is intentionally deferred from the current server-action execution window.
- Current grep snapshot shows 76 unresolved legacy imports across public pages, admin pages, hooks, and components.

### Metadata/sitemap/rss backend dependency gap

- `src/app/sitemap.ts` and `src/app/rss.xml/route.ts` import legacy query functions.
- These should be migrated to the new backend server-action/query facade to keep static metadata generation stable.

### Commonized backend utility opportunity

- Reusable validation/data-shaping logic exists but is repeated across domains (public article/comments/stats and admin).
- A unified backend utility/facade layer is not fully established yet.

---

## 2) Backend Target Architecture (End State)

## 2.1 Public read backend by content domain

Contract objective:

- All public content domains must expose the same read surface so pages, API adapters, sitemap/RSS generators, and tests integrate through one predictable backend contract.

Implementation status:

- `src/server/new/public/content/article/*` is complete.
- `src/server/new/public/content/blog/*` is complete.
- `src/server/new/public/content/project/*` is complete.
- `src/server/new/public/content/index.ts` exports all three domains and is complete.

Required domain read contract (mandatory for every domain):

| Domain  | By-path read action         | By-id read action         | Listing action                                                                       | Static-paths action (SSG)        |
| ------- | --------------------------- | ------------------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| Article | `getPublishedArticleByPath` | `getPublishedArticleById` | `getPublishedArticleTopics` (plus `getPublishedTopicTreeBySlug` for topic detail IA) | `getPublishedArticleStaticPaths` |
| Blog    | `getPublishedBlogByPath`    | `getPublishedBlogById`    | `getPublishedBlogs`                                                                  | `getPublishedBlogStaticPaths`    |
| Project | `getPublishedProjectByPath` | `getPublishedProjectById` | `getPublishedProjects`                                                               | `getPublishedProjectStaticPaths` |

Contract guarantees:

1. Read actions are publish-state aware and never leak unpublished content in public flows.
2. Payload envelopes remain stable (`IApiResponse<T>` compatible) across domains.
3. Listing actions are pagination-safe and deterministic under repeated reads.
4. Static-path actions are the canonical source for prerender route discovery.

Operational rules:

1. By-path and by-id actions must return published-only content and stable payload shapes.
2. Listing actions must support pagination and deterministic sorting semantics.
3. Static-path actions must be the single source for prerender route discovery.
4. New public domains (for example notes/pages/series) must adopt this same four-action contract before API exposure.

Compliance checks:

1. Every public content domain must export the four mandatory read actions through its local `index.ts`.
2. `src/server/new/public/content/index.ts` must continue exporting all active public content domains.
3. Any new domain route under `src/app/api/content/<domain>/**` must map to these read actions, not ad-hoc query utilities.
4. SSG/ISR entrypoints (`generateStaticParams`, sitemap, rss, feed builders) must use `getPublished*StaticPaths` and corresponding read actions only.

## 2.2 Dynamic engagement backend (id-based)

Contract objective:

- All engagement writes and reads (views, likes, comments, comment upvotes) must use id-based operations and shared public actions to preserve cross-domain parity.

Core rules:

1. Continue id-based stats/comments with ObjectId-first operations.
2. Keep atomic counters in `PageStats` using upsert + `$inc`.
3. Keep moderation-first comments policy.

Data and concurrency invariants:

1. View/like increments must be atomic and monotonic at document level.
2. Engagement mutations must fail safely on invalid ids and unpublished/missing content.
3. Comment upvotes must resolve against approved/public comments only.
4. Engagement read payload shape must remain consistent across article/blog/project id routes.

Integration boundaries:

1. API routes under `src/app/api/content/**/id/[contentId]/**` are adapters; server actions under `src/server/new/public/stats/*` and `src/server/new/public/comments/*` remain source of truth.
2. Domain-specific pages/components should consume server actions directly for SSR/SSG flows; APIs remain for integration/testing clients.

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

## 3) Remaining Backend Execution Plan (Pending Work Only)

Only unfinished backend work is listed in this section. Completed work remains documented in section 1.1.

Current execution scope:

- Server actions only.
- No active migration work for `@/server/queries/*` in this execution window.

### Active Workstream SA1 - Public read server-action contract hardening

Goal:

- Enforce the public read contract uniformly across article/blog/project server actions.

Current gap:

- Core actions exist, but cross-domain contract enforcement (sorting/pagination/shape parity) is not yet validated as one standard.

Plan:

1. Standardize pagination and deterministic sorting behavior across all listing actions.
2. Align by-path and by-id output envelopes to the same domain-specific response guarantees.
3. Add contract checks to ensure each domain continues exporting the mandatory read actions through local `index.ts` files.

Deliverables:

- Cross-domain read-contract checklist implemented and documented.
- Uniform read behavior for by-path, by-id, listing, and static-path actions.

Acceptance criteria:

- Read-contract parity verified for article/blog/project server-action modules.
- No domain-specific contract drift in response shape and pagination semantics.

### Active Workstream SA2 - Shared server-action helper commonization

Goal:

- Reduce repeated read-helper logic in public server actions and keep behavior centralized.

Current gap:

- Repeated validation/mapping/pagination logic exists across article/blog/project action modules.

Plan:

1. Introduce `src/server/new/public/content/shared/` for reusable read helpers.
2. Move repeated ObjectId validation, published-content guards, and mapping helpers into shared modules.
3. Refactor article/blog/project server actions to consume shared helpers without changing API contracts.

Deliverables:

- Shared read-helper layer adopted by all public content server-action domains.
- Reduced duplication across domain action modules.

Acceptance criteria:

- Shared helpers are used by all three content domains.
- Existing action payload contracts remain backward-compatible.

### Active Workstream SA3 - Dynamic engagement server-action hardening

Goal:

- Strengthen id-based engagement actions for correctness and parity.

Current gap:

- Engagement behavior is implemented but needs explicit hardening against invalid id and state-edge cases.

Plan:

1. Tighten invalid-id and missing-content handling in stats/comment actions.
2. Validate monotonic atomic updates for views/likes (`PageStats` upsert + `$inc`).
3. Enforce moderation and approval invariants for comment read/write/upvote actions.

Deliverables:

- Hardened stats/comment server actions under `src/server/new/public/stats/*` and `src/server/new/public/comments/*`.
- Engagement parity checklist across article/blog/project id routes.

Acceptance criteria:

- Engagement server actions are consistent and deterministic across domains.
- Invalid-id and unpublished-content scenarios return stable, safe responses.

### Active Workstream SA4 - Server-action tests and revalidation validation

Goal:

- Lock server-action behavior with targeted tests and deterministic revalidation checks.

Current gap:

- End-to-end server-action test coverage is incomplete.

Plan:

1. Add unit tests for public read actions and engagement actions (happy path + edge cases).
2. Add revalidation helper tests for publish/update/unpublish path invalidation behavior.
3. Add contract tests for action output shape stability.

Deliverables:

- `src/server/new/public/**/__tests__` action unit suites.
- Revalidation helper validation suite for deterministic path invalidation.

Acceptance criteria:

- Server-action test suites pass for public read and engagement domains.
- Revalidation behavior is verified for key content lifecycle transitions.

### Deferred work (not in current scope)

- Legacy import migration for `@/server/queries/*`.
- Legacy import migration for `@/server/actions/*`.
- Metadata migration work that depends on legacy query import replacement.

### Execution order for current scope

1. Workstream SA1 (public read contract hardening)
2. Workstream SA2 (shared helper commonization)
3. Workstream SA3 (dynamic engagement hardening)
4. Workstream SA4 (server-action tests and revalidation validation)

---

## 4) What To Keep As-Is (Good Backend Decisions)

- Flat modular server action files in `src/server/new/public/*`.
- id-based stats/comments mutations.
- clear domain separation (article/comments/stats).
- admin shared route helper pattern via re-exported `_shared.ts` modules.
- `SERVER_ACTIONS.md` per domain for backend documentation.

---

## 5) Immediate Next Backend Tasks (Execution Order)

1. Standardize public read server-action contract behavior across article/blog/project (shape, pagination, sorting, published filtering).
2. Introduce and adopt shared helper modules for public content server actions under `src/server/new/public/content/shared/`.
3. Harden id-based engagement server actions for invalid ids, unpublished content, and moderation invariants.
4. Add unit tests for public read and engagement server actions.
5. Add revalidation helper tests for publish/update/unpublish path invalidation behavior.
6. Run typecheck and test suites for server-action focused changes, and log non-server-action backlog separately.

Execution notes:

- Target order is strict: complete steps 1-3 before broad test implementation to avoid rewriting tests.
- Legacy query import migration is intentionally deferred and should not block current server-action work.

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
