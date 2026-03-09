import type { Metadata } from 'next';

import { getRecentNotes, getAllNoteTags } from '@/server/queries/content';
import { SITE_CONFIG } from '@/constants';
import { NotesClient } from '@/components/content/NotesClient';
import type { INote } from '@/interfaces/schema';

const description = `Quick notes, atomic knowledge, and learning snippets by ${SITE_CONFIG.author.name}.`;

export const metadata: Metadata = {
    title: 'Notes',
    description,
    keywords: ['notes', 'atomic knowledge', 'learning', 'snippets', SITE_CONFIG.author.name].join(', '),
    alternates: {
        canonical: `${SITE_CONFIG.url}/notes`,
    },
    openGraph: {
        title: `Notes | ${SITE_CONFIG.name}`,
        description,
        url: `${SITE_CONFIG.url}/notes`,
        siteName: SITE_CONFIG.name,
        locale: 'en_US',
        type: 'website',
        images: [{ url: `${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}`, width: 1200, height: 630, alt: 'Notes' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: `Notes | ${SITE_CONFIG.name}`,
        description,
        creator: SITE_CONFIG.seo.twitterHandle,
        site: SITE_CONFIG.seo.twitterHandle,
        images: [`${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}`],
    },
};

// ISR: notes listing regenerates every 10 minutes; on-demand via /api/revalidate
export const revalidate = 600;

/**
 * Helper to transform MongoDB notes to plain objects
 */
function transformNote(note: INote): INote {
    return {
        slug: note.slug,
        type: 'note',
        title: note.title,
        description: note.description,
        body: note.body,
        html: note.html,
        tags: note.tags || [],
        published: note.published,
        publishedAt: note.publishedAt,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
    };
}

/**
 * Notes Page - Fully Static with Client-Side Filtering
 *
 * Strategy:
 * - Fetch ALL notes at build time (static)
 * - Filter tags on client side (instant, no server requests)
 * - Pre-render as static HTML for instant page loads
 * - Revalidate only when admin publishes new content
 *
 * Performance:
 * - ○ Static (not ƒ Dynamic)
 * - Instant page load
 * - Instant tag filtering (client-side)
 * - No server round trips
 */
export default async function NotesPage() {
    // Fetch ALL notes and tags at build time (static)
    const [notes, allTags] = await Promise.all([
        getRecentNotes(100), // Fetch all notes once
        getAllNoteTags(),
    ]);

    const transformedNotes = notes.map(transformNote);

    return (
        <NotesClient
            notes={transformedNotes}
            allTags={allTags}
        />
    );
}
