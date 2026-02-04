'use client';

import { useState, useCallback, useImperativeHandle, forwardRef, Suspense, useEffect, useRef } from 'react';
import { Editor, useEditor } from '@lobehub/editor/react';
import {
    ReactCodeblockPlugin,
    ReactImagePlugin,
    ReactLinkPlugin,
    ReactListPlugin,
    ReactTablePlugin,
    ReactHRPlugin,
    INSERT_HEADING_COMMAND,
    INSERT_TABLE_COMMAND,
    INSERT_LINK_COMMAND,
    INSERT_IMAGE_COMMAND,
} from '@lobehub/editor';
import { cn } from '@/lib/utils';
import {
    Heading1,
    Heading2,
    Heading3,
    Code,
    List,
    ListOrdered,
    Quote,
    Table as TableIcon,
    Link as LinkIcon,
    Image as ImageIcon,
    Minus,
    Loader2,
} from 'lucide-react';

export interface LobeEditorHandle {
    getMarkdown: () => string;
    getJSON: () => unknown;
    setMarkdown: (content: string) => void;
    focus: () => void;
    insertImage: (url: string, alt?: string) => void;
    insertText: (text: string) => void;
}

interface LobeEditorProps {
    value: string;
    onChange: (markdown: string, json?: unknown) => void;
    onHtmlChange?: (html: string) => void;
    height?: string;
    className?: string;
}

const EditorLoadingFallback = () => (
    <div className="flex items-center justify-center h-150 border rounded-lg bg-muted/30">
        <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Loading rich text editor...</p>
        </div>
    </div>
);

