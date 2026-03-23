# SEO Name Discoverability Plan

## Objective

Improve discoverability for these name queries:

- Aaditya Hasabnis (canonical)
- Aditya Hasabnis (variant)
- Aditya
- Hasabnis
- Aaditya Hasabins (typo variant requested)

This document extends the existing SEO plan with a complete JSON-LD graph strategy (Person + WebSite + WebPage), SearchAction support, and implementation guidance for this codebase.

## Canonical Identity Rules

- Canonical person name remains: Aaditya Hasabnis
- Variants and typo variants are added as alternate names (not canonical replacements)
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
                "alternateName": ["Aditya Hasabnis", "Aditya", "Hasabnis", "Aaditya Hasabins"],
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
- author.aliasesTypo: typo variants requested for on-page schema
- seo.keywordAliasCap: numeric cap for metadata keyword usage

Use aliasesTypo primarily inside JSON-LD alternateName to avoid visible keyword stuffing.

## Metadata and Anti-Stuffing Guardrails

- Keep canonical title and description natural and user-first
- Do not inject every alias into every title/description
- Prefer this distribution:
    - JSON-LD alternateName: full exact + typo coverage
    - Metadata keywords: at most 1-2 variants per page
    - Body copy: natural mention once in About page intro only

## Rollout Checklist

1. Phase 1: Schema Foundation

- Update site constants for aliases
- Update Person and WebSite schema utilities
- Add homepage WebPage schema utility
- Render updated graph on homepage

2. Phase 2: Search Surface

- Build /search route
- Enable SearchAction in WebSite schema
- Update robots/sitemap if needed for search base route

3. Phase 3: Coverage and Validation

- Add schema utility tests (alternateName, SearchAction, stable IDs)
- Add metadata tests for homepage and detail pages
- Validate with Rich Results Test and Schema Validator
- Submit sitemap in Search Console

## Validation Targets

Track impressions/clicks for:

- aaditya hasabnis
- aditya hasabnis
- aditya
- hasabnis
- aaditya hasabins

Evaluate after 2-4 weeks before further tuning.

## Important Notes

- Schema improves understanding and entity confidence, but ranking also requires content quality, backlinks, and consistency.
- Replace og-default.png with a real profile image URL when available for stronger person entity quality.
