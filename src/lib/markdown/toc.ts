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

/**
 * Extract headings from Authorly editor HTML and assign IDs that exactly match
 * what AuthorlyRenderer generates client-side with enableHeadingIds.
 *
 * Authorly assigns IDs by slugifying the heading text content, with numeric
 * suffixes for duplicates (e.g. "getting-started", "getting-started-1").
 * This replicates that logic on the server so TOC links always point to the
 * correct DOM element.
 *
 * @param html - Raw HTML string from Authorly editor (run through stampHeadingIds first)
 * @param maxLevel - Maximum heading level to include in TOC (default: 4)
 * @returns Array of TOC items with slug-based IDs matching Authorly's output
 */
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

        // Pick up the id that stampHeadingIds already wrote (or a pre-existing one)
        const existingIdMatch = attrs.match(/id="([^"]*)"/i);
        if (!existingIdMatch) continue;   // shouldn't happen after stampHeadingIds
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

// ---------------------------------------------------------------------------
// Authorly heading-ID helpers — must match AuthorlyRenderer's enableHeadingIds
//
// Authorly source (minified as `wn` + `er` + `Nt`):
//
//   function wn(e) {
//     return e.toLowerCase().trim()
//       .replace(/[^\w\s-]/g, '')
//       .replace(/[\s_-]+/g, '-')
//       .replace(/^-+|-+$/g, '');
//   }
//   const Nt = new Map();           // dedup counter, cleared per renderer mount
//   function er(innerHtml) {
//     const slug = wn(textContent(innerHtml));
//     if (!slug) return 'heading';
//     const n = Nt.get(slug) || 0;
//     Nt.set(slug, n + 1);
//     return n === 0 ? slug : `${slug}-${n}`;
//   }
//
// We replicate this exactly so the IDs stamped server-side match what
// AuthorlyRenderer will stamp client-side — keeping TOC links in sync.
// ---------------------------------------------------------------------------

/** Strip HTML tags and return plain text (mirrors Authorly's `kn` helper). */
function innerText(html: string): string {
    return html.replace(/<[^>]+>/g, '');
}

/**
 * Slugify plain text exactly as Authorly does (mirrors `wn`).
 * e.g. "Getting Started!" → "getting-started"
 */
function authorlySlugify(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Stamp heading IDs directly into an HTML string using the same slug logic
 * as AuthorlyRenderer's `enableHeadingIds` option.
 *
 * IDs are text-based slugs (e.g. `id="getting-started"`) with numeric suffixes
 * for duplicates (e.g. `id="getting-started-1"`), not sequential `heading-N`.
 *
 * Because the IDs are present in the raw HTML string they survive
 * server-rendering so the TOC can find real DOM elements immediately.
 * AuthorlyRenderer checks `if (!el.id)` before writing its own IDs, so
 * pre-stamped IDs are preserved unchanged in the client phase as well.
 *
 * @param html - Raw HTML string (Authorly or markdown-rendered)
 * @returns HTML string with id attributes stamped onto headings
 */
export const stampHeadingIds = (html: string): string => {
    const counts = new Map<string, number>();

    return html.replace(
        /<h([1-6])([^>]*?)>([\s\S]*?)<\/h[1-6]>/gi,
        (_match, level, attrs, inner) => {
            // If the tag already has an id, leave it untouched (Authorly skips these too)
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
