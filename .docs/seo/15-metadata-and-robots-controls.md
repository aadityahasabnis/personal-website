# Metadata and Robots Controls Reference

## Purpose

Consolidate valid metadata, robots meta, and X-Robots-Tag implementation requirements.

## Valid HTML Head Rules

Keep metadata in valid head structure using only valid head elements (such as title, meta, link, script, style).

Important:

- Invalid elements in head can cause search parsers to stop reading later metadata.
- Keep canonical, robots, and structured data script tags in valid head/body usage paths.

## Supported Meta Priorities

For this project:

- `title`
- `description`
- canonical link
- robots rules
- Open Graph and Twitter fields

## Robots Meta Rules

Common directives used in this project:

- `index, follow` for indexable pages
- `noindex, follow` for non-indexable utility result pages
- snippet/image/video preview controls only when intentionally required

Conflict behavior:

- More restrictive directives win.

## X-Robots-Tag Usage

Use HTTP header controls for non-HTML resources when needed:

- PDFs
- media files
- other non-HTML responses

Important:

- Do not block crawling by robots if you need crawler to see `noindex` directives.

## `data-nosnippet` Usage

Use to exclude specific visible sections from snippets while still allowing page indexing.

Guidance:

- Apply only to valid supported container elements.
- Ensure HTML remains valid.

## Project-Specific Controls

- Keep metadata generated through shared route metadata helpers.
- Avoid client-side metadata rewrites unless unavoidable.
- Validate metadata and robots output through URL Inspection after template changes.
