# Google Crawlers and Verification Guide

## Purpose

Document how to identify real Google crawlers and design safe crawler policies.

## Crawler Categories

1. Common crawlers

- Example: Googlebot
- Respect robots rules for automatic crawling

2. Special-case crawlers

- Example: AdsBot
- May have product-specific behavior

3. User-triggered fetchers

- Triggered by user actions in Google tools/products
- May ignore robots in some cases

## Important Notes

- User-Agent strings can be spoofed.
- Do not trust User-Agent alone for security decisions.

## Verification Methods

### Manual verification (one-off)

1. Reverse DNS lookup on request IP.
2. Validate hostname domain (`googlebot.com`, `google.com`, or `googleusercontent.com`).
3. Forward DNS lookup on that hostname.
4. Confirm it resolves back to the same IP.

### Automated verification (production)

Match source IP against Google-published IP range JSON files for:

- Common crawlers
- Special crawlers
- User-triggered fetchers

## Logging Recommendations

Capture at minimum:

- Source IP
- User-Agent
- Requested URL
- Response status
- Response time

## Policy Guidance

- Use robots for crawl policy, not for access security.
- Use authentication/authorization for protected content.
- Avoid blanket blocking without validating crawler authenticity.

## Project Implementation Notes

- Keep `Googlebot` crawling allowed for public content.
- Keep private/admin endpoints protected independently of robots.
- Validate suspicious high-rate traffic before applying crawler-specific blocks.
