'use server';

import { revalidatePath } from 'next/cache';

/**
 * Server-side revalidation utilities
 *
 * Call these from server actions when content is created/updated/deleted
 * in the admin panel to trigger ISR revalidation of affected pages.
 */

export type RevalidateContentType = 'article' | 'note' | 'project' | 'page';

/**
 * Revalidate a specific content page and its listing.
 * Also revalidates home and sitemap where appropriate.
 */
export const revalidateContent = async (type: RevalidateContentType, slug: string): Promise<void> => {
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
    revalidatePath('/sitemap.xml');
};

/**
 * Revalidate only the listing page for a content type
 */
export const revalidateContentList = async (type: RevalidateContentType): Promise<void> => {
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
            revalidatePath('/');
            break;
    }
    revalidatePath('/sitemap.xml');
};

/**
 * Revalidate the home page (for featured content updates)
 */
export const revalidateHome = async (): Promise<void> => {
    revalidatePath('/');
};

/**
 * Revalidate the entire site — use sparingly (e.g., bulk migrations)
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
