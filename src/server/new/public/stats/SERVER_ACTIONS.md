# Public Stats Server Actions Guide

## 1) Purpose and scope

This module is the canonical public stats backend for all content domains.

Supported operations:

- read views snapshot
- read likes snapshot
- increment views
- increment likes

All operations are content-id based and publish-state guarded.

## 2) Hardening status and invariants

This module was hardened for parity and safety.

Invariants now enforced:

1. Invalid content ids return stable 400 responses.
2. All reads/writes require published content existence.
3. Views and likes increments are atomic and monotonic.
4. Stats responses use one shared snapshot shape.
5. Id parsing is centralized in one shared helper.

Reference checklist:

- src/server/new/public/ENGAGEMENT_CONTRACT_CHECKLIST.md

## 3) Exact implementation locations

Core actions:

- src/server/new/public/stats/getContentViewsById.ts
- src/server/new/public/stats/getContentLikesById.ts
- src/server/new/public/stats/incrementContentViewsById.ts
- src/server/new/public/stats/incrementContentLikesById.ts

Shared helper layer:

- src/server/new/public/stats/shared.ts

Helper responsibilities in shared.ts:

- content id parsing for stats actions
- publish-state guard
- canonical snapshot mapping

## 4) Action-by-action behavior and guarantees

### getContentViewsById(contentId)

Use when:

- Rendering read-only stats snapshots.

Guarantees:

- Validates content id.
- Requires published content.
- Returns canonical snapshot with views, likes, lastViewedAt.

### getContentLikesById(contentId)

Use when:

- Rendering like-focused stats snapshots.

Guarantees:

- Same validation and snapshot guarantees as views read.

### incrementContentViewsById(contentId)

Use when:

- Recording page view events.

Guarantees:

- Atomic increment through findOneAndUpdate + $inc + upsert.
- lastViewedAt update on increment.
- Stable response shape after write.

### incrementContentLikesById(contentId)

Use when:

- Recording like events.

Guarantees:

- Atomic increment through findOneAndUpdate + $inc + upsert.
- Stable response shape after write.

## 5) Professional integration examples

### A) Server-rendered stats snapshot

```ts
const statsResult = await getContentViewsById(contentId);
if (!statsResult.success) {
    // handle 400/404/500
}

const { views, likes } = statsResult.data;
```

### B) Event write action

```ts
const nextStats = await incrementContentViewsById(contentId);
```

### C) Thin API adapter pattern

Use in:

- src/app/api/content/\*\*/id/[contentId]/views
- src/app/api/content/\*\*/id/[contentId]/likes

```ts
export const POST = async (_request: Request, context: { params: Promise<{ contentId: string }> }) => {
    const { contentId } = await context.params;
    return toHttp(await incrementContentLikesById(contentId));
};
```

## 6) Required usage rules

1. Keep stats business logic in server actions only.
2. Keep API routes as wrappers only.
3. Keep content existence and publish-state checks in action layer.
4. Preserve atomic single-document write operations.

## 7) Error semantics

- Invalid id: 400.
- Unpublished or missing content: 404.
- Unexpected failures: 500 from handleError.

## 8) Why this architecture is correct

- Id-based atomic operations scale cleanly and keep race-risk low.
- Shared parser and snapshot mapping guarantee parity across domains.
- Adapter routes remain thin, so contract logic is not duplicated.
