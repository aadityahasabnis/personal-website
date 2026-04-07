import { DELETE, PATCH } from '@/app/api/admin/media/[id]/route';
import { GET, POST } from '@/app/api/admin/media/route';
import { GET as GET_STATS } from '@/app/api/admin/media/stats/route';
import * as authModule from '@/lib/auth/admin';
import * as mediaModule from '@/server/new/admin/media';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth/admin', () => ({
    auth: vi.fn(),
}));

vi.mock('@/server/new/admin/media', () => ({
    deleteMedia: vi.fn(),
    getMedia: vi.fn(),
    getMediaStats: vi.fn(),
    updateMedia: vi.fn(),
    uploadMedia: vi.fn(),
}));

describe('admin media API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (authModule.auth as unknown as { mockResolvedValue: (value: unknown) => void }).mockResolvedValue({
            user: { id: 'admin-id', email: 'admin@example.com', name: 'Admin', image: null },
            expires: '2099-01-01T00:00:00.000Z',
        });
    });

    // ============================================================
    // GET /api/admin/media - Query Media
    // ============================================================

    describe('GET /api/admin/media', () => {
        it('returns media list with pagination', async () => {
            vi.mocked(mediaModule.getMedia).mockResolvedValue({
                success: true,
                status: 200,
                        data: [
                            {
                        id: '507f1f77bcf86cd799439011',
                        fileName: 'test.jpg',
                        fileKey: 'blog/test.jpg',
                        publicUrl: 'https://cdn.example.com/blog/test.jpg',
                        fileType: 'image',
                        mimeType: 'image/jpeg',
                        size: 1024,
                        sizeFormatted: '1 KB',
                        folder: 'blog',
                                description: null,
                                altText: null,
                                tags: [],
                                uploadedAt: '2024-01-01T00:00:00.000Z',
                                createdAt: '2024-01-01T00:00:00.000Z',
                                updatedAt: '2024-01-01T00:00:00.000Z',
                    },
                ],
                pagination: {
                    total: 1,
                    offset: 0,
                    limit: 20,
                    hasMore: false,
                },
            });

            const request = new NextRequest('http://localhost/api/admin/media');
            const response = await GET(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(payload.data).toHaveLength(1);
            expect(payload.pagination.total).toBe(1);
        });

        it('parses query parameters correctly', async () => {
            vi.mocked(mediaModule.getMedia).mockResolvedValue({
                success: true,
                status: 200,
                data: [],
                pagination: { total: 0, offset: 0, limit: 20, hasMore: false },
            });

            const request = new NextRequest(
                'http://localhost/api/admin/media?filter=image&query=hero&offset=10&limit=5&sortBy=createdAt&sortOrder=desc'
            );
            await GET(request);

            expect(mediaModule.getMedia).toHaveBeenCalledWith({
                filter: 'image',
                query: 'hero',
                pagination: { offset: 10, limit: 5 },
                sort: { sortBy: 'createdAt', sortOrder: 'desc' },
            });
        });

        it('returns 500 when action throws unexpectedly', async () => {
            vi.mocked(mediaModule.getMedia).mockRejectedValue(new Error('boom'));

            const request = new NextRequest('http://localhost/api/admin/media');
            const response = await GET(request);
            const payload = await response.json();

            expect(response.status).toBe(500);
            expect(payload.success).toBe(false);
        });
    });

    // ============================================================
    // POST /api/admin/media - Upload (multipart)
    // ============================================================

    describe('POST /api/admin/media - upload', () => {
        it('returns success for valid upload', async () => {
            vi.mocked(mediaModule.uploadMedia).mockResolvedValue({
                success: true,
                status: 201,
                data: {
                    id: '507f1f77bcf86cd799439011',
                    fileName: 'test.jpg',
                    fileKey: 'blog/test.jpg',
                    publicUrl: 'https://cdn.example.com/blog/test.jpg',
                },
            });

            const formData = new FormData();
            formData.append('file', new File(['test'], 'test.jpg', { type: 'image/jpeg' }));
            formData.append('folder', 'blog');
            formData.append('description', 'Test image');
            formData.append('tags', 'featured,test');

            const request = new NextRequest('http://localhost/api/admin/media', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(201);
            expect(payload.success).toBe(true);
            expect(payload.data.fileName).toBe('test.jpg');
        });

        it('returns error when file is missing', async () => {
            const formData = new FormData();
            formData.append('folder', 'blog');

            const request = new NextRequest('http://localhost/api/admin/media', {
                method: 'POST',
                body: formData,
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
            expect(payload.error).toContain('file');
        });
    });

    // ============================================================
    // POST /api/admin/media - Update (JSON)
    // ============================================================

    describe('POST /api/admin/media - update action', () => {
        it('returns success for valid update', async () => {
            vi.mocked(mediaModule.updateMedia).mockResolvedValue({
                success: true,
                status: 200,
                data: { updated: true },
            });

            const request = new NextRequest('http://localhost/api/admin/media', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update',
                    id: '507f1f77bcf86cd799439011',
                    description: 'Updated description',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
        });

        it('returns error when id is missing', async () => {
            const request = new NextRequest('http://localhost/api/admin/media', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update',
                    description: 'Updated',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
            expect(payload.error).toContain('id');
        });
    });

    // ============================================================
    // POST /api/admin/media - Delete (JSON)
    // ============================================================

    describe('POST /api/admin/media - delete action', () => {
        it('returns success for valid delete', async () => {
            vi.mocked(mediaModule.deleteMedia).mockResolvedValue({
                success: true,
                status: 200,
                data: { deleted: true },
            });

            const request = new NextRequest('http://localhost/api/admin/media', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'delete',
                    id: '507f1f77bcf86cd799439011',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
        });

        it('returns error when id is missing', async () => {
            const request = new NextRequest('http://localhost/api/admin/media', {
                method: 'POST',
                body: JSON.stringify({ action: 'delete' }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
            expect(payload.error).toContain('id');
        });
    });

    // ============================================================
    // POST /api/admin/media - Validation
    // ============================================================

    describe('POST /api/admin/media - validation', () => {
        it('returns error for missing action in JSON body', async () => {
            const request = new NextRequest('http://localhost/api/admin/media', {
                method: 'POST',
                body: JSON.stringify({}),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
            expect(payload.error).toContain('action');
        });

        it('returns error for unsupported action', async () => {
            const request = new NextRequest('http://localhost/api/admin/media', {
                method: 'POST',
                body: JSON.stringify({ action: 'invalid' }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
            expect(payload.error).toContain('Unsupported');
        });

        it('returns 500 when action throws unexpectedly', async () => {
            vi.mocked(mediaModule.updateMedia).mockRejectedValue(new Error('boom'));

            const request = new NextRequest('http://localhost/api/admin/media', {
                method: 'POST',
                body: JSON.stringify({
                    action: 'update',
                    id: '507f1f77bcf86cd799439011',
                    description: 'Test',
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await POST(request);
            const payload = await response.json();

            expect(response.status).toBe(500);
            expect(payload.success).toBe(false);
        });
    });

    // ============================================================
    // GET /api/admin/media/stats
    // ============================================================

    describe('GET /api/admin/media/stats', () => {
        it('returns media statistics', async () => {
            vi.mocked(mediaModule.getMediaStats).mockResolvedValue({
                success: true,
                status: 200,
                data: {
                    totalFiles: 10,
                    totalSize: 1024000,
                    totalSizeFormatted: '1000 KB',
                    byType: {
                        image: { count: 5, size: 512000 },
                        video: { count: 3, size: 307200 },
                        file: { count: 2, size: 204800 },
                    },
                    byFolder: {
                        root: { count: 1, size: 100000 },
                        blog: { count: 5, size: 500000 },
                        articles: { count: 2, size: 200000 },
                        projects: { count: 1, size: 100000 },
                        gallery: { count: 1, size: 100000 },
                        documents: { count: 0, size: 0 },
                    },
                    recentUploads: 3,
                },
            });

            const response = await GET_STATS();
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(payload.data.totalFiles).toBe(10);
            expect(payload.data.recentUploads).toBe(3);
        });

        it('returns 500 when action throws unexpectedly', async () => {
            vi.mocked(mediaModule.getMediaStats).mockRejectedValue(new Error('boom'));

            const response = await GET_STATS();
            const payload = await response.json();

            expect(response.status).toBe(500);
            expect(payload.success).toBe(false);
        });
    });

    // ============================================================
    // PATCH /api/admin/media/[id]
    // ============================================================

    describe('PATCH /api/admin/media/[id]', () => {
        it('returns success for valid update', async () => {
            vi.mocked(mediaModule.updateMedia).mockResolvedValue({
                success: true,
                status: 200,
                data: { updated: true },
            });

            const request = new NextRequest('http://localhost/api/admin/media/507f1f77bcf86cd799439011', {
                method: 'PATCH',
                body: JSON.stringify({
                    description: 'Updated description',
                    tags: ['featured'],
                }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await PATCH(request, { params: Promise.resolve({ id: '507f1f77bcf86cd799439011' }) });
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
        });

        it('returns error for invalid JSON body', async () => {
            const request = new NextRequest('http://localhost/api/admin/media/507f1f77bcf86cd799439011', {
                method: 'PATCH',
                body: 'invalid json',
                headers: { 'content-type': 'application/json' },
            });

            const response = await PATCH(request, { params: Promise.resolve({ id: '507f1f77bcf86cd799439011' }) });
            const payload = await response.json();

            expect(response.status).toBe(400);
            expect(payload.success).toBe(false);
        });

        it('returns 500 when action throws unexpectedly', async () => {
            vi.mocked(mediaModule.updateMedia).mockRejectedValue(new Error('boom'));

            const request = new NextRequest('http://localhost/api/admin/media/507f1f77bcf86cd799439011', {
                method: 'PATCH',
                body: JSON.stringify({ description: 'Test' }),
                headers: { 'content-type': 'application/json' },
            });

            const response = await PATCH(request, { params: Promise.resolve({ id: '507f1f77bcf86cd799439011' }) });
            const payload = await response.json();

            expect(response.status).toBe(500);
            expect(payload.success).toBe(false);
        });
    });

    // ============================================================
    // DELETE /api/admin/media/[id]
    // ============================================================

    describe('DELETE /api/admin/media/[id]', () => {
        it('returns success for valid delete', async () => {
            vi.mocked(mediaModule.deleteMedia).mockResolvedValue({
                success: true,
                status: 200,
                data: { deleted: true },
            });

            const request = new NextRequest('http://localhost/api/admin/media/507f1f77bcf86cd799439011', {
                method: 'DELETE',
            });

            const response = await DELETE(request, { params: Promise.resolve({ id: '507f1f77bcf86cd799439011' }) });
            const payload = await response.json();

            expect(response.status).toBe(200);
            expect(payload.success).toBe(true);
            expect(payload.data.deleted).toBe(true);
        });

        it('returns error for not found', async () => {
            vi.mocked(mediaModule.deleteMedia).mockResolvedValue({
                success: false,
                status: 404,
                error: 'Media not found',
            });

            const request = new NextRequest('http://localhost/api/admin/media/507f1f77bcf86cd799439011', {
                method: 'DELETE',
            });

            const response = await DELETE(request, { params: Promise.resolve({ id: '507f1f77bcf86cd799439011' }) });
            const payload = await response.json();

            expect(response.status).toBe(404);
            expect(payload.success).toBe(false);
        });

        it('returns 500 when action throws unexpectedly', async () => {
            vi.mocked(mediaModule.deleteMedia).mockRejectedValue(new Error('boom'));

            const request = new NextRequest('http://localhost/api/admin/media/507f1f77bcf86cd799439011', {
                method: 'DELETE',
            });

            const response = await DELETE(request, { params: Promise.resolve({ id: '507f1f77bcf86cd799439011' }) });
            const payload = await response.json();

            expect(response.status).toBe(500);
            expect(payload.success).toBe(false);
        });
    });
});
