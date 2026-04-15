import { ArticleSidebar } from '@/components/content/article/ArticleSidebar';
import { TableOfContents } from '@/components/content/common/TableOfContents';
import { FadeIn } from '@/components/motion/FadeIn';
import { extractHeadingsFromAuthorlyHtml, stampHeadingIds } from '@/lib/markdown/toc';
import { getPublishedArticleByPath, getPublishedTopicTreeBySlug } from '@/server/new/public/content/article';

interface IArticleLayoutProps {
    children: React.ReactNode;
    params: Promise<{ topicSlug: string; articleSlug: string }>;
}

/**
 * Article Layout - 3-column layout for article pages
 *
 * Left: Navigation sidebar with subtopics/articles (grows to fill space)
 * Center: Article content (fixed max-width, shrink-protected)
 * Right: Table of contents (grows to fill space)
 */
export default async function ArticleLayout({ children, params }: IArticleLayoutProps) {
    const { topicSlug, articleSlug } = await params;

    const [topicTreeResult, articleResult] = await Promise.all([getPublishedTopicTreeBySlug(topicSlug), getPublishedArticleByPath(topicSlug, articleSlug)]);

    const topicTree = topicTreeResult.success ? topicTreeResult.data : null;
    const article = articleResult.success ? articleResult.data : null;
    const topicTitle = topicTree?.topic.title ?? 'Articles';

    const rawHtml = article?.html ?? article?.body ?? '';
    const stampedHtml = stampHeadingIds(rawHtml);
    const tocHeadings = extractHeadingsFromAuthorlyHtml(stampedHtml);

    return (
        <div className='mx-auto w-full px-4 sm:px-6 lg:px-8'>
            <div className='grid gap-6 pt-16 md:pt-20 lg:grid-cols-[minmax(14rem,1fr)_minmax(0,48rem)] xl:grid-cols-[minmax(14rem,1fr)_minmax(0,48rem)_minmax(14rem,1fr)] xl:gap-8'>
                {/* Left Sidebar — fluid column that grows with available space */}
                <aside className='hidden lg:block'>
                    <FadeIn direction='right' distance={16} duration={0.45} delay={0.1} trigger='always' className='sticky top-20'>
                        <div className='max-h-[calc(100vh-7rem)] overflow-y-auto pb-8'>
                            <ArticleSidebar
                                topicSlug={topicSlug}
                                topicTitle={topicTitle}
                                sections={topicTree?.subtopics ?? []}
                                uncategorizedArticles={topicTree?.uncategorizedArticles ?? []}
                                currentSlug={articleSlug}
                            />
                        </div>
                    </FadeIn>
                </aside>

                {/* Main Content — fixed readable column */}
                <main className='mx-auto w-full max-w-3xl min-w-0'>{children}</main>

                {/* Right Sidebar — fluid TOC column that grows with available space */}
                <aside className='hidden xl:block'>
                    <FadeIn direction='left' distance={16} duration={0.45} delay={0.12} trigger='always' className='sticky top-20'>
                        <div className='max-h-[calc(100vh-7rem)] overflow-y-auto pb-8'>
                            <TableOfContents headings={tocHeadings} />
                        </div>
                    </FadeIn>
                </aside>
            </div>
        </div>
    );
}
