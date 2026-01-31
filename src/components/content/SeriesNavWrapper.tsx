import { getSeries, getSeriesArticles } from '@/server/queries/content';
import { SeriesNav } from './SeriesNav';

interface ISeriesNavWrapperProps {
    seriesSlug: string;
    currentSlug: string;
}

/**
 * SeriesNavWrapper - Server Component that fetches series data and renders SeriesNav
 *
 * Wrap in Suspense for streaming:
 * <Suspense fallback={null}>
 *   <SeriesNavWrapper seriesSlug={article.seriesSlug} currentSlug={slug} />
 * </Suspense>
 */
const SeriesNavWrapper = async ({
    seriesSlug,
    currentSlug,
}: ISeriesNavWrapperProps) => {
    // Fetch series and articles in parallel
    const [series, articles] = await Promise.all([
        getSeries(seriesSlug),
        getSeriesArticles(seriesSlug),
    ]);

    if (!series || articles.length === 0) return null;

    return (
        <SeriesNav
            seriesTitle={series.title}
            seriesSlug={seriesSlug}
            articles={articles}
            currentSlug={currentSlug}
        />
    );
};

export { SeriesNavWrapper };
export type { ISeriesNavWrapperProps };
