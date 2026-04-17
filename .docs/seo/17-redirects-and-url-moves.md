# Redirects and URL Moves Guide

## Purpose

Standardize redirect strategy for SEO-safe URL changes, consolidations, and migrations.

## Redirect Type Selection

### Permanent moves

Use when URL is replaced permanently:

- `301` or `308`

SEO effect:

- Strong canonicalization signal to new URL.

### Temporary moves

Use when URL is expected to return:

- `302`, `303`, or `307`

SEO effect:

- Source URL may remain canonical.

## Preferred Implementation Order

1. Server-side HTTP redirects
2. Meta refresh only when server redirects are not possible
3. JavaScript redirects only as last resort

## Migration Rules

- Redirect old URL to most relevant equivalent, not generic homepage.
- Avoid long redirect chains.
- Keep internal links updated to final URL.
- Keep sitemap updated with final canonical URLs only.

## Canonical and Redirect Alignment

- Redirect target should match canonical target.
- Do not send mixed signals (redirect to A, canonical to B).

## Project Checklist

- Verify status code type matches move intent.
- Validate redirects with URL Inspection and HTTP checks.
- Re-submit sitemap after bulk moves.
- Monitor indexing shifts and canonical selection after migration.
