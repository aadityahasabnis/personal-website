# Lazy Loading and Infinite Scroll SEO Guide

## Purpose

Define search-safe lazy-loading and paginated loading patterns.

## Lazy-Loading Rules

- Load important content when it enters viewport.
- Do not require click/swipe-only interactions for core indexable content.
- Avoid lazy-loading content that is immediately above the fold.

Preferred mechanisms:

- Native lazy loading where applicable
- IntersectionObserver-based loading

## Infinite Scroll Rules

To make infinite-scroll content indexable:

1. Provide paginated URLs with stable content per URL.
2. Use unique persistent URLs per chunk/page.
3. Link sequentially so crawlers can discover pages.
4. Update browser URL using History API when primary chunk changes.

Avoid:

- Date-relative URL states (for example dynamic "yesterday" pages).
- Endless content loads with no crawlable paginated endpoints.

## Project Standards

- Search/indexable archive pages must have URL-addressable pagination.
- Infinite UI may exist, but must be backed by crawlable paginated URLs.
- Canonical logic must remain consistent for paginated pages.

## Validation Steps

1. Inspect paginated URLs directly (200 + correct content).
2. Verify links between pages are crawlable anchors.
3. Check rendered HTML includes expected image/video `src` values.
4. Confirm key content appears in URL Inspection rendered HTML.
