/**
 * Professional Yoopta Editor Plugin Configuration
 * 
 * This file contains ALL Yoopta v6 plugins properly configured with:
 * - Cloudinary uploads for Image/Video/File
 * - All text formatting marks
 * - Professional default options
 * 
 * @version 6.0.0-beta.16
 */

// ===== CORE IMPORTS =====
import Paragraph from '@yoopta/paragraph';
import { HeadingOne, HeadingTwo, HeadingThree } from '@yoopta/headings';
import Blockquote from '@yoopta/blockquote';
import { BulletedList, NumberedList, TodoList } from '@yoopta/lists';
import Divider from '@yoopta/divider';
import Callout from '@yoopta/callout';

// ===== MEDIA IMPORTS =====
import Image from '@yoopta/image';
import Video from '@yoopta/video';
import File from '@yoopta/file';
import Embed from '@yoopta/embed';

// ===== ADVANCED IMPORTS =====
import Table from '@yoopta/table';
import Code from '@yoopta/code';
import Accordion from '@yoopta/accordion';
import Link from '@yoopta/link';
import Tabs from '@yoopta/tabs';
import Steps from '@yoopta/steps';
import Carousel from '@yoopta/carousel';

// ===== MARKS IMPORTS =====
import { 
  Bold, 
  Italic, 
  CodeMark, 
  Underline, 
  Strike, 
  Highlight 
} from '@yoopta/marks';

// ===== TYPES =====
import type { ImageUploadResponse } from '@yoopta/image';

// ===== UPLOAD HANDLERS =====

/**
 * Upload image to Cloudinary via API
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
    id: data.data.publicId || `img-${Date.now()}`,
    src: data.data.url,
    alt: file.name.replace(/\.[^/.]+$/, ''),
    sizes: {
      width: data.data.width,
      height: data.data.height,
    },
  };
};

/**
 * Upload video to Cloudinary via API
 */
export const uploadVideo = async (file: File) => {
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
    id: data.data.publicId || `vid-${Date.now()}`,
    src: data.data.url,
    sizes: {
      width: data.data.width || 1280,
      height: data.data.height || 720,
    },
  };
};

/**
 * Upload file to Cloudinary via API
 */
export const uploadFile = async (file: File) => {
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
    id: data.data.publicId || `file-${Date.now()}`,
    src: data.data.url,
    name: file.name,
    size: file.size,
    format: file.name.split('.').pop() || 'unknown',
  };
};

// ===== PLUGIN CONFIGURATION =====

/**
 * Get all editor plugins with proper configuration
 * This is the MAIN function used by the editor
 */
export function getEditorPlugins() {
  return [
    // ===== BASIC TEXT BLOCKS =====
    Paragraph,
    HeadingOne,
    HeadingTwo,
    HeadingThree,
    Blockquote,
    
    // ===== LISTS =====
    BulletedList,
    NumberedList,
    TodoList,
    
    // ===== DECORATIVE BLOCKS =====
    Divider,
    Callout,
    
    // ===== MEDIA BLOCKS WITH UPLOADS =====
    Image.extend({
      options: {
        upload: uploadImage,
        maxSizes: {
          maxWidth: 1200,
          maxHeight: 800,
        },
      },
    }),
    
    Video.extend({
      options: {
        upload: uploadVideo,
      },
    }),
    
    File.extend({
      options: {
        upload: uploadFile,
      },
    }),
    
    Embed,
    
    // ===== CODE BLOCKS =====
    Code.Code,
    Code.CodeGroup,
    
    // ===== STRUCTURAL BLOCKS =====
    Table,
    Accordion,
    Tabs,
    Steps,
    Carousel,
    
    // ===== INLINE ELEMENTS =====
    Link,
  ];
}

/**
 * Get all text formatting marks
 */
export function getEditorMarks() {
  return [
    Bold,
    Italic,
    CodeMark,
    Underline,
    Strike,
    Highlight,
  ];
}

// Alias for backwards compatibility
export const marks = getEditorMarks();

// ===== PLUGIN METADATA =====

export const PLUGIN_INFO = {
  total: 26,
  categories: {
    text: ['Paragraph', 'HeadingOne', 'HeadingTwo', 'HeadingThree', 'Blockquote'],
    lists: ['BulletedList', 'NumberedList', 'TodoList'],
    media: ['Image', 'Video', 'File', 'Embed'],
    code: ['Code', 'CodeGroup'],
    structural: ['Table', 'Accordion', 'Tabs', 'Steps', 'Carousel'],
    decorative: ['Divider', 'Callout'],
    inline: ['Link'],
  },
  marks: ['Bold', 'Italic', 'Code', 'Underline', 'Strike', 'Highlight'],
};

// ===== KEYBOARD SHORTCUTS =====

export const KEYBOARD_SHORTCUTS = {
  blocks: {
    '/': 'Open command menu',
    '# ': 'Heading 1',
    '## ': 'Heading 2',
    '### ': 'Heading 3',
    '> ': 'Blockquote',
    '- ': 'Bulleted list',
    '1. ': 'Numbered list',
    '[] ': 'Todo list',
    '```': 'Code block',
    '---': 'Divider',
  },
  marks: {
    'Cmd/Ctrl + B': 'Bold',
    'Cmd/Ctrl + I': 'Italic',
    'Cmd/Ctrl + U': 'Underline',
    'Cmd/Ctrl + Shift + X': 'Strike',
    'Cmd/Ctrl + E': 'Inline code',
    'Cmd/Ctrl + K': 'Link',
  },
  editor: {
    'Cmd/Ctrl + Z': 'Undo',
    'Cmd/Ctrl + Shift + Z': 'Redo',
    'Cmd/Ctrl + A': 'Select all',
    'Tab': 'Indent',
    'Shift + Tab': 'Outdent',
  },
};

// ===== DEFAULT VALUES =====

export const DEFAULT_PLACEHOLDER = 'Start writing or type / for commands...';

export const EMPTY_CONTENT = {};

// ===== EXPORT ALIASES =====

// For backwards compatibility
export const getBasePlugins = getEditorPlugins;
export const getThemedPlugins = getEditorPlugins;
export const keyboardShortcuts = KEYBOARD_SHORTCUTS;
export const emptyContent = EMPTY_CONTENT;
export const defaultPlaceholder = DEFAULT_PLACEHOLDER;
