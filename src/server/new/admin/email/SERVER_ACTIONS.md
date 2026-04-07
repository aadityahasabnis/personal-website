# Admin Email Server Actions Guide

## Purpose

This module provides canonical admin-side email management actions.

- Verify SMTP connection status
- Send test emails
- Send password reset emails (to admin's primary email)
- Send OTP verification emails
- Send newsletters to active subscribers (with batch processing)

## Implementation Files

- src/server/new/admin/email/verifyEmailConnection.ts
- src/server/new/admin/email/sendTestEmail.ts
- src/server/new/admin/email/sendPasswordReset.ts
- src/server/new/admin/email/sendOtp.ts
- src/server/new/admin/email/sendNewsletter.ts
- src/server/new/admin/email/shared.ts
- src/server/new/admin/email/types.ts

## Security and invariants

1. Every action enforces admin authentication via `getAdminId()`.
2. Email validation is performed before sending.
3. Password reset emails always go to admin's primary email (not recovery email).
4. OTP must be numeric and exactly `OTP_CONFIG.length` digits (6 by default).
5. Newsletter sending uses batch processing (25 per batch, 2-second delays) to respect Gmail rate limits.
6. Email service configuration is validated before any send operation.
7. All email sends include retry logic with exponential backoff.

## Action behavior

### `verifyEmailConnection()`

- Checks if email service is configured (GMAIL_ACCOUNT, GMAIL_PASSWORD).
- Verifies SMTP connection can be established.
- Returns connection status with timestamp.

### `sendTestEmail(input)`

- Sends a test email to validate delivery.
- Input: `{ to, subject, body, cc?, bcc? }`
- Uses lavender-themed test email template.

### `sendPasswordReset(input)`

- Sends password reset link to admin's primary email.
- Input: `{ resetLink, expiresIn? }`
- Validates URL format for reset link.
- Default expiry: 1 hour.

### `sendOtp(input)`

- Sends OTP verification code.
- Input: `{ to, otp, recipientName?, expiresIn? }`
- Validates OTP is numeric and correct length.
- Default expiry: 10 minutes.

### `sendNewsletter(input)`

- Sends newsletter to active subscribers.
- Input: `{ subject, htmlContent, previewText?, subscriberIds? }`
- If `subscriberIds` provided, sends only to those subscribers.
- Otherwise, sends to all active subscribers (confirmed, not unsubscribed).
- Implements batch sending: 25 emails per batch with 2-second delays.
- Returns detailed tracking per subscriber (sent/failed, messageId, errors).

## Rate Limiting

The email service respects Gmail's rate limits:
- Batch size: 25 emails
- Batch delay: 2000ms between batches
- Warning threshold: 400 emails (Gmail daily limit is 500)

## Email Templates

All emails use a consistent lavender color theme (#9b87f5):
- OTP verification
- Password reset
- Test email
- Newsletter (with unsubscribe link)
- Welcome email

## Integration example

```ts
// Verify connection
import { verifyEmailConnection } from '@/server/new/admin/email';
const status = await verifyEmailConnection();

// Send test email
import { sendTestEmail } from '@/server/new/admin/email';
const result = await sendTestEmail({
    to: 'test@example.com',
    subject: 'Test Subject',
    body: 'Test email body content',
});

// Send newsletter to all active subscribers
import { sendNewsletter } from '@/server/new/admin/email';
const result = await sendNewsletter({
    subject: 'Monthly Newsletter',
    htmlContent: '<h1>Hello!</h1><p>Newsletter content here...</p>',
    previewText: 'Check out our latest updates',
});

// Send newsletter to specific subscribers
const result = await sendNewsletter({
    subject: 'Special Announcement',
    htmlContent: '<h1>Exclusive Content</h1>',
    subscriberIds: ['subscriber-id-1', 'subscriber-id-2'],
});
```

## API Route

The email actions are exposed via `/api/admin/email`:

- `GET /api/admin/email` - Verify email connection
- `POST /api/admin/email` with action-specific body:
  - `{ action: 'verify' }` - Verify connection
  - `{ action: 'test', to, subject, body, cc?, bcc? }` - Send test email
  - `{ action: 'password-reset', resetLink, expiresIn? }` - Send password reset
  - `{ action: 'otp', to, otp, recipientName?, expiresIn? }` - Send OTP
  - `{ action: 'newsletter', subject, htmlContent, previewText?, subscriberIds? }` - Send newsletter
