# noindex and X-Robots-Tag Implementation Playbook

## Purpose

Provide a focused implementation and debugging guide for `noindex` controls in HTML and HTTP headers.

## Core Rule

`noindex` works only if the crawler can access the URL and read the directive.

Implication:

- Do not block with robots if you expect noindex to be honored.

## Implementation Options

### HTML pages

Use meta robots in document output:

- `meta name="robots" content="noindex"`
- Optional combination: `noindex, follow`

### Non-HTML resources

Use HTTP header:

- `X-Robots-Tag: noindex`

Common targets:

- PDF files
- Image/video assets
- Other file endpoints

## Typical Failure Modes

1. Robots disallow blocks crawl before noindex is seen
2. Noindex set only via fragile client-side mutation
3. Cached/legacy response still missing expected header
4. Conflicting directives where restrictive rule unexpectedly dominates

## Debug Workflow

1. Confirm URL is crawlable (not blocked by robots/auth unexpectedly)
2. Inspect live response headers and HTML output
3. Verify noindex is present in crawler-visible response
4. Run URL Inspection and confirm extracted rule
5. Request recrawl for faster state convergence

## Emergency Deindex Procedure

1. Use Removals tool for immediate suppression
2. Apply durable noindex/remove/auth solution
3. Keep durable control active until recrawl confirms exclusion
4. Monitor indexing reports for status

## Project Integration Guidance

- Keep noindex decisions centralized in route metadata logic where possible.
- Use X-Robots for non-HTML resources controlled by storage/proxy layers.
- Avoid contradictory behavior between metadata helpers and server headers.

## Definition of Done

- Correct URLs are excluded from index
- Intended indexable URLs remain indexable
- No accidental global noindex scope
- Validation evidence captured in release notes/ops log
