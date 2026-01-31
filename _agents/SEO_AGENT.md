# SEO Agent (SEO)

> **Role:** Agentic – Runs automatically  
> **Purpose:** Optimize all pages for search engines and social sharing

---

## Overview

The SEO Agent ensures every page is optimized for search engines. It handles metadata, structured data, sitemaps, robots.txt, and Open Graph images.

---

## Responsibilities

### 1. Metadata
- Page titles and descriptions
- Canonical URLs
- Robots directives

### 2. Structured Data
- Article schema
- Person schema
- Website schema
- Breadcrumb schema

### 3. Social Sharing
- Open Graph meta tags
- Twitter card meta tags
- OG image generation

### 4. Technical SEO
- Sitemap generation
- Robots.txt configuration
- Heading hierarchy

---

## Implementation

### Metadata Component

```tsx
// app/(public)/articles/[slug]/page.tsx
import { type Metadata } from 'next';
import { getArticle } from '@/server/queries/content';
import { SITE_CONFIG } from '@/constants/siteConfig';

interface IPageProps {
    params: { slug: string };
}

export const generateMetadata = async ({ params }: IPageProps): Promise<Metadata> => {
    const article = await getArticle(params.slug);
    
    if (!article) {
        return { title: 'Not Found' };
    }
    
    const title = article.seo?.title ?? article.title;
    const description = article.seo?.description ?? article.description ?? '';
    const ogImage = article.seo?.image ?? `/api/og/${article.slug}`;
    
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'article',
            publishedTime: article.publishedAt?.toISOString(),
            authors: [SITE_CONFIG.author.name],
            images: [{ url: ogImage, width: 1200, height: 630 }]
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [ogImage]
        },
        alternates: {
            canonical: `${SITE_CONFIG.url}/articles/${article.slug}`
        }
    };
};
```

### Structured Data

```tsx
// components/seo/StructuredData.tsx
import { type IArticle } from '@/interfaces/content';
import { SITE_CONFIG } from '@/constants/siteConfig';

interface IArticleStructuredDataProps {
    article: IArticle;
}

const ArticleStructuredData = ({ article }: IArticleStructuredDataProps) => {
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.description,
        author: {
            '@type': 'Person',
            name: SITE_CONFIG.author.name,
            url: SITE_CONFIG.url
        },
        publisher: {
            '@type': 'Person',
            name: SITE_CONFIG.author.name
        },
        datePublished: article.publishedAt?.toISOString(),
        dateModified: article.updatedAt?.toISOString(),
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE_CONFIG.url}/articles/${article.slug}`
        }
    };
    
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
};

export { ArticleStructuredData };
```

### Sitemap Generator

```typescript
// app/sitemap.ts
import { type MetadataRoute } from 'next';
import { getPublishedContent } from '@/server/queries/content';
import { SITE_CONFIG } from '@/constants/siteConfig';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const content = await getPublishedContent();
    
    const contentEntries = content.map(item => ({
        url: `${SITE_CONFIG.url}/${item.type === 'article' ? 'articles' : item.type}/${item.slug}`,
        lastModified: item.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: item.type === 'article' ? 0.8 : 0.6
    }));
    
    return [
        {
            url: SITE_CONFIG.url,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1
        },
        {
            url: `${SITE_CONFIG.url}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8
        },
        ...contentEntries
    ];
}
```

### OG Image Generation

```tsx
// app/api/og/[slug]/route.tsx
import { ImageResponse } from 'next/og';
import { getArticle } from '@/server/queries/content';
import { SITE_CONFIG } from '@/constants/siteConfig';

export const runtime = 'edge';

export const GET = async (
    request: Request,
    { params }: { params: { slug: string } }
): Promise<ImageResponse> => {
    const article = await getArticle(params.slug);
    
    return new ImageResponse(
        (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%',
                    padding: '60px',
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    color: '#ffffff'
                }}
            >
                <div style={{ fontSize: 64, fontWeight: 'bold', marginBottom: 20 }}>
                    {article?.title ?? 'Article'}
                </div>
                <div style={{ fontSize: 32, opacity: 0.8 }}>
                    {SITE_CONFIG.author.name}
                </div>
            </div>
        ),
        { width: 1200, height: 630 }
    );
};
```

---

## SEO Checklist

- [ ] Every page has unique title (< 60 chars)
- [ ] Every page has meta description (< 160 chars)
- [ ] Canonical URLs set on all pages
- [ ] Structured data validates in Google's tool
- [ ] OG images generate correctly
- [ ] Sitemap includes all published content
- [ ] robots.txt allows indexing

---

*Agent Version: 1.0*
