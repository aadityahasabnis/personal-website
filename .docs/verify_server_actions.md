# Server Actions Verification Plan

## 1) Verification Charter

This document is only for verification planning and execution.

It answers three things clearly:

1. What we will verify
2. What we will not verify
3. How verification will be executed step-by-step

No implementation changes are included in this plan.

---

## 2) Scope Boundaries

### In Scope (Verify)

1. Model-to-action contract coverage for models in [src/server/models](src/server/models).
2. Admin modules first, then public modules.
3. Mutation correctness: validation, auth/guard, write logic, revalidation decision.
4. Read correctness: publish/approval visibility rules, pagination strategy, query shape.
5. Model method and index alignment with action-level usage.
6. Export reachability via [src/server/new/admin/index.ts](src/server/new/admin/index.ts) and [src/server/new/public/index.ts](src/server/new/public/index.ts).

### Out of Scope (Do Not Verify)

1. Frontend design and visual QA.
2. New feature development.
3. Refactoring/rewriting actions or models.
4. CI/CD and infra changes.
5. Deep legacy migration outside currently active new modules.

---

## 3) Exactly What To Verify

### For each mutation action

1. Guard present (admin auth or public safety constraints).
2. Input parsing and validation complete.
3. Correct model fields updated.
4. Existing model instance/static method used when contract exists.
5. Revalidation called when mutation affects static content.
6. Stable success/error envelope.

### For each read action

1. Visibility gate correct (published or approved constraints).
2. Query uses correct filters and sort.
3. Projection avoids unnecessary payload.
4. Pagination strategy defined for growth.
5. Stable success/error envelope.

### For each model contract

1. Critical fields are covered by at least one action path.
2. Declared methods are used consistently or intentionally bypassed (documented).
3. Indexes match dominant query filters/sorts.

---

## 4) What Not To Verify In This Pass

1. CSS, layout, and component UX behavior.
2. Content writing quality.
3. Brand/design system decisions.
4. Unused experimental folders unless imported by active modules.

---

## 5) Execution Plan (How Verification Will Be Implemented)

### Step 0: Inventory and mapping

Inputs:

1. [src/server/models](src/server/models)
2. [src/server/new/admin](src/server/new/admin)
3. [src/server/new/public](src/server/new/public)

Actions:

1. List all models and all exported admin/public actions.
2. Build model-to-action mapping matrix.
3. Mark unmapped fields/methods/indexes.

Output:

1. Inventory matrix with coverage status.

### Step 1: Admin pass (must run first)

Order:

1. [src/server/new/admin/comments](src/server/new/admin/comments)
2. [src/server/new/admin/contacts](src/server/new/admin/contacts)
3. [src/server/new/admin/content/article](src/server/new/admin/content/article)
4. [src/server/new/admin/content/blog](src/server/new/admin/content/blog)
5. [src/server/new/admin/content/project](src/server/new/admin/content/project)
6. [src/server/new/admin/topic](src/server/new/admin/topic)
7. [src/server/new/admin/subtopic](src/server/new/admin/subtopic)
8. [src/server/new/admin/subscribers](src/server/new/admin/subscribers)
9. [src/server/new/admin/settings](src/server/new/admin/settings)

Checks per action:

1. Guard
2. Validation
3. Correct write/read behavior
4. Model method alignment
5. Revalidation correctness
6. Error contract consistency

Output:

1. Admin findings table: Severity, Module, Action, Evidence, Recommendation.

### Step 2: Public pass (after admin)

Order:

1. [src/server/new/public/comments](src/server/new/public/comments)
2. [src/server/new/public/contact](src/server/new/public/contact)
3. [src/server/new/public/content/article](src/server/new/public/content/article)
4. [src/server/new/public/content/blog](src/server/new/public/content/blog)
5. [src/server/new/public/content/project](src/server/new/public/content/project)
6. [src/server/new/public/stats](src/server/new/public/stats)
7. [src/server/new/public/subscribe](src/server/new/public/subscribe)

Checks per action:

1. Visibility constraints
2. Validation and normalization
3. Abuse controls where relevant
4. Atomicity for counters/mutations
5. Read query/pagination efficiency
6. Error contract consistency

