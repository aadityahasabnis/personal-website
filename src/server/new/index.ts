/**
 * New Server Actions – Top-Level Barrel Export
 *
 * This is the main entry point for all new server actions.
 *
 * Usage:
 *   import { getPublicArticle } from '@/server/new';
 *   import { createArticle } from '@/server/new/admin';
 *   import { ok, handleError } from '@/server/new/utils';
 *
 * For more targeted imports, use the sub-paths directly:
 *   import { recordView } from '@/server/new/public/stats';
 *   import { updateSiteSettings } from '@/server/new/admin/settings';
 */

// Utilities (helpers, response builders, etc.)
export * from './utils';

// Admin actions (content CRUD, settings, etc.)
// Note: Use '@/server/new/admin' for admin imports to avoid
// pulling admin code into public bundles.

// Public actions (read-only queries, page stats)
// Note: Use '@/server/new/public' for public imports.
