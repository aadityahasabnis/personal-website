# Public Contact Server Actions Guide

## Purpose

This module handles public contact form submission from website visitors.

- validates payload values
- creates `contacts` document using Contact model keys
- stores optional hashed IP as `ipHash`
- enforces anti-abuse protections (rate limits + duplicate-window checks)

## Implementation Files

- src/server/new/public/contact/submitPublicContact.ts
- src/server/new/public/contact/shared.ts
- src/server/new/public/contact/types.ts
- src/server/new/public/shared/helpers.ts

## Action behavior

### `submitPublicContact(input)`

- Validates `name`, `email`, `subject`, and `message` against schema limits/patterns.
- Normalizes name/subject/message and lowercases email.
- Creates a contact row with:
    - `name`
    - `email`
    - `subject`
    - `message`
    - `status: new`
    - `ipHash` when `ipAddress` is provided

## Abuse controls (current)

1. Per-client rate limit window (IP-based fingerprint scope).
2. Per-email rate limit window.
3. Duplicate-submission window check for same email + subject + message.
4. Throttled flows return stable typed error envelopes.

## API adapter guidance

1. Runtime enforcement must remain in server action layer.
2. Any API route for integration testing should be a thin wrapper only.
3. API adapters must not duplicate or replace this module's validation/abuse logic.

## Integration example

```ts
import { submitPublicContact } from '@/server/new/public/contact';

const result = await submitPublicContact({
    name: 'Visitor Name',
    email: 'visitor@example.com',
    subject: 'Hello',
    message: 'I would like to connect.',
});
```

## Response semantics

1. `201` created on accepted contact submission.
2. `400` for invalid payload fields.
3. `429` for throttled abuse/rate-limited submissions.
4. `409` for duplicate submission within configured window.
5. `500` for unexpected failures.
