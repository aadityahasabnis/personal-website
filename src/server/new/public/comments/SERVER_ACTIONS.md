# Public Comments Server Actions Guide

## 1) Purpose and scope

This module is the canonical engagement backend for public comments on published content.

Supported operations:

- create comment (moderation-first)
- list public comments
- upvote approved comments

All operations are content-id based and server-side validated.

## 2) Hardening status and invariants

This module was hardened to enforce deterministic and moderation-safe behavior.

Invariants now enforced:

1. Invalid ids return stable 400 responses.
2. All operations require published content existence.
3. Public listing enforces approved-only visibility.
4. Reply creation requires approved parent comment.
5. Upvotes apply to approved comments only.
6. Top-level and reply ordering are deterministic.

Reference checklist:

- src/server/new/public/ENGAGEMENT_CONTRACT_CHECKLIST.md

## 3) Exact implementation locations

Core actions:

- src/server/new/public/comments/createPublicComment.ts
- src/server/new/public/comments/getPublicCommentsByContentId.ts
- src/server/new/public/comments/upvotePublicCommentById.ts

Shared helper layer:

- src/server/new/public/comments/shared.ts

Helper responsibilities in shared.ts:

- content id parsing
- comment id parsing
- publish-state guard
- approved parent lookup
- payload mapping
- ip hash and author normalization

## 4) Action-by-action behavior and guarantees

### createPublicComment(input)

Use when:

- Submitting new comments or replies.

Guarantees:

- Validates content id and optional parent id.
- Validates author name/email/body/url.
- Requires published content.
- If parentId is present, parent must exist and be approved.
- Inserts with approved: false (moderation-first).

Why:

- Prevents unmoderated reply chains and protects public quality.

### getPublicCommentsByContentId(params)

Use when:

- Rendering comment thread snapshots.

Guarantees:

- Requires published content.
- Approved-only visibility is enforced.
- Deterministic order for top-level rows and replies.
- Returns paginated top-level rows with one-level nested replies.

Why:

- Public read safety and deterministic UI rendering.

### upvotePublicCommentById(contentId, commentId)

Use when:

- Public comment upvote interaction.

Guarantees:

- Validates ids.
- Requires published content.
- Upvotes only approved comments.
- Atomic increment through single-document update.

Why:

- Prevents upvote abuse against non-public comments.

## 5) Professional integration examples

### A) Server action submit flow

Use in:

- server actions under page route or dedicated submit action

```ts
const result = await createPublicComment({
    contentId,
    parentId: maybeParentId ?? null,
    authorName,
    authorEmail,
    authorWebsite,
    body,
    ipAddress,
});

if (!result.success) {
    // map result.status and result.error to UI
}
```

### B) Thread read flow

```ts
const commentsResult = await getPublicCommentsByContentId({
    contentId,
    pagination: { offset: 0, limit: 20 },
});
```

### C) Thin API adapter pattern

Use in:

- src/app/api/content/**/id/[contentId]/comments/**

```ts
export const POST = async (_request: Request, context: { params: Promise<{ contentId: string; commentId: string }> }) => {
    const { contentId, commentId } = await context.params;
    return toHttp(await upvotePublicCommentById(contentId, commentId));
};
```

## 6) Required usage rules

1. Keep comments business logic in server actions only.
2. Keep API route handlers as wrappers only.
3. Do not expose non-approved comments in public read flows.
4. Keep moderation and validation boundaries in action layer.

## 7) Error semantics

- Invalid ids or invalid payload: 400.
- Missing published content or approved target comment: 404.
- Unexpected failures: 500 from handleError.

## 8) Why this architecture is correct

- Establishes strict moderation-first public behavior.
- Keeps replies/upvotes safe and deterministic.
- Creates one source of truth for all public comment adapters.
