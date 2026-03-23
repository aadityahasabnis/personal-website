export interface ITocItem {
    id: string;
    text: string;
    level: number;
}

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
                .replace(/`[^`]+`/g, '')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .replace(/\*\*([^*]+)\*\*/g, '$1')
                .replace(/\*([^*]+)\*/g, '$1')
                .trim();

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

export const extractHeadingsFromAuthorlyHtml = (
    html: string,
    maxLevel = 4
): ITocItem[] => {
    const allHeadingsRegex = /<h([1-6])([^>]*?)>([\s\S]*?)<\/h[1-6]>/gi;
    const result: ITocItem[] = [];
    let match;

    while ((match = allHeadingsRegex.exec(html)) !== null) {
        const level = parseInt(match[1], 10);
        const attrs = match[2];
        const innerHtml = match[3];

        const existingIdMatch = attrs.match(/id="([^"]*)"/i);
        if (!existingIdMatch) continue;
        const id = existingIdMatch[1];

        if (level <= maxLevel) {
            const text = innerText(innerHtml).trim();
            if (text) {
                result.push({ id, text, level });
            }
        }
    }

    return result;
};

function innerText(html: string): string {
    return html.replace(/<[^>]+>/g, '');
}

function authorlySlugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export const stampHeadingIds = (html: string): string => {
    const counts = new Map<string, number>();

    return html.replace(
        /<h([1-6])([^>]*?)>([\s\S]*?)<\/h[1-6]>/gi,
        (_match, level, attrs, inner) => {
            if (/\bid\s*=/i.test(attrs)) {
                return `<h${level}${attrs}>${inner}</h${level}>`;
            }

            const slug = authorlySlugify(innerText(inner)) || 'heading';
            const n = counts.get(slug) ?? 0;
            counts.set(slug, n + 1);
            const id = n === 0 ? slug : `${slug}-${n}`;

            return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
        }
    );
};
