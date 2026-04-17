# SEO and Crawling Playbook

This folder contains implementation-focused SEO documentation for aadityahasabnis.com.

## Document Map

1. `01-article-structured-data.md`
    - Google Article schema guidance translated to project standards.
    - JSON-LD patterns for article pages.
    - Author, image, and date best practices.

2. `02-crawling-and-indexing.md`
    - Crawlability, rendering, links, canonicalization, and robots controls.
    - JavaScript SEO notes for Next.js App Router.

3. `03-sitemaps-and-discovery.md`
    - XML sitemap strategy, quality requirements, and optional extensions.
    - Image, News, and Video sitemap guidance.

4. `04-current-implementation-audit.md`
    - Verification of the current implementation in this repository.
    - Findings, risk levels, and prioritized action plan.

5. `05-recrawl-and-indexing-requests.md`
    - How to request recrawls using URL Inspection and sitemap workflows.
    - Practical expectations and validation checklist.

6. `06-crawling-errors-troubleshooting.md`
    - Crawl diagnostics and remediation workflow.
    - Soft 404, host load, crawl efficiency, and emergency handling.

7. `07-google-crawlers-and-verification.md`
    - Google crawler categories and request verification methods.
    - Logging and policy guidance.

8. `08-robots-txt-implementation-guide.md`
    - Robots syntax and practical policy patterns.
    - Project-specific robots strategy and update workflow.

9. `09-canonicalization-implementation-guide.md`
    - Canonical signal hierarchy, best practices, and diagnostics.
    - Duplicate control strategy for stable indexing.

10. `10-mobile-first-indexing-checklist.md`
    - Mobile parity checklist for content, metadata, and schema.
    - Validation workflow for mobile-first indexing readiness.

11. `11-amp-search-implementation-notes.md`
    - AMP requirements and linking/validation notes for future adoption.
    - Decommissioning strategy if AMP is removed.

12. `12-javascript-seo-basics.md`
    - JavaScript crawl-render-index behavior and implementation standards.
    - Next.js-focused rules for crawlability, canonical stability, and status-code correctness.

13. `13-fix-search-javascript-issues.md`
    - Incident workflow for debugging JavaScript indexing issues.
    - High-impact failure patterns and remediation standards.

14. `14-lazy-loading-and-infinite-scroll.md`
    - Search-safe lazy-loading and infinite-scroll implementation.
    - Crawlable pagination requirements and validation steps.

15. `15-metadata-and-robots-controls.md`
    - Valid head metadata rules, robots meta directives, X-Robots-Tag usage, and snippet controls.
    - Project-level metadata governance guidance.

16. `16-content-control-and-removals.md`
    - Content blocking and emergency removal strategies.
    - Image removal and redacted-information handling policy.

17. `17-redirects-and-url-moves.md`
    - Redirect strategy for URL moves and migrations.
    - Canonical and redirect alignment checklist.

18. `18-search-appearance-and-ai-features.md`
    - Search appearance and AI feature eligibility guidance.
    - Controls, measurement, and implementation standards.

19. `19-byline-favicon-snippets.md`
    - Byline date consistency rules and favicon requirements.
    - Snippet control strategy (`nosnippet`, `max-snippet`, `data-nosnippet`).

20. `20-discover-images-and-business-presence.md`
    - Discover readiness standards and image SEO implementation.
    - Business presence and identity reinforcement guidance.

21. `21-site-names-sitelinks-and-ranking-context.md`
    - Site name and sitelink implementation best practices.
    - Ranking and reviews-system context for content quality decisions.

22. `22-structured-data-governance-and-enriched-results.md`
    - Structured data quality governance model.
    - Enriched result eligibility and validation workflow.

23. `23-page-experience-and-intrusive-ui.md`
    - Page experience standards and intrusive UI avoidance policy.
    - Mobile-first UX and crawlability-friendly dialog practices.

24. `24-signed-exchanges-and-prefetch.md`
    - Signed Exchanges adoption and risk-control playbook.
    - Incremental rollout and monitoring strategy.

25. `25-google-supported-structured-data-landscape.md`
    - Master map of Google-supported structured data families.
    - Project-specific prioritization matrix (now, conditional, future).

26. `26-core-entity-schema-playbook.md`
    - Canonical implementation contracts for Article, Breadcrumb, Organization, and Profile schema.
    - Graph composition, testing, and rollout standards.

27. `27-media-schema-and-visual-search-guide.md`
    - Video and image schema implementation guidance.
    - Discover-oriented media quality and validation workflow.

28. `28-policy-sensitive-schema-usage.md`
    - Guardrails for FAQ, Q&A, discussion, review, and paywall markup.
    - Eligibility and governance checks to prevent policy mismatches.

29. `29-title-links-and-search-appearance-control.md`
    - Title-link influence patterns and snippet control strategy.
    - Metadata and heading consistency rules for stable search appearance.

30. `30-internationalization-and-translated-results-guide.md`
    - Multilingual canonical and hreflang implementation model.
    - Translation quality and rollout controls for international SEO.

31. `31-structured-data-rollout-checklist-and-qa.md`
    - End-to-end schema rollout gates, validation workflow, and incident response.
    - Definition-of-done checklist for production schema changes.

32. `32-outbound-link-qualification-and-rel-policy.md`
    - Outbound link `rel` policy for sponsored, UGC, and nofollow scenarios.
    - Rendering and governance guidance for link qualification consistency.

33. `33-noindex-and-x-robots-implementation-playbook.md`
    - Focused implementation and debugging guide for `noindex` and `X-Robots-Tag`.
    - Emergency deindex workflow and durable exclusion patterns.

34. `34-open-graph-social-cards-implementation-guide.md`
    - Open Graph protocol mapping to project implementation rules.
    - OG type strategy, image standards, canonical/noindex integration, and social debugger workflow.

## Usage

- Start with `04-current-implementation-audit.md` for current status.
- Use documents `01-03` as implementation standards while building new routes and content types.
- Use documents `05-11` for operational SEO execution (recrawl, crawl diagnostics, robots, canonicalization, mobile-first, and AMP readiness).
- Use documents `12-17` for JavaScript SEO hardening, metadata controls, removals workflow, and URL migration operations.
- Use documents `18-24` for Search appearance optimization, AI-feature readiness, snippet/date/favicon controls, Discover/image quality, structured data governance, page experience, and optional SXG performance strategy.
- Use documents `25-31` for advanced structured-data expansion planning, core entity schema contracts, media-rich result implementation, policy-sensitive schema guardrails, title-link controls, internationalization readiness, and schema rollout QA operations.
- Use documents `32-33` for outbound link qualification policy and noindex/X-Robots implementation-debug operations.
- Use document `34` for route-level Open Graph implementation, social card QA, and platform debugger verification.
- Use examples in `examples/` for copy-ready article metadata patterns (SEO, OG, Twitter, and JSON-LD).
- Re-run this audit whenever metadata, robots, sitemap, or structured data utilities change.
