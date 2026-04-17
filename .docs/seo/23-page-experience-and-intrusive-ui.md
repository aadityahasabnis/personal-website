# Page Experience and Intrusive UI Guide

## Purpose

Define practical page-experience expectations that support both users and search performance.

## High-Level Principle

Google systems reward content that provides overall strong user experience, not a single metric win.

## Core Experience Areas

- Core Web Vitals quality
- Secure delivery (HTTPS)
- Mobile usability
- Ad and overlay behavior
- Clear separation of main content and secondary UI

## Intrusive Interstitial Guidance

### Avoid

- Full-screen promotional overlays that block primary content
- Forced flow interruptions before user can access content

### Prefer

- Compact banners instead of full overlays
- Dialogs that do not obstruct main content understanding

### Mandatory dialogs

If legally required dialogs are necessary:

- Keep underlying content available where feasible
- Avoid redirecting all incoming URLs to a consent gate page
- Preserve crawlability and indexing clarity

## Project Implementation Notes

- Keep public content immediately readable on first render.
- Keep promotional UI non-disruptive and dismissible.
- Review ad and CTA overlays on mobile as a priority.

## Validation Checklist

- Main content is accessible without disruptive overlays.
- Mobile rendering is stable and usable.
- Security and performance baselines are monitored.
- No UX pattern obscures page purpose for crawlers or users.
