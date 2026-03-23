import { ArticleSidebar } from '@/components/content/article/ArticleSidebar';
import { TableOfContents } from '@/components/content/TableOfContents';
import type { IArticle, ISubtopic } from '@/interfaces/schema';
import { extractHeadingsFromAuthorlyHtml, stampHeadingIds } from '@/lib/markdown/toc';
import { getArticleByTopicSlug, getArticleSidebarData } from '@/server/queries/content';
import { getTopic } from '@/server/queries/topics';

interface IArticleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ topicSlug: string; articleSlug: string }>;
}

/**
 * Transform subtopic for client component
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

/**
 * Transform article for client component
 */
function transformArticle(article: Pick<IArticle, 'slug' | 'title' | 'subtopicSlug' | 'order'>) {
    return {
        slug: article.slug,
        title: article.title,
        subtopicSlug: article.subtopicSlug,
        order: article.order,
    };
}

/**
 * Article Layout - 3-column layout for article pages
 *
 * Left: Navigation sidebar with subtopics/articles
 * Center: Article content (children)
 * Right: Table of contents
 */
export default async function ArticleLayout({ children, params }: IArticleLayoutProps) {
    const { topicSlug, articleSlug } = await params;

    // Fetch sidebar data + article body for TOC in parallel
    const [topic, sidebarData, article] = await Promise.all([getTopic(topicSlug), getArticleSidebarData(topicSlug), getArticleByTopicSlug(topicSlug, articleSlug)]);

    const topicTitle = topic?.title || 'Articles';
    const transformedSubtopics = sidebarData.subtopics.map(transformSubtopic);
    const transformedArticles = sidebarData.articles.map(transformArticle);

    // Stamp heading IDs server-side (same logic as ArticleContent) then extract
    // headings so the TOC receives the same IDs that will be in the rendered HTML.
    const rawHtml = article?.body || article?.html || '';
    const stampedHtml = stampHeadingIds(rawHtml);
    const tocHeadings = extractHeadingsFromAuthorlyHtml(stampedHtml);

    return (
        <div className='max-w-[1400px] mx-auto px-4 lg:px-8 py-12 md:py-16'>
            <div className='flex gap-8'>
                {/* Left Sidebar - Navigation */}
                <aside className='hidden lg:block w-64 shrink-0'>
                    <div className='sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4 pb-8'>
                        <ArticleSidebar topicSlug={topicSlug} topicTitle={topicTitle} subtopics={transformedSubtopics} articles={transformedArticles} currentSlug={articleSlug} />
                    </div>
                </aside>

                {/* Main Content */}
                <main className='flex-1 min-w-0 max-w-3xl'>{children}</main>

                {/* Right Sidebar - Table of Contents */}
                <aside className='hidden xl:block w-56 shrink-0'>
                    <div className='sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pl-4 pb-8'>
                        <TableOfContents headings={tocHeadings} />
                    </div>
                </aside>
            </div>
        </div>
    );
}
