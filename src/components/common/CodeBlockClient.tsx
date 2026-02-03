'use client';

import { useState } from 'react';

interface CodeBlockClientProps {
  language: string;
  code: string;
}

export function CodeBlockClient({ language, code }: CodeBlockClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-[var(--border-color)]">
      {/* Code header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[oklch(0.18_0.03_285)] border-b border-[var(--border-color)]">
        <span className="text-xs font-medium text-[var(--fg-muted)] uppercase tracking-wider">
          {language}
        </span>
        <button
          type="button"
          className="text-xs text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
          onClick={handleCopy}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      {/* Code content */}
      <pre className="p-4 bg-[oklch(0.12_0.02_285)] overflow-x-auto">
        <code
          data-language={language}
          className="text-sm font-mono text-[oklch(0.90_0.01_285)] leading-relaxed"
        >
          {code}
        </code>
      </pre>
    </div>
  );
}
