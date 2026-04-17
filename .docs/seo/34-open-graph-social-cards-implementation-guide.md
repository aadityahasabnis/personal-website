# Open Graph and Social Cards Implementation Guide

## Purpose

Define a strict, production-grade Open Graph implementation standard for this codebase so every indexable public URL produces stable, high-quality social previews across Facebook, LinkedIn, X, Discord, and Slack.

This document translates Open Graph protocol requirements into project-specific implementation rules.

## Core Open Graph Contract

Every indexable public route must emit the required OG fields:

- `og:title`
- `og:type`
- `og:image`
- `og:url`

Recommended fields for all public routes:

- `og:description`
- `og:site_name`
- `og:locale`
- `og:image:alt`
- `og:image:width`
- `og:image:height`
- `og:image:type` when deterministic
- `og:image:secure_url` when HTTPS image URL is available

Project rule:

- Use absolute URLs for OG URL and all OG images.
- Canonical URL and OG URL must match exactly.
- Do not emit placeholder or non-crawlable image URLs.

## Route-Type Mapping

Use one primary `og:type` per page:

- Home, hubs, static pages (`/`, `/about`, `/contact`, `/terms`, `/privacy`, collections): `website`
- Article/blog detail pages: `article`
- Project detail pages: `article` for social card compatibility, plus project-specific JSON-LD schema

Do not emit multiple `og:type` values on one page.

## Article-Specific Open Graph Fields

For article-like routes (`/articles/**`, `/blogs/**`), include when available:

- `article:published_time` (ISO 8601)
- `article:modified_time` (ISO 8601)
- `article:author`
- `article:section`
- `article:tag` (multi-value support preferred)

Project note:

- Route metadata should derive these values from canonical content data (`publishedAt`, `updatedAt`, topic/category, tags, author identity constants).

## OG Image Rules

### Required standards

- Minimum preferred card size: 1200x630
- Use absolute image URLs
- Keep image URL stable after publish where possible
- Always provide meaningful alt text

### Dynamic image endpoint usage

When using `/api/og`:

- Ensure endpoint is crawlable by social fetchers and not accidentally blocked by robots rules.
- Ensure generated image URLs are HTTPS and publicly retrievable.
- Ensure cache headers are set for fast repeated fetches.

### Fallback order

Per content detail page, use this order:

1. `seo.ogImage` (author override)
2. content cover image
3. generated dynamic OG image URL
4. site default OG image

## Canonical and Noindex Integration

For detail routes, metadata generation must respect content-level SEO overrides:

- Canonical source priority:
    - `seo.canonicalUrl` when present
    - route-derived canonical path fallback
- Indexability source:
    - `seo.noIndex = true` -> emit `noindex, follow`
    - otherwise emit `index, follow`

Googlebot directives should align with the same index/follow decision.

## Twitter Card Alignment

Emit Twitter card fields aligned with OG values:

- `twitter:card=summary_large_image`
- `twitter:title` aligned to social title
- `twitter:description` aligned to OG description intent
- `twitter:image` aligned to OG image
- `twitter:site` and `twitter:creator` from site constants

Avoid conflicting OG and Twitter title/description semantics.

## Validation and Debug Workflow

For each release affecting metadata/social cards:

1. Validate rendered HTML head output on representative URLs.
2. Validate with:
    - Facebook Sharing Debugger
    - LinkedIn Post Inspector
    - X/Twitter card validator equivalent workflow
3. Confirm:
    - canonical URL correctness
    - image fetch success (200)
    - no mixed-protocol image URLs
    - expected title/description values
4. Re-test after cache purge/revalidation.

## Common Failure Modes

- Relative image URLs in OG tags
- OG URL mismatch with canonical
- robots disallow blocking OG asset/API endpoint
- stale social cache after metadata changes
- missing `og:image:alt`
- using incorrect route segment in generated canonical URL

## Project Implementation References

Primary utilities and route surfaces:

- `src/lib/metadata.ts`
- `src/lib/ogImage.ts`
- `src/app/api/og/route.tsx`
- `src/app/robots.ts`
- public detail route metadata generators under `src/app/(public)/**/page.tsx`

Admin source fields and authoring UX:

- `src/components/form/config/seoFields.ts`
- admin content forms for article/blog/project/topic

## Definition of Done (Open Graph)

A route is complete only when:

- Required OG tags are present and valid.
- Canonical and `og:url` are identical.
- OG image is absolute, crawlable, and suitable dimensionally.
- Content-level `canonicalUrl` and `noIndex` are enforced when present.
- Social debugger checks pass for representative URLs.
- Changes are documented in release notes/ops log.
