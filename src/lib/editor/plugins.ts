/**
 * Yoopta Editor Plugins Configuration
 * 
 * This module configures all Yoopta plugins with proper options,
 * Cloudinary image upload integration, and theme styling.
 */

// Core plugins
import Paragraph from '@yoopta/paragraph';
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings';
import Blockquote from '@yoopta/blockquote';
import { BulletedList, NumberedList, TodoList } from '@yoopta/lists';
import Divider from '@yoopta/divider';
import Callout from '@yoopta/callout';

// Media plugins
import Image from '@yoopta/image';
import Video from '@yoopta/video';
import File from '@yoopta/file';
import Embed from '@yoopta/embed';

// Advanced plugins
import Table from '@yoopta/table';
import Code from '@yoopta/code';
import Accordion from '@yoopta/accordion';
import Link from '@yoopta/link';
import Tabs from '@yoopta/tabs';
import Steps from '@yoopta/steps';

// Marks (text formatting)
import { Bold, Italic, CodeMark, Underline, Strike, Highlight } from '@yoopta/marks';

// Types
import type { ImageUploadResponse } from '@yoopta/image';

// ===== UPLOAD HANDLERS =====

/**
 * Upload image to Cloudinary via our API
 */
export const uploadImage = async (file: File): Promise<ImageUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'portfolio/content');

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();

    return {
        src: data.data.url,
        alt: file.name.replace(/\.[^/.]+$/, ''), // Remove extension for alt
        sizes: {
            width: data.data.width,
            height: data.data.height,
        },
    };
};

/**
 * Upload video to Cloudinary via our API
 */
export const uploadVideo = async (file: File): Promise<{ src: string; sizes?: { width: number; height: number } }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'portfolio/videos');
    formData.append('resource_type', 'video');

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload video');
    }

    const data = await response.json();

    return {
        src: data.data.url,
        sizes: {
            width: data.data.width || 1280,
            height: data.data.height || 720,
        },
    };
};

/**
 * Upload file to Cloudinary via our API
 */
export const uploadFile = async (file: File): Promise<{ src: string; name: string; size: number }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'portfolio/files');
    formData.append('resource_type', 'raw');

    const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload file');
    }

    const data = await response.json();

    return {
        src: data.data.url,
        name: file.name,
        size: file.size,
    };
};

// ===== PLUGIN CONFIGURATIONS =====

/**
 * Base plugins without upload configurations
 * These are used for read-only rendering or when uploads are not needed
 */
export const getBasePlugins = () => [
    Paragraph,
    HeadingOne,
    HeadingTwo,
    HeadingThree,
    Blockquote,
    BulletedList,
    NumberedList,
    TodoList,
    Divider,
    Callout,
    Table,
    Code,
    Accordion,
    Link,
    Tabs,
    Steps,
    Embed,
];

/**
 * Full plugins with upload configurations
 * These are used in the editor with full functionality
 */
export const getEditorPlugins = () => [
    Paragraph,
    HeadingOne,
    HeadingTwo,
    HeadingThree,
    Blockquote,
    BulletedList,
    NumberedList,
    TodoList,
    Divider,
    Callout,
    
    // Image with Cloudinary upload
    Image.extend({
        options: {
            onUpload: uploadImage,
            maxSizes: {
                maxWidth: 1200,
                maxHeight: 800,
            },
        },
    }),
    
    // Video with upload support
    Video.extend({
        options: {
            onUpload: uploadVideo,
        },
    }),
    
    // File attachment
    File.extend({
        options: {
            onUpload: uploadFile,
        },
    }),
    
    Embed,
    
    // Table with default configuration
    Table,
    
    // Code with syntax highlighting
    Code,
    
    // Accordion for collapsible content
    Accordion,
    
    // Link block
    Link,
    
    // Tabs for tabbed content
    Tabs,
    
    // Steps for tutorials/guides
    Steps,
];

/**
 * Themed plugins - returns editor plugins
 * Note: themes-shadcn v6 is incompatible with plugins v4.9.9
 * Using base plugins until version alignment is resolved
 */
export const getThemedPlugins = () => {
    return getEditorPlugins();
};

// ===== TEXT FORMATTING MARKS =====

/**
 * All available text formatting marks
 */
export const marks = [
    Bold,
    Italic,
    CodeMark,
    Underline,
    Strike,
    Highlight,
];

// ===== SHORTCUTS REFERENCE =====

/**
 * Built-in keyboard shortcuts for reference
 */
export const keyboardShortcuts = {
    // Block types
    '/': 'Open slash command menu',
    '# ': 'Heading 1',
    '## ': 'Heading 2',
    '### ': 'Heading 3',
    '> ': 'Blockquote',
    '- ': 'Bulleted list',
    '1. ': 'Numbered list',
    '[] ': 'Todo list',
    '```': 'Code block',
    '---': 'Divider',
    'table': 'Insert table',
    'accordion': 'Insert accordion',
    
    // Text formatting
    'Ctrl/Cmd + B': 'Bold',
    'Ctrl/Cmd + I': 'Italic',
    'Ctrl/Cmd + U': 'Underline',
    'Ctrl/Cmd + K': 'Insert link',
    'Ctrl/Cmd + `': 'Inline code',
    
    // Navigation
    'Tab': 'Increase indent',
    'Shift + Tab': 'Decrease indent',
    'Ctrl/Cmd + A': 'Select all blocks',
    'Backspace': 'Delete selected blocks',
    'Ctrl/Cmd + Z': 'Undo',
    'Ctrl/Cmd + Shift + Z': 'Redo',
};

// ===== DEFAULT CONTENT =====

/**
 * Empty editor content
 */
export const emptyContent = {};

/**
 * Default placeholder content for new articles
 */
export const defaultPlaceholder = 'Start writing your content... Type / for commands';
