"use client";

import type { ForwardedRef } from "react";
import {
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
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CodeToggle,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertThematicBreak,
  InsertCodeBlock,
  InsertFrontmatter,
  InsertAdmonition,
  ListsToggle,
  DiffSourceToggleWrapper,
  Separator,
  ConditionalContents,
  ChangeCodeMirrorLanguage,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

/**
 * Comprehensive MDXEditor with all plugins enabled
 * This component is initialized with all available MDXEditor features
 */
export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  return (
    <MDXEditor
      plugins={[
        // Basic formatting plugins
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),

        // Link plugins
        linkPlugin(),
        linkDialogPlugin({
          linkAutocompleteSuggestions: [
            "https://mdxeditor.dev",
            "https://virtuoso.dev",
            "https://github.com",
          ],
        }),

        // Image plugin with upload handler
        imagePlugin({
          imageUploadHandler: async (file: File) => {
            // In production, upload to your server/CDN
            // For demo, we'll use a data URL
            return new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve(e.target?.result as string);
              };
              reader.readAsDataURL(file);
            });
          },
          imageAutocompleteSuggestions: [
            "https://picsum.photos/200/300",
            "https://picsum.photos/400/300",
          ],
        }),

        // Table plugin
        tablePlugin(),

        // Code block plugins
        codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            javascript: "JavaScript",
            jsx: "JSX",
            typescript: "TypeScript",
            tsx: "TypeScript JSX",
            css: "CSS",
            html: "HTML",
            json: "JSON",
            python: "Python",
            bash: "Bash",
            sql: "SQL",
            markdown: "Markdown",
            yaml: "YAML",
            txt: "Plain Text",
          },
        }),

        // Diff/source mode plugin
        diffSourcePlugin({
          viewMode: "rich-text",
          diffMarkdown: "",
        }),

        // Front-matter plugin
        frontmatterPlugin(),

        // Directives plugin with admonitions
        directivesPlugin({
          directiveDescriptors: [AdmonitionDirectiveDescriptor],
        }),

        // Markdown shortcuts
        markdownShortcutPlugin(),

        // Toolbar plugin with all components
        toolbarPlugin({
          toolbarContents: () => (
            <DiffSourceToggleWrapper>
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
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
          ),
        }),
      ]}
      placeholder={props.placeholder || "Start typing..."}
      {...props}
      ref={editorRef}
    />
  );
}