Output:

1. Public findings table: Severity, Module, Action, Evidence, Recommendation.

### Step 3: Cross-cutting pass

Checks:

1. N+1 query risk in list-heavy modules.
2. Missing projection and payload bloat risk.
3. Bulk operation efficiency.
4. Barrel export completeness and modular discipline.

Output:

1. Optimization shortlist with impact tag: High/Medium/Low.

### Step 4: Consolidation and implementation backlog

1. Merge all findings.
2. Classify each as P0, P1, or P2.
3. Mark each item as:
    - Confirmed code gap
    - Assumption/documentation gap
    - Performance hardening item

Output:

1. Final implementation-ready verification backlog.

---

## 6) Deliverable Format (Required)

### Coverage Table

Columns:

1. Domain
2. Module
3. Action
4. Verified checks passed
5. Failed checks
6. Evidence reference

### Findings Table

Columns:

1. Priority (P0/P1/P2)
2. Severity (Critical/High/Medium/Low)
3. File/module
4. Problem statement
5. Why it matters
6. Recommended fix direction

---

## 7) Priority Rules

### P0

Any issue that risks data integrity, auth boundary failure, or incorrect visibility/revalidation behavior.

### P1

Contract inconsistency or missing hardening with realistic production risk.

### P2

Scale optimization and maintainability improvements.

---

## 8) Exit Criteria

Verification is complete only when all conditions are true:

1. Every active model has field/method/index coverage mapping.
2. Every admin and public action has checklist status.
3. All gaps are classified into P0/P1/P2.
4. Out-of-scope items are explicitly excluded from findings.
5. A final implementation backlog is ready without additional discovery work.

---

## 9) Final Direction

Admin-first then public is mandatory for this verification cycle.
The next step after this plan is to execute Step 0 through Step 4 and produce the coverage and findings tables in the same order.

---

## 10) Verification Execution Results (Completed)

Verification date: 2026-03-22
Execution status: Step 0, Step 1, Step 2, Step 3, Step 4 completed.

## Step 0 Result: Inventory and Mapping

### Model inventory

Verified models in [src/server/models](src/server/models):

1. [src/server/models/Admin.ts](src/server/models/Admin.ts)
2. [src/server/models/Comment.ts](src/server/models/Comment.ts)
3. [src/server/models/Contact.ts](src/server/models/Contact.ts)
4. [src/server/models/Content.ts](src/server/models/Content.ts)
5. [src/server/models/PageStats.ts](src/server/models/PageStats.ts)
6. [src/server/models/Subscriber.ts](src/server/models/Subscriber.ts)
7. [src/server/models/Subtopic.ts](src/server/models/Subtopic.ts)
8. [src/server/models/Topic.ts](src/server/models/Topic.ts)

### Action inventory (executed count)

| Domain | Module          | Files with actions | Exported actions |
| ------ | --------------- | -----------------: | ---------------: |
| Admin  | comments        |                  8 |                8 |
| Admin  | contacts        |                 10 |               10 |
| Admin  | content/article |                  8 |               19 |
| Admin  | content/blog    |                  6 |               17 |
| Admin  | content/project |                  7 |               20 |
| Admin  | topic           |                  7 |               15 |
| Admin  | subtopic        |                  7 |               12 |
| Admin  | subscribers     |                  6 |                6 |
| Admin  | settings        |                  3 |                3 |
| Public | comments        |                  3 |                3 |
| Public | contact         |                  1 |                1 |
| Public | content/article |                  5 |                5 |
| Public | content/blog    |                  4 |                4 |
| Public | content/project |                  4 |                4 |
| Public | stats           |                  4 |                4 |
| Public | subscribe       |                  2 |                2 |

### Export reachability

Verified OK:

1. [src/server/new/admin/index.ts](src/server/new/admin/index.ts) exports all admin module barrels.
2. [src/server/new/public/index.ts](src/server/new/public/index.ts) exports all public module barrels.
3. [src/server/new/admin/topic/index.ts](src/server/new/admin/topic/index.ts) and [src/server/new/admin/subtopic/index.ts](src/server/new/admin/subtopic/index.ts) export actions files.

