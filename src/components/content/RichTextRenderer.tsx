/**
 * RichTextRenderer Component
 *
 * Renders pre-processed HTML content from Authorly Editor.
 *
 * The HTML is already processed server-side by processHtmlServer() which:
 * - Wraps code blocks in .cbr-code-wrapper with toolbar + copy button
 * - Adds .cbr-checked-item class to checked checklist items
 * - Adds target="_blank" rel="noopener noreferrer" to links
 *
 * Dark mode is handled purely via CSS using html.dark selector in globals.css,
 * eliminating the need for useTheme() and avoiding FOUC.
 */

export interface RichTextRendererProps {
    html: string;
    className?: string;
}

export const RichTextRenderer = ({ html, className }: RichTextRendererProps) => {
    const classes = ['authorly-content', 'cbr-content', className]
        .filter(Boolean)
        .join(' ');

    return (
        <div
            className={classes}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};
