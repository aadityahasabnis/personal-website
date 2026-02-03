/**
 * Yoopta Rich Text Editor Component (v6)
 * 
 * A professional rich text editor with:
 * - All Yoopta plugins (headings, lists, tables, code, images, etc.)
 * - Cloudinary image upload integration
 * - Slash command menu for block insertion (type / to open)
 * - Floating toolbar for text formatting
 * - Auto-save support
 */

'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import YooptaEditor, { createYooptaEditor, generateId, Marks, useYooptaEditor, Blocks, type YooptaContentValue } from '@yoopta/editor';

// UI components from @yoopta/ui
import { SlashCommandMenu } from '@yoopta/ui/slash-command-menu';
import { FloatingToolbar } from '@yoopta/ui/floating-toolbar';
import { FloatingBlockActions } from '@yoopta/ui/floating-block-actions';
import { SelectionBox } from '@yoopta/ui/selection-box';
import { BlockDndContext, SortableBlock, DragHandle } from '@yoopta/ui/block-dnd';
import { ActionMenuList } from '@yoopta/ui/action-menu-list';
import { BlockOptions, useBlockActions } from '@yoopta/ui/block-options';

import { getEditorPlugins, marks, defaultPlaceholder } from '@/lib/editor/plugins';
import { getContentStats } from '@/lib/editor/utils';
import type { ContentStats } from '@/types/yoopta';
import { cn } from '@/lib/utils';

// Icons for the toolbar
import { Bold, Italic, Underline, Strikethrough, Code, Plus, GripVertical, Highlighter, ChevronDown, MoreVertical, Copy, Trash2 } from 'lucide-react';

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

// ===== SLASH COMMAND MENU =====

const YooptaSlashCommand = () => (
    <SlashCommandMenu>
        {(props) => (
            <SlashCommandMenu.Content>
                <SlashCommandMenu.List>
                    <SlashCommandMenu.Empty>No blocks found</SlashCommandMenu.Empty>
                    {props.items.map((item) => (
                        <SlashCommandMenu.Item
                            key={item.id}
                            value={item.id} 
                            title={item.title}
                            description={item.description}
                        />
                    ))}
                </SlashCommandMenu.List>
                <SlashCommandMenu.Footer showHints />
            </SlashCommandMenu.Content>
        )}
    </SlashCommandMenu>
);

// ===== FLOATING TOOLBAR =====

