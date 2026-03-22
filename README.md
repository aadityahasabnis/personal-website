# Personal Website Backend and App

Production-focused personal website built with Next.js App Router, MongoDB, and typed server actions.

## Stack

- Next.js 16
- TypeScript (strict mode)
- MongoDB + Mongoose
- NextAuth (admin auth)
- Vitest (API/backend test coverage)

## Local setup

1. Install dependencies:

```bash
pnpm install
```

2. Create environment file from `.env.example` and configure required keys.

3. Start dev server:

```bash
pnpm dev
```

## Core commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm typecheck:backend
pnpm test:api
pnpm verify:api
pnpm validate:queries
```

## Backend quality workflow

Use this baseline before backend merges:

1. `pnpm test:api`
2. `pnpm verify:api`
3. `pnpm validate:queries` (when query/index changes are included)

## Documentation map

- Infrastructure and runtime behavior: `INFRASTRUCTURE.md`
- Backend implementation status: `BACKEND_IMPLEMENTATION_PLAN.md`
- Server action verification charter: `verify_server_actions.md`
- Script usage and rationale: `scripts/README.md`
- API tests usage and rationale: `tests/api/README.md`
- Server action domain contracts: `src/server/new/**/SERVER_ACTIONS.md`

## Notes

- Backend scripts may generate local JSON diagnostics under `scripts/`; these artifacts are intentionally ignored and not part of source code.
- API routes are thin wrappers over server actions where possible to preserve a single backend contract surface.
