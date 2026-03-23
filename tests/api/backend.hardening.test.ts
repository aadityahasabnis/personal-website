import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import Comment from '@/server/models/Comment';
import Contact from '@/server/models/Contact';
import Content from '@/server/models/Content';
import PageStats from '@/server/models/PageStats';
import Subscriber from '@/server/models/Subscriber';
import { getSubscribers } from '@/server/new/admin/subscribers';
import { createPublicComment, getPublicCommentsByContentId } from '@/server/new/public/comments';
import { submitPublicContact } from '@/server/new/public/contact';
import { getContentViewsById, incrementContentLikesById, incrementContentViewsById } from '@/server/new/public/stats';
import { subscribe, unsubscribe } from '@/server/new/public/subscribe';

const hoisted = vi.hoisted(() => ({
    requestHeaders: {
        'x-forwarded-for': '203.0.113.10',
        'user-agent': 'vitest-agent',
    } as Record<string, string>,
    auth: vi.fn(),
}));

vi.mock('@/lib/db/connectDB', () => ({
    connectDB: vi.fn(async () => mongoose),
}));

vi.mock('@/lib/auth/admin', () => ({
    auth: hoisted.auth,
}));

vi.mock('next/headers', () => ({
    headers: vi.fn(async () => new Headers(hoisted.requestHeaders)),
}));

let mongod: MongoMemoryServer;

const makePublishedContent = async (type: 'article' | 'blog' | 'project' = 'article') => {
    const adminId = new mongoose.Types.ObjectId();

    return Content.create({
        type,
        slug: `${type}-${new mongoose.Types.ObjectId().toString()}`,
        title: `${type} title`,
        description: `${type} description`,
        body: `${type} body`,
        readingTime: 5,
        publishStatus: 'published',
        publishedAt: new Date(),
        featured: false,
        createdBy: adminId,
        updatedBy: adminId,
    });
};

const clearDb = async () => {
    await Promise.all([
        Content.deleteMany({}),
        Comment.deleteMany({}),
        Contact.deleteMany({}),
        Subscriber.deleteMany({}),
        PageStats.deleteMany({}),
        mongoose.connection.collection('publicRateLimits').deleteMany({}),
    ]);
};

