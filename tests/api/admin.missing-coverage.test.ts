import { POST as commentsPost } from '@/app/api/admin/comments/route';
import { GET as contactsGet, POST as contactsPost } from '@/app/api/admin/contacts/route';
import { POST as settingsPost } from '@/app/api/admin/settings/route';
import { GET as subscribersGet, POST as subscribersPost } from '@/app/api/admin/subscribers/route';
import * as authModule from '@/lib/auth/admin';
import * as commentsModule from '@/server/new/admin/comments';
import * as contactsModule from '@/server/new/admin/contacts';
import * as settingsModule from '@/server/new/admin/settings';
import * as subscribersModule from '@/server/new/admin/subscribers';
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

describe('admin missing coverage routes', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (authModule.auth as unknown as { mockResolvedValue: (value: unknown) => void }).mockResolvedValue({
            user: { id: 'admin-id', email: 'admin@example.com', name: 'Admin', image: null },
            expires: '2099-01-01T00:00:00.000Z',
        });
    });

    it('comments moderation: approve and reject actions dispatch correctly', async () => {
        vi.mocked(commentsModule.approveComment).mockResolvedValue({ success: true, status: 200, data: true });
        vi.mocked(commentsModule.rejectComment).mockResolvedValue({ success: true, status: 200, data: true });

        const approveReq = new NextRequest('http://localhost/api/admin/comments', {
            method: 'POST',
            body: JSON.stringify({ action: 'approve', commentId: 'c1' }),
            headers: { 'content-type': 'application/json' },
        });
        const rejectReq = new NextRequest('http://localhost/api/admin/comments', {
            method: 'POST',
            body: JSON.stringify({ action: 'reject', commentId: 'c2' }),
            headers: { 'content-type': 'application/json' },
        });

        const approveRes = await commentsPost(approveReq);
        const rejectRes = await commentsPost(rejectReq);

        expect(approveRes.status).toBe(200);
        expect(rejectRes.status).toBe(200);
        expect(commentsModule.approveComment).toHaveBeenCalledWith('c1');
        expect(commentsModule.rejectComment).toHaveBeenCalledWith('c2');
    });

    it('contacts: list route supports status filter and mark-read status update', async () => {
        vi.mocked(contactsModule.getContacts).mockResolvedValue({
            success: true,
            status: 200,
            data: [],
            pagination: { total: 0, offset: 0, limit: 20, hasMore: false },
        });
        vi.mocked(contactsModule.markContactAsRead).mockResolvedValue({ success: true, status: 200, data: true });

        const listReq = new NextRequest('http://localhost/api/admin/contacts?status=new&offset=0&limit=20');
        const listRes = await contactsGet(listReq);
        expect(listRes.status).toBe(200);
        expect(contactsModule.getContacts).toHaveBeenCalled();

        const updateReq = new NextRequest('http://localhost/api/admin/contacts', {
            method: 'POST',
            body: JSON.stringify({ action: 'mark-read', contactId: 'contact-1' }),
            headers: { 'content-type': 'application/json' },
        });
        const updateRes = await contactsPost(updateReq);

        expect(updateRes.status).toBe(200);
        expect(contactsModule.markContactAsRead).toHaveBeenCalledWith('contact-1');
    });

    it('subscribers: supports unsubscribed filter and delete action', async () => {
        vi.mocked(subscribersModule.getSubscribers).mockResolvedValue({
            success: true,
            status: 200,
            data: [
                {
                    id: 's1',
                    email: 'old@example.com',
                    name: 'Old',
                    confirmed: true,
                    status: 'unsubscribed',
                    subscribedAt: new Date().toISOString(),
                    unsubscribedAt: new Date().toISOString(),
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ],
            pagination: { total: 1, offset: 0, limit: 20, hasMore: false },
        });
        vi.mocked(subscribersModule.deleteSubscriber).mockResolvedValue({ success: true, status: 200, data: true });

        const listReq = new NextRequest('http://localhost/api/admin/subscribers?filter=unsubscribed');
        const listRes = await subscribersGet(listReq);
        expect(listRes.status).toBe(200);
        expect(subscribersModule.getSubscribers).toHaveBeenCalled();

        const deleteReq = new NextRequest('http://localhost/api/admin/subscribers', {
            method: 'POST',
            body: JSON.stringify({ action: 'delete', subscriberId: 'sub-1' }),
            headers: { 'content-type': 'application/json' },
        });
        const deleteRes = await subscribersPost(deleteReq);

        expect(deleteRes.status).toBe(200);
        expect(subscribersModule.deleteSubscriber).toHaveBeenCalledWith('sub-1');
    });

    it('settings: update profile/recovery and reject unsupported read action', async () => {
        const profileData = {
            id: 'admin-id',
            email: 'admin@example.com',
            name: 'Admin',
            image: 'https://example.com/avatar.png',
            recoveryEmail: 'owner@example.com',
            lastLoginAt: null,
            updatedAt: new Date().toISOString(),
        };

        vi.mocked(settingsModule.updateAdminProfile).mockResolvedValue({ success: true, status: 200, data: profileData });
        vi.mocked(settingsModule.updateAdminRecoveryEmail).mockResolvedValue({ success: true, status: 200, data: profileData });

        const profileReq = new NextRequest('http://localhost/api/admin/settings', {
            method: 'POST',
            body: JSON.stringify({
                action: 'update-profile',
                profile: { name: 'Admin', image: 'https://example.com/avatar.png' },
            }),
            headers: { 'content-type': 'application/json' },
        });
        const profileRes = await settingsPost(profileReq);
        expect(profileRes.status).toBe(200);
        expect(settingsModule.updateAdminProfile).toHaveBeenCalled();

        const recoveryReq = new NextRequest('http://localhost/api/admin/settings', {
            method: 'POST',
            body: JSON.stringify({ action: 'update-recovery-email', recovery: { recoveryEmail: 'owner@example.com' } }),
            headers: { 'content-type': 'application/json' },
        });
        const recoveryRes = await settingsPost(recoveryReq);
        expect(recoveryRes.status).toBe(200);
        expect(settingsModule.updateAdminRecoveryEmail).toHaveBeenCalled();

        const unsupportedReq = new NextRequest('http://localhost/api/admin/settings', {
            method: 'POST',
            body: JSON.stringify({ action: 'read' }),
            headers: { 'content-type': 'application/json' },
        });
        const unsupportedRes = await settingsPost(unsupportedReq);
        const unsupportedPayload = await unsupportedRes.json();

        expect(unsupportedRes.status).toBe(400);
        expect(unsupportedPayload.error).toBe('Unsupported action');
    });
});
