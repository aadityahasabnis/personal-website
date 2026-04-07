# Backend Scripts Guide

This folder contains backend verification and performance scripts.

## Principles

1. Keep source scripts in version control.
2. Treat generated JSON reports as ephemeral run artifacts.
3. Run these scripts before large backend refactors and before release hardening.

## Scripts in this folder

| Script                         | How to run              | When to use                                                | Why to use                                                               |
| ------------------------------ | ----------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| `scripts/verify-api-parity.ts` | `pnpm verify:api`       | After adding/changing server actions or API route wrappers | Confirms critical action-to-API mapping and catches backend parity drift |
| `scripts/validate-queries.ts`  | `pnpm validate:queries` | After changing indexes, query filters, or sort patterns    | Validates query plans and highlights scans/sorts/perf regressions        |

## Optional arguments

### `validate-queries.ts`

- `--out=<path>`: write report to a custom JSON path.
- `--compare=<path>`: compare current run against a previous snapshot.
- `--thresholdMs=<number>`: fail warnings when query latency exceeds threshold.

Example:

```bash
pnpm validate:queries -- --out=scripts/query-performance.current.json --compare=scripts/query-performance.baseline.json --thresholdMs=50
```

## Generated artifacts

These are intentionally not kept in the repository:

- `scripts/*.output.json`
- `scripts/query-performance*.json`
- `scripts/query-performance-report.json`
- `/.audit-matrix.json`

They are generated during local verification runs and should be treated as disposable diagnostics.

## Related commands outside this folder

| Command                     | Backing file                       | Purpose                                           |
| --------------------------- | ---------------------------------- | ------------------------------------------------- |
| `pnpm admin:create`         | `src/scripts/create-admin.ts`      | Seed/create an admin account in local environment |
| `pnpm db:fix-content-index` | `src/scripts/fix-content-index.ts` | Apply index corrections for content collection    |
