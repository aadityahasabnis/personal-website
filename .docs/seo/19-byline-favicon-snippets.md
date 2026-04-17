# Byline Dates, Favicons, and Snippets Guide

## Purpose

Define practical implementation standards for publication dates, favicon behavior, and snippet controls.

## Byline Date Standards

### What to provide

- A clearly visible publish date and/or last updated date
- Structured data dates (`datePublished` and `dateModified`) where applicable
- ISO 8601 formatting in markup

### Consistency requirements

- Visible and structured dates should represent the same timeline intent
- Avoid future publication dates
- Minimize unrelated extra dates that could confuse date selection

## Favicon Standards

### Requirements

- Add favicon link on site home page
- Use square favicon (recommended larger than 48x48)
- Keep favicon URL stable
- Ensure Googlebot and Googlebot-Image can crawl home page and favicon asset

### Host-level behavior

- One favicon per host
- Subdomains may have their own favicon
- Subdirectories do not have separate favicon identity

## Snippet Controls

### Default behavior

Google usually generates snippets from page content and may use meta description when better.

### Control options

- Block snippets: `nosnippet`
- Limit snippet length: `max-snippet`
- Exclude part of text: `data-nosnippet`

### Best practices

- Write unique meta descriptions for key pages
- Keep descriptions specific and useful
- Avoid keyword stuffing

## Project Implementation Notes

- Ensure article and content templates keep visible dates and schema dates aligned.
- Ensure favicon is configured and crawlable at host level.
- Use snippet controls surgically, not globally.
