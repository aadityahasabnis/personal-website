'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Eye } from 'lucide-react';
import { FadeIn, StaggerChildren } from '@/components/motion';
import type { IContent } from '@/interfaces';

interface IFeaturedArticlesProps {
  articles: IContent[];
}

/**
 * Featured Articles Section for homepage
 */
export const FeaturedArticles = ({ articles }: IFeaturedArticlesProps) => {
  if (!articles?.length) return null;

  return (
    <section className="py-24 relative">
      <div className="container-wide">
        {/* Section Header */}
        <FadeIn className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <span className="label text-[var(--accent)] mb-2 block">Latest Articles</span>
            <h2 className="heading-2 text-[var(--fg)]">
              Recent Writings
            </h2>
          </div>
          <Link
            href="/articles"
            className="group inline-flex items-center gap-2 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
          >
            View all articles
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </FadeIn>

        {/* Articles Grid */}
        <StaggerChildren className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <ArticleCard key={article._id?.toString() ?? article.slug} article={article} />
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
};

interface IArticleCardProps {
  article: IContent;
}

const ArticleCard = ({ article }: IArticleCardProps) => {
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  return (
    <Link href={`/articles/${article.slug}`} className="group block">
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="card-premium h-full flex flex-col"
      >
        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent-subtle)] text-[var(--accent)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="heading-4 text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors mb-3 line-clamp-2">
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p className="body-base text-[var(--fg-muted)] line-clamp-2 mb-4 flex-1">
            {article.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 text-[var(--fg-subtle)] body-small mt-auto pt-4 border-t border-[var(--border-color)]">
          {formattedDate && (
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-3.5" />
              {formattedDate}
            </span>
          )}
          {article.readingTime && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {article.readingTime} min
            </span>
          )}
        </div>
      </motion.article>
    </Link>
  );
};

export default FeaturedArticles;
