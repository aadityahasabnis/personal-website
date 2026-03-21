# Public Stats Server Actions Guide

## Purpose

This module provides id-based, atomic stats actions for published content:

- views read/increment
- likes read/increment

All operations use `contentId` (`_id`) and validate that content is published.

## Canonical Usage

- Use these actions in server components and server-only composition layers.
- Keep stats dynamic; do not bake views/likes into static HTML.
- Route handlers under `src/app/api/content/**` are optional adapters for compatibility/testing, not the main frontend contract.

## Action Map

### `getContentViewsById(contentId)`

- Read current snapshot for views/likes/lastViewedAt.

### `incrementContentViewsById(contentId)`

- Atomic increment for views using `findOneAndUpdate` + `$inc` + `upsert`.
- Updates `lastViewedAt`.

### `getContentLikesById(contentId)`

- Read current snapshot for views/likes/lastViewedAt.

### `incrementContentLikesById(contentId)`

- Atomic increment for likes using `findOneAndUpdate` + `$inc` + `upsert`.

## SSR/SSG/ISR Integration

- Render core article/blog/project body via SSG/ISR.
- Resolve views/likes through runtime server actions so counters stay fresh.
- Keep these operations outside static generation boundaries.

## Model and Index Alignment

Models used:

- `Content` for published-content guard
- `PageStats` for stats record

Indexes used:

- `PageStats.contentId` unique index for point read/update
- optional sort indexes (`views`, `likes`, `lastViewedAt`) for leaderboard/report queries

## Performance Notes

- Keep operations id-based and single-document atomic.
- Use `lean()` for read payloads.
- For high traffic views, consider short-window dedupe (cookie/session/ip hash) before increment.
- For likes, optionally enforce one-like-per-user/session to avoid abuse.
- If an API adapter is used, keep it as a thin wrapper over these actions with no duplicate business logic.
