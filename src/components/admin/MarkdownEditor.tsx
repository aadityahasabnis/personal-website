'use client';

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import Editor, { type Monaco, type OnMount } from '@monaco-editor/react';
import type * as monacoEditor from 'monaco-editor';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    height?: string;
    className?: string;
    placeholder?: string;
}

export interface MarkdownEditorHandle {
    insertText: (text: string) => void;
    focus: () => void;
    getValue: () => string;
    undo: () => void;
    redo: () => void;
}

export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(({
    value,
    onChange,
    height = '500px',
    className,
    placeholder = '# Start writing your article...\n\nUse **Markdown** syntax for formatting.',
}, ref) => {
    const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<Monaco | null>(null);
    const { theme, systemTheme } = useTheme();
    
    const currentTheme = theme === 'system' ? systemTheme : theme;
    const editorTheme = currentTheme === 'dark' ? 'vs-dark' : 'light';

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
        insertText: (text: string) => {
            const editor = editorRef.current;
            const monaco = monacoRef.current;
            
            if (!editor || !monaco) return;

            const selection = editor.getSelection();
            const position = selection ? selection.getPosition() : editor.getPosition();
            
            if (position) {
                editor.executeEdits('insert-image', [
                    {
                        range: new monaco.Range(
                            position.lineNumber,
                            position.column,
                            position.lineNumber,
                            position.column
                        ),
                        text,
                    },
                ]);
                
                // Move cursor to end of inserted text
                const lines = text.split('\n');
                const lastLine = lines[lines.length - 1];
                const newPosition = new monaco.Position(
                    position.lineNumber + lines.length - 1,
                    lines.length === 1 ? position.column + text.length : lastLine.length + 1
                );
                editor.setPosition(newPosition);
                editor.focus();
                editor.revealPositionInCenter(newPosition);
            }
        },
        focus: () => {
            editorRef.current?.focus();
        },
        getValue: () => {
            return editorRef.current?.getValue() || '';
        },
        undo: () => {
            editorRef.current?.trigger('keyboard', 'undo', {});
        },
        redo: () => {
            editorRef.current?.trigger('keyboard', 'redo', {});
        },
    }));

    const handleEditorMount: OnMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        // Configure Monaco for Markdown with better completions
        monaco.languages.registerCompletionItemProvider('markdown', {
            provideCompletionItems: (model, position) => {
                const suggestions = [
                    {
                        label: 'h1',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '# ${1:Heading}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Insert H1 heading',
                        detail: 'Heading 1',
                    },
                    {
                        label: 'h2',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '## ${1:Heading}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Insert H2 heading',
                        detail: 'Heading 2',
                    },
                    {
                        label: 'h3',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '### ${1:Heading}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Insert H3 heading',
                        detail: 'Heading 3',
                    },
                    {
                        label: 'bold',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '**${1:text}**',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Bold text',
                        detail: '**bold**',
                    },
                    {
                        label: 'italic',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '*${1:text}*',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Italic text',
                        detail: '*italic*',
                    },
                    {
                        label: 'code',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '`${1:code}`',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Inline code',
                        detail: '`code`',
                    },
                    {
                        label: 'codeblock',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '```${1:language}\n${2:code}\n```',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Code block with syntax highlighting',
                        detail: '```code```',
                    },
                    {
                        label: 'link',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '[${1:text}](${2:url})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Insert link',
                        detail: '[text](url)',
                    },
                    {
                        label: 'image',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '![${1:alt text}](${2:url})',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Insert image',
                        detail: '![alt](url)',
                    },
                    {
                        label: 'table',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '| ${1:Header 1} | ${2:Header 2} |\n| ----------- | ----------- |\n| ${3:Cell 1} | ${4:Cell 2} |',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Insert table',
                        detail: 'Markdown table',
                    },
                    {
                        label: 'quote',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '> ${1:quote}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Insert blockquote',
                        detail: '> quote',
                    },
                    {
                        label: 'ul',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '- ${1:item}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Unordered list',
                        detail: '- item',
                    },
                    {
                        label: 'ol',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '1. ${1:item}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Ordered list',
                        detail: '1. item',
                    },
                    {
                        label: 'checkbox',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '- [ ] ${1:task}',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Task list item',
                        detail: '- [ ] task',
                    },
                    {
                        label: 'hr',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '---',
                        documentation: 'Horizontal rule',
                        detail: '---',
                    },
                ];

                return { suggestions };
            },
        });

        // Enhanced keyboard shortcuts
        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB,
            () => {
                const selection = editor.getSelection();
                const model = editor.getModel();
                if (selection && model) {
                    const text = model.getValueInRange(selection);
                    editor.executeEdits('bold', [
                        {
                            range: selection,
                            text: `**${text || 'text'}**`,
                        },
                    ]);
                }
            }
        );

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI,
            () => {
                const selection = editor.getSelection();
                const model = editor.getModel();
                if (selection && model) {
                    const text = model.getValueInRange(selection);
                    editor.executeEdits('italic', [
                        {
                            range: selection,
                            text: `*${text || 'text'}*`,
                        },
                    ]);
                }
            }
        );

        editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
            () => {
                const selection = editor.getSelection();
                const model = editor.getModel();
                if (selection && model) {
                    const text = model.getValueInRange(selection);
                    editor.executeEdits('link', [
                        {
                            range: selection,
                            text: `[${text || 'text'}](url)`,
                        },
                    ]);
                }
            }
        );

        // Focus editor on mount
        editor.focus();
    };

    const handleChange = (value: string | undefined) => {
        onChange(value || '');
    };

    return (
        <div className={cn('rounded-lg border overflow-hidden bg-background', className)}>
            <Editor
                height={height}
                defaultLanguage="markdown"
                value={value}
                onChange={handleChange}
                onMount={handleEditorMount}
                theme={editorTheme}
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    wordWrap: 'on',
                    wrappingIndent: 'same',
                    padding: { top: 16, bottom: 16 },
                    scrollBeyondLastLine: false,
                    quickSuggestions: true,
                    suggest: {
                        showWords: true,
                        showSnippets: true,
                    },
                    tabSize: 2,
                    insertSpaces: true,
                    formatOnPaste: true,
                    formatOnType: true,
                    automaticLayout: true,
                    smoothScrolling: true,
                    cursorBlinking: 'smooth',
                    cursorSmoothCaretAnimation: 'on',
                    renderLineHighlight: 'all',
                    bracketPairColorization: {
                        enabled: true,
                    },
                }}
                loading={
                    <div className="flex items-center justify-center h-full bg-background">
                        <div className="text-center space-y-2">
                            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                            <p className="text-sm text-muted-foreground">Loading editor...</p>
                        </div>
                    </div>
                }
            />
        </div>
    );
});

MarkdownEditor.displayName = 'MarkdownEditor';
