/**
 * Yoopta Editor Types
 * Type definitions for Yoopta content structure and editor configuration
 */

import type { YooptaContentValue } from '@yoopta/editor';

// ===== YOOPTA CONTENT TYPES =====

/**
 * The content value stored in MongoDB for Yoopta blocks
 * This is the full editor state that gets saved and loaded
 */
export type YooptaContent = YooptaContentValue;

/**
 * Individual block structure as stored in Yoopta
 */
export interface YooptaBlock {
    id: string;
    type: string;
    value: YooptaElement[];
    meta: {
        order: number;
        depth: number;
        align?: 'left' | 'center' | 'right';
    };
}

/**
 * Element within a block (Slate element structure)
 */
export interface YooptaElement {
    id: string;
    type: string;
    children: YooptaNode[];
    props?: Record<string, unknown>;
}

/**
 * Text or element node
 */
export type YooptaNode = YooptaText | YooptaElement;

/**
 * Text node with marks
 */
export interface YooptaText {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    code?: boolean;
    highlight?: {
        color?: string;
        backgroundColor?: string;
    };
}

// ===== IMAGE UPLOAD TYPES =====

/**
 * Image upload result from Cloudinary
 */
export interface ImageUploadResult {
    id: string;
    src: string;
    alt?: string;
    sizes?: {
        width: number;
        height: number;
    };
}

/**
 * Upload progress callback type
 */
export interface ImageUploadProgress {
    loaded: number;
    total: number;
    percent: number;
}

/**
 * Video upload result
 */
export interface VideoUploadResult {
    id: string;
    src: string;
    poster?: string;
    sizes?: {
        width: number;
        height: number;
    };
}

/**
 * File upload result
 */
export interface FileUploadResult {
    id: string;
    src: string;
    name: string;
    size: number;
    format?: string;
}

// ===== EDITOR CONFIGURATION TYPES =====

/**
 * Editor mode for the hybrid editor
 */
export type EditorMode = 'yoopta' | 'markdown' | 'preview';

/**
 * Editor save handler type
 */
export interface EditorSaveData {
    content: YooptaContent;
    html: string;
    plainText: string;
    wordCount: number;
    readingTime: number;
}

// ===== CONTENT BLOCK TYPE IDENTIFIERS =====

/**
 * All supported Yoopta plugin types
 */
export type YooptaBlockType =
    | 'Paragraph'
    | 'HeadingOne'
    | 'HeadingTwo'
    | 'HeadingThree'
    | 'Blockquote'
    | 'BulletedList'
    | 'NumberedList'
    | 'TodoList'
    | 'Image'
    | 'Video'
    | 'File'
    | 'Embed'
    | 'Table'
    | 'Code'
    | 'Accordion'
    | 'Callout'
    | 'Divider'
    | 'Tabs'
    | 'Steps'
    | 'Carousel'
    | 'Link';

// ===== ELEMENT PROPS TYPES =====

/**
 * Image element props
 */
export interface ImageElementProps {
    src: string | null;
    alt: string | null;
    srcSet?: string | null;
    fit?: 'contain' | 'cover' | 'fill' | null;
    sizes?: {
        width: number;
        height: number;
    };
    bgColor?: string | null;
}

/**
 * Code element props
 */
export interface CodeElementProps {
    language: string;
    theme?: string;
}

/**
 * Table element props
 */
export interface TableElementProps {
    headerRow?: boolean;
    headerColumn?: boolean;
    columnWidths?: number[];
}

/**
 * Callout element props
 */
export interface CalloutElementProps {
    type: 'info' | 'warning' | 'error' | 'success' | 'default';
    icon?: string;
}

/**
 * Embed element props
 */
export interface EmbedElementProps {
    src: string;
    provider?: string;
    sizes?: {
        width: number;
        height: number;
    };
}

/**
 * Video element props
 */
export interface VideoElementProps {
    src: string | null;
    provider?: 'youtube' | 'vimeo' | 'custom';
    poster?: string;
    sizes?: {
        width: number;
        height: number;
    };
}

// ===== UTILITY TYPES =====

/**
 * Extract heading info from content for TOC generation
 */
export interface ExtractedHeading {
    id: string;
    text: string;
    level: 1 | 2 | 3;
}

/**
 * Content statistics
 */
export interface ContentStats {
    wordCount: number;
    characterCount: number;
    readingTime: number;
    blockCount: number;
    imageCount: number;
}
