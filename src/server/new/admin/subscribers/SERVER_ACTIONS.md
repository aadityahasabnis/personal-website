# Admin Subscribers Server Actions Guide

## Purpose

This module provides canonical admin-side subscriber management actions.

- table query with filter/search/sort/pagination
- subscriber stats query
- confirm subscriber
- mark subscriber pending
- delete one or many subscribers
- export filtered CSV

## Implementation Files

- src/server/new/admin/subscribers/getSubscribers.ts
- src/server/new/admin/subscribers/getSubscriberStats.ts
- src/server/new/admin/subscribers/confirmSubscriber.ts
- src/server/new/admin/subscribers/markSubscriberPending.ts
- src/server/new/admin/subscribers/deleteSubscriber.ts
- src/server/new/admin/subscribers/bulkDeleteSubscribers.ts
- src/server/new/admin/subscribers/exportSubscribers.ts
- src/server/new/admin/subscribers/shared.ts
- src/server/new/admin/subscribers/types.ts

## Security and invariants

1. Every action enforces admin authentication via `getAdminId()`.
2. Subscriber id mutations require valid ObjectId input.
3. Filtering semantics are deterministic:
    - `confirmed`: `confirmed=true` and not unsubscribed
    - `pending`: `confirmed=false` and not unsubscribed
    - `unsubscribed`: `unsubscribedAt != null`
4. Table sorting is restricted to an allowlist of known fields.
5. CSV values are escaped to produce valid export output.
6. Mutations revalidate subscriber-related admin paths.

## Action behavior

### `getSubscribers(params)`

- Returns paginated rows for admin data tables.
- Supports `query`, `filter`, `pagination`, and allowlisted sort fields.

### `getSubscriberStats()`

- Returns aggregate totals for dashboard cards.
- Includes `active` count using Subscriber model static method.

### `confirmSubscriber(subscriberId)`

- Marks a pending subscriber as confirmed.

### `markSubscriberPending(subscriberId)`

- Admin-only status change from confirmed to pending.
- Rejects operation for unsubscribed records.

### `deleteSubscriber(subscriberId)`

- Deletes one subscriber by id.

### `bulkDeleteSubscribers(subscriberIds)`

- Validates and deduplicates ids, then deletes in one query.

### `exportSubscribers(filter)`

- Builds filtered row set and returns CSV text payload.

## Integration example

```ts
import { getSubscribers } from '@/server/new/admin/subscribers';

const result = await getSubscribers({
    query: 'gmail.com',
    filter: 'confirmed',
    pagination: { offset: 0, limit: 25 },
    sort: { sortBy: 'subscribedAt', sortOrder: 'desc' },
});
```
