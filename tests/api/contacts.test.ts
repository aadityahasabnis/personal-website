import { GET, POST } from '@/app/api/admin/contacts/route';
import * as authModule from '@/lib/auth/admin';
import * as contactsModule from '@/server/new/admin/contacts';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/admin', () => ({
    auth: vi.fn(),
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

describe('admin contacts API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (authModule.auth as unknown as { mockResolvedValue: (value: unknown) => void }).mockResolvedValue({
            user: { id: 'admin-id', email: 'admin@example.com', name: 'Admin', image: null },
            expires: '2099-01-01T00:00:00.000Z',
        });
    });

    it('returns success for stats flow', async () => {
        vi.mocked(contactsModule.getContactStats).mockResolvedValue({
            success: true,
            status: 200,
            data: { total: 1, new: 1, read: 0, replied: 0, archived: 0 },
        });

        const request = new NextRequest('http://localhost/api/admin/contacts?action=stats');
        const response = await GET(request);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.success).toBe(true);
    });

    it('returns validation failure for missing action', async () => {
        const request = new NextRequest('http://localhost/api/admin/contacts', {
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
        vi.mocked(contactsModule.getContactStats).mockRejectedValue(new Error('boom'));

        const request = new NextRequest('http://localhost/api/admin/contacts?action=stats');
        const response = await GET(request);
        const payload = await response.json();

        expect(response.status).toBe(500);
        expect(payload.success).toBe(false);
    });
});
