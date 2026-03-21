# Backend Implementation Plan (Regenerated)

## Scope

This document audits and plans backend implementation for:

- data models and DB access
- public/admin server actions
- SSG + ISR content delivery behavior in Next.js App Router
- API route coverage used to test server actions
- optimization items for server actions and DB calls

---

## 1) Current Backend State (What is implemented)

### 1.1 Models and schema/index baseline

Implemented:

- `src/server/models/Content.ts`
  - unified `content` collection
  - discriminator model for `article`, `blog`, `project`
  - unique index: `{ type, slug }`
  - publish/read indexes present
- `src/server/models/Topic.ts`
  - topic slug uniqueness and published/order indexes
- `src/server/models/Subtopic.ts`
  - `{ topicId, slug }` uniqueness and published/order indexes
- `src/server/models/PageStats.ts`
  - unique `contentId`
  - atomic counter-oriented methods and ranking indexes
- `src/server/models/Comment.ts`
  - moderation fields, parent/reply support, indexes for public/admin moderation queries

Status: **Core model layer is implemented for article/blog/project pipelines.**

Gap:

- `CONTENT_TYPES` currently supports only `article|blog|project` (no `note/page/series/log` in new backend contracts).

---

### 1.2 Database connectivity

Implemented:

- `src/lib/db/connectDB.ts`
  - global cached Mongoose connection for app queries/actions
  - separate native `MongoClient` promise for NextAuth adapter
  - pool settings and connection reuse strategy present

Status: **Good baseline for App Router server workload.**

---

### 1.3 New public server actions (new backend namespace)

Implemented:

- `src/server/new/public/content/article/*`
  - topic listing
  - topic tree
  - by-path
  - by-id
  - static paths
- `src/server/new/public/content/blog/*`
  - by-path, by-id, list, static paths
- `src/server/new/public/content/project/*`
  - by-path, by-id, list, static paths
- `src/server/new/public/stats/*`
  - get/increment views by `contentId`
  - get/increment likes by `contentId`
- `src/server/new/public/comments/*`
  - list approved comments
  - create pending comment
  - upvote approved comment

Status: **Public server-action backend is implemented for article/blog/project and engagement flows.**

---

### 1.4 New admin server actions (new backend namespace)

Implemented:

- topics: create/update/publish/delete/reorder/get
- subtopics: create/update/publish/delete/reorder/get
- content/article: create/update/publish/delete/reorder/get (+ helper actions)
- content/blog: create/update/publish/delete/get (+ status/featured flows via API adapters)
- content/project: create/update/publish/delete/reorder/get (+ lifecycle/featured/status via API adapters)
- admin comments/subscribers/settings namespaces in `src/server/new/admin/*`
- shared helpers:
  - `src/server/new/admin/shared/auth.ts`
  - `src/server/new/admin/shared/revalidate.ts`
  - `src/server/new/admin/shared/seo.ts`

Status: **Admin server-action backend for core content domains is largely implemented.**

---

### 1.5 API routes to test/integrate server actions

Implemented and mostly comprehensive under `src/app/api/content/**` and `src/app/api/admin/**`:

- public read routes (articles/blogs/projects)
- public id-based engagement routes (views/likes/comments/upvote) for all three domains
- admin content/topic/subtopic/auth routes
- many routes include rich `OPTIONS` docs with sample tests and payload schema

Status: **Good API adapter coverage for testing server actions externally.**

---

## 2) What is not fully implemented (Critical remaining work)

### 2.1 Legacy import surface is still active (major blocker to "complete backend")

There are still many live imports to non-existent legacy paths:

- `@/server/queries/*`
- `@/server/actions/*`

Observed in:

- public pages/components/hooks
- admin pages/components
- stats/comments/ui integration components

This means backend migration is partial even though `src/server/new/**` is strong.

**Required:** migrate all consumers to `src/server/new/**` (or add compatibility facade that points to new modules).

---

### 2.2 Notes backend path is not migrated to new server-action contracts

Current public notes pages still depend on legacy queries/actions:

- `src/app/(public)/notes/page.tsx`
- `src/app/(public)/notes/[slug]/page.tsx`

Also, `CONTENT_TYPES` in new schema constants does not include `note`.

**Required decision:**

- either migrate notes into new content contract (`note` domain in `src/server/new/public/content/note/*` + admin actions)
- or formally mark notes as legacy/deferred and isolate them from "new backend completion".

---

### 2.3 Public article page still uses legacy stats/view increment flow

`src/app/(public)/articles/[topicSlug]/[articleSlug]/page.tsx` uses:

- `getArticleByTopicSlug`, `getAllPublishedArticles` from legacy queries
- `getArticleStats`, `getArticleCommentCount` legacy stats
- `incrementViews` legacy action with slug-based flow

While new backend provides id-based stats/comments server actions.

**Required:** move page to new content + id-based stats/comments contract.

---

### 2.4 SSG/ISR consistency is partial

Implemented:

- blogs/projects detail pages use `getPublished*StaticPaths` and `revalidate = 3600`
- article detail has `generateStaticParams` + `revalidate = 3600`
- sitemap and RSS now read from new public providers

Gaps:

- comments in some pages still mention `/api/revalidate` despite route removal
- notes detail uses `revalidate = false` with static params + legacy data flow (needs explicit policy)
- mixed old/new data providers reduce confidence in deterministic ISR invalidation

---

### 2.5 No backend test suites currently present for new server actions

No `*.test.ts`/`*.spec.ts` detected in `src`.

