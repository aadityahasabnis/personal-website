import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Calendar } from 'lucide-react';

import { getNote, getAllNoteSlugs } from '@/server/queries/content';
import { getPageStats } from '@/server/queries/stats';
import { parseMarkdown } from '@/lib/markdown';
import { formatDate } from '@/lib/utils';
import { SITE_CONFIG } from '@/constants';

import { ArticleBody, Views } from '@/components/content';
import { LikeButton } from '@/components/interactive';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
        <article className="container-narrow py-12">
            {/* Back Link */}
            <Link
                href="/notes"
                className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to notes
            </Link>

            {/* Header */}
            <header className="mb-8">
                {/* Type Badge + Tags */}
                <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge>Note</Badge>
                    {note.tags?.map((tag) => (
                        <Badge key={tag} variant="secondary">
                            {tag}
                        </Badge>
                    ))}
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                    {note.title}
                </h1>

                {/* Description */}
                {note.description && (
                    <p className="mt-3 text-muted-foreground">
                        {note.description}
                    </p>
                )}

                {/* Meta */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    {note.publishedAt && (
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={new Date(note.publishedAt).toISOString()}>
                                {formatDate(note.publishedAt)}
                            </time>
                        </span>
                    )}
                    <Suspense fallback={<Skeleton className="h-4 w-20" />}>
                        <Views slug={slug} />
                    </Suspense>
                </div>
            </header>

            {/* Content */}
            <ArticleBody html={htmlContent} />

            {/* Footer */}
            <footer className="mt-8 flex items-center justify-between border-t pt-6">
                <p className="text-sm text-muted-foreground">
                    Found this helpful?
                </p>
                <Suspense fallback={<Skeleton className="h-9 w-24 rounded-full" />}>
                    <NoteStats slug={slug} />
                </Suspense>
            </footer>
        </article>
    );
};

export default NotePage;
