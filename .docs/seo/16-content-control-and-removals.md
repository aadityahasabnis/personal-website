# Content Control and Removals Guide

## Purpose

Define how to prevent unwanted content from appearing in Google and how to remove already indexed content safely.

## Control Methods (choose by intent)

1. Remove content from origin (strongest).
2. Password-protect confidential content.
3. Use `noindex` for crawlable pages that must not appear in search.
4. Use robots crawling disallow for media crawl control where appropriate.

## Important Limitation

- Robots disallow is not a reliable privacy mechanism for web pages.
- If you need guaranteed non-visibility, use auth or noindex on crawlable resources.

## Fast Removal Workflow

For urgent public exposure:

1. Use Search Console Removals tool.
2. Apply permanent control (`noindex`, remove, or auth).
3. Validate with URL Inspection.

## Image Removal Strategy

Options:

- robots rules for image crawler paths
- `X-Robots-Tag: noindex` for image responses

Choose one primary approach and keep behavior consistent.

## Redacted Content Safety

Before publication:

- Remove hidden metadata and revision history.
- Properly redact source files (not overlay-only masking).
- Publish corrected file at new URL when needed.

If leaked:

1. Remove live file.
2. Request removal in Search Console.
3. Publish fully redacted replacement under new URL.
4. Update references and monitor deindexing.

## Project Policy

- Private/admin/internal data must rely on authentication.
- Public low-value utility URLs should be reviewed for noindex suitability.
- Use removals tool only as an emergency accelerator, not primary control.
