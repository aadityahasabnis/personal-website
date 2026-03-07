import { getRecentArticles } from '@/server/queries/content';
import { SITE_CONFIG } from '@/constants';

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

function buildRfc822Date(date: Date | undefined): string {
    if (!date) return new Date().toUTCString();
    return new Date(date).toUTCString();
}

export async function GET(): Promise<Response> {
    const articles = await getRecentArticles(50);

    const items = articles
        .map((article) => {
            const url = `${SITE_CONFIG.url}/articles/${article.topicSlug}/${article.slug}`;
            const title = escapeXml(article.title);
            const description = escapeXml(article.description ?? '');
            const pubDate = buildRfc822Date(article.publishedAt);
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
      ${article.tags?.map((tag) => `<category>${escapeXml(tag)}</category>`).join('\n      ') ?? ''}
      ${coverImage}
    </item>`.trim();
        })
        .join('\n\n  ');

    const lastBuildDate = articles[0]?.publishedAt
        ? buildRfc822Date(articles[0].publishedAt)
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
    <language>en-us</language>
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
