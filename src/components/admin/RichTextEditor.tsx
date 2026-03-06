'use client';

/**
 * RichTextEditor — Authorly Editor wrapper for admin forms
 *
 * A client-only component that wraps AuthorlyEditor with:
 * - Dynamic import for code splitting
 * - Automatic dark mode detection from next-themes
 * - Proper TypeScript types
 */

import dynamic from 'next/dynamic';
import type { EditorRef } from 'authorly-editor';
import { forwardRef } from 'react';
import { useTheme } from 'next-themes';

// Lazy-load the heavy editor bundle; ssr:false avoids window-not-defined errors
const AuthorlyEditor = dynamic(
  () => import('authorly-editor').then((mod) => mod.AuthorlyEditor),
  { ssr: false, loading: () => <EditorSkeleton /> },
);

function EditorSkeleton() {
  return (
    <div className="w-full animate-pulse rounded-lg border border-border bg-muted/30 min-h-[500px] flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Loading editor…</p>
    </div>
  );
}

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onSave?: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor = forwardRef<EditorRef, RichTextEditorProps>(
  function RichTextEditor(
    {
      value,
      onChange,
      onSave,
      placeholder = "Start writing… press '/' for commands",
      minHeight = '500px',
    },
    ref,
  ) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
      <div className="rounded-lg border border-border overflow-hidden bg-background">
        <AuthorlyEditor
          ref={ref}
          initialContent={value}
          onChange={onChange}
          onSave={onSave}
          darkMode={isDark}
          placeholder={placeholder}
          style={{ minHeight, padding: '1.25rem' }}
        />
      </div>
    );
  },
);
