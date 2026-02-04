"use client";

import dynamic from "next/dynamic";
import { forwardRef } from "react";
import { type MDXEditorMethods, type MDXEditorProps } from "@mdxeditor/editor";

// This is the only place InitializedMDXEditor is imported directly.
// We use dynamic import with SSR disabled to avoid server-side rendering issues
const Editor = dynamic(() => import("./InitializedMDXEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8 border rounded-lg bg-gray-50">
      <div className="text-gray-600">Loading editor...</div>
    </div>
  ),
});

/**
 * ForwardRef wrapper for MDXEditor that handles Next.js SSR compatibility
 * This component can be imported and used throughout the app
 *
 * The .light-theme wrapper forces MDXEditor to use light mode colors
 * regardless of the site's dark mode setting (prevents MDXEditor's internal
 * .dark/.dark-theme CSS selectors from activating)
 */
export const ForwardRefEditor = forwardRef<MDXEditorMethods, MDXEditorProps>(
  (props, ref) => (
    <div className="light-theme">
      <Editor {...props} editorRef={ref} />
    </div>
  ),
);

ForwardRefEditor.displayName = "ForwardRefEditor";