## Step 1 Result: Admin Verification (Completed First)

### Admin coverage status

| Module          | Guard   | Validation | Write/Read correctness | Revalidation | Overall             |
| --------------- | ------- | ---------- | ---------------------- | ------------ | ------------------- |
| comments        | OK      | OK         | OK                     | OK           | OK                  |
| contacts        | OK      | OK         | OK                     | OK           | OK                  |
| content/article | Partial | OK         | OK                     | OK           | Needs major changes |
| content/blog    | Partial | OK         | OK                     | OK           | Needs major changes |
| content/project | Partial | OK         | OK                     | OK           | Needs major changes |
| topic           | Missing | OK         | OK                     | OK           | Needs major changes |
| subtopic        | Missing | OK         | OK                     | OK           | Needs major changes |
| subscribers     | OK      | OK         | OK                     | OK           | OK                  |
| settings        | OK      | OK         | OK                     | OK           | OK                  |

### Critical admin findings (major changes)

| Priority | Severity | Module          | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Problem                                                                    | Recommendation                                                  |
| -------- | -------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| P0       | Critical | topic           | [src/server/new/admin/topic/createTopic.ts](src/server/new/admin/topic/createTopic.ts), [src/server/new/admin/topic/updateTopic.ts](src/server/new/admin/topic/updateTopic.ts), [src/server/new/admin/topic/publishTopic.ts](src/server/new/admin/topic/publishTopic.ts), [src/server/new/admin/topic/actions.ts](src/server/new/admin/topic/actions.ts)                                                                                                                                                                                                                                                                                                                                                   | No admin auth guard in topic actions                                       | Add getAdminId guard at start of every exported topic action    |
| P0       | Critical | subtopic        | [src/server/new/admin/subtopic/createSubtopic.ts](src/server/new/admin/subtopic/createSubtopic.ts), [src/server/new/admin/subtopic/updateSubtopic.ts](src/server/new/admin/subtopic/updateSubtopic.ts), [src/server/new/admin/subtopic/publishSubtopic.ts](src/server/new/admin/subtopic/publishSubtopic.ts), [src/server/new/admin/subtopic/actions.ts](src/server/new/admin/subtopic/actions.ts)                                                                                                                                                                                                                                                                                                         | No admin auth guard in subtopic actions                                    | Add getAdminId guard at start of every exported subtopic action |
| P0       | Critical | content/blog    | [src/server/new/admin/content/blog/deleteBlog.ts](src/server/new/admin/content/blog/deleteBlog.ts), [src/server/new/admin/content/blog/publishBlog.ts](src/server/new/admin/content/blog/publishBlog.ts), [src/server/new/admin/content/blog/actions.ts](src/server/new/admin/content/blog/actions.ts), [src/server/new/admin/content/blog/getBlogs.ts](src/server/new/admin/content/blog/getBlogs.ts)                                                                                                                                                                                                                                                                                                     | Partial auth coverage only (create/update guarded, others not)             | Apply getAdminId guard to all blog actions                      |
| P0       | Critical | content/project | [src/server/new/admin/content/project/deleteProject.ts](src/server/new/admin/content/project/deleteProject.ts), [src/server/new/admin/content/project/publishProject.ts](src/server/new/admin/content/project/publishProject.ts), [src/server/new/admin/content/project/actions.ts](src/server/new/admin/content/project/actions.ts), [src/server/new/admin/content/project/getProjects.ts](src/server/new/admin/content/project/getProjects.ts)                                                                                                                                                                                                                                                           | Partial auth coverage only (create/update guarded, others not)             | Apply getAdminId guard to all project actions                   |
| P0       | Critical | content/article | [src/server/new/admin/content/article/deleteArticle.ts](src/server/new/admin/content/article/deleteArticle.ts), [src/server/new/admin/content/article/publishArticle.ts](src/server/new/admin/content/article/publishArticle.ts), [src/server/new/admin/content/article/actions.ts](src/server/new/admin/content/article/actions.ts), [src/server/new/admin/content/article/getArticles.ts](src/server/new/admin/content/article/getArticles.ts), [src/server/new/admin/content/article/reorderArticles.ts](src/server/new/admin/content/article/reorderArticles.ts), [src/server/new/admin/content/article/reconcileArticleCounters.ts](src/server/new/admin/content/article/reconcileArticleCounters.ts) | Partial auth coverage only (create/update guarded, many actions unguarded) | Apply getAdminId guard to all article actions                   |

