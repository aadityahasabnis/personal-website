# Policy-Sensitive Schema Usage (FAQ, Q&A, Discussion, Reviews, Paywall)

## Purpose

Capture strict usage rules for schema types that commonly trigger policy mismatches when overused:

- FAQPage
- QAPage
- DiscussionForumPosting
- Review snippet / aggregate rating
- Paywalled content markup

These types should only be implemented when product behavior genuinely matches the schema intent.

## FAQPage

### Use only when

- A page contains an authoritative list of questions and answers
- Content is not user-submitted Q&A
- Q/A pairs are visible and stable

### Avoid when

- The page is a general article with a small "FAQ-like" section not intended as a dedicated FAQ block
- Q/A is community generated (use QAPage/discussion models if truly applicable)

## QAPage

### Use only when

- A page is centered around one question with answers
- Answers are visible and attributable in a true Q&A context

### Avoid when

- Editorial posts present rhetorical questions
- There is no answer model or no separate answer entities

## DiscussionForumPosting

### Use only when

- Real forum/discussion threads exist
- User-generated posts and replies are first-class page content

### Avoid when

- Static comments are minimal and not a true discussion system

## Review Snippet and Aggregate Ratings

### Use only when

- Genuine review content exists on-page
- Rating values are authentic and methodologically sound
- Markup represents what users can actually see

### High-risk misuse

- Self-serving or fabricated rating markup
- Sitewide rating blocks on pages without real reviewed entities

## Paywalled Content Markup

### Use only when

- Content is actually paywalled or meter-limited
- The accessible vs restricted portions are clearly defined
- Structured markup reflects the paywall boundary accurately

### Do not

- Mark free content as paywalled
- Use paywall markup as a ranking tactic

## Project-Specific Recommendation

For current product state, keep these as conditional-only.

Default path:

- Do not emit these types globally
- Introduce per-template only after product and policy checks
- Add test coverage and review checklist before rollout

## Governance Checklist Before Shipping Any Type in This Document

- Is the page model genuinely aligned with the schema type?
- Is all critical structured information visible on-page?
- Can the content team maintain this data accurately over time?
- Did legal/policy concerns get reviewed where relevant (paywall/review claims)?
- Are there tests preventing accidental over-application?

If any answer is no, block rollout.
