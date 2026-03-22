import { NextRequest, NextResponse } from 'next/server';

import { deleteMedia, updateMedia, type IUpdateMediaInput } from '@/server/new/admin/media';

import { parseJsonBody, requireAdmin, toHttp } from '../../_shared';

// ============================================================
// Route Configuration
// ============================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// PATCH - Update Media Metadata
// ============================================================

export const PATCH = async (
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const body = await parseJsonBody<Partial<IUpdateMediaInput>>(request);
        if (!body) {
            return NextResponse.json(
                { success: false, status: 400, error: 'Invalid request body' },
                { status: 400 }
            );
        }

        const { id } = await context.params;
        const input: IUpdateMediaInput = { id };
        if (body.description !== undefined) input.description = body.description;
        if (body.altText !== undefined) input.altText = body.altText;
        if (body.tags !== undefined) input.tags = body.tags;

        return toHttp(await updateMedia(input));
    } catch {
        return NextResponse.json(
            { success: false, status: 500, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};

// ============================================================
// DELETE - Delete Media
// ============================================================

export const DELETE = async (
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const { id } = await context.params;
        return toHttp(await deleteMedia(id));
    } catch {
        return NextResponse.json(
            { success: false, status: 500, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};

/**
 * ============================================================
 * Admin Media by ID API Route
 * ============================================================
 *
 * Endpoint: /api/admin/media/[id]
 * Auth: Admin session required
 *
 * ============================================================
 * PATCH - Update Media Metadata
 * ============================================================
 *
 * Update description, alt text, or tags for a media file.
 *
 * Body (JSON):
 *   - description?: string | null (max 500 chars)
 *   - altText?: string | null (max 200 chars)
 *   - tags?: string[] (max 10 tags)
 *
 * Demo (Postman):
 * PATCH /api/admin/media/507f1f77bcf86cd799439011
 * {
 *   "description": "Updated description",
 *   "altText": "Updated alt text",
 *   "tags": ["featured", "homepage"]
 * }
 *
 * ============================================================
 * DELETE - Delete Media
 * ============================================================
 *
 * Permanently delete media from CDN and MongoDB.
 *
 * Demo (Postman):
 * DELETE /api/admin/media/507f1f77bcf86cd799439011
 *
 * ============================================================
 */
