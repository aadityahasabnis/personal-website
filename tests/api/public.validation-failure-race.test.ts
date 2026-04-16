import { POST as contentCommentUpvotePost } from '@/app/api/content/articles/id/[contentId]/comments/[commentId]/upvote/route';
import { GET as contentCommentsGet, POST as contentCommentsPost } from '@/app/api/content/articles/id/[contentId]/comments/route';
import { GET as contentLikesGet } from '@/app/api/content/articles/id/[contentId]/likes/route';
import { GET as contentViewsGet } from '@/app/api/content/articles/id/[contentId]/views/route';
import { POST as contentContactPost } from '@/app/api/content/contact/route';
import { POST as contentSubscribePost } from '@/app/api/content/subscribe/route';
import { POST as contentUnsubscribePost } from '@/app/api/content/unsubscribe/route';
import { POST as publicContactPost } from '@/app/api/public/contact/route';
import { POST as publicSubscribePost } from '@/app/api/public/subscribe/route';
import * as commentsModule from '@/server/new/public/comments';
import * as contactModule from '@/server/new/public/contact';
import * as statsModule from '@/server/new/public/stats';
import * as subscribeModule from '@/server/new/public/subscribe';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/server/new/public/contact', () => ({
    submitPublicContact: vi.fn(),
}));

vi.mock('@/server/new/public/subscribe', () => ({
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
}));

vi.mock('@/server/new/public/comments', () => ({
    createPublicComment: vi.fn(),
    getPublicCommentsByContentId: vi.fn(),
    upvotePublicCommentById: vi.fn(),
}));

vi.mock('@/server/new/public/stats', () => ({
    getContentLikesById: vi.fn(),
    getContentViewsById: vi.fn(),
    incrementContentLikesById: vi.fn(),
    incrementContentViewsById: vi.fn(),
}));

