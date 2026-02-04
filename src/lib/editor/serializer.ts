/**
 * Content Serializer Utilities
 * 
 * Handles conversion between lobe-editor JSON format and markdown/HTML
 * Also manages backward compatibility with existing markdown content
 */

/**
 * Serialize lobe-editor JSON to markdown
 * The lobe-editor already outputs markdown, but this utility
 * ensures proper formatting and handles edge cases
 */
export const serializeToMarkdown = (json: any, fallbackMarkdown?: string): string => {
    // If markdown is already available from editor, use it
    if (fallbackMarkdown) {
        return fallbackMarkdown;
    }

    // Otherwise, we'd need to convert from JSON AST
    // For now, we rely on the editor's built-in getDocument('markdown')
    return '';
};

/**
 * Serialize lobe-editor JSON to HTML
 * Can be used for server-side rendering and SEO
 */
export const serializeToHTML = (json: any, fallbackHtml?: string): string => {
    if (fallbackHtml) {
        return fallbackHtml;
    }
    return '';
};

/**
 * Convert existing markdown to lobe-editor compatible format
 * Used for migration from pure markdown to lobe-editor
 */
export const migrateMarkdownToLobeFormat = async (markdown: string): Promise<string> => {
    // For now, we can use the markdown directly as lobe-editor
    // can import markdown content
    return markdown;
};

/**
 * Extract plain text from content
 * Useful for summaries, excerpts, etc.
 */
export const extractPlainText = (markdown: string): string => {
    // Remove markdown syntax
    return markdown
        .replace(/#{1,6}\s+/g, '') // Remove headings
        .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1') // Remove bold/italic
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to text
        .replace(/`([^`]+)`/g, '$1') // Remove inline code
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/^>.*$/gm, '') // Remove blockquotes
        .replace(/^[-*+]\s+/gm, '') // Remove list markers
        .replace(/^\d+\.\s+/gm, '') // Remove numbered list markers
        .trim();
};

/**
 * Calculate reading time from content
 */
export const calculateReadingTime = (text: string): number => {
    const wordsPerMinute = 200;
    const plainText = extractPlainText(text);
    const words = plainText.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
};

/**
 * Extract headings from markdown/content for TOC
 */
export interface HeadingItem {
    id: string;
    text: string;
    level: number;
    children: HeadingItem[];
}

export const extractHeadingsFromContent = (markdown: string): HeadingItem[] => {
    const headings: HeadingItem[] = [];
    const lines = markdown.split('\n');
    const stack: HeadingItem[] = [];

    lines.forEach((line, index) => {
        const match = line.match(/^(#{1,6})\s+(.+)$/);
        if (match) {
            const level = match[1].length;
            const text = match[2].trim();
            const id = `heading-${index}`;

            const heading: HeadingItem = {
                id,
                text,
                level,
                children: [],
            };

            // Find the correct parent level
            while (stack.length > 0 && stack[stack.length - 1].level >= level) {
                stack.pop();
            }

            if (stack.length > 0) {
                stack[stack.length - 1].children.push(heading);
            } else {
                headings.push(heading);
            }

            stack.push(heading);
        }
    });

    return headings;
};

/**
 * Validate content length and structure
 */
export interface ContentValidation {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export const validateContent = (markdown: string): ContentValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!markdown || markdown.trim().length === 0) {
        errors.push('Content cannot be empty');
    }

    if (markdown.length > 1000000) {
        errors.push('Content exceeds maximum length (1MB)');
    }

    const plainText = extractPlainText(markdown);
    const wordCount = plainText.trim().split(/\s+/).length;

    if (wordCount < 10) {
        warnings.push('Content is very short (less than 10 words)');
    }

    if (wordCount > 50000) {
        warnings.push('Content is very long (over 50,000 words)');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
    };
};

/**
 * Generate excerpt from content
 */
export const generateExcerpt = (markdown: string, length: number = 150): string => {
    const plainText = extractPlainText(markdown);
    if (plainText.length <= length) {
        return plainText;
    }
    return plainText.substring(0, length).trim() + '...';
};

/**
 * Get supported features/formatting used in content
 */
export interface ContentFeatures {
    hasHeadings: boolean;
    hasList: boolean;
    hasTable: boolean;
    hasCode: boolean;
    hasLink: boolean;
    hasImage: boolean;
    hasBlockquote: boolean;
}

export const detectContentFeatures = (markdown: string): ContentFeatures => {
    return {
        hasHeadings: /^#{1,6}\s+/m.test(markdown),
        hasList: /^[-*+]\s+/m.test(markdown),
        hasTable: /\|.*\|/m.test(markdown),
        hasCode: /```[\s\S]*?```/.test(markdown),
        hasLink: /\[([^\]]+)\]\([^\)]+\)/m.test(markdown),
        hasImage: /!\[([^\]]*)\]\(([^\)]+)\)/m.test(markdown),
        hasBlockquote: /^>\s+/m.test(markdown),
    };
};
