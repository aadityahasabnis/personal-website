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

# Backend Implementation Plan (Audit-Aligned)

Last updated: 2026-03-22
Owner: Backend platform
Scope: Models, server actions, API adapters, verification pipeline, backend documentation

---

## 1) Purpose

This document is the single source of truth for backend progress after the latest architecture + QA audit.

It tracks:

1. What is complete and production-usable.
2. What is partially complete and at risk.
3. What is missing and prioritized next.

---

## 2) Current Implementation Status

### 2.1 Data models and DB layer

Status: Completed with targeted optimization backlog.

Implemented:

1. Unified content model with discriminators in `src/server/models/Content.ts`.
2. Topic/subtopic/content/comment/contact/subscriber/admin/pageStats models are present and actively used.
3. Core indexes for publish-state and list flows are implemented.
4. Shared DB connection strategy is implemented in `src/lib/db/connectDB.ts` with:
    - cached Mongoose connection for app logic,
    - cached native Mongo client for NextAuth adapter.

Audit findings:

1. Model instance/static methods exist but are inconsistently used by action layer in some domains.
2. Some model statics are currently unused and should either be adopted consistently or documented as optional utilities.

### 2.2 New server-action architecture (`src/server/new`)

Status: Substantially implemented.

Implemented:

1. Admin domains: topic, subtopic, content(article/blog/project), comments, contacts, subscribers, settings.
2. Public domains: content(article/blog/project), stats, comments, contact, subscribe.
3. Standard response helper layer with typed envelopes.
4. P0 admin auth hardening completed across previously unguarded modules.
5. P1 abuse hardening completed for:
    - public contact submit,
    - public comment upvote,
    - public stats view increment,
    - public stats like increment.

Audit findings:

1. P1 anti-abuse is implemented, but response status typing does not currently allow 429 and forces 403 for throttling outcomes.
2. Legacy call paths still bypass `src/server/new` in large parts of the app shell.

### 2.3 API adapter coverage (`src/app/api`)

Status: Partial.

Strong coverage:

1. Admin content/topic/subtopic routes map to `src/server/new/admin` actions.
2. Public content read + id-based engagement routes map to `src/server/new/public` actions.

Missing dedicated API adapter groups for full server-action testability:

1. `src/server/new/admin/comments/*`
2. `src/server/new/admin/contacts/*`
3. `src/server/new/admin/subscribers/*`
4. `src/server/new/admin/settings/*`
5. `src/server/new/public/contact/submitPublicContact.ts`
6. `src/server/new/public/subscribe/*`

Intentional API routes outside server-action testing scope:

1. `src/app/api/auth/[...nextauth]/route.ts` (NextAuth handler)
2. `src/app/api/admin/auth/*` (auth/session plumbing)
3. `src/app/api/images/route.ts`, `src/app/api/upload/route.ts` (media services)

### 2.4 Verification pipeline

Status: Manual and document-driven.

Implemented:

1. Verification plan and execution ledger in `verify_server_actions.md`.
2. Priority classification and implementation progress logging (P0, P1).

Missing:

1. Executable verification script/pipeline for CI.
2. Structured machine-readable report artifact per run.
3. Automated traceability from failure to action/module owner.

### 2.5 Frontend/backend integration migration

Status: Incomplete (high impact).

Observed:

1. Many app files still import legacy paths (`@/server/queries/*`, `@/server/actions/*`).
2. New backend namespaces are not the sole source of runtime behavior yet.

Consequence:

1. Backend modernization is only partially realized despite strong new modules.

---

## 3) Completed Work Log

### Completed (verified)

1. New backend modular action layout established under `src/server/new`.
2. Admin auth guard gaps (P0) fixed in strict order for topic, subtopic, article, blog, project.
3. Public abuse-control hardening (P1) implemented for contact, comment upvote, views increment, likes increment.
4. Public content read contracts standardized for article/blog/project modules.
5. API wrappers for admin content/topic/subtopic and public content/engagement implemented.

### Completed but requires follow-up

1. Verification documentation exists but remains manual-only.
2. Deprecated alias APIs (`/publish` style) are still present for backward compatibility and need a sunset plan.

---

## 4) Prioritized Remaining Work

## P0 (Critical)

1. Complete migration away from legacy imports:
    - remove runtime dependence on `@/server/queries/*` and `@/server/actions/*` in app routes/components/hooks,
    - route all backend behavior through `src/server/new` contracts.
2. Add missing API adapter groups for unexposed server-action domains listed in section 2.3.

## P1 (High)

1. Add an executable verification command (for example: `pnpm verify:server-actions`) that:
    - validates action inventory,
    - validates API coverage map,
    - emits JSON + markdown reports,
    - fails CI when coverage regresses.
2. Expand API response status typing to include 429 so rate-limit semantics are accurate.
3. Add automated tests for public abuse controls and admin auth boundaries.

## P2 (Optimization / maintainability)

1. Reduce duplicated API adapter glue (`toHttp`/`parseJsonBody` patterns) with shared module boundaries.
2. Standardize model method usage policy (either method-first or direct query with documented rationale).
3. Remove deprecated API aliases after migration freeze and client update window.

---

## 5) Delivery Roadmap

### Phase A: Stabilize surface (1 sprint)

1. Ship missing API adapter groups.
2. Introduce response status union update (add 429).
3. Add smoke tests for each newly exposed API group.

### Phase B: Complete migration (1-2 sprints)

1. Replace legacy backend imports in public pages first.
2. Replace legacy backend imports in admin routes/components.
3. Remove or quarantine any legacy contract shim.

### Phase C: Verification automation (1 sprint)

1. Implement CI verification command.
2. Publish per-PR audit report artifact.
3. Enforce coverage gate in pull request checks.

---

## 6) Exit Criteria

Backend implementation is considered complete when all criteria are true:

1. No runtime imports from `@/server/queries/*` or `@/server/actions/*` remain.
2. Every exported business server action has a dedicated API adapter for integration testing, or is explicitly documented as internal-only.
3. Verification runs are executable and CI-enforced.
4. Documentation and architecture are fully aligned with actual implementation.

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
