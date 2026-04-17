# JavaScript SEO Basics for Next.js App Router

## Purpose

Document practical JavaScript SEO standards for this project so content remains crawlable, renderable, and indexable.

## How Google Processes JavaScript

Google Search generally works in three phases:

1. Crawling
2. Rendering
3. Indexing

Key implications:

- URLs blocked by robots are not rendered.
- `200` pages are typically queued for rendering.
- Rendered HTML is used for link extraction and indexing.

## Project Standards

### 1. Keep primary content server-visible

- Public route content must be present in server-rendered HTML where possible.
- JavaScript-enhanced behavior should enrich, not gate, core discoverable content.

### 2. Keep metadata stable and deterministic

- Titles and descriptions must be generated server-side for public pages.
- Canonical values should be stable and not changed to conflicting values in client JavaScript.

### 3. Use meaningful HTTP status codes

- Return `404` or `410` for missing content.
- Return `301` for permanent moved content.
- Avoid `200` for pages that are effectively errors.

### 4. Use History API for client navigation

- Avoid fragment-only routing for indexable content states.
- Use real URLs (`/path`) with proper links.

### 5. Use robots meta carefully

- Do not ship accidental `noindex` on indexable pages.
- For conditional noindex pages, ensure behavior is consistent and test with rendered HTML.

### 6. Avoid stale asset rendering issues

- Use content fingerprinting for JS/CSS assets.
- Do not rely on cache-busting query hacks for long-lived resources.

## Structured Data and JavaScript

- Prefer server-rendered JSON-LD for deterministic SEO behavior.
- If client injection is unavoidable, ensure exactly one valid JSON-LD block per intended schema and test with Rich Results Test.

## Web Components Guidance

- Ensure content intended for indexing appears in rendered DOM.
- Validate rendered output using URL Inspection or Rich Results Test.

## Validation Checklist

- Rendered HTML contains core content.
- Rendered HTML contains expected metadata.
- Important links are crawlable `<a href="...">` links.
- Error pages return meaningful status codes.
- Canonical and robots directives are consistent with intent.
