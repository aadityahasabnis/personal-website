/**
 * Yoopta Rich Text Editor Component
 * 
 * A professional rich text editor with:
 * - All Yoopta plugins (headings, lists, tables, code, images, etc.)
 * - Cloudinary image upload integration
 * - Slash command menu for block insertion (type / to open)
 * - Drag-and-drop block reordering
 * - Auto-save support
 */

'use client';

import { useMemo, useCallback, useEffect, useRef, useState } from 'react';
import YooptaEditor, { createYooptaEditor, type YooptaContentValue, type YooptaPlugin, type SlateElement } from '@yoopta/editor';

import { getThemedPlugins, marks, defaultPlaceholder } from '@/lib/editor/plugins';
import { getContentStats } from '@/lib/editor/utils';
import type { ContentStats } from '@/types/yoopta';
import { cn } from '@/lib/utils';

// ===== TYPES =====

export interface YooptaRichEditorProps {
    /** Initial content value */
    value?: YooptaContentValue;
    /** Called when content changes */
    onChange?: (value: YooptaContentValue) => void;
    /** Callback for auto-save with debounced content */
    onAutoSave?: (value: YooptaContentValue, stats: ContentStats) => void;
    /** Auto-save delay in milliseconds (default: 2000) */
    autoSaveDelay?: number;
    /** Placeholder text */
    placeholder?: string;
    /** Read-only mode */
    readOnly?: boolean;
    /** Editor height (CSS value) */
    height?: string;
    /** Additional CSS classes */
    className?: string;
    /** Show stats bar (word count, reading time) */
    showStats?: boolean;
    /** Unique ID for the editor instance */
    id?: string;
}

// ===== COMPONENT =====

export function YooptaRichEditor({
    value,
    onChange,
    onAutoSave,
    autoSaveDelay = 2000,
    placeholder = defaultPlaceholder,
    readOnly = false,
    height = '600px',
    className,
    showStats = true,
    id,
}: YooptaRichEditorProps) {
    // Get themed plugins with upload handlers
    // Cast to satisfy the strict YooptaEditor typing
    const plugins = useMemo(() => getThemedPlugins() as YooptaPlugin<Record<string, SlateElement>>[], []);

    // Create editor instance (no arguments in Yoopta v4)
    const editor = useMemo(() => createYooptaEditor(), []);

    // Content stats state
    const [stats, setStats] = useState<ContentStats>({
        wordCount: 0,
        characterCount: 0,
        readingTime: 1,
        blockCount: 0,
        imageCount: 0,
    });

    // Auto-save timer ref
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastSavedValueRef = useRef<string>('');

    // Set initial value
    useEffect(() => {
        if (value && Object.keys(value).length > 0) {
            editor.setEditorValue(value);
            setStats(getContentStats(value));
            lastSavedValueRef.current = JSON.stringify(value);
        }
    }, []); // Only run on mount

    // Handle content changes
    const handleChange = useCallback((newValue: YooptaContentValue) => {
        // Update stats
        const newStats = getContentStats(newValue);
        setStats(newStats);

        // Call onChange callback
        onChange?.(newValue);

        // Handle auto-save with debounce
        if (onAutoSave) {
            // Clear existing timer
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }

            // Set new timer
            autoSaveTimerRef.current = setTimeout(() => {
                const valueString = JSON.stringify(newValue);
                
                // Only save if content actually changed
                if (valueString !== lastSavedValueRef.current) {
                    lastSavedValueRef.current = valueString;
                    onAutoSave(newValue, newStats);
                }
            }, autoSaveDelay);
        }
    }, [onChange, onAutoSave, autoSaveDelay]);

    // Cleanup auto-save timer on unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, []);

    return (
        <div className={cn('yoopta-editor-wrapper', className)}>
            {/* Stats Bar */}
            {showStats && (
                <div className="flex items-center justify-between gap-4 px-4 py-2 mb-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span>{stats.wordCount} words</span>
                        <span>·</span>
                        <span>{stats.readingTime} min read</span>
                        <span>·</span>
                        <span>{stats.blockCount} blocks</span>
                        {stats.imageCount > 0 && (
                            <>
                                <span>·</span>
                                <span>{stats.imageCount} images</span>
                            </>
                        )}
                    </div>
                    <div className="text-xs">
                        Type <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">/</kbd> for commands
                    </div>
                </div>
            )}

            {/* Editor Container */}
            <div
                className={cn(
                    'yoopta-editor-container',
                    'border rounded-lg bg-background overflow-hidden',
                    'focus-within:ring-1 focus-within:ring-primary focus-within:border-primary',
                    'transition-all duration-200'
                )}
                style={{ minHeight: height }}
            >
                <div className="p-4 sm:p-6">
                    <YooptaEditor
                        editor={editor}
                        plugins={plugins}
                        marks={marks}
                        value={value}
                        onChange={handleChange}
                        placeholder={placeholder}
                        readOnly={readOnly}
                        autoFocus={!readOnly}
                        id={id}
                        style={{
                            minHeight: `calc(${height} - 3rem)`,
                        }}
                    />
                </div>
            </div>

            {/* Keyboard Shortcuts Help */}
            {!readOnly && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                    <p className="text-xs font-medium text-foreground mb-2">Editor Tips:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                            <kbd className="px-1 py-0.5 bg-background rounded border">/</kbd> Open command menu
                        </div>
                        <div>
                            <kbd className="px-1 py-0.5 bg-background rounded border">Ctrl+B</kbd> Bold text
                        </div>
                        <div>
                            <kbd className="px-1 py-0.5 bg-background rounded border">Ctrl+I</kbd> Italic text
                        </div>
                        <div>
                            <kbd className="px-1 py-0.5 bg-background rounded border">Ctrl+U</kbd> Underline
                        </div>
                        <div>
                            <kbd className="px-1 py-0.5 bg-background rounded border">Ctrl+`</kbd> Inline code
                        </div>
                        <div>
                            <kbd className="px-1 py-0.5 bg-background rounded border">Drag</kbd> Reorder blocks
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ===== EXPORT =====

export default YooptaRichEditor;
