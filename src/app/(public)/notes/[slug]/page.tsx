import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar, Eye } from 'lucide-react';

import { getNote, getAllNoteSlugs } from '@/server/queries/content';
import { getPageStats } from '@/server/queries/stats';
import { parseMarkdown } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';

import { ArticleBody, Views } from '@/components/content';
import { LikeButton } from '@/components/interactive';
import { Skeleton } from '@/components/feedback/Skeleton';

interface INotePageProps {
    params: Promise<{ slug: string }>;
}

// Generate static params for all notes at build time
export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
    const slugs = await getAllNoteSlugs();
    return slugs.map((slug) => ({ slug }));
};

// ISR: Revalidate every hour
export const revalidate = 3600;

// Generate metadata for SEO
export const generateMetadata = async ({
    params,
}: INotePageProps): Promise<Metadata> => {
    const { slug } = await params;
    const note = await getNote(slug);

    if (!note) {
        return { title: 'Note Not Found' };
    }

    return {
        title: note.title,
        description: note.description,
        openGraph: {
            title: note.title,
            description: note.description,
            type: 'article',
            publishedTime: note.publishedAt?.toISOString(),
        },
    };
};

/**
 * Note Stats - Views and Likes
 */
const NoteStats = async ({ slug }: { slug: string }) => {
    const stats = await getPageStats(slug);

    return (
        <div className="flex items-center gap-4">
            <Views slug={slug} />
            <LikeButton slug={slug} initialLikes={stats?.likes ?? 0} />
        </div>
    );
};

/**
 * Note Detail Page
 *
 * Shorter format than articles - for quick snippets and TILs.
 */
const NotePage = async ({ params }: INotePageProps) => {
    const { slug } = await params;
    const note = await getNote(slug);

    if (!note) {
        notFound();
    }

    // Parse markdown to HTML
    const htmlContent = note.html ?? (await parseMarkdown(note.body));

    return (
        <article className="min-h-screen">
            {/* Header Section */}
            <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-24 md:pt-32 pb-12">
                {/* Back Link */}
                <Link
                    href="/notes"
                    className="inline-flex items-center gap-2 text-sm text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors mb-8"
                >
                    <ArrowLeft className="size-4" />
                    Back to notes
                </Link>

                {/* Type Badge + Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--surface)] text-[var(--fg-muted)] border border-[var(--border-color)]">
                        Note
                    </span>
                    {note.tags?.map((tag) => (
                        <span
                            key={tag}
                            className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--accent)]/10 text-[var(--accent)]"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--fg)] leading-tight">
                    {note.title}
                </h1>

                {/* Description */}
                {note.description && (
                    <p className="mt-4 text-lg text-[var(--fg-muted)] leading-relaxed">
                        {note.description}
                    </p>
                )}

                {/* Meta */}
                <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-[var(--fg-muted)]">
                    {note.publishedAt && (
                        <span className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            <time dateTime={new Date(note.publishedAt).toISOString()}>
                                {formatDate(note.publishedAt)}
                            </time>
                        </span>
                    )}
                    <Suspense fallback={
                        <span className="flex items-center gap-2">
                            <Eye className="size-4" />
                            <Skeleton className="h-4 w-12" />
                        </span>
                    }>
                        <Views slug={slug} />
                    </Suspense>
                </div>

                {/* Accent line */}
                <div className="mt-8 w-12 h-px bg-[var(--accent)]" />
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 lg:px-8 pb-16">
                <ArticleBody html={htmlContent} />

                {/* Footer */}
                <footer className="mt-12 pt-8 border-t border-[var(--border-color)]">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <p className="text-sm text-[var(--fg-muted)]">
                            Found this helpful?
                        </p>
                        <Suspense fallback={
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-9 w-24 rounded-full" />
                            </div>
                        }>
                            <NoteStats slug={slug} />
                        </Suspense>
                    </div>
                </footer>
            </div>
        </article>
    );
};

export default NotePage;
