/**
 * Yoopta Editor Library
 * 
 * Centralized exports for the Yoopta editor implementation.
 */

// Plugins and configuration
export { 
    getEditorPlugins, 
    marks,
    uploadImage,
    uploadVideo,
    uploadFile,
    keyboardShortcuts,
    defaultPlaceholder,
} from './plugins';

// Utilities
export {
    extractPlainText,
    calculateWordCount,
    calculateReadingTime,
    getContentStats,
    extractHeadings,
    generateHeadingSlug,
    isContentEmpty,
    validateContent,
    markdownToYooptaContent,
    cloneContent,
} from './utils';

// Re-export Yoopta types
export type { YooptaContentValue } from '@yoopta/editor';
