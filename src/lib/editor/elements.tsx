/**
 * Custom Element Renderers for Yoopta Editor
 * 
 * These provide upload UI for Image, Video, and File blocks.
 * We use the upload functions directly passed to the hooks.
 */

'use client';

import React, { useRef, useState, useCallback } from 'react';
import { useYooptaEditor, Elements, Blocks } from '@yoopta/editor';
import { Upload, Image as ImageIcon, Video, FileText, Loader2, X, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadImage, uploadVideo, uploadFile } from './plugins';

// Types
interface RenderElementProps {
    element: {
        id: string;
        type: string;
        children: unknown[];
        props?: Record<string, unknown>;
    };
    attributes: Record<string, unknown>;
    children: React.ReactNode;
    blockId: string;
}

// ===== IMAGE ELEMENT =====

export const ImageElement = ({ element, attributes, children, blockId }: RenderElementProps) => {
    const editor = useYooptaEditor();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);
        setProgress(0);

        try {
            const result = await uploadImage(file);
            
            // Update element with uploaded image
            Elements.updateElement(editor, {
                blockId,
                type: 'image',
                props: {
                    id: result.id,
                    src: result.src,
                    alt: result.alt || file.name.replace(/\.[^/.]+$/, ''),
                    sizes: result.sizes,
                },
            });
        } catch (err) {
            console.error('Image upload failed:', err);
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setLoading(false);
            // Reset input so same file can be selected again
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [editor, blockId]);

    const handleDelete = useCallback(() => {
        Blocks.deleteBlock(editor, { blockId, focus: true });
    }, [editor, blockId]);

    const imageProps = element.props as {
        src?: string;
        alt?: string;
        sizes?: { width: number; height: number };
    };

    // If image is uploaded, show it
    if (imageProps?.src) {
        return (
            <div {...attributes} contentEditable={false} className="my-4 group relative">
                <img
                    src={imageProps.src}
                    alt={imageProps.alt || ''}
                    width={imageProps.sizes?.width}
                    height={imageProps.sizes?.height}
                    className="rounded-lg max-w-full h-auto mx-auto"
                    loading="lazy"
                />
                <button
                    type="button"
                    onClick={handleDelete}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete image"
                >
                    <X size={14} />
                </button>
                {children}
            </div>
        );
    }

    // Show upload UI
    return (
        <div {...attributes} contentEditable={false}>
            <div
                className={cn(
                    'my-4 p-8 border-2 border-dashed rounded-lg',
                    'flex flex-col items-center justify-center gap-3',
                    'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700',
                    'hover:border-purple-500 dark:hover:border-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                    'transition-all cursor-pointer min-h-[150px]',
                    loading && 'pointer-events-none opacity-70'
                )}
                onClick={() => !loading && fileInputRef.current?.click()}
            >
                {loading ? (
                    <>
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Uploading... {progress}%
                        </span>
                    </>
                ) : error ? (
                    <>
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <span className="text-sm text-red-500">{error}</span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setError(null);
                                fileInputRef.current?.click();
                            }}
                            className="text-xs text-purple-500 hover:underline"
                        >
                            Try again
                        </button>
                    </>
                ) : (
                    <>
                        <ImageIcon className="h-8 w-8 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload image</span>
                        <span className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</span>
                    </>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUpload}
                    className="hidden"
                />
            </div>
            {children}
        </div>
    );
};

// ===== VIDEO ELEMENT =====

