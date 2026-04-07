import { NextResponse } from 'next/server';

import { getMediaStats } from '@/server/new/admin/media';

import { requireAdmin, toHttp } from '../../_shared';

// ============================================================
// Route Configuration
// ============================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// GET - Media Statistics
// ============================================================

export const GET = async (): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        return toHttp(await getMediaStats());
    } catch {
        return NextResponse.json(
            { success: false, status: 500, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};

/**
 * ============================================================
 * Admin Media Statistics API Route
 * ============================================================
 *
 * Endpoint: /api/admin/media/stats
 * Auth: Admin session required
 *
 * ============================================================
 * GET - Media Statistics
 * ============================================================
 *
 * Returns aggregated media statistics.
 *
 * Response:
 *   - totalFiles: number
 *   - totalSize: number
 *   - totalSizeFormatted: string
 *   - byType: { image, video, file } - count and size for each type
 *   - byFolder: { root, blog, articles, projects, gallery, documents } - count and size for each folder
 *   - recentUploads: number - uploads in last 7 days
 *
 * Demo (Postman):
 * GET /api/admin/media/stats
 *
 * ============================================================
 */
