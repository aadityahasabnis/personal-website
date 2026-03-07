'use client';
import { processHtml } from 'authorly-editor';
import { useTheme } from 'next-themes';

export interface RichTextRendererProps {
    html: string;
    className?: string;
}

const CLASS_PREFIX = 'cbr-content';

export const RichTextRenderer = ({ html, className }: RichTextRendererProps) => {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    const outerClass = [CLASS_PREFIX, isDark ? 'cbr-dark' : '', className]
        .filter(Boolean).join(' ');

    return (
        <div
            className={`authorly-content ${outerClass}`}
            dangerouslySetInnerHTML={{
                __html: processHtml(html, {
                    enableCodeCopy: true,
                    enableChecklistStyles: true,
                    enableHeadingIds: true,
                    // keep false until the new package version is published
                    enableSyntaxHighlighting: false,
                })
            }}
        />
    );
};
