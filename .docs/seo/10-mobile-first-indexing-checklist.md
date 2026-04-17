# Mobile-First Indexing Checklist

## Purpose

Ensure mobile-rendered pages carry complete SEO signals and equivalent primary content.

## Core Rules

- Mobile version is the primary indexing source.
- Primary content must be equivalent across desktop and mobile.
- Structured data and metadata must be present on mobile.

## Checklist

### Content and Rendering

- Primary page content is visible in mobile DOM.
- Headings and main copy remain equivalent.
- Critical content is not gated behind interaction-only lazy loading.

### Metadata

- Mobile and desktop titles are equivalent in intent.
- Mobile and desktop descriptions are equivalent in intent.
- Robots directives are consistent between variants.

### Structured Data

- Same schema coverage on mobile and desktop.
- Same key entities and URLs in JSON-LD.
- All schema URLs are valid and crawlable.

### Media

- Important images are present on mobile.
- Alt text exists for important images.
- Video is in supported tags and easily discoverable.

### Crawlability

- Mobile resources are not blocked in robots.
- Mobile URLs return correct status codes.
- No accidental fragment-only mobile URLs for core content.

## If Using Separate Mobile URLs

- Correct `rel="canonical"` and `rel="alternate"` pairing.
- `hreflang` mobile-to-mobile and desktop-to-desktop mappings.
- Equivalent pages exist for desktop URLs.

## Validation Workflow

1. Run URL Inspection with live test.
2. Check rendered HTML and loaded resources.
3. Validate structured data on mobile-rendered output.
4. Monitor indexing and enhancement reports.
