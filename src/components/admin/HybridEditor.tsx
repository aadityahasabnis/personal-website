'use client';

import { useState, useCallback, useRef } from 'react';
import { MarkdownEditor, type MarkdownEditorHandle } from './MarkdownEditor';
import { RichTextEditor, type RichTextEditorHandle } from './RichTextEditor';
import { ContentPreview } from './ContentPreview';
import { ImageUpload, type UploadedImage } from './ImageUpload';
import { ImageGallery, type GalleryImage } from './ImageGallery';
import { cn } from '@/lib/utils';
import {
    Code,
    Type,
    Eye,
    Columns2,
    ImagePlus,
    X,
    Upload,
    Images,
    Undo2,
    Redo2,
    Save,
} from 'lucide-react';

export type EditorMode = 'markdown' | 'rich' | 'split' | 'preview';

interface HybridEditorProps {
    value: string;
    onChange: (value: string) => void;
    onHtmlChange?: (html: string) => void;
    initialMode?: EditorMode;
    height?: string;
    className?: string;
    placeholder?: string;
}

export const HybridEditor = ({
    value,
    onChange,
    onHtmlChange,
    initialMode = 'markdown',
    height = '600px',
    className,
    placeholder = 'Start writing your content...',
}: HybridEditorProps) => {
    const [mode, setMode] = useState<EditorMode>(initialMode);
    const [showImageUploader, setShowImageUploader] = useState(false);
    const [imageTab, setImageTab] = useState<'gallery' | 'upload'>('gallery');
    const [wordCount, setWordCount] = useState(0);

    // Refs for editor instances
    const markdownEditorRef = useRef<MarkdownEditorHandle>(null);
    const richTextEditorRef = useRef<RichTextEditorHandle>(null);

    // Handle content change from Markdown editor
    const handleMarkdownChange = useCallback((newValue: string) => {
        onChange(newValue);
        // Update word count
        const words = newValue.trim().split(/\s+/).filter(Boolean).length;
        setWordCount(words);
    }, [onChange]);

    // Handle content change from Rich Text editor
    const handleRichTextChange = useCallback((html: string, md: string) => {
        onChange(md);
        if (onHtmlChange) {
            onHtmlChange(html);
        }
        // Update word count
        const words = md.trim().split(/\s+/).filter(Boolean).length;
        setWordCount(words);
    }, [onChange, onHtmlChange]);

    // Handle image upload
    const handleImageUpload = useCallback((image: UploadedImage) => {
        const imageMarkdown = `\n\n![${image.publicId.split('/').pop()}](${image.url})\n\n`;
        insertImageToEditor(imageMarkdown);
        
        // Close uploader after successful upload
        setTimeout(() => {
            setShowImageUploader(false);
        }, 1500);
    }, [mode]);

    // Handle gallery image selection
    const handleGallerySelect = useCallback((image: GalleryImage) => {
        const imageMarkdown = `\n\n![${image.filename}](${image.url})\n\n`;
        insertImageToEditor(imageMarkdown);
    }, [mode]);

    // Handle manual image insert (from ImageUpload "Insert" button)
    const handleInsertImage = useCallback((imageMarkdown: string) => {
        insertImageToEditor(imageMarkdown);
    }, [mode]);

    // Insert image into the active editor
    const insertImageToEditor = (imageMarkdown: string) => {
        if (mode === 'markdown' || mode === 'split') {
            markdownEditorRef.current?.insertText(imageMarkdown);
        } else if (mode === 'rich') {
            // Extract URL from markdown
            const match = imageMarkdown.match(/!\[(.*?)\]\((.*?)\)/);
            if (match) {
                const [, alt, url] = match;
                richTextEditorRef.current?.insertImage(url, alt);
            }
        }
    };

    // Undo/Redo handlers
    const handleUndo = () => {
        if (mode === 'markdown' || mode === 'split') {
            markdownEditorRef.current?.undo();
        } else if (mode === 'rich') {
            richTextEditorRef.current?.undo();
        }
    };

    const handleRedo = () => {
        if (mode === 'markdown' || mode === 'split') {
            markdownEditorRef.current?.redo();
        } else if (mode === 'rich') {
            richTextEditorRef.current?.redo();
        }
    };

    const renderEditor = () => {
        switch (mode) {
            case 'markdown':
                return (
                    <div className="h-full">
                        <MarkdownEditor
                            ref={markdownEditorRef}
                            value={value}
                            onChange={handleMarkdownChange}
                            height={height}
                            placeholder={placeholder}
                        />
                    </div>
                );

            case 'rich':
                return (
                    <div className="h-full">
                        <RichTextEditor
                            ref={richTextEditorRef}
                            content={value}
                            onChange={handleRichTextChange}
                            onImageClick={() => setShowImageUploader(true)}
                            placeholder={placeholder}
                        />
                    </div>
                );

            case 'split':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
                        <div className="overflow-auto">
                            <MarkdownEditor
                                ref={markdownEditorRef}
                                value={value}
                                onChange={handleMarkdownChange}
                                height={height}
                                placeholder={placeholder}
                            />
                        </div>
                        <div className="overflow-auto border rounded-lg">
                            <ContentPreview markdown={value} />
                        </div>
                    </div>
                );

            case 'preview':
                return (
                    <div className="h-full overflow-auto border rounded-lg">
                        <ContentPreview markdown={value} />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={cn('space-y-3', className)}>
            {/* Mode Switcher & Actions */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Mode Buttons */}
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                    <ModeButton
                        active={mode === 'markdown'}
                        onClick={() => setMode('markdown')}
                        icon={<Code className="h-4 w-4" />}
                        title="Markdown Editor"
                    >
                        Markdown
                    </ModeButton>

                    <ModeButton
                        active={mode === 'rich'}
                        onClick={() => setMode('rich')}
                        icon={<Type className="h-4 w-4" />}
                        title="Rich Text Editor"
                    >
                        Rich Text
                    </ModeButton>

                    <ModeButton
                        active={mode === 'split'}
                        onClick={() => setMode('split')}
                        icon={<Columns2 className="h-4 w-4" />}
                        title="Split View"
                    >
                        Split
                    </ModeButton>

                    <ModeButton
                        active={mode === 'preview'}
                        onClick={() => setMode('preview')}
                        icon={<Eye className="h-4 w-4" />}
                        title="Preview Only"
                    >
                        Preview
                    </ModeButton>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    {/* Word Count */}
                    <div className="px-3 py-1.5 text-xs bg-muted rounded-lg text-muted-foreground">
                        {wordCount} {wordCount === 1 ? 'word' : 'words'}
                    </div>

                    {/* Undo/Redo */}
                    {mode !== 'preview' && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-lg">
                            <button
                                type="button"
                                onClick={handleUndo}
                                className="p-1.5 hover:bg-background rounded transition-colors"
                                title="Undo (Ctrl+Z)"
                            >
                                <Undo2 className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={handleRedo}
                                className="p-1.5 hover:bg-background rounded transition-colors"
                                title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
                            >
                                <Redo2 className="h-4 w-4" />
                            </button>
                        </div>
                    )}

                    {/* Add Image Button */}
                    <button
                        type="button"
                        onClick={() => setShowImageUploader(!showImageUploader)}
                        className={cn(
                            'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium',
                            showImageUploader
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80'
                        )}
                    >
                        {showImageUploader ? (
                            <>
                                <X className="h-4 w-4" />
                                <span className="hidden sm:inline">Close</span>
                            </>
                        ) : (
                            <>
                                <ImagePlus className="h-4 w-4" />
                                <span className="hidden sm:inline">Add Image</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Image Uploader/Gallery */}
            {showImageUploader && (
                <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <ImagePlus className="h-4 w-4" />
                            Insert Image
                        </h3>
                        {/* Tab Switcher */}
                        <div className="flex items-center gap-1 p-1 bg-background rounded-md border">
                            <button
                                type="button"
                                onClick={() => setImageTab('gallery')}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors',
                                    imageTab === 'gallery'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <Images className="h-3.5 w-3.5" />
                                Gallery
                            </button>
                            <button
                                type="button"
                                onClick={() => setImageTab('upload')}
                                className={cn(
                                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors',
                                    imageTab === 'upload'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                <Upload className="h-3.5 w-3.5" />
                                Upload New
                            </button>
                        </div>
                    </div>
                    
                    {/* Tab Content */}
                    {imageTab === 'gallery' ? (
                        <div>
                            <p className="text-xs text-muted-foreground mb-3">
                                Browse and select images from your library. Click any image to insert it at the cursor position.
                            </p>
                            <ImageGallery
                                onSelect={handleGallerySelect}
                                folder="portfolio/content"
                            />
                        </div>
                    ) : (
                        <div>
                            <p className="text-xs text-muted-foreground mb-3">
                                Upload a new image to Cloudinary. It will be inserted at the cursor position automatically.
                            </p>
                            <ImageUpload
                                onUpload={handleImageUpload}
                                onInsert={handleInsertImage}
                                folder="portfolio/content"
                                showInsertButton={true}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Editor Area */}
            <div className="rounded-lg overflow-hidden" style={{ minHeight: height }}>
                {renderEditor()}
            </div>

            {/* Professional Tips */}
            <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-lg">
                <p className="font-semibold text-foreground mb-2">💡 Editor Features:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                        <strong>• Undo/Redo:</strong> Ctrl+Z / Ctrl+Y (up to 100 steps)
                    </div>
                    <div>
                        <strong>• Image Gallery:</strong> Browse and reuse uploaded images
                    </div>
                    <div>
                        <strong>• Keyboard Shortcuts:</strong> Ctrl+B (bold), Ctrl+I (italic), Ctrl+K (link)
                    </div>
                    <div>
                        <strong>• Auto-save:</strong> Content saves automatically as you type
                    </div>
                </div>
            </div>
        </div>
    );
};

// Mode button component
const ModeButton = ({
    active,
    onClick,
    icon,
    title,
    children,
}: {
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
            active
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
        )}
    >
        {icon}
        <span className="hidden sm:inline">{children}</span>
    </button>
);