describe('public api validation, failure paths, and race expansions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns malformed payload errors for content and public wrappers', async () => {
        const invalidJson = '{"invalid":';

        const contentContact = await contentContactPost(
            new NextRequest('http://localhost/api/content/contact', {
                method: 'POST',
                body: invalidJson,
                headers: { 'content-type': 'application/json' },
            })
        );
        expect(contentContact.status).toBe(400);

        const contentSubscribe = await contentSubscribePost(
            new NextRequest('http://localhost/api/content/subscribe', {
                method: 'POST',
                body: invalidJson,
                headers: { 'content-type': 'application/json' },
            })
        );
        expect(contentSubscribe.status).toBe(400);

        const contentUnsubscribe = await contentUnsubscribePost(
            new NextRequest('http://localhost/api/content/unsubscribe', {
                method: 'POST',
                body: invalidJson,
                headers: { 'content-type': 'application/json' },
            })
        );
        expect(contentUnsubscribe.status).toBe(400);

        const publicContact = await publicContactPost(
            new NextRequest('http://localhost/api/public/contact', {
                method: 'POST',
                body: invalidJson,
                headers: { 'content-type': 'application/json' },
            })
        );
        expect(publicContact.status).toBe(500);

        const publicSubscribe = await publicSubscribePost(
            new NextRequest('http://localhost/api/public/subscribe', {
                method: 'POST',
                body: invalidJson,
                headers: { 'content-type': 'application/json' },
            })
        );
        expect(publicSubscribe.status).toBe(500);
    });

    it('propagates missing-field and invalid-id validation errors for public APIs', async () => {
        vi.mocked(contactModule.submitPublicContact).mockResolvedValue({
            success: false,
            status: 400,
            error: 'Missing required fields',
        });
        vi.mocked(subscribeModule.subscribe).mockResolvedValue({
            success: false,
            status: 400,
            error: 'Invalid email address',
        });
        vi.mocked(commentsModule.getPublicCommentsByContentId).mockResolvedValue({
            success: false,
            status: 400,
            error: 'Invalid content id',
        });
        vi.mocked(commentsModule.upvotePublicCommentById).mockResolvedValue({
            success: false,
            status: 400,
            error: 'Invalid comment id',
        });
        vi.mocked(statsModule.getContentLikesById).mockResolvedValue({
            success: false,
            status: 400,
            error: 'Invalid content id',
        });
        vi.mocked(statsModule.getContentViewsById).mockResolvedValue({
            success: false,
            status: 400,
            error: 'Invalid content id',
        });

        const publicContactRes = await publicContactPost(
            new NextRequest('http://localhost/api/public/contact', {
                method: 'POST',
                body: JSON.stringify({}),
                headers: { 'content-type': 'application/json' },
            })
        );
        expect(publicContactRes.status).toBe(400);

        const publicSubscribeRes = await publicSubscribePost(
            new NextRequest('http://localhost/api/public/subscribe', {
                method: 'POST',
                body: JSON.stringify({ action: 'subscribe', payload: {} }),
                headers: { 'content-type': 'application/json' },
            })
        );
        expect(publicSubscribeRes.status).toBe(400);

        const commentsRes = await contentCommentsGet(new NextRequest('http://localhost/api/content/articles/id/not-object-id/comments'), {
            params: Promise.resolve({ contentId: 'not-object-id' }),
        });
        expect(commentsRes.status).toBe(400);

        const upvoteRes = await contentCommentUpvotePost(new NextRequest('http://localhost/api/content/articles/id/not-object-id/comments/bad/upvote', { method: 'POST' }), {
            params: Promise.resolve({ contentId: 'not-object-id', commentId: 'bad' }),
        });
        expect(upvoteRes.status).toBe(400);

        const likesRes = await contentLikesGet(new NextRequest('http://localhost/api/content/articles/id/not-object-id/likes'), {
            params: Promise.resolve({ contentId: 'not-object-id' }),
        });
        expect(likesRes.status).toBe(400);

        const viewsRes = await contentViewsGet(new NextRequest('http://localhost/api/content/articles/id/not-object-id/views'), {
            params: Promise.resolve({ contentId: 'not-object-id' }),
        });
        expect(viewsRes.status).toBe(400);
    });

    it('returns consistent error envelope for failure paths including 429', async () => {
        vi.mocked(contactModule.submitPublicContact)
            .mockResolvedValueOnce({
                success: false,
                status: 429,
                error: 'Too many contact attempts',
            })
            .mockRejectedValueOnce(new Error('db down'));

        const rateLimitedRes = await publicContactPost(
            new NextRequest('http://localhost/api/public/contact', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Aaditya',
                    email: 'a@example.com',
                    subject: 'Hi there',
                    message: 'Long enough message body for validation.',
                }),
                headers: { 'content-type': 'application/json' },
            })
        );
        const rateLimitedPayload = await rateLimitedRes.json();

        expect(rateLimitedRes.status).toBe(429);
        expect(rateLimitedPayload.success).toBe(false);
        expect(rateLimitedPayload.status).toBe(429);

        const failedRes = await publicContactPost(
            new NextRequest('http://localhost/api/public/contact', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'Aaditya',
                    email: 'a@example.com',
                    subject: 'Hi there',
                    message: 'Long enough message body for validation.',
                }),
                headers: { 'content-type': 'application/json' },
            })
        );
        const failedPayload = await failedRes.json();

        expect(failedRes.status).toBe(500);
        expect(failedPayload.success).toBe(false);
        expect(failedPayload.status).toBe(500);

        vi.mocked(subscribeModule.subscribe).mockRejectedValueOnce(new Error('db down'));
        const subscribeErrorRes = await publicSubscribePost(
            new NextRequest('http://localhost/api/public/subscribe', {
                method: 'POST',
                body: JSON.stringify({ action: 'subscribe', payload: { email: 'test@example.com' } }),
                headers: { 'content-type': 'application/json' },
            })
        );
        const subscribeErrorPayload = await subscribeErrorRes.json();

        expect(subscribeErrorRes.status).toBe(500);
        expect(subscribeErrorPayload.success).toBe(false);
        expect(subscribeErrorPayload.status).toBe(500);
    });

    it('supports race scenarios: parallel comments, contact spam bursts, and subscriber double insert', async () => {
        vi.mocked(commentsModule.createPublicComment).mockResolvedValue({
            success: true,
            status: 200,
            data: {
                id: 'c1',
                contentId: '65f1502cdc9bc503f8d7c001',
                parentId: null,
                author: { name: 'A', avatar: null, isOwner: false },
                content: 'parallel comment',
                upvotes: 0,
                replyCount: 0,
                createdAt: new Date().toISOString(),
                replies: [],
            },
        });

        let burstCount = 0;
        vi.mocked(contactModule.submitPublicContact).mockImplementation(async () => {
            burstCount += 1;
            if (burstCount <= 3) {
                return {
                    success: true,
                    status: 201,
                    data: { id: `c-${burstCount}`, status: 'new', createdAt: new Date().toISOString() },
                };
            }
            return {
                success: false,
                status: 429,
                error: 'Too many contact attempts',
            };
        });

        let subscribeCount = 0;
        vi.mocked(subscribeModule.subscribe).mockImplementation(async () => {
            subscribeCount += 1;
            if (subscribeCount === 1) {
                return { success: true, status: 201, data: { email: 'race@example.com', confirmed: false, state: 'created' } };
            }
            return { success: true, status: 200, data: { email: 'race@example.com', confirmed: false, state: 'active' } };
        });

        const commentRequests = await Promise.all(
            Array.from({ length: 5 }).map((_, i) =>
                contentCommentsPost(
                    new NextRequest('http://localhost/api/content/articles/id/65f1502cdc9bc503f8d7c001/comments', {
                        method: 'POST',
                        body: JSON.stringify({
                            authorName: `User ${i}`,
                            authorEmail: `user${i}@example.com`,
                            body: 'parallel comment payload',
                        }),
                        headers: { 'content-type': 'application/json' },
                    }),
                    { params: Promise.resolve({ contentId: '65f1502cdc9bc503f8d7c001' }) }
                )
            )
        );

        expect(commentRequests.every((res) => res.status === 200)).toBe(true);
        expect(commentsModule.createPublicComment).toHaveBeenCalledTimes(5);

        const burstRequests = await Promise.all(
            Array.from({ length: 6 }).map((_, i) =>
                publicContactPost(
                    new NextRequest('http://localhost/api/public/contact', {
                        method: 'POST',
                        body: JSON.stringify({
                            name: 'Aaditya',
                            email: `spam${i}@example.com`,
                            subject: `Subject ${i}`,
                            message: 'Long enough message body for spam burst simulation.',
                        }),
                        headers: { 'content-type': 'application/json' },
                    })
                )
            )
        );

        const burstStatuses = burstRequests.map((res) => res.status);
        expect(burstStatuses.filter((status) => status === 429).length).toBe(3);

        const [subA, subB] = await Promise.all([
            publicSubscribePost(
                new NextRequest('http://localhost/api/public/subscribe', {
                    method: 'POST',
                    body: JSON.stringify({ action: 'subscribe', payload: { email: 'race@example.com' } }),
                    headers: { 'content-type': 'application/json' },
                })
            ),
            publicSubscribePost(
                new NextRequest('http://localhost/api/public/subscribe', {
                    method: 'POST',
                    body: JSON.stringify({ action: 'subscribe', payload: { email: 'race@example.com' } }),
                    headers: { 'content-type': 'application/json' },
                })
            ),
        ]);

        expect([subA.status, subB.status].every((status) => status === 200 || status === 201)).toBe(true);
        expect(subscribeModule.subscribe).toHaveBeenCalledTimes(2);
    });
});
