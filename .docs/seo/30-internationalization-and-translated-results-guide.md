# Internationalization and Translated Results Guide

## Purpose

Define how to prepare this project for multilingual search behavior and translated result handling, without introducing canonical/hreflang conflicts.

## Current State

Primary site language appears single-locale. This guide is forward-compatible and should be activated when multilingual routes are introduced.

## Core Principles

1. One canonical URL per language-targeted equivalent page
2. Explicit language targeting via `hreflang` clusters
3. Self-referencing `hreflang` and canonical consistency
4. No machine-translated low-quality pages published at scale

## URL Strategy Options

Choose one strategy and stay consistent:

- Subpaths: `/en/...`, `/hi/...`
- Subdomains: `en.example.com`, `hi.example.com`
- ccTLDs (usually unnecessary for this project)

Recommended for this project: subpaths for maintainability.

## hreflang Implementation Rules

For each localized page set:

- Include alternate links for all language variants
- Include `x-default` when appropriate
- Ensure reciprocal linking among variants
- Ensure each variant references itself

## Canonical Rules in Multilingual Setups

- Canonical should usually point to same-language URL, not always to one master language page
- Do not canonicalize all translations to one source page
- Keep translated metadata and on-page text aligned

## Translated Results Considerations

Google may translate or present language alternatives based on user context.

To minimize confusion:

- Preserve clear language markup and correct locale metadata
- Avoid mixed-language content in a single page body
- Ensure nav/UI labels are localized coherently

## Quality Requirements for Localized Content

- Human-reviewed translation quality
- Correct cultural/terminology adaptation for technical concepts
- Equivalent informational completeness across key languages

Avoid thin translated variants that only rewrite headings while leaving body incomplete.

## Operational Checklist

- Locale-aware metadata generation verified
- hreflang links validated for reciprocal integrity
- Canonical tags audited across all locale routes
- Sitemap includes language variants appropriately
- Search Console properties monitored for target regions/languages

## Migration Path for This Project

If multilingual expansion starts:

1. Define locale routing contract in App Router
2. Add locale-aware metadata + hreflang helper utilities
3. Add locale-aware canonical logic tests
4. Launch one language segment first and validate indexing behavior
5. Expand incrementally with QA gates
