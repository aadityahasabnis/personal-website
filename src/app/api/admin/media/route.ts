import { NextRequest, NextResponse } from 'next/server';

import {
    deleteMedia,
    getMedia,
    updateMedia,
    uploadMedia,
    type IMediaTableQuery,
    type IUpdateMediaInput,
    type IUploadMediaInput,
    type MediaFilter,
} from '@/server/new/admin/media';
import { isValidFolder, type MediaFolder } from '@/constants/mediaConstants';

import { parseJsonBody, requireAdmin, toHttp } from '../_shared';

// ============================================================
// Types
// ============================================================

type MediaMutationAction = 'upload' | 'update' | 'delete';

interface IMediaMutationBody {
    action: MediaMutationAction;
    // Upload fields
    file?: File;
    folder?: MediaFolder;
    description?: string;
    altText?: string;
    tags?: string[];
    // Update/Delete fields
    id?: string;
}

// ============================================================
// Route Configuration
// ============================================================

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ============================================================
// GET - Query Media
// ============================================================

export const GET = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const { searchParams } = new URL(request.url);

        const params: IMediaTableQuery = {};

        const filter = searchParams.get('filter');
        if (filter) params.filter = filter as MediaFilter;

        const query = searchParams.get('query');
        if (query) params.query = query;

        const offsetRaw = searchParams.get('offset');
        const limitRaw = searchParams.get('limit');
        if (offsetRaw !== null || limitRaw !== null) {
            params.pagination = {
                ...(offsetRaw !== null ? { offset: Number.parseInt(offsetRaw, 10) || 0 } : {}),
                ...(limitRaw !== null ? { limit: Number.parseInt(limitRaw, 10) || 20 } : {}),
            };
        }

        const sortBy = searchParams.get('sortBy');
        const sortOrder = searchParams.get('sortOrder');
        if (sortBy || sortOrder) {
            params.sort = {
                ...(sortBy ? { sortBy } : {}),
                ...(sortOrder === 'asc' || sortOrder === 'desc' ? { sortOrder } : {}),
            };
        }

        return toHttp(await getMedia(params));
    } catch {
        return NextResponse.json(
            { success: false, status: 500, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};

// ============================================================
// POST - Media Actions
// ============================================================

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    try {
        const unauthorized = await requireAdmin();
        if (unauthorized) return unauthorized;

        const contentType = request.headers.get('content-type');

        // Handle multipart/form-data for file uploads
        if (contentType?.includes('multipart/form-data')) {
            const formData = await request.formData();
            const file = formData.get('file') as File | null;
            const folder = formData.get('folder') as string | null;
            const description = formData.get('description') as string | null;
            const altText = formData.get('altText') as string | null;
            const tagsRaw = formData.get('tags') as string | null;

            if (!file) {
                return NextResponse.json(
                    { success: false, status: 400, error: 'Missing file' },
                    { status: 400 }
                );
            }

            const input: IUploadMediaInput = { file };
            if (folder && isValidFolder(folder)) input.folder = folder as MediaFolder;
            if (description) input.description = description;
            if (altText) input.altText = altText;
            if (tagsRaw) input.tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);

            return toHttp(await uploadMedia(input));
        }

        // Handle JSON body for update/delete
        const body = await parseJsonBody<IMediaMutationBody>(request);
        if (!body?.action) {
            return NextResponse.json(
                { success: false, status: 400, error: 'Missing action' },
                { status: 400 }
            );
        }

        switch (body.action) {
            // --------------------------------------------------------
            // Action: update
            // Required: id
            // Optional: description, altText, tags
            // --------------------------------------------------------
            case 'update': {
                if (!body.id) {
                    return NextResponse.json(
                        { success: false, status: 400, error: 'Missing id' },
                        { status: 400 }
                    );
                }
                const input: IUpdateMediaInput = { id: body.id };
                if (body.description !== undefined) input.description = body.description;
                if (body.altText !== undefined) input.altText = body.altText;
                if (body.tags !== undefined) input.tags = body.tags;
                return toHttp(await updateMedia(input));
            }

            // --------------------------------------------------------
            // Action: delete
            // Required: id
            // --------------------------------------------------------
            case 'delete': {
                if (!body.id) {
                    return NextResponse.json(
                        { success: false, status: 400, error: 'Missing id' },
                        { status: 400 }
                    );
                }
                return toHttp(await deleteMedia(body.id));
            }

            // --------------------------------------------------------
            // Unsupported action
            // --------------------------------------------------------
            default:
                return NextResponse.json(
                    { success: false, status: 400, error: 'Unsupported action' },
                    { status: 400 }
                );
        }
    } catch {
        return NextResponse.json(
            { success: false, status: 500, error: 'Internal Server Error' },
            { status: 500 }
        );
    }
};

/**
 * ============================================================
 * Admin Media API Route
 * ============================================================
 *
 * Endpoint: /api/admin/media
 * Auth: Admin session required
 *
 * ============================================================
 * GET - Query Media
 * ============================================================
 *
 * Query media files with filters and pagination.
 *
 * Query Params:
 *   - filter?: 'all' | 'image' | 'video' | 'file' | 'root' | 'blog' | 'articles' | 'projects' | 'gallery' | 'documents'
 *   - query?: string (search by filename or tags)
 *   - offset?: number (default: 0)
 *   - limit?: number (default: 20, max: 100)
 *   - sortBy?: 'fileName' | 'fileType' | 'size' | 'folder' | 'createdAt' | 'updatedAt'
 *   - sortOrder?: 'asc' | 'desc'
 *
 * Demo (Postman):
 * GET /api/admin/media?filter=image&query=hero&offset=0&limit=20&sortBy=createdAt&sortOrder=desc
 *
 * Response:
 *   - data: Array of media rows
 *   - pagination: { total, offset, limit, hasMore }
 *
 * ============================================================
 * POST Actions
 * ============================================================
 *
 * All POST requests use one of two content types:
 * - multipart/form-data for uploads
 * - application/json for mutations
 *
 * ------------------------------------------------------------
 * Action: "upload" (multipart/form-data)
 * ------------------------------------------------------------
 * Upload a new media file to CDN and save metadata.
 *
 * Required: file (File)
 * Optional: folder, description, altText, tags (comma-separated)
 *
 * Demo (Postman):
 * POST /api/admin/media
 * Content-Type: multipart/form-data
 * Body (form-data):
 *   file: [select file]
 *   folder: "blog"
 *   description: "Blog post hero image"
 *   altText: "Mountain landscape at sunset"
 *   tags: "featured,nature,mountains"
 *
 * ------------------------------------------------------------
 * Action: "update" (JSON)
 * ------------------------------------------------------------
 * Update media metadata.
 *
 * Required: action, id
 * Optional: description, altText, tags (array)
 *
 * Demo (Postman):
 * {
 *   "action": "update",
 *   "id": "507f1f77bcf86cd799439011",
 *   "description": "Updated description",
 *   "altText": "Updated alt text",
 *   "tags": ["featured", "homepage"]
 * }
 *
 * ------------------------------------------------------------
 * Action: "delete" (JSON)
 * ------------------------------------------------------------
 * Delete media from CDN and MongoDB.
 *
 * Required: action, id
 *
 * Demo (Postman):
 * {
 *   "action": "delete",
 *   "id": "507f1f77bcf86cd799439011"
 * }
 *
 * ============================================================
 */
