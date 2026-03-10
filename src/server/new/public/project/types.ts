/**
 * Public Project – Serialized Types
 *
 * Explicitly defined interfaces for JSON-safe transport.
 * These serve as a security boundary and stable API contract.
 */

import type { ProjectStatus } from '@/interfaces/schema';

// ============================================================
// Full Project (detail page)
// ============================================================

/**
 * Full published project for the detail page (SSG/ISR).
 * Includes body, gallery, and complete SEO metadata.
 */
export interface PublicProject {
    _id: string;
    slug: string;
    title: string;
    description: string;
    body: string;
    tags: string[];
    coverImage: string | null;
    publishedAt: string;
    updatedAt: string;
    featured: boolean;
    techStack: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    demoVideo: string | null;
    gallery: string[];
    status: ProjectStatus;
    startDate: string | null;
    completedDate: string | null;
    order: number;
    seo: {
        title: string | null;
        description: string | null;
        keywords: string[];
        ogImage: string | null;
        canonicalUrl: string | null;
        noIndex: boolean;
    };
}

// ============================================================
// Project Card (listing pages)
// ============================================================

/**
 * Lightweight card for listing pages — no body, no gallery.
 */
export interface PublicProjectCard {
    slug: string;
    title: string;
    description: string;
    coverImage: string | null;
    tags: string[];
    techStack: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    status: ProjectStatus;
    featured: boolean;
    order: number;
}