### Important admin consistency findings

| Priority | Severity | Module                | Evidence                                                                                                                                                                                                                                                           | Problem                                                                      | Recommendation                                                                     |
| -------- | -------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| P1       | High     | comments              | [src/server/new/admin/comments/approveComment.ts](src/server/new/admin/comments/approveComment.ts), [src/server/new/admin/comments/rejectComment.ts](src/server/new/admin/comments/rejectComment.ts), [src/server/models/Comment.ts](src/server/models/Comment.ts) | Comment model has instance methods but moderation uses direct updateOne      | Standardize moderation transitions through model methods or document bypass policy |
| P2       | Medium   | topic/subtopic models | [src/server/models/Topic.ts](src/server/models/Topic.ts), [src/server/models/Subtopic.ts](src/server/models/Subtopic.ts)                                                                                                                                           | No publish/unpublish instance methods; action layer owns all lifecycle logic | Add model lifecycle methods or explicitly keep action-only lifecycle contract      |

## Step 2 Result: Public Verification (Completed)

### Public coverage status

| Module          | Visibility constraints | Validation/Normalization | Atomicity | Abuse controls | Overall       |
| --------------- | ---------------------- | ------------------------ | --------- | -------------- | ------------- |
| comments        | OK                     | OK                       | OK        | Partial        | Mostly OK     |
| contact         | N/A                    | OK                       | OK        | Missing        | Needs changes |
| content/article | OK                     | OK                       | OK        | N/A            | OK            |
| content/blog    | OK                     | OK                       | OK        | N/A            | OK            |
| content/project | OK                     | OK                       | OK        | N/A            | OK            |
| stats           | OK                     | OK                       | OK        | Missing        | Needs changes |
| subscribe       | N/A                    | OK                       | OK        | Missing        | Needs changes |

### Public findings

| Priority | Severity | Module   | Evidence                                                                                                                                                                                                                                   | Problem                                                      | Recommendation                                         |
| -------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------ |
| P1       | High     | contact  | [src/server/new/public/contact/submitPublicContact.ts](src/server/new/public/contact/submitPublicContact.ts)                                                                                                                               | No rate limiting or anti-spam control in action path         | Add IP/email-window rate limiting and abuse throttling |
| P1       | High     | comments | [src/server/new/public/comments/upvotePublicCommentById.ts](src/server/new/public/comments/upvotePublicCommentById.ts)                                                                                                                     | No upvote deduplication policy                               | Add dedup guard (IP hash or user/session key)          |
| P1       | High     | stats    | [src/server/new/public/stats/incrementContentViewsById.ts](src/server/new/public/stats/incrementContentViewsById.ts), [src/server/new/public/stats/incrementContentLikesById.ts](src/server/new/public/stats/incrementContentLikesById.ts) | Counters can be spammed without abuse guard                  | Add request throttling/dedup where acceptable          |
| P2       | Medium   | comments | [src/server/new/public/comments/getPublicCommentsByContentId.ts](src/server/new/public/comments/getPublicCommentsByContentId.ts)                                                                                                           | Offset pagination only; no cursor strategy for large threads | Add cursor pagination path for high-volume threads     |

## Step 3 Result: Cross-Cutting Performance and Modularization

### Verified OK

1. One-action-per-file modular structure is maintained across admin/public modules.
2. Shared helpers are separated by module domain.
3. Most list endpoints use projection and lean reads.
4. Core counter updates are atomic via $inc + upsert patterns.

### Performance and architecture risks

