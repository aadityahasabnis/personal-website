"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  frontmatterPlugin,
  directivesPlugin,
  AdmonitionDirectiveDescriptor,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  StrikeThroughSupSubToggles,
  CodeToggle,
  ListsToggle,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  InsertCodeBlock,
  InsertFrontmatter,
  InsertAdmonition,
  DiffSourceToggleWrapper,
  Separator,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { cn } from "@/lib/utils";

export interface MDXEditorHandle {
  getMarkdown: () => string;
  setMarkdown: (content: string) => void;
  focus: () => void;
}

interface MDXEditorProps {
  value: string;
  onChange: (markdown: string) => void;
  height?: string;
  className?: string;
  placeholder?: string;
}

/**
 * MDXEditor Component - Professional Implementation
 * A comprehensive WYSIWYG MDX editor with all professional features
 *
 * Features:
 * - Headings (H1-H6), Blockquotes, Thematic Breaks
 * - Text Formatting: Bold, Italic, Underline, Strikethrough, Superscript, Subscript
 * - Lists: Ordered, Unordered, Nested
 * - Links & Images with autocomplete
 * - Tables (full-width, responsive)
 * - Code blocks with syntax highlighting (10+ languages)
 * - Admonitions (Note, Tip, Warning, Danger, Info)
 * - Front-matter support
 * - Source/WYSIWYG toggle
 * - Markdown shortcuts
 */
export const MDXEditorComponent = forwardRef<MDXEditorHandle, MDXEditorProps>(
  (
    {
      value,
      onChange,
      height = "600px",
      className,
      placeholder = "Start writing...",
    },
    ref,
  ) => {
    const editorRef = useRef<MDXEditorMethods>(null);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      getMarkdown: () => {
        return editorRef.current?.getMarkdown() || "";
      },
      setMarkdown: (content: string) => {
        editorRef.current?.setMarkdown(content);
      },
      focus: () => {
        editorRef.current?.focus();
      },
    }));

    return (
      <div
        className={cn("mdx-editor-wrapper", className)}
        style={{ height, colorScheme: "light" }}
        data-theme="light"
      >
        <MDXEditor
          ref={editorRef}
          markdown={value}
          onChange={onChange}
          placeholder={placeholder}
          contentEditableClassName="prose prose-slate max-w-none"
          plugins={[
            // Basic formatting plugins
            headingsPlugin(),
            listsPlugin(),
            quotePlugin(),
            thematicBreakPlugin(),

            // Link plugin with autocomplete
            linkPlugin(),
            linkDialogPlugin({
              linkAutocompleteSuggestions: [
                "https://github.com",
                "https://www.npmjs.com",
                "https://developer.mozilla.org",
              ],
            }),

            // Image plugin with upload handler
            imagePlugin({
              imageUploadHandler: async (file) => {
                // TODO: Implement your cloud upload (Cloudinary/S3)
                // For now, create a data URL for preview
                return new Promise((resolve) => {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    resolve(e.target?.result as string);
                  };
                  reader.readAsDataURL(file);
                });
              },
              imageAutocompleteSuggestions: [
                "https://picsum.photos/800/600",
                "https://via.placeholder.com/800x600",
              ],
            }),

            // Table plugin (full-width by default)
            tablePlugin(),

            // Code blocks with CodeMirror
            codeBlockPlugin({ defaultCodeBlockLanguage: "javascript" }),
            codeMirrorPlugin({
              codeBlockLanguages: {
                javascript: "JavaScript",
                js: "JavaScript",
                jsx: "JSX",
                typescript: "TypeScript",
                ts: "TypeScript",
                tsx: "TypeScript JSX",
                css: "CSS",
                html: "HTML",
                json: "JSON",
                python: "Python",
                bash: "Bash",
                shell: "Shell",
                sql: "SQL",
                markdown: "Markdown",
                md: "Markdown",
                yaml: "YAML",
                xml: "XML",
                txt: "Plain Text",
                c: "C",
                cpp: "C++",
                java: "Java",
                rust: "Rust",
                go: "Go",
              },
            }),

            // Source/WYSIWYG toggle
            diffSourcePlugin({
              viewMode: "rich-text",
              diffMarkdown: value,
            }),

            // Front-matter support (for MDX metadata)
            frontmatterPlugin(),

            // Directives plugin with Admonitions
            directivesPlugin({
              directiveDescriptors: [AdmonitionDirectiveDescriptor],
            }),

            // Markdown shortcuts
            markdownShortcutPlugin(),

            // Toolbar with all professional features
            toolbarPlugin({
              toolbarContents: () => (
                <>
                  <DiffSourceToggleWrapper>
                    <UndoRedo />
                    <Separator />
                    <BoldItalicUnderlineToggles />
                    <StrikeThroughSupSubToggles />
                    <CodeToggle />
                    <Separator />
                    <BlockTypeSelect />
                    <Separator />
                    <CreateLink />
                    <InsertImage />
                    <Separator />
                    <InsertTable />
                    <InsertThematicBreak />
                    <Separator />
                    <ListsToggle />
                    <Separator />
                    <ConditionalContents
                      options={[
                        {
                          when: (editor) => editor?.editorType === "codeblock",
                          contents: () => <ChangeCodeMirrorLanguage />,
                        },
                        {
                          fallback: () => (
                            <>
                              <InsertCodeBlock />
                              <InsertAdmonition />
                              <InsertFrontmatter />
                            </>
                          ),
                        },
                      ]}
                    />
                  </DiffSourceToggleWrapper>
                </>
              ),
            }),
          ]}
        />
      </div>
    );
  },
);

MDXEditorComponent.displayName = "MDXEditorComponent";
