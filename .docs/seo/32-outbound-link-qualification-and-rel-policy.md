# Outbound Link Qualification and rel Policy

## Purpose

Define how this project should mark outbound links with `rel` attributes for quality, trust, and policy alignment.

## Supported rel Values and Use

### `rel="sponsored"`

Use for:

- Paid links
- Sponsorship placements
- Affiliate-style monetized placements

### `rel="ugc"`

Use for:

- User-generated links in comments/discussions
- Community-contributed link fields

### `rel="nofollow"`

Use when:

- You do not want to endorse or transfer trust context
- Link destination is low-confidence or unreviewed
- Sponsored/ugc labels do not fully capture policy need

## Combining Values

Multiple values are allowed when appropriate, for example:

- `ugc nofollow`
- `sponsored nofollow`

## Project Policy

For current product shape:

- Editorial outbound references: no extra rel unless specific risk requires it
- User-generated links (if/when enabled): default `ugc nofollow`
- Paid/partner links: `sponsored` (optionally plus `nofollow`)

## Important Clarifications

- `rel` qualification does not guarantee the target will not be crawled by other discovery paths.
- For internal crawl/index control, use canonical/robots/noindex patterns, not outbound rel attributes.

## Implementation Notes

- Apply link qualification at rendering/template layer for consistency.
- Avoid mixing conflicting heuristics route-by-route.
- Add lint/review checks for sponsored placements.

## Validation Checklist

- Paid links are consistently marked `sponsored`.
- UGC links are consistently marked `ugc` (and usually `nofollow`).
- Internal links are not over-qualified unnecessarily.
- Crawlability of important internal URLs is unaffected.
