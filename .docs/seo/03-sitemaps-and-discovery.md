# Sitemaps and Discovery Strategy

## Objective

Provide high-quality URL discovery signals for Google while keeping sitemap output accurate and maintainable.

## Current Format

This project uses a dynamic Next.js sitemap route (`/sitemap.xml`) generated from public content providers.

## Sitemap Quality Rules

- Include only canonical, indexable URLs.
- Use fully-qualified absolute URLs.
- Keep `lastmod` accurate and meaningful.
- Keep sitemap at root scope when possible.

## Important Google Notes

- Google ignores `priority` and `changefreq`.
- `lastmod` is useful only when accurate and verifiable.
- Sitemap helps discovery but does not guarantee indexing.

## Scale Limits

Per sitemap file:

- Maximum 50,000 URLs
- Maximum 50MB uncompressed

If limits are exceeded:

- Split into multiple sitemap files
- Add a sitemap index file

## Optional Extensions

Use extensions only when content warrants them:

- Image sitemap tags for image-heavy pages
- News sitemap tags for recent news publishing workflows
- Video sitemap tags for embedded or hosted video-centric pages

## Robots Integration

Always list sitemap URL(s) in robots output.

Example:

```txt
Sitemap: https://aadityahasabnis.com/sitemap.xml
```

## Implementation Notes for This Project

- Continue generating sitemap from canonical public server actions.
- Keep detail URLs synchronized with route structure (`/articles`, `/blogs`, `/projects`).
- Prefer content-level `updatedAt` values for `lastmod` where available.
- Keep search result query URLs out of sitemap.

## Validation Checklist

1. Open sitemap URL and verify valid XML output.
2. Ensure all listed URLs are 200 and canonical.
3. Ensure blocked/private routes are excluded.
4. Submit in Search Console and monitor processing warnings.
