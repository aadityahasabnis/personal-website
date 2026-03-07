/**
 * Admin Server Actions - Main Barrel Export
 * 
 * Central export file for all admin server actions organized by domain.
 * Import from '@/server/admin' for clean imports.
 * 
 * @example
 * import { createArticle, getTopics, exportAllContent } from '@/server/admin';
 */

// ===== UTILITIES =====
export * from './utils';

// ===== ARTICLES DOMAIN =====
export * from './articles';

// ===== TOPICS DOMAIN =====
export * from './topics';

// ===== SUBTOPICS DOMAIN =====
export * from './subtopics';

// ===== PROJECTS DOMAIN =====
export * from './projects';

// ===== NOTES DOMAIN =====
export * from './notes';

// ===== COMMENTS DOMAIN =====
export * from './comments';

// ===== SUBSCRIBERS DOMAIN =====
export * from './subscribers';

// ===== MESSAGES DOMAIN =====
export * from './messages';

// ===== MEDIA DOMAIN =====
export * from './media';

// ===== ACTIVITY DOMAIN =====
export * from './activity';

// ===== BACKUP DOMAIN =====
export * from './backup';

// ===== SCHEDULE DOMAIN =====
export * from './schedule';

// ===== SETTINGS DOMAIN =====
export * from './settings';
