import { ArticleSidebar } from '@/components/content/article/ArticleSidebar';
import { TableOfContents } from '@/components/content/common/TableOfContents';
import { extractHeadingsFromAuthorlyHtml, stampHeadingIds } from '@/lib/markdown/toc';
import { getPublishedArticleByPath, getPublishedTopicTreeBySlug } from '@/server/new/public/content/article';

interface IArticleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ topicSlug: string; articleSlug: string }>;
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

    const [topicTreeResult, articleResult] = await Promise.all([getPublishedTopicTreeBySlug(topicSlug), getPublishedArticleByPath(topicSlug, articleSlug)]);

    const topicTree = topicTreeResult.success ? topicTreeResult.data : null;
    const article = articleResult.success ? articleResult.data : null;
    const topicTitle = topicTree?.topic.title ?? 'Articles';

    // Stamp heading IDs server-side (same logic as ArticleContent) then extract
    // headings so the TOC receives the same IDs that will be in the rendered HTML.
    const rawHtml = article?.html ?? article?.body ?? '';
    const stampedHtml = stampHeadingIds(rawHtml);
    const tocHeadings = extractHeadingsFromAuthorlyHtml(stampedHtml);

    return (
        <div className='mx-auto px-4 py-12 max-w-350 md:py-16 lg:px-8'>
            <div className='flex gap-8'>
                {/* Left Sidebar - Navigation */}
                <aside className='shrink-0 hidden w-64 lg:block'>
                    <div className='sticky top-24 overflow-y-auto pr-4 pb-8 max-h-[calc(100vh-8rem)]'>
                        <ArticleSidebar
                            topicSlug={topicSlug}
                            topicTitle={topicTitle}
                            sections={topicTree?.subtopics ?? []}
                            uncategorizedArticles={topicTree?.uncategorizedArticles ?? []}
                            currentSlug={articleSlug}
                        />
                    </div>
                </aside>

                {/* Main Content */}
                <main className='flex-1 min-w-0 max-w-3xl'>{children}</main>

                {/* Right Sidebar - Table of Contents */}
                <aside className='shrink-0 hidden w-56 xl:block'>
                    <div className='sticky top-24 overflow-y-auto pl-4 pb-8 max-h-[calc(100vh-8rem)]'>
                        <TableOfContents headings={tocHeadings} />
                    </div>
                </aside>
            </div>
        </div>
    );
}
