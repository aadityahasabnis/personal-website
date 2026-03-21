# Public Comments Server Actions Guide

## Purpose

This module is the canonical backend contract for public comments on published content.

- create comment (moderation-first)
- list approved comments and replies
- upvote approved comments

All operations are content-id based and server-side validated.

## Canonical Usage

- Frontend app routes should call these server actions from server components, server-only loaders, or server actions.
- Do not make frontend runtime API fetches for comment reads/writes when equivalent server actions are available.
- Route handlers under `src/app/api/content/**` are optional adapters for external tooling, QA, and compatibility, not the primary render path.

## Action Map

### `createPublicComment(input)`

- Validates content id, optional parent id, author fields, body length, URL/email patterns.
- Creates comment in `approved: false` state for moderation workflows.

### `getPublicCommentsByContentId(params)`

- Returns paginated top-level comments and one-level replies.
- `approvedOnly` defaults to true for safe public reads.

### `upvotePublicCommentById(contentId, commentId)`

- Atomically increments `upvotes` for approved comments only.

## SSR/SSG/ISR Integration

- Keep primary content static (SSG/ISR) and resolve comments dynamically through server actions.
- Prefer server-rendered comment snapshots for initial paint when needed.
- Keep anti-spam and abuse protections at server boundaries (action input validation + rate limiting at edge/middleware/adapter layers).

## Model and Index Alignment

Models used:

- `Content` for published-content guard
- `Comment` for tree reads and upvote writes

Indexes used:

- `{ contentId, parentId, createdAt }`
- `{ contentId, approved, parentId }`
- `{ parentId, approved }`

## Operational Notes

- Keep public payloads minimal and projection-based.
- Avoid deep recursive trees in a single query.
- If HTTP endpoints are required, keep them as thin wrappers over these actions.
