# Public Read Contract Checklist

## Scope

Domains covered:

- article
- blog
- project

Mandatory actions per domain:

- by-path read
- by-id read
- listing read
- static-paths read

## Contract checks

1. Local domain index exports include a declared read-contract object.
2. Declared contract object wires by-path, by-id, list, and static-path actions.
3. Global read-contract registry includes article, blog, and project domains.
4. By-id and by-path actions return the same domain detail envelope shape.
5. Listing actions use normalized pagination and deterministic sorting.
6. Static-path actions are deterministic and suitable for SSG/ISR discovery.
7. Public read actions return published-only content (or null/not-found response).

## Deterministic sorting standard

- Use explicit domain sort keys.
- Add a stable tie-breaker (slug when available, then \_id).
- Preserve pagination stability under repeated reads.

## Contract files

- src/server/new/public/content/article/index.ts
- src/server/new/public/content/blog/index.ts
- src/server/new/public/content/project/index.ts
- src/server/new/public/content/readContractChecks.ts
