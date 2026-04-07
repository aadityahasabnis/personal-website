# Public Engagement Contract Checklist

## Scope

Shared id-based engagement actions:

- stats: get views, get likes, increment views, increment likes
- comments: list, create, upvote

Applies to id routes under:

- /api/content/articles/id/:contentId/\*\*
- /api/content/blogs/id/:contentId/\*\*
- /api/content/projects/id/:contentId/\*\*

## Hardening checks

1. Invalid content/comment ids return stable 400 responses.
2. Content existence checks require published content only.
3. Views and likes increments remain atomic with upsert + $inc.
4. Stats reads/writes share one id-parse and published-content guard path.
5. Public comment listing enforces approved-only visibility.
6. Public comment upvotes target approved comments only.
7. Parent-reply creation validates approved parent comment existence.
8. Public engagement payloads remain deterministic and shape-stable.

## Implementation files

- src/server/new/public/stats/shared.ts
- src/server/new/public/stats/getContentViewsById.ts
- src/server/new/public/stats/getContentLikesById.ts
- src/server/new/public/stats/incrementContentViewsById.ts
- src/server/new/public/stats/incrementContentLikesById.ts
- src/server/new/public/comments/shared.ts
- src/server/new/public/comments/getPublicCommentsByContentId.ts
- src/server/new/public/comments/createPublicComment.ts
- src/server/new/public/comments/upvotePublicCommentById.ts
