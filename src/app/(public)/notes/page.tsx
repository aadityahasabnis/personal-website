import type { Metadata } from 'next';

import { getRecentNotes } from '@/server/queries/content';
import { SITE_CONFIG } from '@/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentCard } from '@/components/content/ContentCard';
import { FadeIn, FadeInStagger, StaggerItem } from '@/components/animation/FadeIn';
import type { INote } from '@/interfaces';

export const metadata: Metadata = {
    title: 'Notes',
    description: `Quick notes, atomic knowledge, and learning snippets by ${SITE_CONFIG.author.name}.`,
    openGraph: {
        title: `Notes | ${SITE_CONFIG.name}`,
        description: `Quick notes, atomic knowledge, and learning snippets by ${SITE_CONFIG.author.name}.`,
    },
};

// ISR: Revalidate every 30 minutes
export const revalidate = 1800;

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
 * Notes Page
 * 
 * Fully static + ISR page for atomic knowledge notes.
 * No loading states - content is pre-rendered.
 */
export default async function NotesPage() {
    const notes = await getRecentNotes(30);
    const transformedNotes = notes.map(transformNote);

    return (
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 md:py-32">
            {/* Page Header */}
            <PageHeader
                label="Knowledge"
                title="Notes"
                description="Quick snippets, learnings, and atomic knowledge. Short-form content that captures ideas, discoveries, and things I learn along the way."
            />

            {/* Notes Grid */}
            <FadeIn delay={0.3}>
                {transformedNotes.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-[var(--fg-muted)] text-lg">
                            No notes yet. Quick insights will appear here soon.
                        </p>
                    </div>
                ) : (
                    <FadeInStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {transformedNotes.map((note, i) => (
                            <StaggerItem key={note.slug}>
                                <ContentCard
                                    href={`/notes/${note.slug}`}
                                    title={note.title}
                                    description={note.description}
                                    tags={note.tags}
                                    date={note.publishedAt}
                                    variant="compact"
                                    index={i}
                                />
                            </StaggerItem>
                        ))}
                    </FadeInStagger>
                )}
            </FadeIn>
        </div>
    );
}
