# Crawling and Indexing Implementation Guide

## Goal

Ensure Google can discover, crawl, render, and index important content pages with minimal friction.

## Core Principles

- Every important page must be internally linked.
- Public pages should be server-rendered or statically generated where possible.
- Robots rules should block sensitive/private routes but not public resources required for indexing.
- Canonical URLs must be stable and consistent across metadata and sitemap.

## Crawlable Link Requirements

Use normal anchor elements:

```html
<a href="/articles/my-topic/my-article">My article</a>
```

Avoid JS-only navigation patterns without crawlable `href` values.

## JavaScript SEO for Next.js

For App Router pages:

- Keep core text content in server-rendered HTML.
- Keep JSON-LD rendered in server output.
- Avoid relying on client-only rendering for primary content.
- Keep route state URL-based, not hash-fragment based for indexable pages.

## URL Structure Standards

- Descriptive and human-readable slugs.
- Hyphen-separated words.
- Lowercase canonical URL output.
- Avoid unnecessary parameters for canonical pages.

## Canonicalization Standards

- Set canonical URL for every indexable route.
- Do not canonicalize paginated/multi-page content to unrelated pages.
- Canonical values in metadata and sitemap should match exactly.

## Robots and Indexing Controls

Use route-level controls intentionally:

- `index, follow` for public content and hubs.
- `noindex, follow` for search result pages with query states.
- Block admin and private endpoints in robots.
- Do not block resources that are needed for rendering/index understanding.

## Metadata Completeness Checklist

For all indexable public pages:

- Unique title
- Useful description
- Canonical
- Open Graph + Twitter image
- Robots directive
- JSON-LD where applicable

## Operational Workflow

1. Build or update route metadata.
2. Ensure internal links to route exist.
3. Confirm robots and sitemap coverage.
4. Validate with URL Inspection and Rich Results Test.
5. Track indexing in Search Console.
