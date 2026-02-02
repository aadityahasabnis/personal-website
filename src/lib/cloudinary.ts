import { v2 as cloudinary } from 'cloudinary';

// Server-side Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

export interface CloudinaryUploadResult {
    public_id: string;
    version: number;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    created_at: string;
    tags: string[];
    bytes: number;
    type: string;
    etag: string;
    placeholder: boolean;
    url: string;
    secure_url: string;
    folder: string;
    original_filename: string;
    api_key: string;
}

/**
 * Upload image to Cloudinary (server-side only)
 */
export async function uploadToCloudinary(
    file: File | Buffer | string,
    folder: string = 'portfolio'
): Promise<CloudinaryUploadResult> {
    try {
        let uploadSource: string;

        if (typeof file === 'string') {
            // Base64 or URL
            uploadSource = file;
        } else if (file instanceof Buffer) {
            uploadSource = `data:image/jpeg;base64,${file.toString('base64')}`;
        } else {
            // File object - convert to base64
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            uploadSource = `data:${file.type};base64,${buffer.toString('base64')}`;
        }

        const result = await cloudinary.uploader.upload(uploadSource, {
            folder,
            resource_type: 'auto',
            transformation: [
                { quality: 'auto:good', fetch_format: 'auto' },
            ],
        });

        return result as CloudinaryUploadResult;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
}

/**
 * Generate optimized image URL from Cloudinary
 */
export function getCloudinaryUrl(
    publicId: string,
    options: {
        width?: number;
        height?: number;
        crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'limit';
        quality?: 'auto' | number;
        format?: 'auto' | 'jpg' | 'png' | 'webp';
    } = {}
): string {
    const {
        width,
        height,
        crop = 'fill',
        quality = 'auto',
        format = 'auto',
    } = options;

    return cloudinary.url(publicId, {
        width,
        height,
        crop,
        quality,
        fetch_format: format,
        secure: true,
    });
}

/**
 * Generate upload signature for client-side uploads
 */
export function generateUploadSignature(
    paramsToSign: Record<string, string | number>
): string {
    return cloudinary.utils.api_sign_request(
        paramsToSign,
        process.env.CLOUDINARY_API_SECRET!
    );
}

export default cloudinary;