**Required:** add test coverage for:

- public read contract (article/blog/project)
- stats atomic increments and error cases
- comments moderation visibility and upvote constraints
- admin create/update/publish lifecycle with revalidation helpers

---

## 3) SSG + ISR implementation verification

## 3.1 What is correct now

- App Router static generation is used with `generateStaticParams` for key detail pages.
- ISR (`revalidate`) is configured on article/blog/project listings/details and metadata routes (`rss.xml`).
- Revalidation helper exists in server layer (`revalidateContent`) and admin shared wrappers call it.
- Public content static path provider actions exist for article/blog/project and are used by routes/pages.

## 3.2 What must be tightened

1. Remove stale comments/docs mentioning `/api/revalidate`.
2. Ensure every public content page uses new server-action providers only (no legacy query paths).
3. Define explicit notes ISR strategy:
   - Option A: ISR window + static params from new note provider
   - Option B: full static no-ISR, publish-triggered rebuild only
4. Add contract test to validate `generateStaticParams` providers return stable sorted output.

---

## 4) Server-action and DB call optimization opportunities

## 4.1 High-priority optimizations

1. **Batch content existence checks in engagement hot paths**
   - current stats/comments often call `ensurePublishedContent` before mutation/read
   - keep correctness, but reduce duplicate checks where same request already proved content validity
2. **Avoid N+1 in RSS article detail loading**
   - current RSS flow gets static paths then fetches details for each path
   - replace with one list query projection for top N published articles
3. **Stricter projection everywhere**
   - keep `.select()` minimal across all read actions (already good in many files; standardize globally)
4. **Use deterministic stable sort contract for all list/static-path providers**
   - ensure cache-friendly and testable outputs under ISR/SSG

## 4.2 Medium-priority optimizations

1. Add optional dedupe/rate-limit strategy for views/likes (session/IP/time window) to reduce abuse.
2. Add pagination metadata parity for blog/project list actions if client APIs need total/hasMore uniformly.
3. Evaluate `autoIndex` production behavior in `connectDB` (safe migration strategy recommended).
4. Add standardized action telemetry (duration, status code, action name) for backend observability.

---

## 5) API folder verification for server-action testing

Verified:

- public engagement routes for article/blog/project are present:
  - `/api/content/<domain>/id/:contentId/views`
  - `/api/content/<domain>/id/:contentId/likes`
  - `/api/content/<domain>/id/:contentId/comments`
  - `/api/content/<domain>/id/:contentId/comments/:commentId/upvote`
- content read/testing routes are present:
  - list/by-path/by-id/static-paths per article/blog/project
- many routes implement `OPTIONS` with:
  - request schema
  - sample responses
  - basic test cases

Remaining:

- add route-level integration tests that execute these APIs in CI (not only documented in `OPTIONS`).

---

## 6) Execution Plan (remaining work only)

## Workstream B1 - Eliminate legacy backend imports (highest priority)

Goal:

- remove all `@/server/queries/*` and `@/server/actions/*` imports from app/components/hooks.

Deliverables:

- consumers moved to `src/server/new/**` contracts
- temporary compatibility adapters only if needed for phased migration

Acceptance:

- zero legacy import matches in `src`.

---

## Workstream B2 - Notes domain migration into new backend

Goal:

- implement `note` in new public/admin content contracts or explicitly de-scope notes from current release.

Deliverables if included:

- `src/server/new/public/content/note/*`
- admin note actions under `src/server/new/admin/content/note/*`
- notes pages switched to new providers
- SSG/ISR policy documented and enforced

Acceptance:

- notes no longer depend on legacy query/action modules.

---

## Workstream B3 - Public page alignment to id-based engagement

Goal:

- migrate article/notes public pages/components/hooks to the new id-based stats/comments/likes contracts.

Deliverables:

- `ContentStats`, `CommentSection`, hooks and page loaders aligned with `contentId` contract
- remove slug-based legacy stats/likes actions from runtime paths

Acceptance:

- page stats/comments/likes run fully through `src/server/new/public/{stats,comments}`.

---

## Workstream B4 - SSG/ISR contract hardening

Goal:

- ensure deterministic static generation and revalidation behavior across all public content domains.

Deliverables:

- stale `/api/revalidate` references removed
- explicit notes strategy finalized
- static-path + metadata generators use new providers only

Acceptance:

- predictable ISR behavior with no split legacy/new data providers.

---

## Workstream B5 - Backend tests for server actions + API adapters

Goal:

- introduce automated verification for new backend contracts.

Test scope:

- public read actions (happy + null/not-found + invalid id)
- stats increment atomicity and monotonicity
- comment moderation/parent constraints
- admin create/update/publish flows and counter adjustments
- selected API adapter route smoke tests

Acceptance:

- CI includes backend tests and enforces contract stability.

---

## 7) Definition of Done for backend completion

Backend is complete when all are true:

1. No runtime imports remain for `@/server/queries/*` or `@/server/actions/*`.
2. Public pages (articles/blogs/projects/notes-in-scope) use only new backend providers.
3. Engagement flows are consistently id-based and atomic.
4. SSG/ISR providers are deterministic and unified through new server-action/data contracts.
5. API adapter routes exist and are CI-tested (not only documented via `OPTIONS`).
6. Admin content lifecycle triggers revalidation through server helper layer only.

---

## 8) Environment verification note

Automated lint/typecheck execution could not be run in this session because PowerShell Core (`pwsh`) is unavailable in the current environment. Backend status in this document is based on static code audit of repository files.

