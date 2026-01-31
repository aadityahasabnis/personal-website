import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { type IArticle } from '@/interfaces';

interface ISeriesNavProps {
    seriesTitle: string;
    seriesSlug: string;
    articles: Pick<IArticle, 'slug' | 'title'>[];
    currentSlug: string;
    className?: string;
}

/**
 * SeriesNav - Server Component for navigating articles in a series
 */
const SeriesNav = ({
    seriesTitle,
    seriesSlug,
    articles,
    currentSlug,
    className,
}: ISeriesNavProps) => {
    const currentIndex = articles.findIndex((a) => a.slug === currentSlug);
    const prevArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;
    const nextArticle =
        currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;

    return (
        <nav
            className={cn(
                'rounded-lg border bg-muted/50 p-4',
                className
            )}
            aria-label="Series navigation"
        >
            {/* Series header */}
            <div className="mb-4 flex items-center justify-between">
                <Link
                    href={`/series/${seriesSlug}`}
                    className="text-sm font-medium text-primary hover:underline"
                >
                    {seriesTitle}
                </Link>
                <span className="text-sm text-muted-foreground">
                    {currentIndex + 1} of {articles.length}
                </span>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between gap-4">
                {prevArticle ? (
                    <Button variant="ghost" size="sm" asChild className="max-w-[45%]">
                        <Link
                            href={`/articles/${prevArticle.slug}`}
                            className="flex items-center gap-1"
                        >
                            <ChevronLeft className="h-4 w-4 shrink-0" />
                            <span className="truncate">{prevArticle.title}</span>
                        </Link>
                    </Button>
                ) : (
                    <div />
                )}

                {nextArticle ? (
                    <Button variant="ghost" size="sm" asChild className="max-w-[45%]">
                        <Link
                            href={`/articles/${nextArticle.slug}`}
                            className="flex items-center gap-1"
                        >
                            <span className="truncate">{nextArticle.title}</span>
                            <ChevronRight className="h-4 w-4 shrink-0" />
                        </Link>
                    </Button>
                ) : (
                    <div />
                )}
            </div>
        </nav>
    );
};

export { SeriesNav };
export type { ISeriesNavProps };
