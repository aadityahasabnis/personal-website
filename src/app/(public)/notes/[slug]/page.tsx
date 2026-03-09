import { after } from 'next/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getNote, getAllNoteSlugs } from '@/server/queries/content';
import { getArticleStats, getArticleCommentCount } from '@/server/queries/stats';
import { incrementViews } from '@/server/actions/stats';
import { calculateReadingTime } from '@/lib/utils';
import { NoteHeader } from '@/components/content/NoteHeader';
import { ArticleContent } from '@/components/content/ArticleContent';
import { ContentStats } from '@/components/common/ContentStats';
import { CommentSection } from '@/components/common/CommentSection';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { JsonLd, generateArticleSchema, generateBreadcrumbSchema, generateOrganizationSchema, combineSchemas } from '@/lib/seo';
import { SITE_CONFIG } from '@/constants/siteConstants';

export const revalidate = false;

interface INotePageProps {
    params: Promise<{ slug: string }>;
}

export const generateStaticParams = async (): Promise<{ slug: string }[]> => {
    const slugs = await getAllNoteSlugs();
    return slugs.map((slug) => ({ slug }));
};

export const generateMetadata = async ({ params }: INotePageProps): Promise<Metadata> => {
    const { slug } = await params;
    const note = await getNote(slug);
    if (!note) return { title: 'Note Not Found' };

    const url = `${SITE_CONFIG.url}/notes/${slug}`;
    const imageUrl = `${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}`;
    const readingTime = note.readingTime ?? calculateReadingTime(note.body ?? '');
    const keywords = [...(note.tags ?? []), SITE_CONFIG.author.name, 'notes', 'learning', 'knowledge'];

    return {
        title: note.title,
        description: note.description,
        keywords: keywords.join(', '),
        authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.url }],
        creator: SITE_CONFIG.author.name,
        publisher: SITE_CONFIG.author.name,
        alternates: { canonical: url },
        openGraph: {
            title: note.title,
            description: note.description,
            type: 'article',
            url,
            siteName: SITE_CONFIG.name,
            locale: 'en_US',
            publishedTime: note.publishedAt?.toISOString(),
            modifiedTime: note.updatedAt?.toISOString(),
            authors: [SITE_CONFIG.author.name],
            tags: keywords,
            images: [{ url: imageUrl, width: 1200, height: 630, alt: note.title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: note.title,
            description: note.description,
            creator: SITE_CONFIG.seo.twitterHandle,
            site: SITE_CONFIG.seo.twitterHandle,
            images: [imageUrl],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 },
        },
        other: {
            'article:author': SITE_CONFIG.author.name,
            'article:section': 'Notes',
            ...(note.publishedAt && { 'article:published_time': note.publishedAt.toISOString() }),
            ...(note.updatedAt && { 'article:modified_time': note.updatedAt.toISOString() }),
            'article:tag': keywords.join(', '),
            'twitter:label1': 'Reading time',
            'twitter:data1': `${readingTime} min read`,
            'twitter:label2': 'Written by',
            'twitter:data2': SITE_CONFIG.author.name,
        },
    };
};

const NotePage = async ({ params }: INotePageProps) => {
    const { slug } = await params;

    after(() => incrementViews(slug));

    const [note, stats, commentCount] = await Promise.all([
        getNote(slug),
        getArticleStats(slug),
        getArticleCommentCount(slug),
    ]);

    if (!note) notFound();

    const readingTime = note.readingTime ?? calculateReadingTime(note.body ?? '');
    const content = note.html ?? note.body ?? '';
    const breadcrumbs = [
        { label: 'Notes', href: '/notes' },
        { label: note.title, href: `/notes/${slug}` },
    ];

    const combinedSchemas = combineSchemas(
        generateArticleSchema({
            article: { ...note, type: 'article' as const, topicSlug: 'notes', subtopicSlug: note.tags?.[0], readingTime, order: 0 } as Parameters<typeof generateArticleSchema>[0]['article'],
            topicSlug: 'notes',
            articleSlug: slug,
            topicTitle: 'Notes',
            subtopicTitle: note.tags?.[0],
            commentCount,
        }),
        generateBreadcrumbSchema(breadcrumbs.map((b) => ({ name: b.label, url: `${SITE_CONFIG.url}${b.href}` }))),
        generateOrganizationSchema(),
    );

    return (
        <>
            <JsonLd data={combinedSchemas} />
            <ScrollToTop />
            <article className="article-content" itemScope itemType="https://schema.org/TechArticle">
                <NoteHeader
                    title={note.title}
                    description={note.description}
                    tags={note.tags}
                    publishedAt={note.publishedAt}
                    updatedAt={note.updatedAt}
                    readingTime={readingTime}
                />
                <div className="max-w-4xl mx-auto px-6 lg:px-8 pb-12 md:pb-16">
                    {content ? (
                        <ArticleContent content={content} />
                    ) : (
                        <div className="text-[var(--fg-muted)] leading-7">
                            <p>This note is being prepared. Check back soon.</p>
                        </div>
                    )}
                    <footer className="mt-12 pt-8 border-t border-[var(--border-color)]">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <p className="text-[var(--fg-muted)]">Found this note helpful? Show some love!</p>
                            <ContentStats
                                slug={slug}
                                contentType="notes"
                                initialViews={stats?.views ?? 0}
                                initialLikes={stats?.likes ?? 0}
                            />
                        </div>
                    </footer>
                    <CommentSection slug={slug} contentType="notes" />
                </div>
            </article>
        </>
    );
};

export default NotePage;
