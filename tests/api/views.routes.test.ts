import { POST as articlePost } from '@/app/api/content/articles/id/[contentId]/views/route';
import * as blogViewsRoute from '@/app/api/content/blogs/id/[contentId]/views/route';
import * as projectViewsRoute from '@/app/api/content/projects/id/[contentId]/views/route';
import * as statsModule from '@/server/new/public/stats';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/server/new/public/stats', () => ({
    getContentViewsById: vi.fn(),
    incrementContentViewsById: vi.fn(),
}));

describe('views routes hardening', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(statsModule.incrementContentViewsById).mockResolvedValue({
            success: true,
            status: 200,
            data: {
                contentId: '65f1502cdc9bc503f8d7c001',
                views: 10,
                likes: 2,
                lastViewedAt: null,
            },
        });
    });

    it('article route increments views through canonical endpoint', async () => {
        const request = new NextRequest('http://localhost/api/content/articles/id/65f1502cdc9bc503f8d7c001/views', {
            method: 'POST',
        });

        const response = await articlePost(request, {
            params: Promise.resolve({ contentId: '65f1502cdc9bc503f8d7c001' }),
        });
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.success).toBe(true);
        expect(statsModule.incrementContentViewsById).toHaveBeenCalledTimes(1);
        expect(statsModule.incrementContentViewsById).toHaveBeenCalledWith('65f1502cdc9bc503f8d7c001');
    });

    it('blog route does not expose a POST increment endpoint', async () => {
        expect('POST' in blogViewsRoute).toBe(false);
        expect(statsModule.incrementContentViewsById).not.toHaveBeenCalled();
    });

    it('project route does not expose a POST increment endpoint', async () => {
        expect('POST' in projectViewsRoute).toBe(false);
        expect(statsModule.incrementContentViewsById).not.toHaveBeenCalled();
    });
});
