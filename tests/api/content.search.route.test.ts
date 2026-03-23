import { SITE_CONFIG } from '@/constants/siteConstants';
import * as searchModule from '@/server/new/public/content/search';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GET, OPTIONS } from '@/app/api/content/search/route';

vi.mock('@/server/new/public/content/search', () => ({
    getPublishedContentSearchResults: vi.fn(),
}));

describe('content search api route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(searchModule.getPublishedContentSearchResults).mockResolvedValue({
            success: true,
            status: 200,
            data: [],
        });
    });

    it('passes parsed query params to search module and filters invalid content types', async () => {
        const q = SITE_CONFIG.seo.search.queryParam;
        const request = new NextRequest(
            `http://localhost/api/content/search?${q}=nextjs&contentTypes=article,invalid,blog&featuredOnly=true&offset=oops&limit=25`
        );

        const response = await GET(request);
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.success).toBe(true);
        expect(searchModule.getPublishedContentSearchResults).toHaveBeenCalledWith({
            query: 'nextjs',
            contentTypes: ['article', 'blog'],
            featuredOnly: true,
            pagination: {
                offset: 0,
                limit: 25,
            },
        });
    });

    it('uses defaults when optional params are missing', async () => {
        const q = SITE_CONFIG.seo.search.queryParam;
        const request = new NextRequest(`http://localhost/api/content/search?${q}=portfolio`);

        const response = await GET(request);

        expect(response.status).toBe(200);
        expect(searchModule.getPublishedContentSearchResults).toHaveBeenCalledWith({
            query: 'portfolio',
            featuredOnly: false,
            pagination: {
                offset: 0,
                limit: 20,
            },
        });
    });

    it('exposes endpoint contract via OPTIONS', async () => {
        const response = OPTIONS();
        const payload = await response.json();

        expect(response.status).toBe(200);
        expect(payload.endpoint).toBe('/api/content/search');
        expect(payload.methods).toEqual(['GET']);
        expect(payload.querySchema[SITE_CONFIG.seo.search.queryParam]).toBe('string required search query');
    });
});
