import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { uploadToCloudinary } from '@/lib/cloudinary';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Supported file types by category
const FILE_TYPES = {
    image: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'image/avif',
    ],
    video: [
        'video/mp4',
        'video/webm',
        'video/ogg',
        'video/quicktime',
    ],
    document: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/markdown',
    ],
};

// Max file sizes by type
const MAX_SIZES = {
    image: 10 * 1024 * 1024,     // 10MB
    video: 100 * 1024 * 1024,   // 100MB
    document: 25 * 1024 * 1024, // 25MB
};

/**
 * Determine file category from MIME type
 */
function getFileCategory(mimeType: string): 'image' | 'video' | 'document' | null {
    if (FILE_TYPES.image.includes(mimeType)) return 'image';
    if (FILE_TYPES.video.includes(mimeType)) return 'video';
    if (FILE_TYPES.document.includes(mimeType)) return 'document';
    return null;
}

/**
 * POST /api/upload - Upload file to Cloudinary
 * Supports images, videos, and documents
 * Protected route - requires authentication
 */
export async function POST(request: NextRequest) {
    try {
        // Check authentication
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get form data
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = (formData.get('folder') as string) || 'portfolio/content';
        const resourceType = formData.get('resource_type') as string | null;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Determine file category
        const category = getFileCategory(file.type);
        
        if (!category) {
            return NextResponse.json(
                { 
                    error: 'Invalid file type.',
                    allowed: [...FILE_TYPES.image, ...FILE_TYPES.video, ...FILE_TYPES.document],
                },
                { status: 400 }
            );
        }

        // Validate file size based on category
        const maxSize = MAX_SIZES[category];
        if (file.size > maxSize) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024));
            return NextResponse.json(
                { error: `File too large. Maximum size for ${category}s is ${maxSizeMB}MB.` },
                { status: 400 }
            );
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(file, folder);

        return NextResponse.json({
            success: true,
            data: {
                url: result.secure_url,
                publicId: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format,
                bytes: result.bytes,
                resourceType: result.resource_type,
                category,
            },
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}
