'use client';

/**
 * RichTextRenderer — Authorly Renderer wrapper
 *
 * Renders Authorly HTML content with proper styling.
 * Automatically detects and applies dark mode from next-themes.
 */

import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

const AuthorlyRenderer = dynamic(
  () => import('authorly-editor').then((mod) => mod.AuthorlyRenderer),
  { 
    ssr: false,
    loading: () => <div>Loading content...</div>
  },
);

export interface RichTextRendererProps {
  html: string;
  className?: string;
}

export function RichTextRenderer({ html, className }: RichTextRendererProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <div className={className}>
      <AuthorlyRenderer
        html={html}
        darkMode={isDark}
        enableCodeCopy
        enableHeadingIds
        enableChecklistStyles
      />
    </div>
  );
}
