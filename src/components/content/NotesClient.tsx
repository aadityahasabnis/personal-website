'use client';

import { useState, useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentCard } from '@/components/content/ContentCard';
import { FadeIn, FadeInStagger, StaggerItem } from '@/components/animation/FadeIn';
import { Filter } from 'lucide-react';
import type { INote } from '@/interfaces';

interface INotesClientProps {
    notes: INote[];
    allTags: string[];
}

/**
 * NotesClient - Client-side filtered notes page
 * 
 * Features:
 * - Instant client-side tag filtering (no server requests)
 * - Toggle tag selection
 * - Smooth animations
 * - Fully static parent page (no searchParams)
 * 
 * Performance:
 * - Parent page is static (○)
 * - Filtering happens instantly on client
 * - No loading states or skeleton screens needed
 */
export function NotesClient({ notes, allTags }: INotesClientProps) {
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Filter notes by selected tag (instant, client-side)
    const filteredNotes = useMemo(() => {
        if (!selectedTag) return notes;
        return notes.filter(note => note.tags?.includes(selectedTag));
    }, [notes, selectedTag]);

    const handleTagClick = (tag: string) => {
        // Toggle: if already selected, deselect it
        setSelectedTag(current => current === tag ? null : tag);
    };

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
                            <div className="size-8 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                                <Filter className="size-4 text-[var(--accent)]" />
                            </div>
                            <h2 className="text-base md:text-lg font-semibold text-[var(--fg)]">
                                Filter by Tag
                            </h2>
                            {selectedTag && (
                                <span className="text-sm text-[var(--fg-subtle)]">
                                    ({filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'})
                                </span>
                            )}
                            {!selectedTag && (
                                <span className="text-sm text-[var(--fg-subtle)]">
                                    (Showing all {filteredNotes.length} notes)
                                </span>
                            )}
                        </div>

                        {/* Tag Pills - Toggle functionality */}
                        <div className="flex flex-wrap gap-2 md:gap-3">
                            {/* "All" Tag - Always shows all notes */}
                            <button
                                onClick={() => setSelectedTag(null)}
                                className={`
                                    inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                                    transition-all duration-200
                                    ${
                                        !selectedTag
                                            ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--glow-color)]'
                                            : 'bg-[var(--surface)] text-[var(--fg-muted)] border-2 border-[var(--border-color)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                                    }
                                `}
                            >
                                All Notes
                            </button>

                            {/* Individual Tags - Click to toggle */}
                            {allTags.map((tag) => {
                                const isActive = selectedTag === tag;
                                
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => handleTagClick(tag)}
                                        className={`
                                            inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                                            transition-all duration-200
                                            ${
                                                isActive
                                                    ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--glow-color)]'
                                                    : 'bg-[var(--surface)] text-[var(--fg-muted)] border-2 border-[var(--border-color)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                                            }
                                        `}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </FadeIn>
            )}

            {/* Notes Grid */}
            <FadeIn delay={0.4} key={`notes-grid-${selectedTag || 'all'}`}>
                {filteredNotes.length === 0 ? (
                    <div className="text-center py-16 md:py-20">
                        {selectedTag ? (
                            <>
                                <p className="text-[var(--fg-muted)] text-base md:text-lg mb-4">
                                    No notes found with tag &quot;{selectedTag}&quot;
                                </p>
                                <button
                                    onClick={() => setSelectedTag(null)}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--accent)] text-white text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors shadow-lg shadow-[var(--glow-color)]"
                                >
                                    View all notes
                                </button>
                            </>
                        ) : (
                            <p className="text-[var(--fg-muted)] text-base md:text-lg">
                                No notes yet. Quick insights will appear here soon.
                            </p>
                        )}
                    </div>
                ) : (
                    <FadeInStagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" key={`stagger-${selectedTag || 'all'}`}>
                        {filteredNotes.map((note, i) => (
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
