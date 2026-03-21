# Admin Settings Server Actions Guide

## Purpose

This module handles only account-level admin settings mutations:

- update profile (name, image, email)
- change password
- update recovery email

No SEO, site-config, or social-settings actions are part of this module.

## Implementation Files

- src/server/new/admin/settings/updateAdminProfile.ts
- src/server/new/admin/settings/changeAdminPassword.ts
- src/server/new/admin/settings/updateAdminRecoveryEmail.ts
- src/server/new/admin/settings/shared.ts
- src/server/new/admin/settings/types.ts

## Security and invariants

1. Every action requires authenticated admin session.
2. Current admin document is resolved from session id/email.
3. Profile email updates enforce unique email across admins.
4. Recovery email updates enforce valid format and uniqueness.
5. Recovery email cannot equal primary admin email.
6. Password changes require current password verification.
7. New password must meet strength policy and differ from current password.

## Action behavior

### updateAdminProfile(input)

- Updates `name`, `email`, and optional `image`.
- Validates email format, name length, and optional image URL.
- Returns normalized profile payload.

### changeAdminPassword(input)

- Validates current/new/confirm fields.
- Verifies current password hash.
- Enforces password strength policy.
- Saves new bcrypt hash.

### updateAdminRecoveryEmail(input)

- Sets or clears `recoveryEmail`.
- Validates format when provided.
- Enforces unique recovery email across admins.
- Returns normalized profile payload.

## Integration example

```ts
import { changeAdminPassword } from '@/server/new/admin/settings';

const result = await changeAdminPassword({
    currentPassword: 'old-password',
    newPassword: 'NewStrongPass1',
    confirmPassword: 'NewStrongPass1',
});
```
