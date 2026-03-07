'use client';

/**
 * RichTextRenderer — Authorly Renderer wrapper
 *
 * SEO-safe two-phase rendering:
 *
 * Phase 1 (server + client before hydration):
 *   Raw HTML is injected via dangerouslySetInnerHTML so crawlers and the
 *   initial paint receive full article content immediately — no loading flash,
 *   no empty body in the HTML source.
 *
 * Phase 2 (client, after mount):
 *   AuthorlyRenderer takes over to add interactivity: code-copy buttons,
 *   live dark-mode switching, checklist styles, heading anchor IDs, etc.
 *   The visual output is identical, so there is no layout shift on swap.
 */

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

// Load AuthorlyRenderer only on the client — it relies on window/document APIs.
// No loading fallback needed here: the static HTML below is shown instead.
const AuthorlyRenderer = dynamic(
  () => import('authorly-editor').then((mod) => mod.AuthorlyRenderer),
  { ssr: false }
);

export interface RichTextRendererProps {
  html: string;
  className?: string;
}

export function RichTextRenderer({ html, className }: RichTextRendererProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Track whether we are on the client and the component has mounted.
  // Until then, render the raw HTML so the server-generated markup is
  // preserved for SEO crawlers and for the initial paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    // Server render + pre-hydration client render:
    // Output the exact same HTML the server produced so React hydration
    // finds a matching DOM and does not throw a mismatch warning.
    return (
      <div
        className={className}
        // suppressHydrationWarning is safe here because AuthorlyRenderer will
        // produce the same visual output after mount — only interactive
        // enhancements differ.
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // Client render after mount: full AuthorlyRenderer with interactivity.
  return (
    <AuthorlyRenderer
      html={html}
      darkMode={isDark}
      enableCodeCopy
      enableHeadingIds
      enableChecklistStyles
      className={className}
    />
  );
}
