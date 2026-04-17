# Canonicalization Implementation Guide

## Purpose

Define a consistent canonicalization strategy to consolidate duplicate signals and stabilize indexing.

## Canonical Signals (strength order)

1. Redirects (`301`) for deprecated duplicates
2. `rel="canonical"` annotations
3. Sitemap canonical inclusion

Use multiple consistent signals together where possible.

## Best Practices

- Use absolute canonical URLs.
- Keep canonical references self-consistent across metadata and sitemap.
- Link internally to canonical URLs.
- Do not use robots for canonicalization.
- Avoid URL fragments in canonical targets.

## Next.js Project Standard

For page metadata:

- Always set canonical via shared metadata factory.
- Ensure canonical path maps to a valid, indexable route.
- Ensure social URLs and schema URLs use the same canonical origin.

## Duplicate URL Sources to Control

- Query parameter variants
- Trailing slash differences
- Upper/lowercase variations
- Legacy route aliases
- HTTP vs HTTPS variants

## Diagnostics

Use URL Inspection to compare:

- User-declared canonical
- Google-selected canonical

If different:

1. Check redirects.
2. Check canonical tags.
3. Check sitemap inclusion.
4. Check content similarity and quality.

## Project Checklist

- Canonical set for all indexable pages.
- Sitemap includes canonical URLs only.
- No canonical to blocked or non-200 URLs.
- Internal links point to canonical URLs.
