# Testing and Scripts Documentation

This document explains the backend verification and performance scripts.

## Core Principles

1. Keep source scripts in version control.
2. Run these scripts before large backend refactors and release hardening.

## Scripts Context

| Script                         | Command                 | Purpose                                                                  |
| ------------------------------ | ----------------------- | ------------------------------------------------------------------------ |
| `scripts/verify-api-parity.ts` | `pnpm verify:api`       | Confirms critical action-to-API mapping and catches backend parity drift |
| `scripts/validate-queries.ts`  | `pnpm validate:queries` | Validates query plans and highlights scans/sorts/perf regressions        |

## Testing Strategy

The API Test Suite verifies backend route contracts and backend hardening behavior. Run the full suite with:

```bash
pnpm test:api
```

### Key Test Files and Intents

- `admin.auth-boundary.test.ts`: Guards admin route boundaries.
- `views.routes.test.ts`: Enforces canonical increment behavior for views.
- `public.validation-failure-race.test.ts`: Covers parallel request scenarios, 429/500 envelopes, and bad payloads.
- `backend.hardening.test.ts`: Integration checks with in-memory MongoDB for realistic concurrent workloads.

The suite prevents unauthorized access, guards payload validations, and traps errors on failing APIs before production.
