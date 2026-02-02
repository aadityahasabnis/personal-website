import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import cloudinary from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/images - Fetch images from Cloudinary
 * Protected route - requires authentication
 */
export async function GET(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const folder = searchParams.get('folder') || 'portfolio/content';
        const maxResults = parseInt(searchParams.get('max_results') || '50');
        const nextCursor = searchParams.get('next_cursor');

        // Fetch images from Cloudinary
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: folder,
            max_results: Math.min(maxResults, 100), // Cap at 100
            next_cursor: nextCursor || undefined,
            resource_type: 'image',
        });

        // Transform to simplified format
        const images = result.resources.map((resource: any) => ({
            publicId: resource.public_id,
            url: resource.secure_url,
            width: resource.width,
            height: resource.height,
            format: resource.format,
            bytes: resource.bytes,
            createdAt: resource.created_at,
            folder: resource.folder,
            filename: resource.public_id.split('/').pop(),
        }));

        return NextResponse.json({
            success: true,
            data: {
                images,
                nextCursor: result.next_cursor || null,
                totalCount: result.total_count || images.length,
            },
        });
    } catch (error) {
        console.error('Failed to fetch images:', error);
        return NextResponse.json(
            { error: 'Failed to fetch images from Cloudinary' },
            { status: 500 }
        );
    }
}
