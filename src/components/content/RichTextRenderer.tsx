'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export interface RichTextRendererProps {
    html: string;
    className?: string;
}

const CLASS_PREFIX = 'cbr-content';

export const RichTextRenderer = ({ html, className }: RichTextRendererProps) => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';
    const [processedHtml, setProcessedHtml] = useState(html);

    useEffect(() => {
        // Dynamic import to avoid SSR issues with authorly-editor
        import('authorly-editor').then(({ processHtml }) => {
            setProcessedHtml(processHtml(html, {
                enableCodeCopy: true,
                enableChecklistStyles: true,
                enableHeadingIds: true,
                enableSyntaxHighlighting: false,
            }));
        });
    }, [html]);

    const outerClass = [CLASS_PREFIX, isDark ? 'cbr-dark' : '', className]
        .filter(Boolean).join(' ');

    return (
        <div
            className={`authorly-content ${outerClass}`}
            dangerouslySetInnerHTML={{ __html: processedHtml }}
        />
    );
};
