# Fix Search-Related JavaScript Issues

## Purpose

Provide a structured incident workflow for diagnosing and fixing JavaScript indexing problems.

## Diagnosis Workflow

1. Test URL in URL Inspection (live test) and Rich Results Test.
2. Compare raw response vs rendered HTML.
3. Check JavaScript console errors from rendering output.
4. Confirm critical resources are fetchable and not blocked.
5. Re-test after changes.

## High-Impact Failure Patterns

### Soft 404 behavior in SPA routes

Problem:

- Application shows "not found" UI but server still returns `200`.

Fix options:

- Redirect to a real server `404` route.
- Apply `noindex` to error state pages when true 404 is infeasible.

### Fragment-based routing

Problem:

- `#/route` URLs are weak for crawl/index discovery.

Fix:

- Use path-based URLs and History API.

### State-dependent rendering assumptions

Problem:

- Critical content requires cookies/local storage state unavailable to crawler sessions.

Fix:

- Provide server-available fallback content and deterministic rendering path.

### Unsupported runtime features

Problem:

- Critical content depends on APIs unavailable in crawler runtime.

Fix:

- Use feature detection plus fallback/polyfill where suitable.

### JS/CSS cache staleness

Problem:

- Old assets can cause partial or broken rendering.

Fix:

- Fingerprinted versioned asset filenames.

## Logging Recommendations

Capture and monitor:

- JS runtime errors
- Failed resource fetches
- Route-level render failures
- Status code mismatches (UI vs HTTP)

## Project Remediation Standard

For public route regressions:

1. Confirm route status code correctness.
2. Confirm canonical, robots, and schema presence in rendered HTML.
3. Confirm important text content exists without user interaction.
4. Confirm crawlable links to and from the route.
5. Re-run Search Console URL Inspection.
