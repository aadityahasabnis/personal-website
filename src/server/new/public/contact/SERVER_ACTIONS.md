# Public Contact Server Actions Guide

## Purpose

This module handles public contact form submission from website visitors.

- validates payload values
- creates `contacts` document using Contact model keys
- stores optional hashed IP as `ipHash`

## Implementation Files

- src/server/new/public/contact/submitPublicContact.ts
- src/server/new/public/contact/shared.ts
- src/server/new/public/contact/types.ts

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
