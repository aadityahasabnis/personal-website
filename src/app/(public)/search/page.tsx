import type { Metadata } from 'next';
import Link from 'next/link';

import { PUBLIC_READ_CONTENT_TYPE_VALUES, type PublicReadContentType } from '@/constants/schemaConstants';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { getPublishedContentSearchResults } from '@/server/new/public/content/search';

interface ISearchPageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const SEARCH_QUERY_PARAM = SITE_CONFIG.seo.search.queryParam;
const SEARCH_PATH = SITE_CONFIG.seo.search.path;
const MIN_QUERY_LENGTH = SITE_CONFIG.seo.search.minQueryLength;
const RESULT_LIMIT = SITE_CONFIG.seo.search.resultLimit;

const getSingleParam = (params: Record<string, string | string[] | undefined>, key: string): string | undefined => {
    const value = params[key];
    if (Array.isArray(value)) return value[0];
    return value;
};

const normalizeQuery = (value: string | undefined): string => {
    return typeof value === 'string' ? value.trim() : '';
};

const isPublicReadContentType = (value: string): value is PublicReadContentType => {
    return PUBLIC_READ_CONTENT_TYPE_VALUES.includes(value as PublicReadContentType);
};

const parseContentTypes = (raw: string | undefined): PublicReadContentType[] | undefined => {
    if (!raw) return undefined;

    const parsed = raw
        .split(',')
        .map((item) => item.trim())
        .filter(isPublicReadContentType);

    return parsed.length > 0 ? parsed : undefined;
};

const toSearchHref = (query: string, type?: PublicReadContentType): string => {
    const params = new URLSearchParams({ [SEARCH_QUERY_PARAM]: query });

    if (type) {
        params.set('contentTypes', type);
    }

    return `${SEARCH_PATH}?${params.toString()}`;
};

const typeLabel = (type: PublicReadContentType): string => {
    switch (type) {
        case 'article':
            return 'Article';
        case 'blog':
            return 'Blog';
        case 'project':
            return 'Project';
        default:
            return type;
    }
};

export const dynamic = 'force-dynamic';

export const generateMetadata = async ({ searchParams }: ISearchPageProps): Promise<Metadata> => {
    const params = await searchParams;
    const query = normalizeQuery(getSingleParam(params, SEARCH_QUERY_PARAM));
    const hasQuery = query.length >= MIN_QUERY_LENGTH;

    return createPageMetadata({
        title: hasQuery ? `Search: ${query}` : 'Search',
        description: `Search ${SITE_CONFIG.name} content across articles, blogs, and projects.`,
        canonicalPath: SEARCH_PATH,
        robots: hasQuery
            ? {
                  index: false,
                  follow: true,
              }
            : {
                  index: true,
                  follow: true,
              },
    });
};

export default async function SearchPage({ searchParams }: ISearchPageProps) {
    const params = await searchParams;
    const query = normalizeQuery(getSingleParam(params, SEARCH_QUERY_PARAM));
    const contentTypes = parseContentTypes(getSingleParam(params, 'contentTypes'));
    const featuredOnly = getSingleParam(params, 'featuredOnly') === 'true';

    const hasSearch = query.length >= MIN_QUERY_LENGTH;

    const result = hasSearch
        ? await getPublishedContentSearchResults({
              query,
              ...(contentTypes ? { contentTypes } : {}),
              featuredOnly,
              pagination: {
                  offset: 0,
                  limit: RESULT_LIMIT,
              },
          })
        : null;

    const rows = result?.success ? result.data : [];

    return (
        <div className='max-w-4xl mx-auto px-6 lg:px-8 py-24 md:py-32'>
            <header className='mb-10'>
                <p className='text-xs font-medium uppercase tracking-widest text-(--fg-muted)'>Site Search</p>
                <h1 className='mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-(--fg)'>Search</h1>
                <p className='mt-4 text-(--fg-muted)'>Find articles, blogs, and projects by keyword.</p>
            </header>

            <form method='get' action={SEARCH_PATH} className='mb-8'>
                <label htmlFor='search-query' className='sr-only'>
                    Search query
                </label>
                <input
                    id='search-query'
                    name={SEARCH_QUERY_PARAM}
                    defaultValue={query}
                    placeholder='Search by title, description, tags'
                    className='w-full rounded-lg border border-(--border-color) bg-(--card-bg) px-4 py-3 text-(--fg) focus:outline-none focus:ring-2 focus:ring-(--accent)'
                />
            </form>

            {query.length > 0 && query.length < MIN_QUERY_LENGTH && <p className='mb-8 text-(--fg-muted)'>Enter at least {MIN_QUERY_LENGTH} characters to search.</p>}

            {!hasSearch && (
                <div className='space-y-3 text-sm text-(--fg-muted)'>
                    <p>Try one of these quick filters:</p>
                    <div className='flex flex-wrap gap-2'>
                        {PUBLIC_READ_CONTENT_TYPE_VALUES.map((type) => (
                            <Link
                                key={type}
                                href={toSearchHref('next', type)}
                                className='inline-flex rounded-full border border-(--border-color) px-3 py-1 hover:border-(--accent) hover:text-(--accent)'
                            >
                                {typeLabel(type)}
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {hasSearch && result?.success && (
                <section>
                    <p className='mb-6 text-sm text-(--fg-muted)'>
                        {rows.length} result{rows.length === 1 ? '' : 's'} for "{query}"
                    </p>

                    {rows.length === 0 ? (
                        <p className='text-(--fg-muted)'>No matching content found.</p>
                    ) : (
                        <ul className='space-y-4'>
                            {rows.map((row) => (
                                <li key={row.id} className='rounded-xl border border-(--border-color) p-5'>
                                    <p className='mb-2 text-xs uppercase tracking-widest text-(--fg-muted)'>{typeLabel(row.type)}</p>
                                    <Link href={row.path} className='text-lg font-medium text-(--fg) hover:text-(--accent)'>
                                        {row.title}
                                    </Link>
                                    <p className='mt-2 text-sm text-(--fg-muted)'>{row.description}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}

            {hasSearch && result && !result.success && <p className='text-(--fg-muted)'>Unable to load search results right now.</p>}
        </div>
    );
}
