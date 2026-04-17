# Site Names, Sitelinks, and Ranking Context

## Purpose

Document practical guidance for site naming in Search, sitelink quality, and ranking-system context.

## Site Names in Search

### Recommended implementation

- Add `WebSite` structured data on the host home page
- Provide `name` and `url`
- Optionally provide `alternateName` values in preference order

### Constraints

- Site names are host-level or subdomain-level, not subdirectory-level
- Home page must be crawlable
- Keep naming signals consistent across home page sources

## Sitelinks

Sitelinks are automated and depend on strong site architecture.

### Best practices

- Clear page titles and headings
- Logical hierarchy
- Strong internal linking to important pages
- Concise, descriptive anchor text
- Reduced repetitive boilerplate content

## Ranking Systems Context

Google uses many systems and signals, including page-level and site-level understanding.

Practical implication:

- Focus on durable quality and clarity rather than chasing one system label.
- Keep content useful, original, and easy to navigate.

## Reviews System Context

For review-focused content:

- Prioritize original analysis and expert perspective
- Avoid thin summary-only review pages
- Keep review content quality consistently high

## Project Implementation Notes

- Maintain `WebSite` schema integrity on root host.
- Keep navigation and internal linking architecture explicit and stable.
- Treat ranking documentation as operating context, not a checklist for shortcuts.
