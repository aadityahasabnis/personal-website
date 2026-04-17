import { NAV_LINKS, SITE_CONFIG } from '@/constants/siteConstants';
import { describe, expect, it } from 'vitest';

describe('manifest contracts', () => {
    it('derives core manifest fields from site constants', async () => {
        const manifestModule = await import('@/app/manifest');
        const output = manifestModule.default();

        expect(output.name).toBe(SITE_CONFIG.name);
        expect(output.short_name).toBe(SITE_CONFIG.shortName);
        expect(output.description).toBe(SITE_CONFIG.description);
        expect(output.lang).toBe(SITE_CONFIG.locale);
    });

    it('includes nav shortcuts for key public routes', async () => {
        const manifestModule = await import('@/app/manifest');
        const output = manifestModule.default();

        expect(output.shortcuts).toHaveLength(NAV_LINKS.length);

        for (const link of NAV_LINKS) {
            expect(output.shortcuts).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({
                        name: link.label,
                        url: link.href,
                    }),
                ]),
            );
        }
    });
});
