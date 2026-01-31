import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

import { cn, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { type IArticle } from '@/interfaces';

interface IArticleCardProps {
    article: IArticle;
    variant?: 'default' | 'compact' | 'featured';
    className?: string;
}

/**
 * ArticleCard - Server Component for displaying article previews
 * Used in article listings, related posts, and featured sections
 */
const ArticleCard = ({ article, variant = 'default', className }: IArticleCardProps) => {
    const isFeatured = variant === 'featured';
    const isCompact = variant === 'compact';

    return (
        <Card
            className={cn(
                'group relative overflow-hidden transition-all duration-300',
                'hover:shadow-lg hover:border-primary/20',
                'dark:hover:border-primary/40',
                isFeatured && 'md:col-span-2 md:row-span-2',
                className
            )}
        >
            <Link
                href={`/articles/${article.slug}`}
                className="block h-full p-6"
            >
                {/* Cover Image for featured variant */}
                {isFeatured && article.coverImage && (
                    <div className="relative mb-4 aspect-video overflow-hidden rounded-lg">
                        <img
                            src={article.coverImage}
                            alt={article.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    </div>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && !isCompact && (
                    <div className="mb-3 flex flex-wrap gap-2">
                        {article.tags.slice(0, 3).map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs font-medium"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                {/* Title */}
                <h3
                    className={cn(
                        'font-semibold tracking-tight transition-colors',
                        'group-hover:text-primary',
                        isFeatured ? 'text-2xl md:text-3xl' : isCompact ? 'text-base' : 'text-xl'
                    )}
                >
                    {article.title}
                </h3>

                {/* Description */}
                {article.description && !isCompact && (
                    <p className="mt-2 line-clamp-2 text-muted-foreground">
                        {article.description}
                    </p>
                )}

                {/* Meta */}
                <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                    {article.publishedAt && (
                        <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <time dateTime={new Date(article.publishedAt).toISOString()}>
                                {formatDate(article.publishedAt)}
                            </time>
                        </span>
                    )}
                    {article.readingTime && (
                        <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {article.readingTime} min read
                        </span>
                    )}
                </div>

                {/* Read more indicator for featured */}
                {isFeatured && (
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                        Read article
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                )}
            </Link>
        </Card>
    );
};

export { ArticleCard };
export type { IArticleCardProps };
