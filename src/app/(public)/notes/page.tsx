import type { Metadata } from 'next';
import Link from 'next/link';

import { getRecentNotes, getNotesByTag, getAllNoteTags } from '@/server/queries/content';
import { SITE_CONFIG } from '@/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentCard } from '@/components/content/ContentCard';
import { FadeIn, FadeInStagger, StaggerItem } from '@/components/animation/FadeIn';
import { Filter } from 'lucide-react';
import type { INote } from '@/interfaces';

interface INotesPageProps {
    searchParams: Promise<{ tag?: string }>;
}

export const metadata: Metadata = {
    title: 'Notes',
    description: `Quick notes, atomic knowledge, and learning snippets by ${SITE_CONFIG.author.name}.`,
    openGraph: {
        title: `Notes | ${SITE_CONFIG.name}`,
        description: `Quick notes, atomic knowledge, and learning snippets by ${SITE_CONFIG.author.name}.`,
    },
};

// ISR: Revalidate every 30 minutes (with cache)
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
 * Notes Page with Server-Side Tag Filtering
 *
 * FIXED BUGS:
 * - Click tag again → deselects (toggles)
 * - "All Notes" → always shows ALL notes
 * - Removed "Clear filter" button (click tag to unselect instead)
 * - Proper query handling
 *
 * URL Pattern:
 * - /notes → Show all notes
 * - /notes?tag=typescript → Show notes with "typescript" tag
 * - /notes?tag=typescript (click "typescript" again) → deselects, shows all
 */
export default async function NotesPage({ searchParams }: INotesPageProps) {
    const params = await searchParams;
    const selectedTag = params.tag;

    // Fetch notes and tags in parallel
    const [notes, allTags] = await Promise.all([
        selectedTag ? getNotesByTag(selectedTag, 100) : getRecentNotes(100),
        getAllNoteTags(),
    ]);

    const transformedNotes = notes.map(transformNote);

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 md:py-32">
            {/* Page Header */}
            <FadeIn delay={0.1}>
                <PageHeader
                    label="Knowledge"
                    title="Notes"
                    description="Quick snippets, learnings, and atomic knowledge. Short-form content that captures ideas, discoveries, and things I learn along the way."
                />
            </FadeIn>

            {/* Tag Filter */}
            {allTags.length > 0 && (
                <FadeIn delay={0.3}>
                    <div className="mb-8 md:mb-12">
                        {/* Filter Header */}
                        <div className="flex items-center gap-2 mb-4 md:mb-6">
                            <div className="size-8 rounded-full bg-[#9b87f5]/10 flex items-center justify-center">
                                <Filter className="size-4 text-[#9b87f5]" />
                            </div>
                            <h2 className="text-base md:text-lg font-semibold text-[var(--fg)]">
                                Filter by Tag
                            </h2>
                            {selectedTag && (
                                <span className="text-sm text-[var(--fg-subtle)]">
                                    ({transformedNotes.length} {transformedNotes.length === 1 ? 'note' : 'notes'})
                                </span>
                            )}
                            {!selectedTag && (
                                <span className="text-sm text-[var(--fg-subtle)]">
                                    (Showing all {transformedNotes.length} notes)
                                </span>
                            )}
                        </div>

                        {/* Tag Pills - Toggle functionality */}
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {/* "All" Tag - Always shows all notes */}
                            <Link
                                href="/notes"
                                className={`
                                    inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                                    transition-all duration-200
                                    ${
                                        !selectedTag
                                            ? 'bg-[#9b87f5] text-white shadow-lg shadow-[#9b87f5]/30'
                                            : 'bg-[var(--surface)] text-[var(--fg-muted)] border-2 border-[var(--border-color)] hover:border-[#9b87f5] hover:text-[#9b87f5]'
                                    }
                                `}
                            >
                                All Notes
                            </Link>

                            {/* Individual Tags - Click to toggle */}
                            {allTags.map((tag) => {
                                const isActive = selectedTag === tag;
                                
                                // TOGGLE: If tag is active, clicking it goes to /notes (unselect)
                                // If tag is NOT active, clicking it selects that tag
                                const href = isActive ? '/notes' : `/notes?tag=${encodeURIComponent(tag)}`;
                                
                                return (
                                    <Link
                                        key={tag}
                                        href={href}
                                        className={`
                                            inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                                            transition-all duration-200
                                            ${
                                                isActive
                                                    ? 'bg-[#9b87f5] text-white shadow-lg shadow-[#9b87f5]/30'
                                                    : 'bg-[var(--surface)] text-[var(--fg-muted)] border-2 border-[var(--border-color)] hover:border-[#9b87f5] hover:text-[#9b87f5]'
                                            }
                                        `}
                                    >
                                        {tag}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </FadeIn>
            )}

            {/* Notes Grid */}
            <FadeIn delay={0.4} key={`notes-grid-${selectedTag || 'all'}`}>
                {transformedNotes.length === 0 ? (
                    <div className="text-center py-16 md:py-20">
                        {selectedTag ? (
                            <>
                                <p className="text-[var(--fg-muted)] text-base md:text-lg mb-4">
                                    No notes found with tag "{selectedTag}"
                                </p>
                                <Link
                                    href="/notes"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#9b87f5] text-white text-sm font-medium hover:bg-[#8b77e5] transition-colors shadow-lg shadow-[#9b87f5]/20"
                                >
                                    View all notes
                                </Link>
                            </>
                        ) : (
                            <p className="text-[var(--fg-muted)] text-base md:text-lg">
                                No notes yet. Quick insights will appear here soon.
                            </p>
                        )}
                    </div>
                ) : (
                    <FadeInStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" key={`stagger-${selectedTag || 'all'}`}>
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
