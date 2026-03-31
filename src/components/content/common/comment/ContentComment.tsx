'use client';

import { AlertCircle, CheckCircle, Loader2, MessageSquare, RefreshCw, Send, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

import { useAction, useActionQuery } from '@/hooks';
import { AVATAR_OPTIONS, siteStorage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { createPublicComment, getPublicCommentsByContentId, upvotePublicCommentById } from '@/server/new/public/comments';

import { CommentAvatarPicker } from './CommentAvatarPicker';
import { CommentItem } from './CommentItem';
import { CommentListSkeleton } from './CommentListSkeleton';
import type { ICommentNode, ICommentsListResult, IContentCommentProps, ICreateCommentPayload } from './types';

// =============================================================
// Constants
// =============================================================

const COMMENTS_LIMIT = 20;
const DEFAULT_AVATAR_ID = 'avatar-1';

type ISubmitState = 'idle' | 'success' | 'error';

// =============================================================
// Component
// =============================================================

export const ContentComment = ({ contentType, contentId, className }: IContentCommentProps) => {
    const queryKey = useMemo(() => ['public-comments', contentType, contentId, COMMENTS_LIMIT], [contentType, contentId]);

    // Form state
    const [authorName, setAuthorName] = useState('');
    const [authorEmail, setAuthorEmail] = useState('');
    const [body, setBody] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState<string>(DEFAULT_AVATAR_ID);
    const [submitState, setSubmitState] = useState<ISubmitState>('idle');
    const [feedbackMessage, setFeedbackMessage] = useState<string>('');
    const [pendingUpvoteId, setPendingUpvoteId] = useState<string | null>(null);
    const [failedUpvoteId, setFailedUpvoteId] = useState<string | null>(null);

    // Helpers
    const buildUpvoteKey = useCallback((commentId: string): string => `${contentType}:${contentId}:${commentId}`, [contentId, contentType]);

    const resolveAvatarId = useCallback((avatarId: string | null | undefined): string => {
        if (!avatarId) return DEFAULT_AVATAR_ID;
        return AVATAR_OPTIONS.some((o) => o.id === avatarId) ? avatarId : DEFAULT_AVATAR_ID;
    }, []);

    // Load stored author
    useEffect(() => {
        const commentAuthor = siteStorage.getCommentAuthor();
        const userProfile = siteStorage.getUserProfile();

        if (commentAuthor) {
            setAuthorName(commentAuthor.name);
            setAuthorEmail(commentAuthor.email);
            setSelectedAvatar(resolveAvatarId(commentAuthor.avatar));
            return;
        }

        if (userProfile) {
            if (userProfile.name) setAuthorName(userProfile.name);
            if (userProfile.email) setAuthorEmail(userProfile.email);
            setSelectedAvatar(resolveAvatarId(userProfile.avatar));
        }
    }, [resolveAvatarId]);

    // Query
    const commentsQuery = useActionQuery<ICommentsListResult>({
        queryKey,
        action: () => getPublicCommentsByContentId({ contentId, pagination: { offset: 0, limit: COMMENTS_LIMIT } }),
        staleTime: 5000,
        refetchOnWindowFocus: false,
    });

    // Create comment
    const createCommentAction = useAction<ICommentNode, [ICreateCommentPayload]>({
        action: (payload) => createPublicComment({ contentId, ...payload }),
        invalidateKeys: [queryKey],
        onSuccess: (data) => {
            // Save author info
            siteStorage.setCommentAuthor({ name: authorName.trim(), email: authorEmail.trim().toLowerCase(), avatar: selectedAvatar });
            siteStorage.updateUserProfile({ name: authorName.trim(), email: authorEmail.trim().toLowerCase(), avatar: selectedAvatar });
            // Track own comment to prevent self-upvoting
            if (data?.id) {
                siteStorage.addOwnComment(data.id);
            }
            setBody('');
            setReplyingTo(null);
            setIsComposerOpen(false);
            setSubmitState('success');
            setFeedbackMessage('Comment posted!');
        },
        onError: (message) => {
            setSubmitState('error');
            setFeedbackMessage(message);
        },
    });

    // Upvote
    const upvoteCommentAction = useAction<ICommentNode, [string]>({
        action: (commentId) => upvotePublicCommentById(contentId, commentId),
        invalidateKeys: [queryKey],
        onSuccess: (_, __, [commentId]) => {
            siteStorage.setCommentUpvoted(buildUpvoteKey(commentId));
            setPendingUpvoteId(null);
            setFailedUpvoteId(null);
        },
        onError: (message, _, [commentId]) => {
            setPendingUpvoteId(null);
            setFailedUpvoteId(commentId);
            setSubmitState('error');
            setFeedbackMessage(message);
        },
    });

    const hasUpvoted = useCallback((commentId: string): boolean => siteStorage.hasUpvotedComment(buildUpvoteKey(commentId)), [buildUpvoteKey]);

    const handleReply = useCallback((commentId: string) => {
        setReplyingTo(commentId);
        setIsComposerOpen(true);
    }, []);

    const handleUpvote = useCallback(
        async (commentId: string) => {
            if (hasUpvoted(commentId) || pendingUpvoteId === commentId || siteStorage.isOwnComment(commentId)) return;
            setPendingUpvoteId(commentId);
            setFailedUpvoteId(null);
            // Don't set storage here - let onSuccess handle it after server confirms
            await upvoteCommentAction.mutateAsync(commentId);
        },
        [hasUpvoted, pendingUpvoteId, upvoteCommentAction],
    );

    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setSubmitState('idle');
            setFeedbackMessage('');

            const payload: ICreateCommentPayload = {
                ...(replyingTo ? { parentId: replyingTo } : {}),
                authorName: authorName.trim(),
                authorEmail: authorEmail.trim().toLowerCase(),
                authorAvatar: selectedAvatar,
                body: body.trim(),
            };

            await createCommentAction.mutateAsync(payload);
        },
        [authorEmail, authorName, body, createCommentAction, replyingTo, selectedAvatar],
    );

    const comments = commentsQuery.data?.rows ?? [];
    const totalComments = commentsQuery.data?.total ?? 0;
    const isSubmitting = createCommentAction.pending;

    // Find the comment being replied to (handles nested comments recursively)
    const findCommentById = useCallback((id: string, commentList: ICommentNode[]): ICommentNode | null => {
        for (const comment of commentList) {
            if (comment.id === id) return comment;
            if (comment.replies.length > 0) {
                const found = findCommentById(id, comment.replies);
                if (found) return found;
            }
        }
        return null;
    }, []);

    const replyingToComment = replyingTo ? findCommentById(replyingTo, comments) : null;

    return (
        <section className={cn('mt-12', className)} aria-label='Comments'>
            {/* Header */}
            <div className='flex items-center justify-between gap-4 pb-4 border-b border-border'>
                <h2 className='flex items-center gap-2 text-h4 font-semibold text-foreground'>
                    <MessageSquare className='w-5 h-5 text-primary' />
                    <span>Comments{totalComments > 0 && ` (${totalComments})`}</span>
                </h2>

                <div className='flex items-center gap-2'>
                    {/* Refresh button */}
                    <button
                        type='button'
                        onClick={() => commentsQuery.refetch()}
                        disabled={commentsQuery.isFetching}
                        className='inline-flex items-center justify-center h-9 w-9 text-muted-foreground bg-muted border border-border rounded-md transition-fast hover:text-foreground hover:border-foreground/20 disabled:opacity-50'
                        aria-label='Refresh comments'
                    >
                        <RefreshCw className={cn('w-4 h-4', commentsQuery.isFetching && 'animate-spin')} />
                    </button>

                    {/* Write comment / Cancel button */}
                    <button
                        type='button'
                        onClick={() => {
                            setIsComposerOpen(!isComposerOpen);
                            if (isComposerOpen) setReplyingTo(null);
                        }}
                        className={cn(
                            'inline-flex items-center gap-2 h-9 px-3 text-small font-medium rounded-md border transition-fast',
                            isComposerOpen
                                ? 'text-muted-foreground bg-muted border-border hover:text-foreground hover:border-foreground/20'
                                : 'text-primary-foreground bg-primary border-primary hover:bg-primary/90',
                        )}
                    >
                        {isComposerOpen ? (
                            <>
                                <X className='w-4 h-4' />
                                <span>Cancel</span>
                            </>
                        ) : (
                            <>
                                <Send className='w-4 h-4' />
                                <span>Write comment</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Feedback */}
            {submitState !== 'idle' && (
                <div className={cn(
                    'flex items-start gap-3 mt-4 p-3 border rounded-md',
                    submitState === 'success' ? 'text-success bg-success/5 border-success/20' : 'text-destructive bg-destructive/5 border-destructive/20',
                )}>
                    {submitState === 'success' ? <CheckCircle className='shrink-0 w-4 h-4 mt-0.5' /> : <AlertCircle className='shrink-0 w-4 h-4 mt-0.5' />}
                    <p className='flex-1 text-small'>{feedbackMessage}</p>
                    <button type='button' onClick={() => setSubmitState('idle')} className='shrink-0 p-0.5 rounded transition-fast hover:bg-foreground/10'>
                        <X className='w-3.5 h-3.5' />
                    </button>
                </div>
            )}

            {/* Form */}
            {isComposerOpen && (
                <form onSubmit={handleSubmit} className='mt-6 p-4 bg-card border border-border rounded-lg'>
                    {/* Reply indicator */}
                    {replyingTo && (
                        <div className='flex items-center justify-between gap-3 mb-4 px-3 py-2 text-small bg-primary/5 border-l-2 border-primary rounded-r-md'>
                            <span className='text-foreground'>
                                Replying to <span className='font-medium'>{replyingToComment?.author.name ?? 'comment'}</span>
                            </span>
                            <button type='button' onClick={() => setReplyingTo(null)} className='text-primary font-medium transition-fast hover:underline'>
                                Cancel
                            </button>
                        </div>
                    )}

                    {/* Avatar picker */}
                    <div className='mb-4'>
                        <CommentAvatarPicker selectedAvatar={selectedAvatar} onSelect={setSelectedAvatar} />
                    </div>

                    {/* Name and Email */}
                    <div className='grid gap-4 sm:grid-cols-2 mb-4'>
                        <div>
                            <label htmlFor='comment-name' className='block mb-1.5 text-small font-medium text-foreground'>
                                Name <span className='text-destructive'>*</span>
                            </label>
                            <input
                                id='comment-name'
                                type='text'
                                required
                                minLength={2}
                                maxLength={100}
                                value={authorName}
                                onChange={(e) => setAuthorName(e.target.value)}
                                placeholder='Your name'
                                className='block w-full px-3 py-2 text-body text-foreground bg-background border border-border rounded-md transition-fast placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary'
                            />
                        </div>

                        <div>
                            <label htmlFor='comment-email' className='block mb-1.5 text-small font-medium text-foreground'>
                                Email <span className='text-destructive'>*</span>
                            </label>
                            <input
                                id='comment-email'
                                type='email'
                                required
                                value={authorEmail}
                                onChange={(e) => setAuthorEmail(e.target.value)}
                                placeholder='you@example.com'
                                className='block w-full px-3 py-2 text-body text-foreground bg-background border border-border rounded-md transition-fast placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary'
                            />
                            <p className='mt-1 text-label text-muted-foreground'>Not published</p>
                        </div>
                    </div>

                    {/* Comment body */}
                    <div className='mb-4'>
                        <label htmlFor='comment-body' className='block mb-1.5 text-small font-medium text-foreground'>
                            {replyingTo ? 'Your reply' : 'Your comment'} <span className='text-destructive'>*</span>
                        </label>
                        <textarea
                            id='comment-body'
                            required
                            minLength={10}
                            maxLength={5000}
                            rows={3}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            placeholder='Share your thoughts...'
                            className='block w-full px-3 py-2 text-body text-foreground bg-background border border-border rounded-md resize-y transition-fast placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary'
                        />
                    </div>

                    {/* Submit */}
                    <div className='flex justify-end'>
                        <button
                            type='submit'
                            disabled={isSubmitting}
                            className='inline-flex items-center gap-2 h-9 px-4 text-small font-medium text-primary-foreground bg-primary border border-primary rounded-md transition-fast hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isSubmitting ? <Loader2 className='w-4 h-4 animate-spin' /> : <Send className='w-4 h-4' />}
                            <span>{isSubmitting ? 'Posting...' : replyingTo ? 'Post reply' : 'Post comment'}</span>
                        </button>
                    </div>
                </form>
            )}

            {/* Loading */}
            {commentsQuery.isLoading && <CommentListSkeleton className='mt-6' />}

            {/* Error */}
            {commentsQuery.error && (
                <div className='flex items-start gap-3 mt-6 p-4 text-destructive bg-destructive/5 border border-destructive/20 rounded-lg'>
                    <AlertCircle className='shrink-0 w-5 h-5 mt-0.5' />
                    <p className='text-body'>{commentsQuery.error.message}</p>
                </div>
            )}

            {/* Empty state */}
            {!commentsQuery.isLoading && !commentsQuery.error && comments.length === 0 && (
                <div className='mt-8 py-8 text-center border border-dashed border-border rounded-lg'>
                    <MessageSquare className='mx-auto mb-2 w-8 h-8 text-muted-foreground/50' />
                    <p className='text-body text-muted-foreground'>No comments yet</p>
                    <p className='mt-0.5 text-small text-muted-foreground/70'>Be the first to share your thoughts</p>
                </div>
            )}

            {/* Comments list */}
            {comments.length > 0 && (
                <div className='mt-6 space-y-4'>
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onReply={handleReply}
                            onUpvote={handleUpvote}
                            hasUpvoted={hasUpvoted}
                            pendingUpvoteId={pendingUpvoteId}
                            failedUpvoteId={failedUpvoteId}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};
