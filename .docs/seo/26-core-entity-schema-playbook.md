# Core Entity Schema Playbook (Article, Breadcrumb, Organization, Profile)

## Purpose

Define the canonical implementation strategy for the four highest-value schema types in this project:

- Article (or BlogPosting/TechArticle)
- BreadcrumbList
- Organization
- ProfilePage / Person

These types are the baseline search semantics for a personal publishing platform.

## Architecture Placement

Use existing project conventions:

- Schema composition helpers in `src/lib/seo.tsx`
- Route-level metadata and JSON-LD produced in server components/pages
- No client-only schema generation

Target behavior:

- Deterministic JSON-LD on first response
- No dependency on client hydration for critical search semantics

## Article Schema Contract

### Required operational fields

- `@context`: `https://schema.org`
- `@type`: one of `BlogPosting` / `Article` / `TechArticle`
- `headline`
- `datePublished`
- `dateModified`
- `author` (Person)
- `mainEntityOfPage`
- `image` (primary representative image)

### Recommended fields

- `description`
- `publisher` (Organization)
- `keywords`
- `articleSection`
- `inLanguage`

### Mapping guidance

- Headline: use canonical title, not decorative UI title variants
- Dates: align with content model and visible date text
- Author: single source from author profile constants/config
- Main entity URL: canonical route URL

## BreadcrumbList Contract

### When to emit

Emit breadcrumb schema when hierarchy exists and is visible or logically inferable:

- Home > Articles > Article Title
- Home > Projects > Project Name

### Core fields

- `@type`: `BreadcrumbList`
- `itemListElement`: ordered `ListItem[]`
- Each list item has `position`, `name`, `item`

### Rules

- Positions must be contiguous and 1-indexed
- URLs must be absolute canonical URLs
- Names should match human-readable navigation labels

## Organization Schema Contract

### Purpose

Establish site-level identity and ownership context.

### Core fields

- `@type`: `Organization`
- `name`
- `url`
- `logo`
- `sameAs` (only real profiles)

### Rules

- `logo` must be crawlable and stable
- `sameAs` should only include active, official profiles
- Do not include aspirational or unused social URLs

## ProfilePage / Person Contract

### Purpose

Strengthen author identity and E-E-A-T style signals for authored content.

### Core fields

- `ProfilePage` with `mainEntity` as `Person`
- `name`, `url`, optional `image`, optional `sameAs`
- Optional role descriptors (`jobTitle`) only when accurate

### Rules

- Keep biography and role claims factual and current
- Link authored content to the same person entity consistently

## Graph Composition Pattern

Prefer a single JSON-LD graph for each page where possible:

- `WebPage`
- Optional `BreadcrumbList`
- Detail entity (`BlogPosting`, `ProfilePage`, etc.)
- Shared publisher identity (`Organization`)

Benefits:

- Easier testing
- Fewer contradictions
- Better long-term maintainability

## Validation Checklist

- Rich Results Test passes for Article/Breadcrumb eligibility
- No date mismatches between UI and JSON-LD
- Canonical URL and `mainEntityOfPage` match
- Organization logo URL is accessible and indexable
- Person identity fields are consistent across pages

## Testing Requirements

For schema helpers/tests:

- Snapshot or contract tests for key output fields
- Tests for fallback behavior when optional data is missing
- Tests for canonical URL building in all environments

Minimum assertions for article pages:

- Type is expected (`BlogPosting`/`Article`)
- `headline`, `datePublished`, `author.name`, and canonical URL exist
- Breadcrumb positions are correct when breadcrumbs are present

## Rollout Strategy

1. Audit existing routes with article-like content
2. Normalize helper contracts in `src/lib/seo.tsx`
3. Add/adjust tests
4. Deploy and inspect sampled URLs
5. Monitor Search Console enhancement reports
