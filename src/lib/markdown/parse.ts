import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

/**
 * Parse markdown to HTML with syntax highlighting
 *
 * Features:
 * - GitHub Flavored Markdown (tables, strikethrough, task lists)
 * - Syntax highlighting for code blocks
 * - Auto-generated heading IDs for TOC
 * - Autolinked headings
 */
export const parseMarkdown = async (markdown: string): Promise<string> => {
    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeSlug)
        .use(rehypeAutolinkHeadings, {
            behavior: 'wrap',
            properties: {
                className: ['anchor-link'],
            },
        })
        .use(rehypeHighlight, {
            ignoreMissing: true,
            detect: true,
        })
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(markdown);

    return String(result);
};

/**
 * Calculate reading time in minutes
 */
export const calculateReadingTime = (text: string): number => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

/**
 * Strip markdown to plain text (for excerpts)
 */
export const stripMarkdown = (markdown: string): string => {
    return markdown
        // Remove code blocks
        .replace(/```[\s\S]*?```/g, '')
        // Remove inline code
        .replace(/`[^`]+`/g, '')
        // Remove images
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
        // Remove links but keep text
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        // Remove headers
        .replace(/^#{1,6}\s+/gm, '')
        // Remove bold/italic
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        // Remove blockquotes
        .replace(/^>\s+/gm, '')
        // Remove horizontal rules
        .replace(/^[-*_]{3,}$/gm, '')
        // Remove HTML tags
        .replace(/<[^>]+>/g, '')
        // Collapse whitespace
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Generate excerpt from markdown
 */
export const generateExcerpt = (markdown: string, maxLength = 160): string => {
    const plainText = stripMarkdown(markdown);
    if (plainText.length <= maxLength) return plainText;
    return plainText.slice(0, maxLength).replace(/\s+\S*$/, '') + '...';
};
