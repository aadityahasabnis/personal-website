# Title Links and Search Appearance Control

## Purpose

Provide implementation-level guidance for controlling search snippets and title-link outcomes through robust technical and editorial patterns.

This complements metadata docs by focusing on practical control levers and quality constraints.

## Title Link Formation Principles

Google title links can be influenced by:

- HTML title element quality
- Main heading alignment
- Anchor text from internal links
- Structured data consistency

No single field guarantees exact rendering, but consistency strongly improves outcomes.

## Implementation Rules

### Title tags

- Unique per indexable URL
- Descriptive and specific
- Avoid boilerplate-only patterns
- Keep branding suffix consistent but not dominant

### H1 and visible heading alignment

- Primary heading should reflect the same intent as title
- Avoid contradictory phrasing between H1 and title

### Internal anchor text

- Use meaningful labels in lists/navigation
- Avoid repetitive generic anchors like "read more" without context

### Snippet controls

Where needed, apply controls carefully:

- `meta name="robots"` with snippet directives (as policy requires)
- Data-nosnippet for precise exclusion zones

Do not over-constrain snippets unless there is a legal or product reason.

## Visual Elements in Search

For improved appearance:

- Ensure strong representative images
- Maintain valid structured data where applicable
- Keep canonical and alternate relationships clean

## Quality Safeguards

- No clickbait mismatch between title and content
- No keyword stuffing
- No duplicate title templates across distinct pages
- No hidden text intended solely for snippet manipulation

## Operational Checklist

- Title and H1 reviewed together for all key templates
- Canonical URL aligns with metadata and internal links
- Rich Results Test passes where structured data applies
- Search Console inspected for title rewrite trends

## Project Integration Notes

- Centralize title generation in route metadata helpers
- Keep route-level overrides explicit and tested
- Introduce lint-style checks for empty/duplicate metadata on critical routes
