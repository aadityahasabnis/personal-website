import { GET, POST } from '@/app/api/admin/comments/route';
import * as authModule from '@/lib/auth/admin';
import * as commentsModule from '@/server/new/admin/comments';
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

describe('admin comments API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (authModule.auth as unknown as { mockResolvedValue: (value: unknown) => void }).mockResolvedValue({
            user: { id: 'admin-id', email: 'admin@example.com', name: 'Admin', image: null },
            expires: '2099-01-01T00:00:00.000Z',
        });
    });

    it('returns success for stats flow', async () => {
        vi.mocked(commentsModule.getCommentStats).mockResolvedValue({
            success: true,
            status: 200,
            data: {
                total: 1,
                approved: 1,
                pending: 0,
                topLevel: 1,
                replies: 0,
                ownerReplies: 0,
                byContentType: { article: 1, blog: 0, project: 0 },
                topContent: [],
            },
        });

        const request = new NextRequest('http://localhost/api/admin/comments?action=stats');
        const response = await GET(request);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.success).toBe(true);
    });

    it('returns validation failure for missing action', async () => {
        const request = new NextRequest('http://localhost/api/admin/comments', {
            method: 'POST',
            body: JSON.stringify({}),
            headers: { 'content-type': 'application/json' },
        });

        const response = await POST(request);
        const payload = await response.json();

        expect(response.status).toBe(400);
        expect(payload.success).toBe(false);
    });

    it('returns 500 when action throws unexpectedly', async () => {
        vi.mocked(commentsModule.getCommentStats).mockRejectedValue(new Error('boom'));

        const request = new NextRequest('http://localhost/api/admin/comments?action=stats');
        const response = await GET(request);
        const payload = await response.json();

        expect(response.status).toBe(500);
        expect(payload.success).toBe(false);
    });
});