describe('backend hardening tests', () => {
    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        await mongoose.connect(mongod.getUri(), { dbName: 'backend-hardening' });

        await Promise.all([
            Content.createIndexes(),
            Comment.createIndexes(),
            Contact.createIndexes(),
            Subscriber.createIndexes(),
            PageStats.createIndexes(),
        ]);
    });

    beforeEach(async () => {
        hoisted.auth.mockReset();
        hoisted.auth.mockResolvedValue({
            user: {
                id: new mongoose.Types.ObjectId().toString(),
                email: 'admin@example.com',
                name: 'Admin',
                image: null,
            },
            expires: '2099-01-01T00:00:00.000Z',
        });

        hoisted.requestHeaders = {
            'x-forwarded-for': '203.0.113.10',
            'user-agent': 'vitest-agent',
        };

        await clearDb();
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongod.stop();
    });

    it('comments: returns nested replies with strict parent-child integrity', async () => {
        const content = await makePublishedContent('blog');

        const topA = await Comment.create({
            contentId: content._id,
            parentId: null,
            author: { name: 'Alex', email: 'a@example.com', avatar: null, website: null, isOwner: false },
            content: 'Top level comment A',
            approved: true,
            createdAt: new Date(Date.now() - 2000),
        });

        const topB = await Comment.create({
            contentId: content._id,
            parentId: null,
            author: { name: 'Bianca', email: 'b@example.com', avatar: null, website: null, isOwner: false },
            content: 'Top level comment B',
            approved: true,
            createdAt: new Date(Date.now() - 1000),
        });

        await Comment.create({
            contentId: content._id,
            parentId: topA._id,
            author: { name: 'R1', email: 'r1@example.com', avatar: null, website: null, isOwner: false },
            content: 'Reply under A',
            approved: true,
        });

        await Comment.create({
            contentId: content._id,
            parentId: topB._id,
            author: { name: 'R2', email: 'r2@example.com', avatar: null, website: null, isOwner: false },
            content: 'Reply under B',
            approved: true,
        });

        await Comment.create({
            contentId: content._id,
            parentId: topA._id,
            author: { name: 'R3', email: 'r3@example.com', avatar: null, website: null, isOwner: false },
            content: 'Unapproved reply under A',
            approved: false,
        });

        const result = await getPublicCommentsByContentId({
            contentId: content._id.toString(),
            pagination: { offset: 0, limit: 20 },
        });

        expect(result.success).toBe(true);
        if (!result.success) return;

        expect(result.data.rows.length).toBe(2);

        const rowA = result.data.rows.find((row) => row.id === topA._id.toString());
        const rowB = result.data.rows.find((row) => row.id === topB._id.toString());

        expect(rowA?.replies.length).toBe(1);
        expect(rowB?.replies.length).toBe(1);
        expect(rowA?.replies[0]?.parentId).toBe(topA._id.toString());
        expect(rowB?.replies[0]?.parentId).toBe(topB._id.toString());
    });

    it('comments: rejects invalid ids and invalid parent linkage', async () => {
        const badContent = await getPublicCommentsByContentId({ contentId: 'invalid-id' });
        expect(badContent.success).toBe(false);
        if (badContent.success) return;
        expect(badContent.status).toBe(400);

        const contentA = await makePublishedContent('blog');
        const contentB = await makePublishedContent('blog');

        const parentOnOtherContent = await Comment.create({
            contentId: contentB._id,
            parentId: null,
            author: { name: 'Parent', email: 'parent@example.com', avatar: null, website: null, isOwner: false },
            content: 'Parent comment',
            approved: true,
        });

        const invalidParent = await createPublicComment({
            contentId: contentA._id.toString(),
            parentId: parentOnOtherContent._id.toString(),
            authorName: 'Tester',
            authorEmail: 'tester@example.com',
            body: 'This should fail parent integrity check',
        });

        expect(invalidParent.success).toBe(false);
        if (invalidParent.success) return;
        expect(invalidParent.status).toBe(404);
    });

    it('contacts: enforces duplicate detection and email rate limiting (429)', async () => {
        const first = await submitPublicContact({
            name: 'Aaditya',
            email: 'aaditya@example.com',
            subject: 'Need collaboration',
            message: 'Hello there, this is a full valid contact message body.',
            ipAddress: '203.0.113.10',
        });

        expect(first.success).toBe(true);
        if (!first.success) return;
        expect(first.status).toBe(201);

        const duplicate = await submitPublicContact({
            name: 'Aaditya',
            email: 'aaditya@example.com',
            subject: 'Need collaboration',
            message: 'Hello there, this is a full valid contact message body.',
            ipAddress: '203.0.113.10',
        });

        expect(duplicate.success).toBe(false);
        if (duplicate.success) return;
        expect(duplicate.status).toBe(409);

        await clearDb();

        for (let i = 0; i < 3; i += 1) {
            const ok = await submitPublicContact({
                name: 'Aaditya',
                email: 'rate@example.com',
                subject: `Subject ${i} valid`,
                message: `Unique message ${i} that is definitely long enough for validation.`,
                ipAddress: '203.0.113.10',
            });
            expect(ok.success).toBe(true);
        }

        const limited = await submitPublicContact({
            name: 'Aaditya',
            email: 'rate@example.com',
            subject: 'Fourth request valid',
            message: 'This fourth request should be blocked by per-email rate limiting.',
            ipAddress: '203.0.113.10',
        });

        expect(limited.success).toBe(false);
        if (limited.success) return;
        expect(limited.status).toBe(429);
    });

    it('subscribers: supports subscribe/unsubscribe/resubscribe and filter correctness', async () => {
        const created = await subscribe({ email: 'reader@example.com', name: 'Reader' });
        expect(created.success).toBe(true);
        if (!created.success) return;
        expect(created.data.state).toBe('created');

        const removed = await unsubscribe({ email: 'reader@example.com' });
        expect(removed.success).toBe(true);

        const resubscribed = await subscribe({ email: 'reader@example.com', name: 'Reader' });
        expect(resubscribed.success).toBe(true);
        if (!resubscribed.success) return;
        expect(resubscribed.data.state).toBe('resubscribed');

        await Subscriber.insertMany([
            {
                email: 'confirmed@example.com',
                name: 'Aaditya Confirmed',
                confirmed: true,
                subscribedAt: new Date(),
                unsubscribedAt: null,
            },
            {
                email: 'pending@example.com',
                name: 'Pending Reader',
                confirmed: false,
                subscribedAt: new Date(),
                unsubscribedAt: null,
            },
            {
                email: 'unsub@example.com',
                name: 'Old Reader',
                confirmed: true,
                subscribedAt: new Date(),
                unsubscribedAt: new Date(),
            },
        ]);

        const confirmed = await getSubscribers({ filter: 'confirmed', pagination: { offset: 0, limit: 50 } });
        expect(confirmed.success).toBe(true);
        if (!confirmed.success) return;
        expect(confirmed.data.every((row) => row.status === 'confirmed')).toBe(true);

        const pending = await getSubscribers({ filter: 'pending', pagination: { offset: 0, limit: 50 } });
        expect(pending.success).toBe(true);
        if (!pending.success) return;
        expect(pending.data.every((row) => row.status === 'pending')).toBe(true);

        const unsubscribed = await getSubscribers({ filter: 'unsubscribed', pagination: { offset: 0, limit: 50 } });
        expect(unsubscribed.success).toBe(true);
        if (!unsubscribed.success) return;
        expect(unsubscribed.data.every((row) => row.status === 'unsubscribed')).toBe(true);

        const searched = await getSubscribers({
            filter: 'all',
            query: 'aaditya',
            pagination: { offset: 0, limit: 50 },
        });
        expect(searched.success).toBe(true);
        if (!searched.success) return;
        expect(searched.data.some((row) => row.name?.toLowerCase().includes('aaditya'))).toBe(true);
    });

    it('subscribers: handles parallel subscribe race without duplicate records or 500 errors', async () => {
        const [a, b] = await Promise.all([
            subscribe({ email: 'race@example.com', name: 'Race User' }),
            subscribe({ email: 'race@example.com', name: 'Race User' }),
        ]);

        expect([a.status, b.status].every((status) => status === 200 || status === 201)).toBe(true);

        const count = await Subscriber.countDocuments({ email: 'race@example.com' });
        expect(count).toBe(1);
    });

    it('engagement: enforces view/like increment correctness and invalid id handling', async () => {
        const content = await makePublishedContent('blog');

        const invalid = await incrementContentViewsById('not-an-objectid');
        expect(invalid.success).toBe(false);
        if (invalid.success) return;
        expect(invalid.status).toBe(400);

        hoisted.requestHeaders = {};
        await Promise.all(Array.from({ length: 5 }).map(() => incrementContentViewsById(content._id.toString())));

        const stats = await getContentViewsById(content._id.toString());
        expect(stats.success).toBe(true);
        if (!stats.success) return;
        expect(stats.data.views).toBe(5);
        expect(stats.data.lastViewedAt).not.toBeNull();

        hoisted.requestHeaders = {
            'x-forwarded-for': '203.0.113.10',
            'user-agent': 'vitest-agent',
        };

        const likeA = await incrementContentLikesById(content._id.toString());
        const likeB = await incrementContentLikesById(content._id.toString());

        expect(likeA.success).toBe(true);
        expect(likeB.success).toBe(true);

        const final = await getContentViewsById(content._id.toString());
        expect(final.success).toBe(true);
        if (!final.success) return;
        expect(final.data.likes).toBe(2);
    });

    it('subscribe rejects invalid email field', async () => {
        const result = await subscribe({ email: 'invalid-email' });
        expect(result.success).toBe(false);
        if (result.success) return;
        expect(result.status).toBe(400);
    });
});
