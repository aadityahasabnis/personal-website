# Structured Data Rollout Checklist and QA Operations

## Purpose

Provide an execution checklist to ship schema changes safely in production without regressions.

Use this for every schema expansion, refactor, or template migration.

## Pre-Implementation Gate

- Confirm target schema type is relevant to real page intent
- Confirm required fields can be sourced reliably
- Confirm ownership for long-term field maintenance
- Confirm policy fit for sensitive types (FAQ/QA/review/paywall)

## Implementation Gate

- Use existing schema helper architecture (`src/lib/seo.tsx`)
- Keep JSON-LD generation server-side
- Ensure canonical URL and route metadata alignment
- Avoid duplicating schema emitters across components

## Testing Gate

### Unit/contract tests

- Validate required fields exist for each supported type
- Validate date and URL formatting
- Validate fallback behavior for missing optional fields

### Integration checks

- Sample route rendering checks for JSON-LD presence
- Verify no duplicate/conflicting graph entities on a page

## Validation Gate (External)

For sampled URLs per template:

1. Rich Results Test
2. Schema Markup Validator
3. URL Inspection in Search Console (post-deploy)

Record results in a release note or ops log.

## Deployment Gate

- Roll out in small batches by template type where possible
- Revalidate affected routes after deploy
- Watch logs for metadata/schema generation exceptions

## Post-Deployment Monitoring

- Search Console enhancement reports
- Search appearance/performance trend changes
- Crawl and indexing anomalies for modified templates

Monitor at least one full recrawl cycle before declaring success.

## Incident Response Playbook

If schema regressions are detected:

1. Identify affected templates/URLs
2. Roll back schema change or hotfix helper output
3. Revalidate impacted pages
4. Re-run validation tests on representative URLs
5. Document root cause and add regression test coverage

## Definition of Done for Schema Changes

- Correct schema appears on all intended templates
- No schema appears on unintended templates
- Tests cover critical output contracts
- Validation tools show no blocking errors for sampled URLs
- Search Console shows stable or improving enhancement status over time
