# Google-Supported Structured Data Landscape and Prioritization

## Purpose

Provide a complete, implementation-oriented map of Google Search Central structured data features, with a practical prioritization model for this codebase.

This document is intentionally broad. It is the master reference that explains:

- What Google currently supports at a feature level
- Which features matter to this project now vs later
- Which features are out-of-scope for this product unless business direction changes

## Scope and Context

Project: aadityahasabnis.com (personal knowledge and portfolio platform)

Current content model:

- Articles / blogs
- Notes / logs
- Static pages
- Projects
- About/contact/legal pages

Current delivery model:

- Static-first (SSG/ISR)
- Dynamic islands for engagement
- Server-rendered metadata and JSON-LD

## Feature Families in Google Search

Google-supported markup spans many verticals. For operational use, group them into families:

1. Core publisher and navigation

- Article
- Breadcrumb
- Organization
- ProfilePage
- WebSite (site name context)

2. Rich content formats

- Video
- Image metadata
- DiscussionForumPosting
- QAPage
- FAQPage

3. Commerce / marketplace

- Product
- Review snippet
- LocalBusiness
- SoftwareApplication
- VacationRental

4. Education and knowledge

- Course list
- Education Q&A (Quiz/Question/Answer)
- Dataset
- MathSolver

5. Jobs and hiring

- JobPosting
- EmployerAggregateRating

6. Event and media programs

- Event
- Movie
- Recipe
- Carousel (ItemList host carousel support)

7. Program-specific / partner-limited

- Book actions feed
- Some carousel vertical integrations
- Vacation rental integrations

8. Policy and control overlays

- Paywalled content
- Snippet controls
- Title link influence
- Translated results behavior

## Relevance Matrix for This Project

### Tier 1: Implement now (high fit)

- Article
- Breadcrumb
- Organization
- ProfilePage (author/entity identity)
- VideoObject (where relevant)
- Image metadata (license/credit only if rights workflows require it)
- Review snippet only if there is genuine review content and policy fit

Why Tier 1:

- Directly aligned with current content inventory
- Improves discoverability and trust signals
- Uses existing architectural patterns (server-rendered metadata + JSON-LD)

### Tier 2: Conditional near-term (feature-dependent)

- FAQPage (only where policy and content shape match)
- QAPage (only if true community Q&A exists)
- DiscussionForumPosting (only if user-generated discussion sections are added)
- Web Stories (if editorial adopts that format)
- Paywalled content markup (only if subscriptions/paywall are introduced)

Why Tier 2:

- Valid but depends on product evolution and strict eligibility constraints

### Tier 3: Future vertical expansion (low current fit)

- Course list
- Education Q&A
- Dataset
- MathSolver
- SoftwareApplication (if dedicated software catalog appears)
- LocalBusiness (if local business listing use case appears)
- Event
- Recipe
- Movie
- VacationRental
- JobPosting and EmployerAggregateRating
- Book actions feed

Why Tier 3:

- Technically supported by Google
- Not aligned to current product intent
- High risk of policy mismatch if implemented prematurely

## Non-Negotiable Governance Rules

1. Eligibility is conditional, not guaranteed

- Structured data enables eligibility; it does not guarantee rich result rendering.

2. Content-visibility parity

- Markup must match visible on-page content.

3. Type correctness

- Use the most semantically accurate schema type.

4. No speculative markup

- Do not add types that are not represented by real page intent.

5. Single-source generation

- Use centralized helper utilities for all JSON-LD graph assembly.

6. Regression-tested templates

- Any template that emits schema must have tests that validate key fields.

## Anti-Patterns to Avoid

- Marking collection/search pages as single-item detail schema
- Injecting contradictory dates across UI and JSON-LD
- Using placeholder logos/images/ratings
- Applying FAQ/QA/discussion markup without true interaction model
- Publishing review aggregates without user-generated review systems
- Mixing locale, language, and canonical inconsistently

## Project Implementation Doctrine

For this codebase, default schema stack should remain:

- WebSite + Person/Organization identity graph at root
- WebPage per route
- BlogPosting/TechArticle for article detail pages
- BreadcrumbList where page hierarchy exists
- VideoObject and ImageObject where media is first-class and crawlable

Everything else should be introduced only with explicit product requirements, policy verification, and test coverage.

## Validation and Monitoring Model

Use this sequence for all schema changes:

1. Rich Results Test (syntax + feature eligibility)
2. Schema Markup Validator (shape sanity)
3. URL Inspection (rendered output and crawlability)
4. Search Console enhancement/performance monitoring
5. Regression tests in repository for critical schema contracts

## Decision Checklist Before Adding Any New Schema Type

- Is this type represented by real content on the page?
- Does this page satisfy Google's content and technical guidelines for this type?
- Is there a user-visible value beyond SEO checklists?
- Can this be generated through existing schema helpers?
- Do we have test coverage for required/recommended fields?
- Do we have operational owners for keeping fields fresh?

If any answer is no, defer implementation.
