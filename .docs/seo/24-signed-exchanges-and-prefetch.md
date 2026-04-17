# Signed Exchanges and Prefetch Optimization

## Purpose

Capture operational guidance for Signed Exchanges (SXG) as a performance optimization path.

## What SXG Can Improve

SXG can help prefetch key resources while preserving origin trust signals, potentially improving perceived load speed and LCP.

## Adoption Position

SXG is optional. Evaluate only if performance goals justify implementation complexity.

## Implementation Considerations

- Follow web packaging implementation tooling guidance
- Set appropriate SXG expiration boundaries
- Ensure responsive delivery or clearly annotated media support constraints
- Avoid embedding highly personalized content in SXG payloads without proper strategy

## Monitoring and Debugging

- Validate SXG output and cache eligibility
- Monitor fallback behavior when SXG is not used
- Confirm no canonical/indexing regressions after rollout

## Risk Controls

- Keep canonical URL behavior unchanged
- Keep non-SXG fallback fully functional
- Roll out incrementally and compare performance metrics

## Project Implementation Notes

- Treat SXG as an optimization layer after SEO and crawl basics are already stable.
- Prefer staged experiments with measurable impact thresholds.
