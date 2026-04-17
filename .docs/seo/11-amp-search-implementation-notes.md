# AMP Search Implementation Notes

## Purpose

Capture AMP-specific SEO requirements for teams that may enable AMP later.

## Current Project Status

AMP is not a required baseline for this project today.

This document is maintained for future implementation readiness.

## Core AMP Requirements

- AMP page must be valid AMP HTML.
- AMP and canonical versions should provide equivalent core user value.
- AMP pages should remain discoverable through correct linking relations.

## Linking Requirements

For paired setup (canonical non-AMP + AMP):

- Canonical page includes `rel="amphtml"` to AMP URL.
- AMP page includes `rel="canonical"` to canonical URL.

For canonical AMP-only setup:

- AMP page is self-canonical.

## Structured Data

- Keep structured data consistent between AMP and canonical versions.
- Validate with Rich Results Test and AMP Test.

## Monitoring

- Use Search Console AMP status report.
- Monitor rich result eligibility separately from AMP validity.

## Removal Strategy (if AMP is deprecated)

- Remove `rel="amphtml"` references from canonical pages.
- Redirect AMP URLs to canonical non-AMP where needed.
- Return proper status codes for removed endpoints.
- Monitor decline of indexed AMP URLs in Search Console.

## Project Guidance

If AMP is introduced in this codebase later:

1. Start with one route family.
2. Validate end-to-end (discovery, canonical pairing, rich results).
3. Roll out gradually with monitoring gates.
