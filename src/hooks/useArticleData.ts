'use client';

/**
 * DEPRECATED: Use useContentData.ts hooks instead
 * 
 * This file re-exports from useContentData for backwards compatibility.
 * All new code should import from @/hooks/useContentData directly.
 */

export {
    usePageStats,
    useLikeToggle,
    useComments,
    usePostComment,
    type IPageStats,
    type IComment,
    type ICommentsResponse,
    type ContentType,
} from './useContentData';

// Legacy convenience exports for articles
import { 
    usePageStats as usePageStatsGeneric, 
    useLikeToggle as useLikeToggleGeneric,
    useComments as useCommentsGeneric,
    usePostComment as usePostCommentGeneric,
} from './useContentData';

/**
 * @deprecated Use usePageStats from useContentData with contentType parameter
 */
export const useArticleStats = (slug: string) => usePageStatsGeneric(slug, 'articles');

/**
 * @deprecated Use useLikeToggle from useContentData with contentType parameter
 */
export const useArticleLike = (slug: string) => useLikeToggleGeneric(slug, 'articles');

/**
 * @deprecated Use useComments from useContentData with contentType parameter
 */
export const useArticleComments = (slug: string) => useCommentsGeneric(slug, 'articles');

/**
 * @deprecated Use usePostComment from useContentData with contentType parameter
 */
export const useArticlePostComment = (slug: string) => usePostCommentGeneric(slug, 'articles');