export const VideoElement = ({ element, attributes, children, blockId }: RenderElementProps) => {
    const editor = useYooptaEditor();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [urlInput, setUrlInput] = useState('');
    const [showUrlInput, setShowUrlInput] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const result = await uploadVideo(file);
            
            Elements.updateElement(editor, {
                blockId,
                type: 'video',
                props: {
                    id: result.id,
                    src: result.src,
                    sizes: result.sizes,
                },
            });
        } catch (err) {
            console.error('Video upload failed:', err);
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [editor, blockId]);

    const handleUrlSubmit = useCallback(() => {
        if (!urlInput.trim()) return;
        
        Elements.updateElement(editor, {
            blockId,
            type: 'video',
            props: {
                src: urlInput.trim(),
                provider: urlInput.includes('youtube') ? 'youtube' : 
                         urlInput.includes('vimeo') ? 'vimeo' : 'custom',
            },
        });
        setShowUrlInput(false);
        setUrlInput('');
    }, [urlInput, editor, blockId]);

    const handleDelete = useCallback(() => {
        Blocks.deleteBlock(editor, { blockId, focus: true });
    }, [editor, blockId]);

    const videoProps = element.props as {
        src?: string;
        provider?: string;
        sizes?: { width: number; height: number };
    };

    // If video is set, show it
    if (videoProps?.src) {
        // Check for YouTube
        const youtubeId = extractYouTubeId(videoProps.src);
        if (youtubeId) {
            return (
                <div {...attributes} contentEditable={false} className="my-4 group relative aspect-video">
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}`}
                        className="w-full h-full rounded-lg"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        <X size={14} />
                    </button>
                    {children}
                </div>
            );
        }

        // Check for Vimeo
        const vimeoId = extractVimeoId(videoProps.src);
        if (vimeoId) {
            return (
                <div {...attributes} contentEditable={false} className="my-4 group relative aspect-video">
                    <iframe
                        src={`https://player.vimeo.com/video/${vimeoId}`}
                        className="w-full h-full rounded-lg"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                    />
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    >
                        <X size={14} />
                    </button>
                    {children}
                </div>
            );
        }

        // Direct video file
        return (
            <div {...attributes} contentEditable={false} className="my-4 group relative">
                <video
                    src={videoProps.src}
                    controls
                    className="w-full rounded-lg"
                    width={videoProps.sizes?.width}
                    height={videoProps.sizes?.height}
                />
                <button
                    type="button"
                    onClick={handleDelete}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X size={14} />
                </button>
                {children}
            </div>
        );
    }

    // Show upload UI
    return (
        <div {...attributes} contentEditable={false}>
            <div
                className={cn(
                    'my-4 p-8 border-2 border-dashed rounded-lg',
                    'flex flex-col items-center justify-center gap-3',
                    'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700',
                    'transition-all min-h-[150px]'
                )}
            >
                {loading ? (
                    <>
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Uploading video...
                        </span>
                    </>
                ) : error ? (
                    <>
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <span className="text-sm text-red-500">{error}</span>
                    </>
                ) : showUrlInput ? (
                    <div className="w-full max-w-md space-y-3">
                        <input
                            type="url"
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            placeholder="Paste YouTube, Vimeo, or video URL..."
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                        />
                        <div className="flex gap-2 justify-center">
                            <button
                                type="button"
                                onClick={handleUrlSubmit}
                                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600"
                            >
                                Embed Video
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowUrlInput(false)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <Video className="h-8 w-8 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Add a video</span>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-purple-600"
                            >
                                <Upload size={14} />
                                Upload
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowUrlInput(true)}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <LinkIcon size={14} />
                                Embed URL
                            </button>
                        </div>
                    </>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={handleUpload}
                    className="hidden"
                />
            </div>
            {children}
        </div>
    );
};

// ===== FILE ELEMENT =====

export const FileElement = ({ element, attributes, children, blockId }: RenderElementProps) => {
    const editor = useYooptaEditor();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        setError(null);

        try {
            const result = await uploadFile(file);
            
            Elements.updateElement(editor, {
                blockId,
                type: 'file',
                props: {
                    id: result.id,
                    src: result.src,
                    name: result.name,
                    size: result.size,
                    format: result.format,
                },
            });
        } catch (err) {
            console.error('File upload failed:', err);
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    }, [editor, blockId]);

    const handleDelete = useCallback(() => {
        Blocks.deleteBlock(editor, { blockId, focus: true });
    }, [editor, blockId]);

    const fileProps = element.props as {
        src?: string;
        name?: string;
        size?: number;
        format?: string;
    };

    // If file is uploaded, show it
    if (fileProps?.src) {
        return (
            <div {...attributes} contentEditable={false} className="my-4 group relative">
                <a
                    href={fileProps.src}
                    download={fileProps.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <FileText className="h-8 w-8 text-purple-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{fileProps.name || 'File'}</p>
                        <p className="text-xs text-gray-500">
                            {fileProps.format?.toUpperCase()} {fileProps.size ? `• ${formatFileSize(fileProps.size)}` : ''}
                        </p>
                    </div>
                </a>
                <button
                    type="button"
                    onClick={handleDelete}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <X size={14} />
                </button>
                {children}
            </div>
        );
    }

    // Show upload UI
    return (
        <div {...attributes} contentEditable={false}>
            <div
                className={cn(
                    'my-4 p-8 border-2 border-dashed rounded-lg',
                    'flex flex-col items-center justify-center gap-3',
                    'bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700',
                    'hover:border-purple-500 dark:hover:border-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                    'transition-all cursor-pointer min-h-[120px]',
                    loading && 'pointer-events-none opacity-70'
                )}
                onClick={() => !loading && fileInputRef.current?.click()}
            >
                {loading ? (
                    <>
                        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            Uploading file...
                        </span>
                    </>
                ) : error ? (
                    <>
                        <AlertCircle className="h-8 w-8 text-red-500" />
                        <span className="text-sm text-red-500">{error}</span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setError(null);
                            }}
                            className="text-xs text-purple-500 hover:underline"
                        >
                            Try again
                        </button>
                    </>
                ) : (
                    <>
                        <FileText className="h-8 w-8 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload file</span>
                        <span className="text-xs text-gray-500">PDF, Word, Excel, or other documents</span>
                    </>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleUpload}
                    className="hidden"
                />
            </div>
            {children}
        </div>
    );
};

// ===== UTILITY FUNCTIONS =====

function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return match[1];
    }
    
    return null;
}

function extractVimeoId(url: string): string | null {
    const patterns = [
        /vimeo\.com\/(\d+)/,
        /player\.vimeo\.com\/video\/(\d+)/,
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match?.[1]) return match[1];
    }
    
    return null;
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ===== EXPORT ELEMENT CONFIGS =====

export const CustomImageRender = ImageElement;
export const CustomVideoRender = VideoElement;
export const CustomFileRender = FileElement;
