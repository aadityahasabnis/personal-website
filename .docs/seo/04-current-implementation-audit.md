# Current SEO and Structured Data Audit

Audit date: 2026-04-17

## Scope Reviewed

- `src/lib/seo.tsx`
- `src/lib/metadata.ts`
- `src/app/(public)/articles/[topicSlug]/[articleSlug]/page.tsx`
- `src/app/(public)/articles/[topicSlug]/page.tsx`
- `src/app/(public)/articles/page.tsx`
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/app/layout.tsx`
- `src/constants/siteConstants.ts`

## Summary

Status: Mostly strong baseline with a few high-impact corrections recommended.

The project already implements:

- Server-rendered JSON-LD for article and collection pages.
- Person, WebSite, WebPage, Breadcrumb, and article schemas.
- Canonical metadata factory with social metadata.
- Dynamic sitemap from current public content providers.
- Robots route with sitemap references.

## Verification Against Google Article Guidance

1. `@type` coverage: Pass

- Uses `TechArticle` and `BlogPosting` for articles.

2. `headline`: Pass

- Present on article detail schema.

3. `author` richness: Partial

- Author references `#person` node, which is good graph linking.
- Recommended improvement: include explicit `@type` and `url` directly in article `author` object or ensure person node is always included in same graph for all article responses.

4. `datePublished`: Pass (conditional)

- Included when available.

5. `dateModified`: Pass

- Included from article update value.

6. `image`: Partial

- Uses a single representative image URL.
- Recommended improvement: provide multiple aspect ratios (1:1, 4:3, 16:9) where feasible.

7. JSON-LD placement and render path: Pass

- Emitted server-side through shared `JsonLd` helper.

## Crawling and Indexing Review

1. Robots policy: Mostly good

- Correctly blocks private/admin/api routes.
- Potential risk: global `/api` disallow may block crawl of generated OG image endpoints under `/api/og` if those URLs are used as primary schema image values.

2. Sitemap generation: Good baseline

- Includes key static and dynamic public routes.
- Recommended improvement: use real content modification timestamps for detail URLs instead of `now` where data is available.

3. Canonical and metadata consistency: Good

- Shared factory keeps route-level metadata consistent.

4. Search route indexing behavior: Good intent

- Search route is feature-gated and conditionally included.

## High-Priority Fixes

1. Absolute image URL composition bug risk

- In `src/lib/seo.tsx`, fallback image concatenation uses `SITE_CONFIG.url + SITE_CONFIG.seo.ogImage` even though `ogImage` is already absolute in site constants.
- This can produce malformed URLs like `https://aadityahasabnis.comhttps://cdn...`.

2. Same absolute URL bug risk in article page fallback

- In `src/app/(public)/articles/[topicSlug]/[articleSlug]/page.tsx`, the article schema fallback repeats the same concatenation pattern.

3. Optional but recommended schema enhancement

- Move publisher to `Organization` node for stronger publisher semantics.

## Medium-Priority Improvements

1. Add article image arrays where available

- Prefer three aspect ratios in `image` arrays for richer eligibility signals.

2. Improve sitemap `lastmod` fidelity

- Populate from content-level timestamps whenever available.

3. Extend automated SEO tests

- Add tests that verify valid absolute image URLs in generated JSON-LD.
- Add regression checks for canonical/schema alignment.

## Suggested Implementation Order

1. Fix absolute OG image fallback URL composition.
2. Add JSON-LD unit tests for article/person/image URL correctness.
3. Upgrade article schema image handling to ratio arrays when assets exist.
4. Improve sitemap `lastmod` values for detail pages.
5. Re-run Rich Results and URL Inspection for representative pages.

## Post-Change Validation

- Rich Results Test for at least one article URL.
- URL Inspection for article, topic, and index pages.
- Search Console sitemap re-submit and monitor crawl/index reports.
