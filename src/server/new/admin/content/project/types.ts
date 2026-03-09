/**
 * Admin Project – Input Types
 *
 * Derived from schema.ts interfaces using Pick/Omit/Partial.
 * No Zod — validation is handled at the action level.
 */

import type { IProject, ISeoMetadata, ProjectStatus } from '@/interfaces/schema';

// ============================================================
// Create Input
// ============================================================

/**
 * Fields the client provides when creating a project.
 * Auto-generated fields (_id, timestamps, published state) are excluded.
 */
export type ProjectCreateInput = {
    slug: string;
    title: string;
    description: string;
    body: string;
    techStack: string[];
    status?: ProjectStatus;
    tags?: string[];
    coverImage?: string | null;
    githubUrl?: string | null;
    liveUrl?: string | null;
    demoVideo?: string | null;
    gallery?: string[];
    startDate?: Date | null;
    completedDate?: Date | null;
    order?: number;
    seo?: Partial<ISeoMetadata> | null;
};

// ============================================================
// Update Input
// ============================================================

/**
 * All user-editable fields are optional for partial updates.
 */
export type ProjectUpdateInput = Partial<
    Pick<
        IProject,
        | 'slug'
        | 'title'
        | 'description'
        | 'body'
        | 'tags'
        | 'coverImage'
        | 'techStack'
        | 'githubUrl'
        | 'liveUrl'
        | 'demoVideo'
        | 'gallery'
        | 'status'
        | 'startDate'
        | 'completedDate'
        | 'order'
    >
> & {
    seo?: Partial<ISeoMetadata> | null;
};