// Internal component that uses the editor - only rendered when mounted
const EditorInternal = forwardRef<LobeEditorHandle, LobeEditorProps>(
    (props, ref) => {
        const { onChange, onHtmlChange, height = '600px', className } = props;

        const editor = useEditor();
        const [wordCount, setWordCount] = useState(0);

        // Handle content changes
        const handleChange = useCallback((ed: unknown) => {
            const typedEditor = ed as typeof editor;
            if (!typedEditor) return;

            try {
                const markdown = typedEditor.getDocument('markdown') as unknown as string;
                const json = typedEditor.getDocument('json');

                // Update word count
                const words = markdown?.trim().split(/\s+/).filter(Boolean).length || 0;
                setWordCount(words);

                // Call parent's onChange
                onChange(markdown || '', json);

                // Optionally convert to HTML
                if (onHtmlChange) {
                    const html = typedEditor.getDocument('html') as unknown as string;
                    if (html) onHtmlChange(html);
                }
            } catch (error) {
                console.error('Error getting document:', error);
            }
        }, [onChange, onHtmlChange]);

        // Expose methods via ref
        useImperativeHandle(ref, () => ({
            getMarkdown: () => {
                try {
                    return (editor?.getDocument('markdown') as unknown as string) || '';
                } catch (error) {
                    console.error('Error getting markdown:', error);
                    return '';
                }
            },
            getJSON: () => {
                try {
                    return editor?.getDocument('json') || {};
                } catch (error) {
                    console.error('Error getting JSON:', error);
                    return {};
                }
            },
            setMarkdown: (content: string) => {
                try {
                    if (editor) {
                        editor.setDocument('markdown', content);
                    }
                } catch (error) {
                    console.error('Error setting markdown:', error);
                }
            },
            focus: () => {
                try {
                    editor?.focus();
                } catch (error) {
                    console.error('Error focusing editor:', error);
                }
            },
            insertImage: (url: string, alt?: string) => {
                try {
                    if (editor) {
                        editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
                            file: new File([], alt || 'image'),
                        });
                    }
                } catch (error) {
                    console.error('Error inserting image:', error);
                }
            },
            insertText: () => {
                // Not directly supported by lobe-editor
                console.warn('insertText not supported');
            },
        }), [editor]);

        // Slash command menu items
        const slashCommandItems = [
            {
                key: 'h1',
                label: 'Heading 1',
                description: 'Large section heading',
                icon: <Heading1 className="h-4 w-4" />,
                onSelect: (ed: unknown) => {
                    (ed as typeof editor)?.dispatchCommand(INSERT_HEADING_COMMAND, { tag: 'h1' });
                },
            },
            {
                key: 'h2',
                label: 'Heading 2',
                description: 'Medium section heading',
                icon: <Heading2 className="h-4 w-4" />,
                onSelect: (ed: unknown) => {
                    (ed as typeof editor)?.dispatchCommand(INSERT_HEADING_COMMAND, { tag: 'h2' });
                },
            },
            {
                key: 'h3',
                label: 'Heading 3',
                description: 'Small section heading',
                icon: <Heading3 className="h-4 w-4" />,
                onSelect: (ed: unknown) => {
                    (ed as typeof editor)?.dispatchCommand(INSERT_HEADING_COMMAND, { tag: 'h3' });
                },
            },
            {
                key: 'bullet_list',
                label: 'Bullet List',
                description: 'Unordered list',
                icon: <List className="h-4 w-4" />,
                onSelect: () => {
                    // List plugin handles this via keyboard shortcut
                },
            },
            {
                key: 'numbered_list',
                label: 'Numbered List',
                description: 'Ordered list',
                icon: <ListOrdered className="h-4 w-4" />,
                onSelect: () => {
                    // List plugin handles this
                },
            },
            {
                key: 'table',
                label: 'Table',
                description: 'Insert a table',
                icon: <TableIcon className="h-4 w-4" />,
                onSelect: (ed: unknown) => {
                    (ed as typeof editor)?.dispatchCommand(INSERT_TABLE_COMMAND, {
                        rows: '3',
                        columns: '3',
                    });
                },
            },
            {
                key: 'link',
                label: 'Link',
                description: 'Insert a hyperlink',
                icon: <LinkIcon className="h-4 w-4" />,
                onSelect: (ed: unknown) => {
                    const url = prompt('Enter URL:');
                    if (url) {
                        (ed as typeof editor)?.dispatchCommand(INSERT_LINK_COMMAND, {
                            url,
                        });
                    }
                },
            },
            {
                key: 'image',
                label: 'Image',
                description: 'Insert an image',
                icon: <ImageIcon className="h-4 w-4" />,
                onSelect: () => {
                    const url = prompt('Enter image URL:');
                    if (url) {
                        console.log('Image URL:', url);
                    }
                },
            },
            {
                key: 'code_block',
                label: 'Code Block',
                description: 'Insert a code block',
                icon: <Code className="h-4 w-4" />,
                onSelect: () => {
                    // Code block plugin handles this
                },
            },
            {
                key: 'blockquote',
                label: 'Quote',
                description: 'Insert a blockquote',
                icon: <Quote className="h-4 w-4" />,
                onSelect: () => {
                    // Quote plugin handles this
                },
            },
            {
                key: 'divider',
                label: 'Divider',
                description: 'Insert a horizontal line',
                icon: <Minus className="h-4 w-4" />,
                onSelect: () => {
                    // HR plugin handles this
                },
            },
        ];

        return (
            <div className={cn('flex flex-col gap-4', className)} suppressHydrationWarning>
                {/* Editor Toolbar Info */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div>
                        Type <kbd className="px-2 py-1 bg-muted rounded border border-border">/</kbd> for
                        commands
                    </div>
                    <div>{wordCount} words</div>
                </div>

                {/* Editor Container */}
                <div
                    className={cn(
                        'w-full rounded-lg border border-border bg-background prose prose-sm dark:prose-invert',
                        'overflow-hidden'
                    )}
                    style={{ height }}
                >
                    <Suspense fallback={<EditorLoadingFallback />}>
                        <Editor
                            editor={editor}
                            placeholder="Start typing..."
                            editable={true}
                            plugins={[
                                ReactListPlugin,
                                ReactLinkPlugin,
                                ReactImagePlugin,
                                ReactCodeblockPlugin,
                                ReactTablePlugin,
                                ReactHRPlugin,
                            ]}
                            slashOption={{
                                items: slashCommandItems,
                            }}
                            onChange={handleChange}
                            className="min-h-full"
                            style={{
                                height: '100%',
                            }}
                        />
                    </Suspense>
                </div>

                {/* Features List */}
                <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium">Supported Features:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                        <li>Headings, lists, tables, code blocks</li>
                        <li>Links and images with drag-drop support</li>
                        <li>Keyboard shortcuts for markdown formatting</li>
                        <li>Automatic syntax highlighting</li>
                    </ul>
                </div>
            </div>
        );
    });

EditorInternal.displayName = 'EditorInternal';

// Wrapper component that delays rendering until client-side mount
export const LobeEditor = forwardRef<LobeEditorHandle, LobeEditorProps>((props, ref) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Only render the editor after client-side mount
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <EditorLoadingFallback />;
    }

    return <EditorInternal ref={ref} {...props} />;
});

LobeEditor.displayName = 'LobeEditor';
