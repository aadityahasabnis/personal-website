import { getArticlesByTag } from '@/server/queries/content';
import { ArticleCard } from './ArticleCard';

interface IRelatedPostsProps {
    currentSlug: string;
    tags: string[];
    limit?: number;
}

/**
 * RelatedPosts - Server Component that fetches and displays related articles
 * 
 * Streams via Suspense - doesn't block main content render
 * 
 * Usage:
 * <Suspense fallback={<Skeleton className="h-48" />}>
 *   <RelatedPosts currentSlug={slug} tags={tags} />
 * </Suspense>
 */
const RelatedPosts = async ({ currentSlug, tags, limit = 3 }: IRelatedPostsProps) => {
    if (!tags || tags.length === 0) return null;

    // Fetch articles with matching tags
    const articles = await getArticlesByTag(tags[0], limit + 1);

    // Filter out current article
    const relatedArticles = articles
        .filter((article) => article.slug !== currentSlug)
        .slice(0, limit);

    if (relatedArticles.length === 0) return null;

    return (
        <section className="mt-12 border-t pt-8">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">
                Related Articles
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedArticles.map((article) => (
                    <ArticleCard
                        key={article.slug}
                        article={article}
                        variant="compact"
                    />
                ))}
            </div>
        </section>
    );
};

export { RelatedPosts };
export type { IRelatedPostsProps };
