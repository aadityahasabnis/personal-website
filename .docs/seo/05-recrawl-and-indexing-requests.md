# Recrawl and Indexing Request Playbook

## Purpose

This guide documents when and how to ask Google to recrawl URLs after publishing or updating content.

## Key Principles

- Recrawl requests are hints, not guarantees.
- Indexing usually takes days, sometimes weeks.
- Repeatedly requesting indexing for the same URL does not speed processing.

## Methods

### 1. URL Inspection Tool (small batches)

Use when you changed a small number of high-priority pages.

Process:

1. Open URL Inspection in Search Console.
2. Test the exact canonical URL.
3. Confirm page is accessible and indexable.
4. Request indexing.

Use cases:

- Newly published article
- Critical metadata fix
- Structured data fix on a single URL

### 2. Sitemap Submission (large batches)

Use when many URLs were added or updated.

Process:

1. Ensure sitemap contains canonical, indexable URLs only.
2. Ensure `lastmod` is accurate.
3. Submit sitemap in Search Console.
4. Monitor sitemap processing and indexing reports.

Use cases:

- New section launch
- Large content migration
- Bulk content updates

## Project Workflow Standard

For this repository:

1. Publish content.
2. Trigger revalidation where applicable.
3. Verify URL appears in `sitemap.xml`.
4. Use URL Inspection for top-priority pages.
5. Monitor indexing in Search Console reports.

## Practical Expectations

- Typical non-news pages should not expect same-day indexing.
- Quality and crawlability matter more than submission frequency.

## Validation Checklist

- URL returns `200`.
- URL is canonical.
- Page is not blocked by robots or `noindex`.
- Structured data is valid where applicable.
- URL is internally linked.
