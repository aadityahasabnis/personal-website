# API Test Suite Guide

This suite verifies backend route contracts and backend hardening behavior.

Run all API tests:

```bash
pnpm test:api
```

## What this suite is for

1. Guard route boundaries (especially admin auth).
2. Protect validation/error envelope consistency.
3. Catch regressions in rate limit and race-condition handling.
4. Keep canonical route behavior stable (for example, views endpoint policy).

## Test files and intent

| File                                               | When to run                                                | Why it matters                                                                                       |
| -------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `tests/api/admin.auth-boundary.test.ts`            | Any auth/session/admin-route change                        | Prevents unauthorized access regressions on admin APIs                                               |
| `tests/api/admin.missing-coverage.test.ts`         | Admin comments/contacts/subscribers/settings route updates | Verifies critical route dispatch behavior and unsupported action handling                            |
| `tests/api/comments.test.ts`                       | Admin comments API changes                                 | Confirms baseline success, validation failure, and 500 fallbacks                                     |
| `tests/api/contacts.test.ts`                       | Admin contacts API changes                                 | Confirms baseline success, validation failure, and 500 fallbacks                                     |
| `tests/api/subscribers.test.ts`                    | Admin subscribers API changes                              | Confirms baseline success, validation failure, and 500 fallbacks                                     |
| `tests/api/views.routes.test.ts`                   | Content views route changes                                | Enforces canonical increment behavior and removed POST behavior for blog/project views               |
| `tests/api/public.validation-failure-race.test.ts` | Public contact/subscribe/comments/stats wrapper changes    | Covers malformed payloads, validation passthrough, 429/500 envelopes, and parallel request scenarios |
| `tests/api/backend.hardening.test.ts`              | Model/index/engagement/anti-abuse changes                  | Integration-grade safety checks with in-memory MongoDB for correctness under realistic writes        |

## Practical run strategy

1. Fast route smoke: run `pnpm test:api`.
2. Before release: run `pnpm test:api` and `pnpm verify:api` together.
3. After query/index changes: run `pnpm test:api` and `pnpm validate:queries`.

## Scope notes

- These are backend-focused tests only.
- They are designed to validate route and server-action contracts, not UI rendering.
