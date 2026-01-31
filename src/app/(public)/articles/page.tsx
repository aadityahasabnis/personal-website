import { Suspense } from 'react';
import type { Metadata } from 'next';

import { getRecentArticles, getFeaturedArticles } from '@/server/queries/content';
import { SITE_CONFIG } from '@/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { ContentCard } from '@/components/content/ContentCard';
import { ArticlesGridSkeleton } from '@/components/feedback/Skeleton';

export const metadata: Metadata = {
  title: 'Articles',
  description: `Read articles about software development, technology, and more by ${SITE_CONFIG.author.name}.`,
  openGraph: {
    title: 'Articles',
    description: `Read articles about software development, technology, and more by ${SITE_CONFIG.author.name}.`,
  },
};

// ISR: Revalidate every 30 minutes
export const revalidate = 1800;

/**
 * Featured Articles Section - Server Component
 */
async function FeaturedArticles() {
  const featured = await getFeaturedArticles(2);

  if (featured.length === 0) return null;

  return (
    <section className="mb-16">
      <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--fg-muted)] mb-6">
        Featured
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {featured.map((article, i) => (
          <ContentCard
            key={article.slug}
            href={`/articles/${article.slug}`}
            title={article.title}
            description={article.description}
            tags={article.tags}
            date={article.publishedAt}
            readingTime={article.readingTime}
            variant="featured"
            index={i}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Recent Articles Section - Server Component
 */
async function RecentArticles() {
  const articles = await getRecentArticles(12);

  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--fg-muted)] text-lg">
          No articles yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <section>
      <h2 className="text-xs font-medium uppercase tracking-widest text-[var(--fg-muted)] mb-6">
        All Articles
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {articles.map((article, i) => (
          <ContentCard
            key={article.slug}
            href={`/articles/${article.slug}`}
            title={article.title}
            description={article.description}
            tags={article.tags}
            date={article.publishedAt}
            readingTime={article.readingTime}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Articles Page
 * 
 * Static + ISR page listing all published articles.
 * Features premium design with animated cards.
 */
export default function ArticlesPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-8 py-20 md:py-28">
      {/* Page Header */}
      <PageHeader
        label="Writing"
        title="Articles"
        description="Thoughts on software development, technology, and building things that matter. Long-form writing on topics I find interesting."
      />

      {/* Featured Section */}
      <Suspense fallback={null}>
        <FeaturedArticles />
      </Suspense>

      {/* Article Grid */}
      <Suspense fallback={<ArticlesGridSkeleton />}>
        <RecentArticles />
      </Suspense>
    </div>
  );
}
