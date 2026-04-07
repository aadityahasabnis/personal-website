import { GET, POST } from '@/app/api/admin/subscribers/route';
import * as authModule from '@/lib/auth/admin';
import * as subscribersModule from '@/server/new/admin/subscribers';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/admin', () => ({
    auth: vi.fn(),
}));

vi.mock('@/server/new/admin/subscribers', () => ({
    bulkDeleteSubscribers: vi.fn(),
    confirmSubscriber: vi.fn(),
    deleteSubscriber: vi.fn(),
    exportSubscribers: vi.fn(),
    getSubscribers: vi.fn(),
    getSubscriberStats: vi.fn(),
}));

describe('admin subscribers API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (authModule.auth as unknown as { mockResolvedValue: (value: unknown) => void }).mockResolvedValue({
            user: { id: 'admin-id', email: 'admin@example.com', name: 'Admin', image: null },
            expires: '2099-01-01T00:00:00.000Z',
        });
    });

    it('returns success for stats flow', async () => {
        vi.mocked(subscribersModule.getSubscriberStats).mockResolvedValue({
            success: true,
            status: 200,
            data: { total: 1, confirmed: 1, pending: 0, unsubscribed: 0, active: 1 },
        });

        const request = new NextRequest('http://localhost/api/admin/subscribers?action=stats');
        const response = await GET(request);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.success).toBe(true);
    });

    it('returns validation failure for missing action', async () => {
        const request = new NextRequest('http://localhost/api/admin/subscribers', {
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
        vi.mocked(subscribersModule.getSubscriberStats).mockRejectedValue(new Error('boom'));

        const request = new NextRequest('http://localhost/api/admin/subscribers?action=stats');
        const response = await GET(request);
        const payload = await response.json();

        expect(response.status).toBe(500);
        expect(payload.success).toBe(false);
    });
});
