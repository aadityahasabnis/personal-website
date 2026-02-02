'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface UploadedImage {
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
}

interface ImageUploadProps {
    onUpload: (image: UploadedImage) => void;
    onInsert?: (markdown: string) => void;
    folder?: string;
    className?: string;
    maxSize?: number; // in bytes
    showInsertButton?: boolean;
}

export const ImageUpload = ({
    onUpload,
    onInsert,
    folder = 'portfolio/content',
    className,
    maxSize = 10 * 1024 * 1024, // 10MB default
    showInsertButton = true,
}: ImageUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const uploadFile = async (file: File) => {
        setUploading(true);
        setError(null);
        setProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            // Simulate progress for better UX
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 10, 90));
            }, 200);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setProgress(100);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Upload failed');
            }

            const result = await response.json();
            const image: UploadedImage = result.data;

            setUploadedImage(image);
            onUpload(image);

            // Auto-clear after 3 seconds
            setTimeout(() => {
                setUploadedImage(null);
                setProgress(0);
            }, 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload image');
            setProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            uploadFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
        },
        maxSize,
        multiple: false,
    });

    const handleInsert = () => {
        if (uploadedImage && onInsert) {
            const markdown = `![Image](${uploadedImage.url})`;
            onInsert(markdown);
            setUploadedImage(null);
        }
    };

    const handleClear = () => {
        setUploadedImage(null);
        setError(null);
        setProgress(0);
    };

    return (
        <div className={cn('space-y-3', className)}>
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={cn(
                    'relative rounded-lg border-2 border-dashed transition-all cursor-pointer',
                    'hover:border-primary/50 hover:bg-muted/30',
                    isDragActive && 'border-primary bg-primary/5',
                    uploading && 'pointer-events-none opacity-60',
                    'p-6 text-center'
                )}
            >
                <input {...getInputProps()} />

                {uploading ? (
                    <div className="space-y-2">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                        <p className="text-sm text-muted-foreground">
                            Uploading... {progress}%
                        </p>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-primary h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                ) : uploadedImage ? (
                    <div className="space-y-2">
                        <Check className="h-8 w-8 mx-auto text-green-500" />
                        <p className="text-sm font-medium text-green-600">
                            Upload successful!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium">
                                {isDragActive
                                    ? 'Drop image here'
                                    : 'Drag & drop an image, or click to browse'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                PNG, JPG, GIF, WebP, SVG (max {Math.round(maxSize / 1024 / 1024)}MB)
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                    <X className="h-4 w-4 flex-shrink-0" />
                    <p>{error}</p>
                </div>
            )}

            {/* Uploaded Image Preview */}
            {uploadedImage && (
                <div className="relative rounded-lg border bg-card p-3 space-y-3">
                    <div className="flex items-start gap-3">
                        <ImageIcon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0 space-y-1">
                            <p className="text-sm font-medium truncate">
                                {uploadedImage.publicId.split('/').pop()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {uploadedImage.width} × {uploadedImage.height} • {' '}
                                {(uploadedImage.bytes / 1024).toFixed(0)}KB
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Image URL */}
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={uploadedImage.url}
                            readOnly
                            className="flex-1 text-xs bg-muted px-2 py-1.5 rounded border font-mono"
                            onClick={(e) => e.currentTarget.select()}
                        />
                        {showInsertButton && onInsert && (
                            <button
                                type="button"
                                onClick={handleInsert}
                                className="px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors whitespace-nowrap"
                            >
                                Insert
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
