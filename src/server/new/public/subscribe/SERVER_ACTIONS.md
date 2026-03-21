# Public Subscribe Server Actions Guide

## Purpose

This module owns newsletter subscription mutations for public-facing surfaces.

- subscribe with duplicate-safe behavior
- resubscribe via model instance method when previously unsubscribed
- unsubscribe by email

## Implementation Files

- src/server/new/public/subscribe/subscribe.ts
- src/server/new/public/subscribe/unsubscribe.ts
- src/server/new/public/subscribe/shared.ts
- src/server/new/public/subscribe/types.ts

## Contracts and invariants

1. Email is normalized to lowercase trimmed value.
2. Email must match shared schema validation pattern.
3. Optional name is validated with schema-length limits.
4. Existing unsubscribed records are reactivated with `resubscribe()`.
5. Unsubscribe uses the model `unsubscribe()` instance method.
6. Repeated subscribe calls are idempotent and return clear subscription state.

## Action behaviors

### `subscribe(input)`

- New email: creates record and returns `state: created`.
- Existing unsubscribed: reactivates record and returns `state: resubscribed`.
- Existing active confirmed: returns `state: active`.
- Existing pending: returns `state: pending`.

### `unsubscribe(input)`

- Subscribed record: marks `unsubscribedAt` and returns `state: unsubscribed`.
- Unknown/already-unsubscribed email: returns a non-leaking success response with `state: unsubscribed`.

## Integration example

```ts
import { subscribe } from '@/server/new/public/subscribe';

const result = await subscribe({
    email: 'reader@example.com',
    name: 'Reader',
});

if (!result.success) {
    // map result.status and result.error to UI
}
```
