import type { Metadata } from 'next';

import { getRecentNotes, getAllNoteTags } from '@/server/queries/content';
import { SITE_CONFIG } from '@/constants';
import { NotesClient } from '@/components/content/NotesClient';
import type { INote } from '@/interfaces';

export const metadata: Metadata = {
    title: 'Notes',
    description: `Quick notes, atomic knowledge, and learning snippets by ${SITE_CONFIG.author.name}.`,
    openGraph: {
        title: `Notes | ${SITE_CONFIG.name}`,
        description: `Quick notes, atomic knowledge, and learning snippets by ${SITE_CONFIG.author.name}.`,
    },
};

// Static generation - revalidate only on publish
export const revalidate = false;

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