const YooptaToolbar = () => {
    const editor = useYooptaEditor();
    const [actionMenuOpen, setActionMenuOpen] = useState(false);
    const [highlightMenuOpen, setHighlightMenuOpen] = useState(false);
    const turnIntoRef = useRef<HTMLButtonElement>(null);
    const highlightRef = useRef<HTMLButtonElement>(null);

    // Highlight colors
    const highlightColors = [
        { value: '#fef3c7', label: 'Yellow', color: 'bg-yellow-100' },
        { value: '#dbeafe', label: 'Blue', color: 'bg-blue-100' },
        { value: '#dcfce7', label: 'Green', color: 'bg-green-100' },
        { value: '#fce7f3', label: 'Pink', color: 'bg-pink-100' },
        { value: '#f3e8ff', label: 'Purple', color: 'bg-purple-100' },
        { value: '#fed7aa', label: 'Orange', color: 'bg-orange-100' },
        { value: '#fecaca', label: 'Red', color: 'bg-red-100' },
        { value: 'transparent', label: 'None', color: 'bg-transparent' },
    ];

    const applyHighlight = (color: string) => {
        if (color === 'transparent') {
            Marks.toggle(editor, { type: 'highlight' });
        } else {
            // Apply highlight with color via editor transforms
            Marks.toggle(editor, { type: 'highlight' });
            // Note: Color customization would need custom mark implementation
        }
        setHighlightMenuOpen(false);
    };

    return (
        <>
            <FloatingToolbar frozen={actionMenuOpen || highlightMenuOpen}>
                <FloatingToolbar.Content>
                    {/* Turn Into Menu */}
                    <FloatingToolbar.Group>
                        <FloatingToolbar.Button
                            ref={turnIntoRef}
                            onClick={() => setActionMenuOpen(true)}
                            title="Turn into"
                        >
                            Turn into <ChevronDown size={14} className="ml-1" />
                        </FloatingToolbar.Button>
                    </FloatingToolbar.Group>

                    <FloatingToolbar.Separator />

                    {/* Text Formatting */}
                    <FloatingToolbar.Group>
                        {editor.formats.bold && (
                            <FloatingToolbar.Button
                                onClick={() => Marks.toggle(editor, { type: 'bold' })}
                                active={Marks.isActive(editor, { type: 'bold' })}
                                title="Bold (Ctrl+B)"
                            >
                                <Bold size={16} />
                            </FloatingToolbar.Button>
                        )}
                        {editor.formats.italic && (
                            <FloatingToolbar.Button
                                onClick={() => Marks.toggle(editor, { type: 'italic' })}
                                active={Marks.isActive(editor, { type: 'italic' })}
                                title="Italic (Ctrl+I)"
                            >
                                <Italic size={16} />
                            </FloatingToolbar.Button>
                        )}
                        {editor.formats.underline && (
                            <FloatingToolbar.Button
                                onClick={() => Marks.toggle(editor, { type: 'underline' })}
                                active={Marks.isActive(editor, { type: 'underline' })}
                                title="Underline (Ctrl+U)"
                            >
                                <Underline size={16} />
                            </FloatingToolbar.Button>
                        )}
                        {editor.formats.strike && (
                            <FloatingToolbar.Button
                                onClick={() => Marks.toggle(editor, { type: 'strike' })}
                                active={Marks.isActive(editor, { type: 'strike' })}
                                title="Strikethrough"
                            >
                                <Strikethrough size={16} />
                            </FloatingToolbar.Button>
                        )}
                        {editor.formats.code && (
                            <FloatingToolbar.Button
                                onClick={() => Marks.toggle(editor, { type: 'code' })}
                                active={Marks.isActive(editor, { type: 'code' })}
                                title="Code (Ctrl+`)"
                            >
                                <Code size={16} />
                            </FloatingToolbar.Button>
                        )}
                    </FloatingToolbar.Group>

                    <FloatingToolbar.Separator />

                    {/* Highlight with Color Picker */}
                    <FloatingToolbar.Group>
                        {editor.formats.highlight && (
                            <FloatingToolbar.Button
                                ref={highlightRef}
                                onClick={() => setHighlightMenuOpen(!highlightMenuOpen)}
                                active={Marks.isActive(editor, { type: 'highlight' })}
                                title="Highlight"
                            >
                                <Highlighter size={16} />
                                <ChevronDown size={14} className="ml-1" />
                            </FloatingToolbar.Button>
                        )}
                    </FloatingToolbar.Group>
                </FloatingToolbar.Content>
            </FloatingToolbar>

            {/* Action Menu List - Turn Into */}
            <ActionMenuList
                open={actionMenuOpen}
                onOpenChange={setActionMenuOpen}
                anchor={turnIntoRef.current}
                view="small"
                placement="bottom-start"
            >
                <ActionMenuList.Content />
            </ActionMenuList>

            {/* Highlight Color Picker */}
            {highlightMenuOpen && highlightRef.current && (
                <div
                    className="fixed z-50 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] shadow-lg p-2"
                    style={{
                        top: `${highlightRef.current.getBoundingClientRect().bottom + 8}px`,
                        left: `${highlightRef.current.getBoundingClientRect().left}px`,
                    }}
                >
                    <div className="grid grid-cols-4 gap-2">
                        {highlightColors.map((color) => (
                            <button
                                key={color.value}
                                onClick={() => applyHighlight(color.value)}
                                className={`w-8 h-8 rounded border-2 border-[var(--border-color)] hover:border-[var(--accent)] transition-colors ${color.color}`}
                                title={color.label}
                                style={{ backgroundColor: color.value }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

// ===== FLOATING BLOCK ACTIONS =====

const YooptaBlockActions = () => {
    const editor = useYooptaEditor();
    const [blockOptionsOpen, setBlockOptionsOpen] = useState(false);
    const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
    const optionsButtonRef = useRef<HTMLButtonElement>(null);

    const onPlusClick = (blockId: string | null) => {
        if (!blockId) return;
        const floatingBlock = Blocks.getBlock(editor, { id: blockId });
        if (!floatingBlock) return;

        const nextOrder = floatingBlock.meta.order + 1;
        editor.insertBlock('Paragraph', { at: nextOrder, focus: true });
    };

    const onOptionsClick = (blockId: string | null) => {
        setCurrentBlockId(blockId);
        setBlockOptionsOpen(true);
    };

    return (
        <>
            <FloatingBlockActions frozen={blockOptionsOpen}>
                {({ blockId }) => (
                    <>
                        <FloatingBlockActions.Button 
                            onClick={() => onPlusClick(blockId)} 
                            title="Add block below"
                        >
                            <Plus size={16} />
                        </FloatingBlockActions.Button>
                        <DragHandle blockId={blockId} asChild>
                            <FloatingBlockActions.Button title="Drag to reorder">
                                <GripVertical size={16} />
                            </FloatingBlockActions.Button>
                        </DragHandle>
                        <FloatingBlockActions.Button
                            ref={optionsButtonRef}
                            onClick={() => onOptionsClick(blockId)}
                            title="More options"
                        >
                            <MoreVertical size={16} />
                        </FloatingBlockActions.Button>
                    </>
                )}
            </FloatingBlockActions>

            {/* Block Options Menu */}
            {currentBlockId && (
                <YooptaBlockOptions
                    open={blockOptionsOpen}
                    onOpenChange={setBlockOptionsOpen}
                    blockId={currentBlockId}
                    anchor={optionsButtonRef.current}
                />
            )}
        </>
    );
};

// ===== BLOCK OPTIONS MENU =====

const YooptaBlockOptions = ({ 
    open, 
    onOpenChange, 
    blockId, 
    anchor 
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    blockId: string; 
    anchor: HTMLElement | null;
}) => {
    const { duplicateBlock, deleteBlock } = useBlockActions();
    const [actionMenuOpen, setActionMenuOpen] = useState(false);
    const turnIntoRef = useRef<HTMLButtonElement>(null);

    const onActionMenuClose = (menuOpen: boolean) => {
        setActionMenuOpen(menuOpen);
        if (!menuOpen) {
            onOpenChange(false);
        }
    };

    return (
        <>
            <BlockOptions open={open} onOpenChange={onOpenChange} anchor={anchor}>
                <BlockOptions.Content side="right">
                    <BlockOptions.Group>
                        <BlockOptions.Item 
                            ref={turnIntoRef}
                            onSelect={() => setActionMenuOpen(true)}
                            keepOpen
                        >
                            <span className="flex items-center gap-2">
                                <ChevronDown size={14} />
                                Turn into
                            </span>
                        </BlockOptions.Item>
                    </BlockOptions.Group>
                    <BlockOptions.Separator />
                    <BlockOptions.Group>
                        <BlockOptions.Item onSelect={() => duplicateBlock(blockId)}>
                            <span className="flex items-center gap-2">
                                <Copy size={14} />
                                Duplicate
                            </span>
                        </BlockOptions.Item>
                        <BlockOptions.Item 
                            variant="destructive" 
                            onSelect={() => deleteBlock(blockId)}
                        >
                            <span className="flex items-center gap-2">
                                <Trash2 size={14} />
                                Delete
                            </span>
                        </BlockOptions.Item>
                    </BlockOptions.Group>
                </BlockOptions.Content>
            </BlockOptions>

            <ActionMenuList
                open={actionMenuOpen}
                onOpenChange={onActionMenuClose}
                anchor={turnIntoRef.current}
                view="small"
                placement="right-start"
            >
                <ActionMenuList.Content />
            </ActionMenuList>
        </>
    );
};

// ===== MAIN COMPONENT =====

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
    // Track if component is mounted (for SSR safety)
    const [isMounted, setIsMounted] = useState(false);
    
    // Editor instance state - created only on client side
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [editor, setEditor] = useState<any>(null);

    // Selection box ref
    const selectionRef = useRef<HTMLDivElement>(null);

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
    const initialValueRef = useRef(value);

    // Initialize editor on mount (client-side only)
    useEffect(() => {
        console.log('[YooptaRichEditor] Initializing editor...');
        setIsMounted(true);

        // Get plugins (client-side only)
        const plugins = getEditorPlugins();
        console.log('[YooptaRichEditor] Got plugins:', plugins.length);
        
        // Filter out any undefined plugins
        const validPlugins = plugins.filter((p): p is NonNullable<typeof p> => !!p);
        console.log('[YooptaRichEditor] Valid plugins:', validPlugins.length);

        try {
            console.log('[YooptaRichEditor] Creating editor instance...');
            // Create editor instance
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const editorInstance = createYooptaEditor({
                plugins: validPlugins as any,
                marks,
                readOnly,
            });
            console.log('[YooptaRichEditor] Editor instance created:', editorInstance);
            
            // Set initial value - use provided value or create an empty paragraph
            if (initialValueRef.current && Object.keys(initialValueRef.current).length > 0) {
                console.log('[YooptaRichEditor] Setting initial value from props');
                editorInstance.setEditorValue(initialValueRef.current);
                setStats(getContentStats(initialValueRef.current));
                lastSavedValueRef.current = JSON.stringify(initialValueRef.current);
            } else {
                console.log('[YooptaRichEditor] Creating default empty paragraph');
                // Create a default empty paragraph block (v6 format)
                const blockId = generateId();
                const elementId = generateId();
                const defaultValue: YooptaContentValue = {
                    [blockId]: {
                        id: blockId,
                        type: 'Paragraph',
                        value: [
                            {
                                id: elementId,
                                type: 'paragraph',
                                children: [{ text: '' }],
                                props: {
                                    nodeType: 'block',
                                },
                            },
                        ],
                        meta: {
                            align: 'left',
                            depth: 0,
                            order: 0,
                        },
                    },
                };
                editorInstance.setEditorValue(defaultValue);
            }
            
            console.log('[YooptaRichEditor] Applying transforms...');
            // Apply transforms to validate block paths (v6 requirement)
            editorInstance.applyTransforms([{ type: 'validate_block_paths' }]);

            console.log('[YooptaRichEditor] Setting editor state - COMPLETE');
            setEditor(editorInstance);
        } catch (error) {
            console.error('[YooptaRichEditor] Failed to create editor:', error);
            console.error('[YooptaRichEditor] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
        }

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [readOnly]);

    // Render block with sortable wrapper for drag & drop
    const renderBlock = useCallback(({ children, blockId }: { children: React.ReactNode; blockId: string }) => {
        return (
            <SortableBlock id={blockId} useDragHandle>
                {children}
            </SortableBlock>
        );
    }, []);

    // Handle content changes
    const handleChange = useCallback((newValue: YooptaContentValue) => {
        // Update stats
        const newStats = getContentStats(newValue);
        setStats(newStats);

        // Call onChange callback
        onChange?.(newValue);

        // Handle auto-save with debounce
        if (onAutoSave) {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }

            autoSaveTimerRef.current = setTimeout(() => {
                const valueString = JSON.stringify(newValue);
                if (valueString !== lastSavedValueRef.current) {
                    lastSavedValueRef.current = valueString;
                    onAutoSave(newValue, newStats);
                }
            }, autoSaveDelay);
        }
    }, [onChange, onAutoSave, autoSaveDelay]);

    // Don't render on server or while editor is loading
    if (!isMounted || !editor) {
        return (
            <div className={cn('yoopta-editor-wrapper', className)}>
                <div
                    className={cn(
                        'yoopta-editor-container',
                        'border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]',
                        'flex items-center justify-center'
                    )}
                    style={{ minHeight: height }}
                >
                    <div className="text-[var(--fg-muted)]">Loading editor...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('yoopta-editor-wrapper', className)}>
            {/* Stats Bar */}
            {showStats && (
                <div className="flex items-center justify-between gap-4 px-4 py-2.5 mb-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface)] text-sm text-[var(--fg-muted)]">
                    <div className="flex items-center gap-3">
                        <span>{stats.wordCount} words</span>
                        <span className="opacity-40">·</span>
                        <span>{stats.readingTime} min read</span>
                        {stats.blockCount > 1 && (
                            <>
                                <span className="opacity-40">·</span>
                                <span>{stats.blockCount} blocks</span>
                            </>
                        )}
                    </div>
                    <div className="text-xs opacity-75">
                        <kbd className="px-1.5 py-0.5 bg-[var(--bg)] rounded-md border border-[var(--border-color)] text-[10px] font-mono">/</kbd> commands
                    </div>
                </div>
            )}

            {/* Editor Container - Premium styling */}
            <div
                ref={selectionRef}
                className={cn(
                    'yoopta-editor-container',
                    'border border-[var(--border-color)] rounded-xl bg-[var(--card-bg)]',
                    'focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)]/20',
                    'transition-all duration-200'
                )}
                style={{ minHeight: height }}
            >
                <div className="yoopta-editor-inner p-4" style={{ minHeight: `calc(${height} - 2rem)` }}>
                    <BlockDndContext editor={editor}>
                        <YooptaEditor
                            editor={editor}
                            onChange={handleChange}
                            placeholder={placeholder}
                            autoFocus
                            renderBlock={renderBlock}
                            style={{
                                width: '100%',
                                minHeight: '400px',
                            }}
                        >
                            {/* Slash Command Menu - type / to open */}
                            <YooptaSlashCommand />
                            
                            {/* Floating Toolbar - appears on text selection */}
                            <YooptaToolbar />
                            
                            {/* Block Actions - appears on block hover */}
                            <YooptaBlockActions />
                            
                            {/* Selection Box - for multi-block selection */}
                            <SelectionBox selectionBoxElement={selectionRef} />
                        </YooptaEditor>
                    </BlockDndContext>
                </div>
            </div>

            {/* Keyboard Shortcuts Help */}
            {!readOnly && (
                <div className="mt-3 px-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface)]">
                    <p className="text-xs font-medium text-[var(--fg)] mb-1.5">Shortcuts:</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--fg-muted)]">
                        <span><kbd className="px-1.5 py-0.5 bg-[var(--bg)] rounded-md border border-[var(--border-color)] text-[10px] font-mono">/</kbd> menu</span>
                        <span><kbd className="px-1.5 py-0.5 bg-[var(--bg)] rounded-md border border-[var(--border-color)] text-[10px] font-mono">Ctrl+B</kbd> bold</span>
                        <span><kbd className="px-1.5 py-0.5 bg-[var(--bg)] rounded-md border border-[var(--border-color)] text-[10px] font-mono">Ctrl+I</kbd> italic</span>
                        <span><kbd className="px-1.5 py-0.5 bg-[var(--bg)] rounded-md border border-[var(--border-color)] text-[10px] font-mono">Ctrl+U</kbd> underline</span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ===== EXPORT =====

export default YooptaRichEditor;
