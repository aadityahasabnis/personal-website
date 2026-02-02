/**
 * Yoopta Editor Utilities
 * 
 * Utilities for processing Yoopta content:
 * - Word count & reading time calculation
 * - Plain text extraction
 * - Heading extraction for TOC
 * - Content validation
 */

import type { YooptaContentValue } from '@yoopta/editor';
import type { ContentStats, ExtractedHeading } from '@/types/yoopta';

// ===== TEXT EXTRACTION =====

/**
 * Extract plain text from a Yoopta element recursively
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTextFromElement(element: any): string {
    // If it's a text node
    if (element && typeof element === 'object' && 'text' in element) {
        return element.text || '';
    }
    
    // If it has children, recursively extract
    if (element && 'children' in element && Array.isArray(element.children)) {
        return element.children
            .map((child: unknown) => extractTextFromElement(child))
            .join('');
    }
    
    return '';
}

/**
 * Extract all plain text from Yoopta content
 */
export function extractPlainText(content: YooptaContentValue): string {
    if (!content || typeof content !== 'object') {
        return '';
    }

    const texts: string[] = [];
    
    // Sort blocks by order
    const sortedBlocks = Object.values(content).sort(
        (a, b) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0)
    );

    for (const block of sortedBlocks) {
        if (!block.value || !Array.isArray(block.value)) continue;

        for (const element of block.value) {
            const text = extractTextFromElement(element);
            if (text.trim()) {
                texts.push(text.trim());
            }
        }
    }

    return texts.join('\n\n');
}

// ===== CONTENT STATISTICS =====

/**
 * Calculate word count from plain text
 */
export function calculateWordCount(text: string): number {
    if (!text || typeof text !== 'string') return 0;
    
    return text
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0)
        .length;
}

/**
 * Calculate estimated reading time in minutes
 * Based on average reading speed of 200 words per minute
 */