| Priority | Severity | Area                           | Evidence                                                                                                                                                                                                                                                                                                     | Risk                                                        | Recommendation                                                                    |
| -------- | -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| P1       | High     | Admin auth boundary            | Multiple admin modules listed in Step 1                                                                                                                                                                                                                                                                      | Unauthorized action invocation risk                         | Enforce uniform guard contract in all admin actions                               |
| P2       | Medium   | Comment tree query cost        | [src/server/new/admin/comments/getComments.ts](src/server/new/admin/comments/getComments.ts)                                                                                                                                                                                                                 | Multiple follow-up reads and ancestor resolution loops      | Consider aggregation-based ancestry resolution for large datasets                 |
| P2       | Medium   | Bulk operations                | [src/server/new/admin/content/article/actions.ts](src/server/new/admin/content/article/actions.ts), [src/server/new/admin/topic/actions.ts](src/server/new/admin/topic/actions.ts), [src/server/new/admin/subtopic/actions.ts](src/server/new/admin/subtopic/actions.ts)                                     | Per-item loops in bulk paths can increase latency           | Prefer batched write patterns where business rules allow                          |
| P2       | Medium   | Model static usage consistency | [src/server/models/PageStats.ts](src/server/models/PageStats.ts), [src/server/new/public/stats/incrementContentViewsById.ts](src/server/new/public/stats/incrementContentViewsById.ts), [src/server/new/public/stats/incrementContentLikesById.ts](src/server/new/public/stats/incrementContentLikesById.ts) | Model statics exist but action paths use direct query logic | Standardize either static-method usage or keep direct-query convention documented |

## Step 4 Result: Consolidated Backlog (Implementation-Ready)

### P0 (Major changes required)

1. Add admin auth guard to all unguarded admin action files in:
    - [src/server/new/admin/topic](src/server/new/admin/topic)
    - [src/server/new/admin/subtopic](src/server/new/admin/subtopic)
    - [src/server/new/admin/content/article](src/server/new/admin/content/article)
    - [src/server/new/admin/content/blog](src/server/new/admin/content/blog)
    - [src/server/new/admin/content/project](src/server/new/admin/content/project)
2. Enforce guard coverage for both mutation and admin read actions.

### P1 (High-value hardening)

1. Add abuse controls for public contact submission.
2. Add dedup/throttle controls for public comment upvote and public stats increments.
3. Align comment moderation transitions with explicit model-method policy.

### P2 (Optimization and maintainability)

1. Optimize large comment/admin tree queries and loop-based bulk workflows.
2. Standardize model-static usage strategy for PageStats and publish lifecycle helpers.
3. Introduce cursor pagination strategy for large public comment threads.

## 11) What Is OK

1. Export wiring is complete for admin/public module barrels.
2. Comments, contacts, subscribers, and settings admin modules have consistent auth guards and validation.
3. Public content read paths enforce published visibility via shared match helpers.
4. Public comments enforce approved parent constraint for replies.
5. Contact/subscriber admin actions correctly use model instance methods for state transitions.
6. Revalidation hooks are present in mutation flows across modules.
7. Counter updates use atomic DB updates.

## 12) What Needs Major Changes / New Changes

### Major changes

1. Uniform admin auth enforcement across all admin action files listed in P0.
2. Public abuse prevention controls for contact, upvotes, and stats increment endpoints.

### New changes needed

1. Add standardized guard contract tests for admin modules (to prevent regression of unguarded actions).
2. Add anti-abuse policy layer (rate limit + dedup) for public mutations.
3. Add performance hardening for bulk and deep-thread query paths.

## 13) Exit Criteria Status After Verification

1. Model-to-action mapping: Completed.
2. Admin and public checklist run: Completed.
3. P0/P1/P2 classification: Completed.
4. Verification pass outcome: Not ready for sign-off until P0 items are fixed.

## 14) P0 Implementation Progress (Strict Order)

Execution mode: strict module order with document update after each batch.

### Batch 1: Topic module auth hardening

Status: Completed

Updated files:

1. [src/server/new/admin/topic/createTopic.ts](src/server/new/admin/topic/createTopic.ts)
2. [src/server/new/admin/topic/updateTopic.ts](src/server/new/admin/topic/updateTopic.ts)
3. [src/server/new/admin/topic/publishTopic.ts](src/server/new/admin/topic/publishTopic.ts)
4. [src/server/new/admin/topic/actions.ts](src/server/new/admin/topic/actions.ts)
5. [src/server/new/admin/topic/deleteTopic.ts](src/server/new/admin/topic/deleteTopic.ts)
6. [src/server/new/admin/topic/getTopics.ts](src/server/new/admin/topic/getTopics.ts)
7. [src/server/new/admin/topic/reorderTopics.ts](src/server/new/admin/topic/reorderTopics.ts)

