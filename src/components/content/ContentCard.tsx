'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Calendar, Clock } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface IContentCardProps {
  /** Link href */
  href: string;
  /** Card title */
  title: string;
  /** Card description */
  description?: string;
  /** Tags/categories */
  tags?: string[];
  /** Published date */
  date?: Date | string;
  /** Reading time in minutes */
  readingTime?: number;
  /** Card variant */
  variant?: 'default' | 'featured' | 'compact';
  /** Animation delay index */
  index?: number;
  /** Additional className */
  className?: string;
}

/**
 * Premium Content Card
 * 
 * Used for articles, notes, and other content items.
 * Features subtle hover animations and clean typography.
 */
export const ContentCard = ({
  href,
  title,
  description,
  tags,
  date,
  readingTime,
  variant = 'default',
  index = 0,
  className,
}: IContentCardProps) => {
  const isFeatured = variant === 'featured';
  const isCompact = variant === 'compact';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn('group relative', className)}
    >
      <Link href={href} className="block">
        <div
          className={cn(
            'relative rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 transition-all duration-300',
            'hover:border-[var(--border-hover)] hover:shadow-lg',
            'dark:hover:shadow-[0_0_30px_-10px_var(--glow-color)]',
            isFeatured && 'p-8 md:p-10',
            isCompact && 'p-4',
          )}
        >
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium uppercase tracking-wider text-[var(--accent)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h3
            className={cn(
              'font-medium text-[var(--fg)] transition-colors group-hover:text-[var(--accent)]',
              isFeatured ? 'text-2xl md:text-3xl' : 'text-lg md:text-xl',
              isCompact && 'text-base',
            )}
          >
            {title}
          </h3>

          {/* Description */}
          {description && !isCompact && (
            <p
              className={cn(
                'mt-3 text-[var(--fg-muted)] line-clamp-2',
                isFeatured ? 'text-base md:text-lg' : 'text-sm',
              )}
            >
              {description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 mt-4 text-xs text-[var(--fg-subtle)]">
            {date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3" />
                <time dateTime={new Date(date).toISOString()}>
                  {formatDate(date)}
                </time>
              </span>
            )}
            {readingTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="size-3" />
                {readingTime} min read
              </span>
            )}
          </div>

          {/* Arrow indicator */}
          <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="size-5 text-[var(--accent)]" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default ContentCard;
