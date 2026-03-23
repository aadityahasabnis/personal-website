# SEO Name Discoverability Plan

## Objective

Improve discoverability for these name queries:

- Aaditya Hasabnis (canonical)
- Aditya Hasabnis (variant)
- Aditya
- Hasabnis

This document extends the existing SEO plan with a complete JSON-LD graph strategy (Person + WebSite + WebPage), SearchAction support, and implementation guidance for this codebase.

## Canonical Identity Rules

- Canonical person name remains: Aaditya Hasabnis
- Variants are added as alternate names (not canonical replacements)
- Keep all links real and verifiable (no placeholder profiles)

## Complete Schema Graph (Project-Ready)

Use this structure (values aligned to current constants and real links):

```html
<script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Person",
                "@id": "https://aadityahasabnis.com/#person",
                "name": "Aaditya Hasabnis",
                "alternateName": ["Aditya Hasabnis", "Aditya", "Hasabnis", "AH"],
                "url": "https://aadityahasabnis.com",
                "image": "https://aadityahasabnis.com/og-default.png",
                "email": "aaditya.hasabnis@gmail.com",
                "description": "Developer, writer, and lifelong learner.",
                "jobTitle": "Software Engineer",
                "sameAs": ["https://github.com/aadityahasabnis", "https://twitter.com/aadityahasabnis", "https://linkedin.com/in/aadityahasabnis"],
                "knowsAbout": [
                    "Software Engineering",
                    "Web Development",
                    "TypeScript",
                    "JavaScript",
                    "React",
                    "Next.js",
                    "Node.js",
                    "System Design",
                    "Data Structures and Algorithms",
                    "Technical Writing"
                ]
            },
            {
                "@type": "WebSite",
                "@id": "https://aadityahasabnis.com/#website",
                "url": "https://aadityahasabnis.com",
                "name": "Aaditya Hasabnis",
                "alternateName": ["Aaditya Hasabnis Portfolio", "Aditya Hasabnis Portfolio"],
                "publisher": {
                    "@id": "https://aadityahasabnis.com/#person"
                },
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://aadityahasabnis.com/search?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                }
            },
            {
                "@type": "WebPage",
                "@id": "https://aadityahasabnis.com/#webpage",
                "url": "https://aadityahasabnis.com",
                "name": "Aaditya (Aditya) Hasabnis | Software Engineer",
                "isPartOf": {
                    "@id": "https://aadityahasabnis.com/#website"
                },
                "about": {
                    "@id": "https://aadityahasabnis.com/#person"
                },
                "description": "Portfolio of Aaditya (Aditya) Hasabnis, software engineer and writer focused on modern web development and scalable systems."
            }
        ]
    }
</script>
```

## Where This Fits In Current Code

Current schema utilities exist in src/lib/seo.tsx and are rendered on the homepage from src/app/(public)/page.tsx.

Implement the graph in utilities rather than hardcoding script JSON in page files:

1. Extend generatePersonSchema in src/lib/seo.tsx:

- add alternateName array from SITE_CONFIG.author aliases
- keep canonical name unchanged

2. Extend generateWebSiteSchema in src/lib/seo.tsx:

- add alternateName
- add potentialAction SearchAction pointing to /search?q={search_term_string}

3. Add a generateHomeWebPageSchema helper in src/lib/seo.tsx:

- emit WebPage node linked by isPartOf -> #website and about -> #person

4. Update homepage composition in src/app/(public)/page.tsx:

- combine WebSite + Person + WebPage schemas via combineSchemas

5. Add search route in src/app/(public)/search/page.tsx:

- index only the base route
- mark query result URLs noindex to avoid thin/duplicate index pages

## Alias Storage Design

Add alias fields in src/constants/siteConstants.ts under author and SEO:

- author.aliasesExact: exact variants
- seo.keywordAliasCap: numeric cap for metadata keyword usage

Use aliasesExact in JSON-LD alternateName and keep metadata keywords controlled.

## Metadata and Anti-Stuffing Guardrails

- Keep canonical title and description natural and user-first
- Do not inject every alias into every title/description
- Prefer this distribution:
    - JSON-LD alternateName: exact variant coverage
    - Metadata keywords: at most 1-2 variants per page
    - Body copy: natural mention once in About page intro only

## Rollout Checklist

Status date: 2026-03-23

1. Phase 1: Schema Foundation

- [Done] Update site constants for aliases.
- [Done] Update Person and WebSite schema utilities.
- [Done] Add homepage WebPage schema utility.
- [Pending] Render updated graph on homepage (currently homepage renders WebSite + Person, not WebPage node).

2. Phase 2: Search Surface

- [Pending] Build /search route under App Router.
- [Pending] Enable SearchAction in WebSite schema (currently gated by seo.search.enabled=false).
- [Pending] Update robots/sitemap for search base route once /search exists.
- [Done] Backend search foundation implemented: /api/content/search and server search query layer.

3. Phase 3: Coverage and Validation

- [Pending] Add schema utility tests (alternateName, SearchAction gating, stable IDs).
- [Pending] Add metadata tests for homepage and detail pages.
- [Pending] Validate with Rich Results Test and Schema Validator (manual run pending).
- [Pending] Submit sitemap and key URLs in Search Console.
- [Done] Existing API suite passes after backend changes (128/128).

## Next Implementation Plan

1. Backend test coverage first (no frontend hooks/components):

- Add tests for `generatePersonSchema` and `generateWebSiteSchema` to verify alternateName output and SearchAction gating.
- Add API tests for `/api/content/search` query validation, filtering by contentTypes, and path formatting.

2. SEO graph completion:

- Update homepage schema composition to include `generateHomeWebPageSchema` with `combineSchemas`.

3. Search route enablement:

- Build minimal `/search` page route.
- Set `seo.search.enabled=true` only when route is live.
- Add sitemap entry for `/search`; keep query result pages noindex.

4. Production validation:

- Run Rich Results tests on home, one article, one blog, one project.
- Submit sitemap in Search Console.
- Track query performance for aaditya hasabnis, aditya hasabnis, aditya, hasabnis.

## Validation Targets

Track impressions/clicks for:

- aaditya hasabnis
- aditya hasabnis
- aditya
- hasabnis

Evaluate after 2-4 weeks before further tuning.

## Important Notes

- Schema improves understanding and entity confidence, but ranking also requires content quality, backlinks, and consistency.
- Replace og-default.png with a real profile image URL when available for stronger person entity quality.
