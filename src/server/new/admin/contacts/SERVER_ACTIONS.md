# Admin Contacts Server Actions Guide

## Purpose

This module is the canonical admin backend contract for contact messages.

Supported capabilities:

- list contacts (filter/search/sort/pagination)
- get single contact by id
- read dashboard stats by status
- mark read / mark replied
- send direct response email to a contact and mark replied
- archive / unarchive
- delete and bulk delete
- bulk archive

## Implementation Files

- src/server/new/admin/contacts/getContacts.ts
- src/server/new/admin/contacts/getContactById.ts
- src/server/new/admin/contacts/getContactStats.ts
- src/server/new/admin/contacts/markContactAsRead.ts
- src/server/new/admin/contacts/markContactAsReplied.ts
- src/server/new/admin/contacts/sendContactResponse.ts
- src/server/new/admin/contacts/archiveContact.ts
- src/server/new/admin/contacts/unarchiveContact.ts
- src/server/new/admin/contacts/deleteContact.ts
- src/server/new/admin/contacts/bulkArchiveContacts.ts
- src/server/new/admin/contacts/bulkDeleteContacts.ts
- src/server/new/admin/contacts/shared.ts
- src/server/new/admin/contacts/types.ts

## Security and invariants

1. Every action requires authenticated admin session.
2. Contact ids are validated before read/write operations.
3. Contact status uses Contact model values (`new | read | replied | archived`).
4. Single-item status mutations use Contact instance methods where available.
5. Mutations revalidate admin messages surfaces.

## Integration example

```ts
import { getContacts } from '@/server/new/admin/contacts';

const result = await getContacts({
    status: 'new',
    query: 'gmail.com',
    pagination: { offset: 0, limit: 20 },
    sort: { sortBy: 'createdAt', sortOrder: 'desc' },
});
```
