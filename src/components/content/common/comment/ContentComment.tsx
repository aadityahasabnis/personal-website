'use client';

import { AlertCircle, CheckCircle, MessageSquare, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';

import { useAction, useActionQuery } from '@/hooks';
import { siteStorage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { createPublicComment, getPublicCommentsByContentId, upvotePublicCommentById } from '@/server/new/public/comments';

import { CommentAvatarPicker } from './CommentAvatarPicker';
import { CommentItem } from './CommentItem';
import type { ICommentNode, ICommentsListResult, IContentCommentProps, ICreateCommentPayload } from './types';

const COMMENTS_LIMIT = 20;
const DEFAULT_AVATAR_ID = 'avatar-1';

type ISubmitState = 'idle' | 'success' | 'error';

export const ContentComment = ({ contentType, contentId, className }: IContentCommentProps) => {
    const queryKey = useMemo(() => ['public-comments', contentType, contentId, COMMENTS_LIMIT], [contentType, contentId]);

    const [authorName, setAuthorName] = useState('');
    const [authorEmail, setAuthorEmail] = useState('');
    const [authorWebsite, setAuthorWebsite] = useState('');
    const [body, setBody] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [selectedAvatar, setSelectedAvatar] = useState<string>(DEFAULT_AVATAR_ID);
    const [submitState, setSubmitState] = useState<ISubmitState>('idle');
    const [feedbackMessage, setFeedbackMessage] = useState<string>('');
    const [pendingUpvoteId, setPendingUpvoteId] = useState<string | null>(null);

    const buildUpvoteKey = useCallback((commentId: string): string => `${contentType}:${contentId}:${commentId}`, [contentId, contentType]);

    const loadStoredAuthor = useCallback(() => {
        const commentAuthor = siteStorage.getCommentAuthor();
        const userProfile = siteStorage.getUserProfile();

        if (commentAuthor) {
            setAuthorName(commentAuthor.name);
            setAuthorEmail(commentAuthor.email);
            setSelectedAvatar(commentAuthor.avatar);
            return;
        }

        if (!userProfile) return;

        if (userProfile.name) setAuthorName(userProfile.name);
        if (userProfile.email) setAuthorEmail(userProfile.email);
        if (userProfile.avatar) setSelectedAvatar(userProfile.avatar);
    }, []);

    useEffect(() => {
        loadStoredAuthor();
    }, [loadStoredAuthor]);

    const commentsQuery = useActionQuery<ICommentsListResult>({
        queryKey,
        action: () =>
            getPublicCommentsByContentId({
                contentId,
                pagination: {
                    offset: 0,
                    limit: COMMENTS_LIMIT,
                },
            }),
        staleTime: 5000,
        refetchOnWindowFocus: false,
    });

    const createCommentAction = useAction<ICommentNode, [ICreateCommentPayload]>({
        action: (payload) =>
            createPublicComment({
                contentId,
                ...payload,
            }),
        invalidateKeys: [queryKey],
        onSuccess: () => {
            siteStorage.setCommentAuthor({
                name: authorName.trim(),
                email: authorEmail.trim().toLowerCase(),
                avatar: selectedAvatar,
            });
            siteStorage.updateUserProfile({
                name: authorName.trim(),
                email: authorEmail.trim().toLowerCase(),
                avatar: selectedAvatar,
            });

            setBody('');
            setReplyingTo(null);
            setSubmitState('success');
            setFeedbackMessage('Comment submitted for moderation. It will appear once approved.');
        },
        onError: (message) => {
            setSubmitState('error');
            setFeedbackMessage(message);
        },
    });

    const upvoteCommentAction = useAction<ICommentNode, [string]>({
        action: (commentId) => upvotePublicCommentById(contentId, commentId),
        invalidateKeys: [queryKey],
        onSuccess: (_, __, [commentId]) => {
            siteStorage.setCommentUpvoted(buildUpvoteKey(commentId));
            setPendingUpvoteId(null);
        },
        onError: (message, _, [commentId]) => {
            siteStorage.removeCommentUpvote(buildUpvoteKey(commentId));
            setPendingUpvoteId(null);
            setSubmitState('error');
            setFeedbackMessage(message);
        },
    });

    const hasUpvoted = useCallback((commentId: string): boolean => siteStorage.hasUpvotedComment(buildUpvoteKey(commentId)), [buildUpvoteKey]);

    const handleReply = useCallback((commentId: string) => {
        setReplyingTo(commentId);
    }, []);

    const handleUpvote = useCallback(
        async (commentId: string) => {
            if (hasUpvoted(commentId) || pendingUpvoteId === commentId) return;

            setPendingUpvoteId(commentId);
            const response = await upvoteCommentAction.mutateAsync(commentId);
            if (!response.success) {
                setPendingUpvoteId(null);
            }
        },
        [hasUpvoted, pendingUpvoteId, upvoteCommentAction],
    );

    const handleSubmit = useCallback(
        async (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setSubmitState('idle');
            setFeedbackMessage('');

            const normalizedName = authorName.trim();
            const normalizedEmail = authorEmail.trim().toLowerCase();
            const normalizedWebsite = authorWebsite.trim();
            const normalizedBody = body.trim();

            const payload: ICreateCommentPayload = {
                ...(replyingTo ? { parentId: replyingTo } : {}),
                authorName: normalizedName,
                authorEmail: normalizedEmail,
                ...(normalizedWebsite ? { authorWebsite: normalizedWebsite } : {}),
                authorAvatar: selectedAvatar,
                body: normalizedBody,
            };

            await createCommentAction.mutateAsync(payload);
        },
        [authorEmail, authorName, authorWebsite, body, createCommentAction, replyingTo, selectedAvatar],
    );

    const comments = commentsQuery.data?.rows ?? [];
    const totalComments = commentsQuery.data?.total ?? 0;
    const isSubmitting = createCommentAction.pending;

    return (
        <section className={cn('mt-14', className)} aria-label='Comments'>
            <header className='flex items-center justify-between gap-3'>
                <h2 className='flex items-center gap-2 text-title font-semibold text-foreground'>
                    <MessageSquare className='size-5 text-primary' />
                    <span>{`Comments (${totalComments})`}</span>
                </h2>

                <button
                    type='button'
                    onClick={() => commentsQuery.refetch()}
                    className='px-3 py-1.5 text-label font-medium text-muted-foreground bg-background border border-border rounded-md transition-base hover:text-primary hover:border-primary/40'
                >
                    Refresh
                </button>
            </header>

            <div className='mt-3'>
                {submitState === 'success' && (
                    <p className='flex items-center gap-2 p-3 text-label text-success bg-success/10 border border-success/30 rounded-lg'>
                        <CheckCircle className='size-4' />
                        {feedbackMessage}
                    </p>
                )}

                {submitState === 'error' && (
                    <p className='flex items-center gap-2 p-3 text-label text-destructive bg-destructive/10 border border-destructive/30 rounded-lg'>
                        <AlertCircle className='size-4' />
                        {feedbackMessage || 'Unable to complete request.'}
                    </p>
                )}
            </div>

            <form onSubmit={handleSubmit} className='grid gap-4 mt-6 p-5 bg-card border border-border rounded-2xl'>
                <CommentAvatarPicker selectedAvatar={selectedAvatar} onSelect={setSelectedAvatar} />

                <div className='grid gap-3 md:grid-cols-2'>
                    <label className='grid gap-1'>
                        <span className='text-small font-medium text-foreground'>Name</span>
                        <input
                            type='text'
                            required
                            minLength={2}
                            maxLength={100}
                            value={authorName}
                            onChange={(event) => setAuthorName(event.target.value)}
                            className='px-3 py-2 text-body text-foreground bg-background border border-border rounded-lg transition-base focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20'
                            placeholder='Your name'
                        />
                    </label>

                    <label className='grid gap-1'>
                        <span className='text-small font-medium text-foreground'>Email</span>
                        <input
                            type='email'
                            required
                            value={authorEmail}
                            onChange={(event) => setAuthorEmail(event.target.value)}
                            className='px-3 py-2 text-body text-foreground bg-background border border-border rounded-lg transition-base focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20'
                            placeholder='you@example.com'
                        />
                    </label>
                </div>

                <label className='grid gap-1'>
                    <span className='text-small font-medium text-foreground'>Website (optional)</span>
                    <input
                        type='url'
                        value={authorWebsite}
                        onChange={(event) => setAuthorWebsite(event.target.value)}
                        className='px-3 py-2 text-body text-foreground bg-background border border-border rounded-lg transition-base focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20'
                        placeholder='https://your-site.com'
                    />
                </label>

                <label className='grid gap-1'>
                    <span className='text-small font-medium text-foreground'>{replyingTo ? 'Reply' : 'Comment'}</span>
                    <textarea
                        required
                        minLength={10}
                        maxLength={5000}
                        rows={4}
                        value={body}
                        onChange={(event) => setBody(event.target.value)}
                        className='px-3 py-2 text-body text-foreground bg-background border border-border rounded-lg transition-base resize-y focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/20'
                        placeholder='Share your thoughts...'
                    />
                </label>

                <div className='flex items-center justify-between gap-3'>
                    <button
                        type='button'
                        onClick={() => setReplyingTo(null)}
                        className={cn(
                            'px-3 py-1.5 text-label font-medium text-muted-foreground bg-background border border-border rounded-md transition-base hover:text-primary hover:border-primary/40',
                            replyingTo ? '' : 'opacity-0 pointer-events-none',
                        )}
                    >
                        Cancel reply
                    </button>

                    <button
                        type='submit'
                        disabled={isSubmitting}
                        className='flex items-center gap-2 px-4 py-2 text-label font-medium text-primary-foreground bg-primary border border-primary rounded-md transition-base hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed'
                    >
                        <Send className='size-4' />
                        <span>{isSubmitting ? 'Submitting...' : replyingTo ? 'Post Reply' : 'Post Comment'}</span>
                    </button>
                </div>
            </form>

            <div className='grid gap-4 mt-6'>
                {commentsQuery.isLoading && <div className='p-4 text-body text-muted-foreground bg-card border border-border rounded-xl'>Loading comments...</div>}

                {commentsQuery.error && <div className='p-4 text-body text-destructive bg-destructive/10 border border-destructive/30 rounded-xl'>{commentsQuery.error.message}</div>}

                {!commentsQuery.isLoading && !commentsQuery.error && comments.length === 0 && (
                    <div className='p-6 text-center text-body text-muted-foreground bg-card border border-dashed border-border rounded-xl'>No approved comments yet. Start the conversation.</div>
                )}

                {comments.map((comment) => (
                    <CommentItem key={comment.id} comment={comment} onReply={handleReply} onUpvote={handleUpvote} hasUpvoted={hasUpvoted} pendingUpvoteId={pendingUpvoteId} />
                ))}
            </div>
        </section>
    );
};
