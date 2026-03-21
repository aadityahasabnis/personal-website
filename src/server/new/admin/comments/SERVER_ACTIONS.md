# Admin Comments Server Actions

This module implements moderation-first admin actions for comments with strict typing, pagination, and thread-aware metadata.

## Files

- src/server/new/admin/comments/getComments.ts
- src/server/new/admin/comments/getCommentStats.ts
- src/server/new/admin/comments/approveComment.ts
- src/server/new/admin/comments/rejectComment.ts
- src/server/new/admin/comments/deleteComment.ts
- src/server/new/admin/comments/bulkApproveComments.ts
- src/server/new/admin/comments/bulkDeleteComments.ts
- src/server/new/admin/comments/adminReplyToComment.ts
- src/server/new/admin/comments/shared.ts
- src/server/new/admin/comments/types.ts

## Admin List Design

Use getComments with filter, query, sort, and pagination.

Recommended table columns:

- Author
- Comment preview
- Content title and content type
- Thread depth and parent preview
- Moderation status (approved or pending)
- Replies count and upvotes
- Created at and updated at

The row payload includes:

- groupKey for grouping in UI
- threadRootId and depth for thread mapping
- parentAuthorName and parentPreview for context
- content metadata for content-level grouping and navigation

## Grouping Strategy

Use groupBy in getComments:

- none: flat queue sorted by date
- status: moderation queue first (pending vs approved)
- content: cluster comments by content entry
- thread: keep all comments from the same thread together

## Moderation Actions

- approveComment(commentId)
- rejectComment(commentId)
- deleteComment(commentId)
- bulkApproveComments(commentIds)
- bulkDeleteComments(commentIds)
- adminReplyToComment({ commentId, content })

All mutations:

- enforce admin authentication
- validate ids and payload constraints
- keep parent replyCount in sync when moderation state changes
- revalidate both admin paths and affected public content paths

## Stats Design

getCommentStats provides:

- global totals
- pending and approved counts
- top-level vs replies split
- owner replies count
- breakdown by content type
- top content items by moderation volume