Change summary:

1. Added admin guard checks via getAdminId at the start of all exported topic actions.
2. Preserved existing business logic and response contracts.
3. Validation: no errors in topic module after patch.

Next batch in strict order:

1. Subtopic module auth hardening.

### Batch 2: Subtopic module auth hardening

Status: Completed

Updated files:

1. [src/server/new/admin/subtopic/createSubtopic.ts](src/server/new/admin/subtopic/createSubtopic.ts)
2. [src/server/new/admin/subtopic/getSubtopics.ts](src/server/new/admin/subtopic/getSubtopics.ts)
3. [src/server/new/admin/subtopic/updateSubtopic.ts](src/server/new/admin/subtopic/updateSubtopic.ts)
4. [src/server/new/admin/subtopic/deleteSubtopic.ts](src/server/new/admin/subtopic/deleteSubtopic.ts)
5. [src/server/new/admin/subtopic/publishSubtopic.ts](src/server/new/admin/subtopic/publishSubtopic.ts)
6. [src/server/new/admin/subtopic/reorderSubtopics.ts](src/server/new/admin/subtopic/reorderSubtopics.ts)
7. [src/server/new/admin/subtopic/actions.ts](src/server/new/admin/subtopic/actions.ts)

Change summary:

1. Added admin guard checks via getAdminId at the start of all exported subtopic actions.
2. Preserved existing business logic and response contracts.
3. Validation: no errors in subtopic module after patch.

Next batch in strict order:

1. Content/article module auth hardening.

### Batch 3: Content/article module auth hardening

Status: Completed

Updated files:
1. [src/server/new/admin/content/article/deleteArticle.ts](src/server/new/admin/content/article/deleteArticle.ts)
2. [src/server/new/admin/content/article/publishArticle.ts](src/server/new/admin/content/article/publishArticle.ts)
3. [src/server/new/admin/content/article/actions.ts](src/server/new/admin/content/article/actions.ts)
4. [src/server/new/admin/content/article/getArticles.ts](src/server/new/admin/content/article/getArticles.ts)
5. [src/server/new/admin/content/article/reorderArticles.ts](src/server/new/admin/content/article/reorderArticles.ts)
6. [src/server/new/admin/content/article/reconcileArticleCounters.ts](src/server/new/admin/content/article/reconcileArticleCounters.ts)

Change summary:

1. Added admin guard checks via getAdminId at the start of all previously unguarded exported article actions.
2. Preserved existing write/read logic, transaction behavior, and response contracts.
3. Validation: no errors in article module after patch.

Next batch in strict order:

1. Content/blog module auth hardening.

### Batch 4: Content/blog module auth hardening

Status: Completed

Updated files:
1. [src/server/new/admin/content/blog/publishBlog.ts](src/server/new/admin/content/blog/publishBlog.ts)
2. [src/server/new/admin/content/blog/getBlogs.ts](src/server/new/admin/content/blog/getBlogs.ts)
3. [src/server/new/admin/content/blog/deleteBlog.ts](src/server/new/admin/content/blog/deleteBlog.ts)
4. [src/server/new/admin/content/blog/actions.ts](src/server/new/admin/content/blog/actions.ts)

Change summary:

1. Added admin guard checks via getAdminId at the start of all previously unguarded exported blog actions.
2. Preserved existing business logic and response contracts.
3. Validation: no errors in blog module after patch.

Next batch in strict order:

1. Content/project module auth hardening.

### Batch 5: Content/project module auth hardening

Status: Completed

Updated files:
1. [src/server/new/admin/content/project/publishProject.ts](src/server/new/admin/content/project/publishProject.ts)
2. [src/server/new/admin/content/project/getProjects.ts](src/server/new/admin/content/project/getProjects.ts)
3. [src/server/new/admin/content/project/deleteProject.ts](src/server/new/admin/content/project/deleteProject.ts)
4. [src/server/new/admin/content/project/reorderProjects.ts](src/server/new/admin/content/project/reorderProjects.ts)
5. [src/server/new/admin/content/project/actions.ts](src/server/new/admin/content/project/actions.ts)

