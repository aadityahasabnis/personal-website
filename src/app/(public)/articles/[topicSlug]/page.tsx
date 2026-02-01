import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft, FileText } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

import { getTopicWithContent, getAllTopicSlugs } from '@/server/queries/topics';
import { SubtopicAccordion } from '@/components/content/SubtopicAccordion';
import { FadeIn } from '@/components/animation/FadeIn';
import { formatDate } from '@/lib/utils';
import type { ISubtopic, IArticle } from '@/interfaces';

// Static generation
export const revalidate = false;

interface ITopicPageProps {
    params: Promise<{ topicSlug: string }>;
}

/**
 * Generate static paths for all topics
 */
export async function generateStaticParams() {
    const slugs = await getAllTopicSlugs();
    return slugs.map((topicSlug) => ({ topicSlug }));
}

/**
 * Generate metadata for the topic page
 */
export async function generateMetadata({
    params,
}: ITopicPageProps): Promise<Metadata> {
    const { topicSlug } = await params;
    const { topic } = await getTopicWithContent(topicSlug);

    if (!topic) {
        return {
            title: 'Topic Not Found',
        };
    }

    return {
        title: topic.title,
        description: topic.description,
        openGraph: {
            title: topic.title,
            description: topic.description,
        },
    };
}

/**
 * Get Lucide icon component by name
 */
function getIconComponent(iconName?: string): React.ComponentType<{ className?: string }> {
    if (!iconName) return FileText;
    
    const pascalCase = iconName
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (LucideIcons as any)[pascalCase];
    return Icon || FileText;
}

/**
 * Transform data for client components
 */
function transformSubtopic(subtopic: ISubtopic): ISubtopic {
    return {
        topicSlug: subtopic.topicSlug,
        slug: subtopic.slug,
        title: subtopic.title,
        description: subtopic.description,
        order: subtopic.order,
        published: subtopic.published,
        metadata: {
            articleCount: subtopic.metadata.articleCount,
        },
        createdAt: subtopic.createdAt,
        updatedAt: subtopic.updatedAt,
    };
}

function transformArticle(article: Pick<IArticle, 'slug' | 'title' | 'description' | 'subtopicSlug' | 'order' | 'readingTime' | 'publishedAt'>) {
    return {
        slug: article.slug,
        title: article.title,
        description: article.description,
        subtopicSlug: article.subtopicSlug,
        order: article.order,
        readingTime: article.readingTime,
        publishedAt: article.publishedAt,
    };
}

/**
 * Topic Detail Page
 * 
 * Shows topic header with description and accordion of subtopics/articles.
 * Static rendering with fade animations.
 */
export default async function TopicPage({ params }: ITopicPageProps) {
    const { topicSlug } = await params;
    const { topic, subtopics, articles } = await getTopicWithContent(topicSlug);

    if (!topic) {
        notFound();
    }

    const Icon = getIconComponent(topic.icon);
    const transformedSubtopics = subtopics.map(transformSubtopic);
    const transformedArticles = articles.map(transformArticle);

    return (
        <div className="max-w-4xl mx-auto px-6 lg:px-8 py-24 md:py-32">
            {/* Breadcrumb */}
            <FadeIn delay={0.1}>
                <nav className="mb-8">
                    <Link
                        href="/articles"
                        className="inline-flex items-center gap-1 text-sm text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors"
                    >
                        <ChevronLeft className="size-4" />
                        All Topics
                    </Link>
                </nav>
            </FadeIn>

            {/* Topic Header */}
            <FadeIn as="header" delay={0.2} className="mb-12">
                {/* Icon */}
                <div className="mb-6 inline-flex items-center justify-center size-16 rounded-2xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                    <Icon className="size-8" />
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-semibold text-[var(--fg)] mb-4">
                    {topic.title}
                </h1>

                {/* Description */}
                <p className="text-lg text-[var(--fg-muted)] max-w-2xl">
                    {topic.description}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-4 mt-6 text-sm text-[var(--fg-subtle)]">
                    <span className="flex items-center gap-1.5">
                        <FileText className="size-4" />
                        {topic.metadata.articleCount} article{topic.metadata.articleCount !== 1 ? 's' : ''}
                    </span>
                    {topic.metadata.lastUpdated && (
                        <span>
                            Last updated {formatDate(topic.metadata.lastUpdated)}
                        </span>
                    )}
                </div>

                {/* Decorative line */}
                <div className="mt-8 h-px bg-gradient-to-r from-[var(--accent)] via-[var(--accent)]/50 to-transparent" />
            </FadeIn>

            {/* Subtopics Accordion */}
            <FadeIn delay={0.4}>
                <SubtopicAccordion
                    topicSlug={topicSlug}
                    subtopics={transformedSubtopics}
                    articles={transformedArticles}
                />
            </FadeIn>
        </div>
    );
}
