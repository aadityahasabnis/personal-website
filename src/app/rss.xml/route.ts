import { SITE_CONFIG } from '@/constants/siteConstants';
import {
    getPublishedArticleByPath,
    getPublishedArticleStaticPaths,
} from '@/server/new/public/content/article';

export const dynamic = 'force-static';
export const revalidate = 3600; // 1 hour

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function buildRfc822Date(date: Date | string | undefined | null): string {
    if (!date) return new Date().toUTCString();
    return new Date(date).toUTCString();
}

interface IRssArticle {
    topicSlug: string;
    articleSlug: string;
    title: string;
    description: string;
    tags: string[];
    coverImage: string | null;
    publishedAt: string | null;
    updatedAt: string;
}

const loadRecentPublishedArticles = async (limit: number): Promise<IRssArticle[]> => {
    const pathsResult = await getPublishedArticleStaticPaths();
    if (!pathsResult.success) return [];

    const detailResults = await Promise.all(
        pathsResult.data.map((path) =>
            getPublishedArticleByPath(path.topicSlug, path.articleSlug).then((result) => ({
                result,
                topicSlug: path.topicSlug,
                articleSlug: path.articleSlug,
            }))
        )
    );

    const articles: IRssArticle[] = [];

    for (const row of detailResults) {
        if (!row.result.success || !row.result.data) {
            continue;
        }

        articles.push({
            topicSlug: row.topicSlug,
            articleSlug: row.articleSlug,
            title: row.result.data.title,
            description: row.result.data.seo?.description ?? row.result.data.description,
            tags: row.result.data.tags,
            coverImage: row.result.data.seo?.ogImage ?? row.result.data.coverImage,
            publishedAt: row.result.data.publishedAt,
            updatedAt: row.result.data.updatedAt,
        });
    }

    return articles
        .sort((a, b) => {
            const aTime = Date.parse(a.publishedAt ?? a.updatedAt);
            const bTime = Date.parse(b.publishedAt ?? b.updatedAt);
            return bTime - aTime;
        })
        .slice(0, limit);
};

export async function GET(): Promise<Response> {
    if (!SITE_CONFIG.seo.rssEnabled) {
        return new Response('RSS feed is disabled', { status: 404 });
    }

    const articles = await loadRecentPublishedArticles(50);

    const items = articles
        .map((article) => {
            const url = `${SITE_CONFIG.url}/articles/${article.topicSlug}/${article.articleSlug}`;
            const title = escapeXml(article.title);
            const description = escapeXml(article.description ?? '');
            const pubDate = buildRfc822Date(article.publishedAt);
            const categories = article.tags.length
                ? article.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ')
                : '';
            const coverImage = article.coverImage
                ? `<enclosure url="${escapeXml(article.coverImage)}" type="image/jpeg" />`
                : '';

            return `
    <item>
      <title>${title}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${description}</description>
      <pubDate>${pubDate}</pubDate>
      <author>${escapeXml(SITE_CONFIG.author.email)} (${escapeXml(SITE_CONFIG.author.name)})</author>
            ${categories}
      ${coverImage}
    </item>`.trim();
        })
        .join('\n\n  ');

        const lastBuildDate = articles[0]
                ? buildRfc822Date(articles[0].publishedAt ?? articles[0].updatedAt)
        : buildRfc822Date(new Date());

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE_CONFIG.name)}</title>
    <link>${SITE_CONFIG.url}</link>
    <description>${escapeXml(SITE_CONFIG.description)}</description>
        <language>${escapeXml(SITE_CONFIG.seo.feedLanguage)}</language>
    <managingEditor>${escapeXml(SITE_CONFIG.author.email)} (${escapeXml(SITE_CONFIG.author.name)})</managingEditor>
    <webMaster>${escapeXml(SITE_CONFIG.author.email)} (${escapeXml(SITE_CONFIG.author.name)})</webMaster>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <ttl>60</ttl>
    <atom:link href="${SITE_CONFIG.url}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}</url>
      <title>${escapeXml(SITE_CONFIG.name)}</title>
      <link>${SITE_CONFIG.url}</link>
    </image>

  ${items}
  </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}
