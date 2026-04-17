# Media Schema and Visual Search Guide (Video, Image, Discover)

## Purpose

Define practical rules for media-related search features:

- Video indexing and rich video eligibility
- Image metadata and image-search quality signals
- Discover compatibility from a media standpoint

## Video SEO and VideoObject

### When to use

Use `VideoObject` only when a page hosts or strongly features a specific video that users can access.

### Core fields

- `name`
- `description`
- `thumbnailUrl`
- `uploadDate`
- `contentUrl` or `embedUrl`
- `duration` (recommended)

### Delivery requirements

- Video asset and thumbnail must be crawlable
- Thumbnail should be high quality and stable
- Video should be discoverable in rendered HTML/server output

### Page requirements

- Video context should be clear in visible content
- Title/description should match page semantics
- Avoid hidden or deceptive video markup

## Image SEO Baseline

### Operational requirements

- Descriptive, context-aware alt text
- Stable image URLs for primary assets
- Optimized dimensions and formats
- Correct lazy loading and responsive behavior

### Metadata and rights (if applicable)

If licensing/credit workflows are relevant, include accurate image metadata and attribution consistently.

Do not add licensing claims unless legally and operationally maintained.

## Discover-Oriented Media Considerations

Discover performance typically benefits from:

- Strong primary image quality
- Clear topical intent
- Helpful, people-first content
- Freshness where relevant

For this project, ensure each major article has a high-quality hero image and strong metadata consistency.

## Integration with Current Stack

- Generate media schema on the server with route metadata
- Keep image URLs aligned with canonical domain and storage settings
- Avoid client-only media metadata assembly

## Validation Checklist

- Video pages validate with Rich Results Test where applicable
- Thumbnails return success status and are not blocked
- Alt text quality review for critical templates
- No broken media URLs in sitemap-listed pages

## Common Failure Patterns

- Missing/low-quality thumbnails
- Mismatch between page title and video schema name
- Marking generic pages as video pages without prominent playable media
- Reused stock alt text across unrelated images
- Non-crawlable assets due to restrictive robots/storage configuration

## Monitoring Recommendations

- Track video and image-related performance in Search Console
- Sample-inspect new media pages after deployment
- Add periodic asset health checks for hero/thumbnail URLs
