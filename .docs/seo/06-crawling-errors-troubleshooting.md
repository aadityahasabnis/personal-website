# Crawling Errors Troubleshooting Guide

## Purpose

This guide provides a repeatable process for diagnosing and fixing crawl-related issues.

## Diagnostic Sequence

1. Check host availability in Search Console Crawl Stats.
2. Identify important URLs not being crawled.
3. Check if updated URLs are discovered quickly enough.
4. Improve crawl efficiency (performance, cache headers, URL hygiene).
5. Handle emergency overcrawling if needed.

## Common Problem Areas

### Availability and Host Load

Symptoms:

- Crawl drops
- Host availability warnings
- Slow crawl throughput

Actions:

- Improve server response times.
- Scale infrastructure when sustained load limits are reached.
- Temporarily use `503` or `429` during overload emergencies.

### Important URLs Not Crawled

Checks:

- URL is linked internally.
- URL exists in sitemap.
- URL is not blocked by robots or auth.
- Canonical setup is coherent.

Actions:

- Add internal links.
- Update sitemap.
- Remove accidental crawl blocks.

### Updates Crawled Too Slowly

Actions:

- Keep `lastmod` accurate.
- Use crawlable links and stable URL structures.
- Avoid resubmitting unchanged sitemaps repeatedly.

## Crawl Efficiency Improvements

- Reduce redirect chains.
- Improve rendering performance.
- Block only non-critical crawl waste URLs.
- Use proper HTTP caching headers:
    - `ETag` and `If-None-Match`
    - `Last-Modified` and `If-Modified-Since`

## Soft 404 Handling

If content is gone:

- Return `404` or `410`.

If content moved:

- Return `301` to the best replacement URL.

If content still exists:

- Ensure rendered output contains real primary content and required resources.

## Emergency Overcrawling Procedure

1. Temporarily return `503` or `429` under real overload.
2. Remove emergency responses once load normalizes.
3. Monitor recovery trend.
4. Investigate root cause and prevent recurrence.

## Project-Specific Priority Checks

- Ensure public content routes are reachable from internal navigation.
- Keep dynamic/search-like parameterized URLs out of crawl-critical pathways.
- Keep API/private/admin paths non-indexable and excluded from crawl focus.