export function calculateReadingTime(wordCount: number): number {
    const wordsPerMinute = 200;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Get complete content statistics
 */
export function getContentStats(content: YooptaContentValue): ContentStats {
    const plainText = extractPlainText(content);
    const wordCount = calculateWordCount(plainText);
    const blockCount = Object.keys(content || {}).length;
    
    // Count images
    let imageCount = 0;
    if (content) {
        for (const block of Object.values(content)) {
            if (block.type === 'Image') {
                imageCount++;
            }
            // Also check for images in carousel blocks
            if (block.type === 'Carousel' && block.value) {
                imageCount += block.value.length;
            }
        }
    }

    return {
        wordCount,
        characterCount: plainText.length,
        readingTime: calculateReadingTime(wordCount),
        blockCount,
        imageCount,
    };
}

// ===== HEADING EXTRACTION =====

/**
 * Extract headings from content for Table of Contents
 * Note: IDs are generated from text slugs to match YooptaRenderer's heading IDs
 */
export function extractHeadings(content: YooptaContentValue): ExtractedHeading[] {
    if (!content || typeof content !== 'object') {
        return [];
    }

    const headings: ExtractedHeading[] = [];
    const usedIds = new Set<string>();
    
    // Sort blocks by order
    const sortedBlocks = Object.values(content).sort(
        (a, b) => (a.meta?.order ?? 0) - (b.meta?.order ?? 0)
    );

    for (const block of sortedBlocks) {
        // Check for heading types
        let level: 1 | 2 | 3 | undefined;
        
        switch (block.type) {
            case 'HeadingOne':
                level = 1;
                break;
            case 'HeadingTwo':
                level = 2;
                break;
            case 'HeadingThree':
                level = 3;
                break;
            default:
                continue;
        }

        if (!block.value || !Array.isArray(block.value)) continue;

        // Extract text from heading
        const text = block.value
            .map(element => extractTextFromElement(element))
            .join('')
            .trim();

        if (text) {
            // Generate slug-based ID to match YooptaRenderer's heading IDs
            let id = generateHeadingSlug(text);
            
            // Handle duplicate headings by appending a number
            if (usedIds.has(id)) {
                let counter = 1;
                while (usedIds.has(`${id}-${counter}`)) {
                    counter++;
                }
                id = `${id}-${counter}`;
            }
            usedIds.add(id);
            
            headings.push({
                id,
                text,
                level,
            });
        }
    }

    return headings;
}

/**
 * Generate slug from heading text (for anchor links)
 */
export function generateHeadingSlug(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// ===== CONTENT VALIDATION =====

/**
 * Check if content is empty
 */
export function isContentEmpty(content: YooptaContentValue): boolean {
    if (!content || typeof content !== 'object') return true;
    
    const blocks = Object.values(content);
    if (blocks.length === 0) return true;
    
    // Check if all blocks have empty text
    const plainText = extractPlainText(content);
    return plainText.trim().length === 0;
}

/**
 * Validate content meets minimum requirements
 */
export function validateContent(content: YooptaContentValue): {
    valid: boolean;
    errors: string[];
} {
    const errors: string[] = [];
    
    if (isContentEmpty(content)) {
        errors.push('Content cannot be empty');
        return { valid: false, errors };
    }
    
    const stats = getContentStats(content);
    
    // Minimum word count for articles
    if (stats.wordCount < 50) {
        errors.push('Content must be at least 50 words');
    }
    
    return {
        valid: errors.length === 0,
        errors,
    };
}

// ===== CONTENT TRANSFORMATION =====

/**
 * Convert legacy markdown content to a simple Yoopta structure
 * This is a basic converter - for complex markdown, use a proper parser
 */
export function markdownToYooptaContent(markdown: string): YooptaContentValue {
    const content: YooptaContentValue = {};
    const paragraphs = markdown.split(/\n\n+/);
    
    paragraphs.forEach((para, index) => {
        const trimmed = para.trim();
        if (!trimmed) return;
        
        const blockId = `block-${Date.now()}-${index}`;
        
        // Detect headings
        if (trimmed.startsWith('### ')) {
            content[blockId] = {
                id: blockId,
                type: 'HeadingThree',
                value: [{
                    id: `elem-${blockId}`,
                    type: 'heading-three',
                    children: [{ text: trimmed.slice(4) }],
                }],
                meta: { order: index, depth: 0 },
            };
        } else if (trimmed.startsWith('## ')) {
            content[blockId] = {
                id: blockId,
                type: 'HeadingTwo',
                value: [{
                    id: `elem-${blockId}`,
                    type: 'heading-two',
                    children: [{ text: trimmed.slice(3) }],
                }],
                meta: { order: index, depth: 0 },
            };
        } else if (trimmed.startsWith('# ')) {
            content[blockId] = {
                id: blockId,
                type: 'HeadingOne',
                value: [{
                    id: `elem-${blockId}`,
                    type: 'heading-one',
                    children: [{ text: trimmed.slice(2) }],
                }],
                meta: { order: index, depth: 0 },
            };
        } else if (trimmed.startsWith('> ')) {
            content[blockId] = {
                id: blockId,
                type: 'Blockquote',
                value: [{
                    id: `elem-${blockId}`,
                    type: 'blockquote',
                    children: [{ text: trimmed.slice(2) }],
                }],
                meta: { order: index, depth: 0 },
            };
        } else if (trimmed.startsWith('---')) {
            content[blockId] = {
                id: blockId,
                type: 'Divider',
                value: [{
                    id: `elem-${blockId}`,
                    type: 'divider',
                    children: [{ text: '' }],
                }],
                meta: { order: index, depth: 0 },
            };
        } else {
            // Default to paragraph
            content[blockId] = {
                id: blockId,
                type: 'Paragraph',
                value: [{
                    id: `elem-${blockId}`,
                    type: 'paragraph',
                    children: [{ text: trimmed }],
                }],
                meta: { order: index, depth: 0 },
            };
        }
    });
    
    return content;
}

/**
 * Deep clone content to avoid mutations
 */
export function cloneContent(content: YooptaContentValue): YooptaContentValue {
    return JSON.parse(JSON.stringify(content));
}
