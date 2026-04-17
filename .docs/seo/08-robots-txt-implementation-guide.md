# Robots.txt Implementation Guide

## Purpose

Define a safe and practical robots strategy for crawl management.

## Core Rules

- Robots controls crawling, not indexing privacy.
- Use `noindex` or auth to keep pages out of search when needed.
- Keep robots at site root (`/robots.txt`).

## Supported Directives

- `User-agent`
- `Disallow`
- `Allow`
- `Sitemap`

Notes:

- Rules are case-sensitive for paths.
- Use UTF-8 plain text.
- Keep file under practical size limits and avoid noisy rule sprawl.

## Recommended Baseline Pattern

```txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/

Sitemap: https://aadityahasabnis.com/sitemap.xml
```

## Project-Specific Guidance

- Keep public content crawlable (`/articles`, `/blogs`, `/projects`, static public pages).
- Block non-public operational surfaces (`/admin`, internal/private routes).
- Be careful with `/api` disallow when API endpoints produce assets referenced by schema (for example OG image endpoints).

## Update Workflow

1. Edit rules in version control.
2. Deploy.
3. Confirm live file is reachable at `/robots.txt`.
4. Test in Search Console robots report.
5. Request robots recrawl when urgent.

## Common Mistakes to Avoid

- Using robots to hide confidential content.
- Blocking essential rendering resources.
- Frequent rule churn for crawl budget micromanagement.
- Contradictory rules across environments.
