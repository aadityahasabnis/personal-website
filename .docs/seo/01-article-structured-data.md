# Article Structured Data Standard

## Purpose

This standard defines how to implement `Article`-family structured data (`Article`, `BlogPosting`, `NewsArticle`, `TechArticle`) so Google can better understand article pages and potentially improve title, image, and publication-date presentation.

## Project Rule

For this codebase, article detail pages should emit JSON-LD with:

- `@type`: `BlogPosting` and `TechArticle` (current pattern)
- `headline`
- `description`
- `image`
- `author`
- `publisher`
- `datePublished` (when available)
- `dateModified`
- `mainEntityOfPage`
- `articleSection`
- `keywords`
- `inLanguage`

## Recommended Author Markup (Google best practice)

Use `Person` for individuals and `Organization` for organizations.

Preferred shape:

```json
{
    "author": [
        {
            "@type": "Person",
            "name": "Aaditya Hasabnis",
            "url": "https://aadityahasabnis.com/about"
        }
    ],
    "publisher": {
        "@type": "Organization",
        "name": "Aaditya Hasabnis",
        "url": "https://aadityahasabnis.com"
    }
}
```

Notes:

- Do not mix extra text in `author.name`.
- If multiple authors exist, use one object per author in an array.
- `url` or `sameAs` should resolve to valid public pages.

## Recommended Image Markup

Google recommends representative, crawlable, high-resolution images and ideally multiple aspect ratios:

- 1:1
- 4:3
- 16:9

Preferred shape:

```json
{
    "image": ["https://example.com/images/article-1x1.jpg", "https://example.com/images/article-4x3.jpg", "https://example.com/images/article-16x9.jpg"]
}
```

If only one image is available, use a fully-qualified absolute URL and ensure it is crawlable.

## Date and Time Rules

- Use ISO 8601 for `datePublished` and `dateModified`.
- Include timezone when possible.
- `dateModified` should be the last meaningful content update.

## JSON-LD Pattern for This Project

```json
{
    "@context": "https://schema.org",
    "@type": ["TechArticle", "BlogPosting"],
    "@id": "https://aadityahasabnis.com/articles/topic-slug/article-slug",
    "url": "https://aadityahasabnis.com/articles/topic-slug/article-slug",
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://aadityahasabnis.com/articles/topic-slug/article-slug"
    },
    "headline": "Article title",
    "description": "Article summary",
    "image": "https://cdn.example.com/article-cover.jpg",
    "author": {
        "@id": "https://aadityahasabnis.com/#person"
    },
    "publisher": {
        "@id": "https://aadityahasabnis.com/#person"
    },
    "datePublished": "2026-04-01T10:00:00+05:30",
    "dateModified": "2026-04-10T14:30:00+05:30",
    "articleSection": "System Design",
    "keywords": "system design, web architecture",
    "inLanguage": "en-US",
    "isAccessibleForFree": true
}
```

## Validation Workflow

1. Validate with Rich Results Test.
2. Validate with Schema Markup Validator.
3. Use URL Inspection to confirm crawlability and rendered JSON-LD.
4. Revalidate when article templates or metadata helpers change.

## Common Errors to Avoid

- Relative image URLs in schema.
- Author represented as a plain string when richer object is available.
- `dateModified` missing on updated articles.
- Non-crawlable image URLs (blocked by robots or auth).
- JSON-LD only in client-side code that does not reliably render for crawlers.
