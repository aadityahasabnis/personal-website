'use client';

import { useEditor, EditorContent, type Editor as TiptapEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Typography } from '@tiptap/extension-typography';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Undo,
    Redo,
    Link as LinkIcon,
    Image as ImageIcon,
    Table as TableIcon,
    CheckSquare,
    CodeSquare,
    Minus,
} from 'lucide-react';
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import TurndownService from 'turndown';

const lowlight = createLowlight(common);
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
});

interface RichTextEditorProps {
    content: string;
    onChange: (html: string, markdown: string) => void;
    onImageClick?: () => void;
    placeholder?: string;
    className?: string;
}

export interface RichTextEditorHandle {
    insertText: (text: string) => void;
    insertImage: (url: string, alt?: string) => void;
    focus: () => void;
    undo: () => void;
    redo: () => void;
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(({
    content,
    onChange,
    onImageClick,
    placeholder = 'Start writing your article...',
    className,
}, ref) => {
    const [showLinkDialog, setShowLinkDialog] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');

    const editor = useEditor({
        immediatelyRender: false, // Fix SSR hydration mismatch
        extensions: [
            StarterKit.configure({
                codeBlock: false, // We use CodeBlockLowlight instead
                history: {
                    depth: 100, // Store up to 100 undo/redo steps
                    newGroupDelay: 500, // Group changes within 500ms
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer hover:text-primary/80',
                },
            }),
            Image.configure({
                inline: true,
                HTMLAttributes: {
                    class: 'rounded-lg max-w-full h-auto my-4',
                },
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse table-auto w-full my-4',
                },
            }),
            TableRow.configure({
                HTMLAttributes: {
                    class: 'border-b',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'border px-4 py-2 text-left font-bold bg-muted',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border px-4 py-2',
                },
            }),
            TaskList.configure({
                HTMLAttributes: {
                    class: 'list-none pl-0',
                },
            }),
            TaskItem.configure({
                nested: true,
                HTMLAttributes: {
                    class: 'flex items-start gap-2 my-1',
                },
            }),
            Placeholder.configure({
                placeholder,
                showOnlyWhenEditable: true,
                emptyNodeClass: 'is-empty',
            }),
            Typography,
            CodeBlockLowlight.configure({
                lowlight,
                HTMLAttributes: {
                    class: 'bg-muted rounded-lg p-4 my-4 font-mono text-sm overflow-x-auto',
                },
            }),
        ],
        content,
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] px-6 py-4',
            },
        },
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            const markdown = turndownService.turndown(html);
            onChange(html, markdown);
        },
        onCreate: ({ editor }) => {
            // Sync initial content
            const html = editor.getHTML();
            const markdown = turndownService.turndown(html);
            onChange(html, markdown);
        },
    });

    // Sync content when prop changes (but don't trigger onChange)
    useEffect(() => {
        if (editor && content !== turndownService.turndown(editor.getHTML())) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        insertText: (text: string) => {
            editor?.commands.insertContent(text);
            editor?.commands.focus();
        },
        insertImage: (url: string, alt: string = 'Image') => {
            editor?.commands.insertContent(`<img src="${url}" alt="${alt}" />`);
            editor?.commands.focus();
        },
        focus: () => {
            editor?.commands.focus();
        },
        undo: () => {
            editor?.commands.undo();
        },
        redo: () => {
            editor?.commands.redo();
        },
    }));

    const addLink = () => {
        if (linkUrl) {
            editor?.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
            setShowLinkDialog(false);
        }
    };

    if (!editor) {
        return (
            <div className="flex items-center justify-center h-[400px] border rounded-lg bg-background">
                <div className="text-center space-y-2">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                    <p className="text-sm text-muted-foreground">Loading editor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn('rounded-lg border bg-background', className)}>
            {/* Toolbar */}
            <div className="border-b bg-muted/30 p-2 flex flex-wrap items-center gap-1">
                {/* Undo/Redo */}
                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().undo().run()}
                        disabled={!editor.can().undo()}
                        title="Undo (Ctrl+Z)"
                        icon={<Undo className="h-4 w-4" />}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().redo().run()}
                        disabled={!editor.can().redo()}
                        title="Redo (Ctrl+Y)"
                        icon={<Redo className="h-4 w-4" />}
                    />
                </div>

                {/* Text Formatting */}
                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        isActive={editor.isActive('bold')}
                        title="Bold (Ctrl+B)"
                        icon={<Bold className="h-4 w-4" />}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        isActive={editor.isActive('italic')}
                        title="Italic (Ctrl+I)"
                        icon={<Italic className="h-4 w-4" />}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                        isActive={editor.isActive('strike')}
                        title="Strikethrough"
                        icon={<Strikethrough className="h-4 w-4" />}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCode().run()}
                        isActive={editor.isActive('code')}
                        title="Inline Code"
                        icon={<Code className="h-4 w-4" />}
                    />
                </div>

                {/* Headings */}
                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        isActive={editor.isActive('heading', { level: 1 })}
                        title="Heading 1"
                        icon={<Heading1 className="h-4 w-4" />}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        isActive={editor.isActive('heading', { level: 2 })}
                        title="Heading 2"
                        icon={<Heading2 className="h-4 w-4" />}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        isActive={editor.isActive('heading', { level: 3 })}
                        title="Heading 3"
                        icon={<Heading3 className="h-4 w-4" />}
                    />
                </div>

                {/* Lists */}
                <div className="flex items-center gap-0.5 border-r pr-2 mr-1">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        isActive={editor.isActive('bulletList')}
                        title="Bullet List"
                        icon={<List className="h-4 w-4" />}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        isActive={editor.isActive('orderedList')}
                        title="Numbered List"
                        icon={<ListOrdered className="h-4 w-4" />}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleTaskList().run()}
                        isActive={editor.isActive('taskList')}
                        title="Task List"
                        icon={<CheckSquare className="h-4 w-4" />}
                    />
                </div>

                {/* Other */}
                <div className="flex items-center gap-0.5">
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        isActive={editor.isActive('blockquote')}
                        title="Quote"
                        icon={<Quote className="h-4 w-4" />}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        isActive={editor.isActive('codeBlock')}
                        title="Code Block"
                        icon={<CodeSquare className="h-4 w-4" />}
                    />
                    <ToolbarButton
                        onClick={() => setShowLinkDialog(!showLinkDialog)}
                        isActive={editor.isActive('link')}
                        title="Insert Link (Ctrl+K)"
                        icon={<LinkIcon className="h-4 w-4" />}
                    />
                    <ToolbarButton
                        onClick={onImageClick}
                        title="Insert Image"
                        icon={<ImageIcon className="h-4 w-4" />}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                        title="Insert Table"
                        icon={<TableIcon className="h-4 w-4" />}
                    />
                    <ToolbarButton
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                        title="Horizontal Line"
                        icon={<Minus className="h-4 w-4" />}
                    />
                </div>
            </div>

            {/* Link Dialog */}
            {showLinkDialog && (
                <div className="border-b bg-muted/50 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                        <input
                            type="url"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    addLink();
                                } else if (e.key === 'Escape') {
                                    setShowLinkDialog(false);
                                }
                            }}
                            placeholder="https://example.com"
                            className="flex-1 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            autoFocus
                        />
                        <button
                            onClick={addLink}
                            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                        >
                            Add Link
                        </button>
                        <button
                            onClick={() => setShowLinkDialog(false)}
                            className="px-3 py-1.5 text-sm border rounded-md hover:bg-muted"
                        >
                            Cancel
                        </button>
                    </div>
                    {editor.isActive('link') && (
                        <button
                            onClick={() => editor.chain().focus().unsetLink().run()}
                            className="text-sm text-destructive hover:underline"
                        >
                            Remove Link
                        </button>
                    )}
                </div>
            )}

            {/* Editor Content */}
            <div className="relative">
                <EditorContent editor={editor} />
            </div>

            {/* Status Bar */}
            <div className="border-t bg-muted/30 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                    <span>{editor.storage.characterCount?.characters() || 0} characters</span>
                    <span>{editor.storage.characterCount?.words() || 0} words</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-70">
                        Ctrl+Z: Undo • Ctrl+Y: Redo • Ctrl+B: Bold • Ctrl+I: Italic
                    </span>
                </div>
            </div>
        </div>
    );
});

RichTextEditor.displayName = 'RichTextEditor';

// Toolbar Button Component
const ToolbarButton = ({
    onClick,
    isActive,
    disabled,
    title,
    icon,
}: {
    onClick?: () => void;
    isActive?: boolean;
    disabled?: boolean;
    title: string;
    icon: React.ReactNode;
}) => (
    <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={cn(
            'p-2 rounded transition-colors',
            'hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed',
            isActive && 'bg-muted text-primary'
        )}
    >
        {icon}
    </button>
);
