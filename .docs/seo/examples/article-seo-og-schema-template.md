# Reusable Article SEO + OG + Schema Template

## Purpose

Use this as a single source template for every new article so SEO metadata, social previews, and structured data stay aligned.

## 1) Fill This Input Block First

Replace these placeholders before generating metadata:

- `ARTICLE_TITLE`: The visible article title
- `SEO_TITLE`: Search title (usually `ARTICLE_TITLE | Aaditya Hasabnis`)
- `SEO_DESCRIPTION`: 150-160 character summary
- `OG_DESCRIPTION`: Social-first summary (can differ from SEO description)
- `TOPIC_SLUG`: Topic path segment
- `ARTICLE_SLUG`: Article path segment
- `CANONICAL_URL`: Full article URL
- `COVER_IMAGE_URL`: 1200x630 preferred
- `PUBLISHED_AT_ISO`: ISO 8601 datetime
- `MODIFIED_AT_ISO`: ISO 8601 datetime
- `ARTICLE_SECTION`: Category/section label
- `KEYWORDS`: Comma-separated keywords
- `TWITTER_HANDLE`: Optional account handle

## 2) Metadata Values (Reference)

Target shape for this project:

- SEO title: unique, <= 60 chars when possible
- SEO description: persuasive, <= 160 chars when possible
- Canonical: exact preferred URL
- Robots: `index, follow` for indexable article pages
- OG URL: same as canonical
- OG image: absolute, crawlable, stable

## 3) HTML Head Example

```html
<head>
    <title>SEO_TITLE</title>
    <meta name="description" content="SEO_DESCRIPTION" />
    <link rel="canonical" href="CANONICAL_URL" />
    <meta name="robots" content="index, follow" />

    <meta property="og:title" content="ARTICLE_TITLE | Aaditya Hasabnis" />
    <meta property="og:description" content="OG_DESCRIPTION" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="CANONICAL_URL" />
    <meta property="og:image" content="COVER_IMAGE_URL" />
    <meta property="og:site_name" content="Aaditya Hasabnis" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="ARTICLE_TITLE | Aaditya Hasabnis" />
    <meta name="twitter:description" content="OG_DESCRIPTION" />
    <meta name="twitter:image" content="COVER_IMAGE_URL" />
    <meta name="twitter:creator" content="TWITTER_HANDLE" />
</head>
```

## 4) JSON-LD Example (Article)

```json
{
    "@context": "https://schema.org",
    "@type": ["TechArticle", "BlogPosting"],
    "@id": "CANONICAL_URL",
    "url": "CANONICAL_URL",
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "CANONICAL_URL"
    },
    "headline": "ARTICLE_TITLE",
    "description": "SEO_DESCRIPTION",
    "image": ["COVER_IMAGE_URL"],
    "author": {
        "@type": "Person",
        "name": "Aaditya Hasabnis",
        "url": "https://aadityahasabnis.com/about"
    },
    "publisher": {
        "@type": "Organization",
        "name": "Aaditya Hasabnis",
        "url": "https://aadityahasabnis.com",
        "logo": {
            "@type": "ImageObject",
            "url": "https://aadityahasabnis.com/assets/logo.png"
        }
    },
    "datePublished": "PUBLISHED_AT_ISO",
    "dateModified": "MODIFIED_AT_ISO",
    "articleSection": "ARTICLE_SECTION",
    "keywords": "KEYWORDS",
    "inLanguage": "en-US",
    "isAccessibleForFree": true
}
```

## 5) Next.js App Router Example (Reusable Pattern)

```ts
import type { Metadata } from 'next';

interface ArticleSeoInput {
    title: string;
    seoTitle: string;
    seoDescription: string;
    ogDescription: string;
    canonicalUrl: string;
    coverImageUrl: string;
    publishedAtIso: string;
    modifiedAtIso: string;
    section: string;
    keywords: string;
}

export function buildArticleMetadata(input: ArticleSeoInput): Metadata {
    return {
        title: input.seoTitle,
        description: input.seoDescription,
        alternates: {
            canonical: input.canonicalUrl,
        },
        robots: {
            index: true,
            follow: true,
        },
        openGraph: {
            type: 'article',
            title: `${input.title} | Aaditya Hasabnis`,
            description: input.ogDescription,
            url: input.canonicalUrl,
            siteName: 'Aaditya Hasabnis',
            images: [
                {
                    url: input.coverImageUrl,
                    width: 1200,
                    height: 630,
                    alt: input.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${input.title} | Aaditya Hasabnis`,
            description: input.ogDescription,
            images: [input.coverImageUrl],
        },
    };
}
```

```ts
interface ArticleJsonLdInput {
    canonicalUrl: string;
    title: string;
    description: string;
    coverImageUrl: string;
    publishedAtIso: string;
    modifiedAtIso: string;
    section: string;
    keywords: string;
}

export function buildArticleJsonLd(input: ArticleJsonLdInput) {
    return {
        '@context': 'https://schema.org',
        '@type': ['TechArticle', 'BlogPosting'],
        '@id': input.canonicalUrl,
        url: input.canonicalUrl,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': input.canonicalUrl,
        },
        headline: input.title,
        description: input.description,
        image: [input.coverImageUrl],
        author: {
            '@type': 'Person',
            name: 'Aaditya Hasabnis',
            url: 'https://aadityahasabnis.com/about',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Aaditya Hasabnis',
            url: 'https://aadityahasabnis.com',
            logo: {
                '@type': 'ImageObject',
                url: 'https://aadityahasabnis.com/assets/logo.png',
            },
        },
        datePublished: input.publishedAtIso,
        dateModified: input.modifiedAtIso,
        articleSection: input.section,
        keywords: input.keywords,
        inLanguage: 'en-US',
        isAccessibleForFree: true,
    };
}
```

## 6) Publish Checklist (Per Article)

- Title and description finalized
- Canonical URL finalized and matches route
- OG tags populated and image verified
- JSON-LD valid and visible in server-rendered output
- Sitemap includes canonical URL

## 7) Validation Workflow

Run these after publish:

1. Google Rich Results Test (schema)
2. URL Inspection in Search Console (indexability and rendered HTML)
3. Facebook Sharing Debugger (OG)
4. Twitter Card Validator (card preview)
5. Bing Webmaster Tools (crawl/index checks)

## 8) Common Mistakes to Avoid

- Canonical, OG URL, and schema URL not matching
- Relative image URLs in OG/schema
- Missing `dateModified` after updates
- Multiple conflicting canonical tags
- Rendering JSON-LD only on the client
