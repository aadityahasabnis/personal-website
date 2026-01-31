'use server';

import { revalidatePath } from 'next/cache';

/**
 * Server-side revalidation utilities
 *
 * Use these functions from server actions when content is created/updated/deleted
 * in the admin panel to trigger ISR revalidation.
 */

export type ContentType = 'article' | 'note' | 'project' | 'page';

/**
 * Revalidate a specific content page and its listing
 */
export const revalidateContent = async (
    type: ContentType,
    slug: string
): Promise<void> => {
    switch (type) {
        case 'article':
            revalidatePath(`/articles/${slug}`);
            revalidatePath('/articles');
            revalidatePath('/'); // Home may show featured articles
            break;

        case 'note':
            revalidatePath(`/notes/${slug}`);
            revalidatePath('/notes');
            break;

        case 'project':
            revalidatePath(`/projects/${slug}`);
            revalidatePath('/projects');
            revalidatePath('/'); // Home may show featured projects
            break;

        case 'page':
            revalidatePath(`/${slug}`);
            break;
    }

    // Always revalidate sitemap
    revalidatePath('/sitemap.xml');
};

/**
 * Revalidate a content listing page
 */
export const revalidateContentList = async (type: ContentType): Promise<void> => {
    switch (type) {
        case 'article':
            revalidatePath('/articles');
            break;

        case 'note':
            revalidatePath('/notes');
            break;

        case 'project':
            revalidatePath('/projects');
            break;

        case 'page':
            // Pages don't have a listing, just revalidate home
            revalidatePath('/');
            break;
    }

    revalidatePath('/sitemap.xml');
};

/**
 * Revalidate the entire site (use sparingly)
 */
export const revalidateAll = async (): Promise<void> => {
    revalidatePath('/', 'layout');
    revalidatePath('/articles');
    revalidatePath('/notes');
    revalidatePath('/projects');
    revalidatePath('/about');
    revalidatePath('/contact');
    revalidatePath('/sitemap.xml');
};

/**
 * Revalidate home page (for featured content updates)
 */
export const revalidateHome = async (): Promise<void> => {
    revalidatePath('/');
};