Change summary:

1. Added admin guard checks via getAdminId at the start of all previously unguarded exported project actions.
2. Preserved existing business logic and response contracts.
3. Validation: no errors in project module after patch.

### Post-batch verification checkpoint (P0 auth scope)

Status: Completed

Result:
1. Admin action files in [src/server/new/admin](src/server/new/admin) now pass guard-presence audit for exported actions (excluding helper/shared modules).
2. Topic, subtopic, article, blog, and project P0 auth gaps identified in verification are now implemented.

Remaining high-priority work outside completed P0 auth batch:
1. Public abuse controls (contact/upvote/stats) remain P1 and are not changed in this batch set.

## 15) P1 Implementation Progress (Strict Order)

Execution mode: strict file order with document update after each batch.

### Batch 1: Public contact anti-abuse hardening

Status: Completed

Updated files:

1. [src/server/new/public/contact/submitPublicContact.ts](src/server/new/public/contact/submitPublicContact.ts)
2. [src/server/new/public/shared/helpers.ts](src/server/new/public/shared/helpers.ts)

Change summary:

1. Added server-action-level abuse controls for contact submission using client fingerprint, scoped rate limit checks, and duplicate submission window checks.
2. Kept implementation in server actions and shared server helpers (no API-layer dependency for runtime enforcement).
3. Preserved existing success/error envelope conventions and adjusted throttling responses to allowed typed status codes.
4. Validation: no errors in contact and shared public helper modules after patch.

Next batch in strict order:

1. Public comment upvote dedup hardening.

### Batch 2: Public comment upvote dedup hardening

Status: Completed

Updated files:

1. [src/server/new/public/comments/upvotePublicCommentById.ts](src/server/new/public/comments/upvotePublicCommentById.ts)
2. [src/server/new/public/shared/helpers.ts](src/server/new/public/shared/helpers.ts)

Change summary:

1. Added per-client dedup/rate-limit guard for upvotes using server-action request metadata and shared fingerprint helpers.
2. Added idempotent duplicate path that returns current snapshot without re-incrementing counters.
3. Validation: no errors in upvote and shared public helper modules after patch.

Next batch in strict order:

1. Public stats views increment dedup hardening.

### Batch 3: Public stats views increment dedup hardening

Status: Completed

Updated files:

1. [src/server/new/public/stats/incrementContentViewsById.ts](src/server/new/public/stats/incrementContentViewsById.ts)
2. [src/server/new/public/shared/helpers.ts](src/server/new/public/shared/helpers.ts)

Change summary:

1. Added per-client dedup window for view increments to reduce automated counter inflation.
2. Added idempotent duplicate response path that returns current aggregate stats without additional increments.
3. Validation: no errors in views increment and shared public helper modules after patch.

Next batch in strict order:

1. Public stats likes increment dedup hardening.

### Batch 4: Public stats likes increment dedup hardening

Status: Completed

Updated files:

1. [src/server/new/public/stats/incrementContentLikesById.ts](src/server/new/public/stats/incrementContentLikesById.ts)
2. [src/server/new/public/shared/helpers.ts](src/server/new/public/shared/helpers.ts)

Change summary:

1. Added per-client dedup window for like increments to reduce repeated abuse from the same client identity.
2. Added idempotent duplicate response path that returns current aggregate stats without additional increments.
3. Validation: no errors in likes increment and shared public helper modules after patch.

### Post-batch verification checkpoint (P1 public abuse-control scope)

Status: Completed

Result:

1. Requested P1 hardening is implemented in strict order for contact submit, comment upvote, content views increment, and content likes increment server actions.
2. Shared anti-abuse primitives are centralized in [src/server/new/public/shared/helpers.ts](src/server/new/public/shared/helpers.ts) for consistent policy reuse.
3. Runtime enforcement remains server-action-first; temporary API helper detours were removed to keep architecture aligned with server-action execution.
