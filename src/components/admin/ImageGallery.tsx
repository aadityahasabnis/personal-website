'use client';

import { useState, useEffect } from 'react';
import { Loader2, Image as ImageIcon, Search, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface GalleryImage {
    publicId: string;
    url: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    createdAt: string;
    folder: string;
    filename: string;
}

interface ImageGalleryProps {
    onSelect: (image: GalleryImage) => void;
    folder?: string;
    className?: string;
}

export const ImageGallery = ({
    onSelect,
    folder = 'portfolio/content',
    className,
}: ImageGalleryProps) => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchImages();
    }, [folder]);

    const fetchImages = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/images?folder=${encodeURIComponent(folder)}&max_results=100`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch images');
            }

            const result = await response.json();
            
            if (result.success) {
                setImages(result.data.images);
            } else {
                throw new Error(result.error || 'Failed to fetch images');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load images');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (image: GalleryImage) => {
        setSelectedImage(image);
        onSelect(image);
        
        // Visual feedback - clear selection after 2 seconds
        setTimeout(() => {
            setSelectedImage(null);
        }, 2000);
    };

    const filteredImages = images.filter(img =>
        img.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className={cn('flex items-center justify-center p-12', className)}>
                <div className="text-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">Loading your images...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn('p-6', className)}>
                <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 text-destructive">
                    <X className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="font-medium">Failed to load images</p>
                        <p className="text-sm">{error}</p>
                        <button
                            onClick={fetchImages}
                            className="text-sm underline hover:no-underline mt-2"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className={cn('p-12', className)}>
                <div className="text-center space-y-3">
                    <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground/50" />
                    <div className="space-y-1">
                        <p className="font-medium text-muted-foreground">No images yet</p>
                        <p className="text-sm text-muted-foreground">
                            Upload your first image to get started!
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search images..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Image Count */}
            <div className="text-sm text-muted-foreground">
                {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
                {searchQuery && ` matching "${searchQuery}"`}
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-2">
                {filteredImages.map((image) => (
                    <ImageCard
                        key={image.publicId}
                        image={image}
                        selected={selectedImage?.publicId === image.publicId}
                        onSelect={() => handleSelect(image)}
                    />
                ))}
            </div>

            {filteredImages.length === 0 && searchQuery && (
                <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                        No images found matching "{searchQuery}"
                    </p>
                </div>
            )}
        </div>
    );
};

// Image Card Component
const ImageCard = ({
    image,
    selected,
    onSelect,
}: {
    image: GalleryImage;
    selected: boolean;
    onSelect: () => void;
}) => {
    return (
        <button
            type="button"
            onClick={onSelect}
            className={cn(
                'group relative rounded-lg overflow-hidden border-2 transition-all',
                'hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary',
                selected
                    ? 'border-green-500 ring-2 ring-green-500'
                    : 'border-transparent hover:border-primary/50'
            )}
        >
            {/* Image */}
            <div className="aspect-square bg-muted relative">
                <img
                    src={image.url}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                    loading="lazy"
                />
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center space-y-1 p-2">
                        <p className="text-xs font-medium truncate">
                            {image.filename}
                        </p>
                        <p className="text-xs opacity-80">
                            {image.width} × {image.height}
                        </p>
                        <p className="text-xs opacity-80">
                            {(image.bytes / 1024).toFixed(0)}KB
                        </p>
                    </div>
                </div>

                {/* Selected Indicator */}
                {selected && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                        <Check className="h-4 w-4" />
                    </div>
                )}
            </div>

            {/* Filename (visible below image) */}
            <div className="p-2 bg-card">
                <p className="text-xs truncate text-center">
                    {image.filename}
                </p>
            </div>
        </button>
    );
};
