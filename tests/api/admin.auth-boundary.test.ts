import { GET as commentsGet, POST as commentsPost } from '@/app/api/admin/comments/route';
import { GET as contactsGet, POST as contactsPost } from '@/app/api/admin/contacts/route';
import { GET as emailGet, POST as emailPost } from '@/app/api/admin/email/route';
import { POST as settingsPost } from '@/app/api/admin/settings/route';
import { GET as subscribersGet, POST as subscribersPost } from '@/app/api/admin/subscribers/route';
import * as authModule from '@/lib/auth/admin';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/admin', () => ({
    auth: vi.fn(),
}));

vi.mock('@/server/new/admin/comments', () => ({
    adminReplyToComment: vi.fn(),
    approveComment: vi.fn(),
    bulkApproveComments: vi.fn(),
    bulkDeleteComments: vi.fn(),
    deleteComment: vi.fn(),
    getComments: vi.fn(),
    getCommentStats: vi.fn(),
    rejectComment: vi.fn(),
}));

vi.mock('@/server/new/admin/contacts', () => ({
    archiveContact: vi.fn(),
    bulkArchiveContacts: vi.fn(),
    bulkDeleteContacts: vi.fn(),
    deleteContact: vi.fn(),
    getContactById: vi.fn(),
    getContacts: vi.fn(),
    getContactStats: vi.fn(),
    markContactAsRead: vi.fn(),
    markContactAsReplied: vi.fn(),
    unarchiveContact: vi.fn(),
}));

vi.mock('@/server/new/admin/subscribers', () => ({
    bulkDeleteSubscribers: vi.fn(),
    confirmSubscriber: vi.fn(),
    deleteSubscriber: vi.fn(),
    exportSubscribers: vi.fn(),
    getSubscribers: vi.fn(),
    getSubscriberStats: vi.fn(),
}));

vi.mock('@/server/new/admin/settings', () => ({
    changeAdminPassword: vi.fn(),
    updateAdminProfile: vi.fn(),
    updateAdminRecoveryEmail: vi.fn(),
}));

vi.mock('@/server/new/admin/email', () => ({
    sendNewsletter: vi.fn(),
    sendOtp: vi.fn(),
    sendPasswordReset: vi.fn(),
    sendTestEmail: vi.fn(),
    verifyEmailConnection: vi.fn(),
}));

const assertUnauthorized = async (responsePromise: Promise<Response>) => {
    const response = await responsePromise;
    const payload = await response.json();
    expect(response.status).toBe(401);
    expect(payload.success).toBe(false);
    expect(payload.error).toBe('Unauthorized');
};

describe('admin auth boundaries', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('blocks public/missing-auth access across admin APIs', async () => {
        (authModule.auth as unknown as { mockResolvedValue: (value: unknown) => void }).mockResolvedValue(null);

        await assertUnauthorized(commentsGet(new NextRequest('http://localhost/api/admin/comments')));
        await assertUnauthorized(commentsPost(new NextRequest('http://localhost/api/admin/comments', { method: 'POST', body: '{}' })));

        await assertUnauthorized(contactsGet(new NextRequest('http://localhost/api/admin/contacts')));
        await assertUnauthorized(contactsPost(new NextRequest('http://localhost/api/admin/contacts', { method: 'POST', body: '{}' })));

        await assertUnauthorized(subscribersGet(new NextRequest('http://localhost/api/admin/subscribers')));
        await assertUnauthorized(subscribersPost(new NextRequest('http://localhost/api/admin/subscribers', { method: 'POST', body: '{}' })));

        await assertUnauthorized(emailGet());
        await assertUnauthorized(emailPost(new NextRequest('http://localhost/api/admin/email', { method: 'POST', body: '{}' })));

        await assertUnauthorized(settingsPost(new NextRequest('http://localhost/api/admin/settings', { method: 'POST', body: '{}' })));
    });

    it('rejects invalid session payloads that have no user', async () => {
        (authModule.auth as unknown as { mockResolvedValue: (value: unknown) => void }).mockResolvedValue({
            user: null,
            expires: '2099-01-01T00:00:00.000Z',
        });

        await assertUnauthorized(commentsGet(new NextRequest('http://localhost/api/admin/comments?action=stats')));
        await assertUnauthorized(contactsGet(new NextRequest('http://localhost/api/admin/contacts?action=stats')));
        await assertUnauthorized(subscribersGet(new NextRequest('http://localhost/api/admin/subscribers?action=stats')));
        await assertUnauthorized(emailGet());
        await assertUnauthorized(settingsPost(new NextRequest('http://localhost/api/admin/settings', { method: 'POST', body: '{}' })));
    });
});
