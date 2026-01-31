export interface ITocItem {
    id: string;
    text: string;
    level: number;
}

/**
 * Extract headings from markdown for Table of Contents
 *
 * @param markdown - Raw markdown string
 * @param maxLevel - Maximum heading level to include (default: 3)
 * @returns Array of TOC items
 */
export const extractHeadings = (
    markdown: string,
    maxLevel = 3
): ITocItem[] => {
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings: ITocItem[] = [];
    let match;

    while ((match = headingRegex.exec(markdown)) !== null) {
        const level = match[1].length;
        if (level <= maxLevel) {
            const text = match[2]
                // Remove inline code
                .replace(/`[^`]+`/g, '')
                // Remove links but keep text
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                // Remove bold/italic
                .replace(/\*\*([^*]+)\*\*/g, '$1')
                .replace(/\*([^*]+)\*/g, '$1')
                .trim();

            // Generate slug from text
            const id = text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim();

            headings.push({ id, text, level });
        }
    }

    return headings;
};

/**
 * Extract headings from HTML (for pre-rendered content)
 *
 * @param html - HTML string
 * @param maxLevel - Maximum heading level to include
 * @returns Array of TOC items
 */
export const extractHeadingsFromHtml = (
    html: string,
    maxLevel = 3
): ITocItem[] => {
    const headingRegex = /<h([1-6])[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h[1-6]>/gi;
    const headings: ITocItem[] = [];
    let match;

    while ((match = headingRegex.exec(html)) !== null) {
        const level = parseInt(match[1], 10);
        if (level <= maxLevel) {
            headings.push({
                level,
                id: match[2],
                text: match[3].trim(),
            });
        }
    }

    return headings;
};
