# Auth Server Actions

Two-step login with OTP verification and forgot password flow for admin authentication.

## Overview

### Two-Step Login Flow
1. **Verify Credentials** - Validate email/password, get pending token and email options
2. **Request Login OTP** - Send OTP to chosen email (main or recovery)
3. **Verify Login OTP** - Validate OTP and complete login (create session)

### Forgot Password Flow
1. **Request Password Reset** - Send reset token to admin's primary email
2. **Verify Reset Token** - (Optional) Check if token is valid before showing form
3. **Reset Password** - Validate token and update password

---

## Actions

### `verifyCredentials`

**Step 1 of Two-Step Login** - Validate admin credentials without creating a session.

```typescript
import { verifyCredentials } from '@/server/new/admin/auth';

const result = await verifyCredentials({
  email: 'admin@example.com',
  password: 'SecurePassword123',
});

// Success: {
//   pendingToken: 'eyJ...',
//   emailOptions: [
//     { type: 'main', maskedEmail: 'ad***@example.com' },
//     { type: 'recovery', maskedEmail: 're***@backup.com' }
//   ],
//   adminName: 'Admin User'
// }
```

**Responses:**
- `200` - Credentials valid. Returns pendingToken, emailOptions, adminName.
- `400` - Missing or invalid input (email/password).
- `401` - Invalid credentials.
- `409` - Password auth not configured for account.

---

### `requestLoginOtp`

**Step 2 of Two-Step Login** - Generate and send OTP to chosen email address.

```typescript
import { requestLoginOtp } from '@/server/new/admin/auth';

const result = await requestLoginOtp({
  pendingToken: 'eyJ...',
  targetEmail: 'main', // or 'recovery'
});

// Success: {
//   sent: true,
//   sentTo: 'ad***@example.com',
//   expiresIn: '5 minutes'
// }
```

**Responses:**
- `200` - OTP sent successfully.
- `400` - Missing input or recovery email not set.
- `401` - Invalid or expired pending token.
- `404` - Admin not found.
- `500` - Email service error.

---

### `verifyLoginOtp`

**Step 3 of Two-Step Login** - Validate OTP and complete login.

```typescript
import { verifyLoginOtp } from '@/server/new/admin/auth';

const result = await verifyLoginOtp({
  pendingToken: 'eyJ...',
  otp: '123456',
});

// Success: {
//   success: true,
//   redirectTo: '/admin'
// }
```

**Responses:**
- `200` - OTP verified, session created.
- `400` - Invalid OTP, expired OTP, or wrong OTP.
- `401` - Invalid or expired pending token.
- `404` - Admin not found.
- `500` - Session creation failure.

---

### `requestPasswordReset`

**Forgot Password Step 1** - Request password reset email.

```typescript
import { requestPasswordReset } from '@/server/new/admin/auth';

const result = await requestPasswordReset({
  email: 'admin@example.com',
});

// Always returns: {
//   sent: true,
//   message: 'If an account exists with this email...'
// }
```

**Security Note:** Always returns the same response regardless of whether the email exists to prevent email enumeration.

**Responses:**
- `200` - Always returns success message.
- `400` - Missing or invalid email format.
- `500` - Email service not configured.

---

### `verifyResetToken`

**Forgot Password Step 2 (Optional)** - Check if reset token is valid.

```typescript
import { verifyResetToken } from '@/server/new/admin/auth';

const result = await verifyResetToken({
  token: 'a7Bx9kM2pQ4rS1tV',
});

// Valid: { valid: true, email: 'ad***@example.com' }
// Invalid: { valid: false }
```

**Responses:**
- `200` - Returns validity status.
- `400` - Missing token.
- `500` - Unexpected error.

---

### `resetPassword`

**Forgot Password Step 3** - Reset password with valid token.

```typescript
import { resetPassword } from '@/server/new/admin/auth';

const result = await resetPassword({
  token: 'a7Bx9kM2pQ4rS1tV',
  newPassword: 'NewSecure123',
  confirmPassword: 'NewSecure123',
});

// Success: {
//   success: true,
//   message: 'Password reset successfully...'
// }
```

**Responses:**
- `200` - Password reset successfully.
- `400` - Invalid token, weak password, or passwords don't match.
- `500` - Unexpected error.

---

## Security Features

### OTP Security
- 6-digit numeric OTP
- 5-minute expiry
- Single-use (cleared after verification or new request)
- Stored as plaintext with expiry timestamp

### Password Reset Token Security
- 16-character alphanumeric token (URL-safe)
- 15-minute expiry
- Single-use (cleared after password reset)
- Always sent to primary email only

### Pending Login Token (JWT)
- 5-minute expiry
- Signed with NEXTAUTH_SECRET
- Contains adminId, email, and purpose claim
- Required for OTP request and verification

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

---

## API Endpoints

| Endpoint | Method | Action |
|----------|--------|--------|
| `/api/admin/auth/verify-credentials` | POST | verifyCredentials |
| `/api/admin/auth/request-otp` | POST | requestLoginOtp |
| `/api/admin/auth/verify-otp` | POST | verifyLoginOtp |
| `/api/admin/auth/forgot-password` | POST | requestPasswordReset |
| `/api/admin/auth/verify-reset-token` | POST | verifyResetToken |
| `/api/admin/auth/reset-password` | POST | resetPassword |

---

## Database Schema

### Admin Model Extensions

```typescript
// OTP data (for two-step login)
otp: {
  code: string;          // 6-digit OTP
  expiresAt: Date;       // Expiry timestamp
  targetEmail: string;   // Email OTP was sent to
} | null;

// Password reset token
passwordResetToken: {
  token: string;         // 16-char token
  expiresAt: Date;       // Expiry timestamp
} | null;
```

Both fields have `select: false` - they must be explicitly selected when querying.

---

## Flow Diagrams

### Two-Step Login
```
┌─────────────────────────────────────────────────────────────┐
│ 1. POST /api/admin/auth/verify-credentials                  │
│    { email, password }                                       │
│    → { pendingToken, emailOptions, adminName }              │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│ 2. POST /api/admin/auth/request-otp                         │
│    { pendingToken, targetEmail: 'main' | 'recovery' }       │
│    → { sent, sentTo, expiresIn }                            │
│    📧 OTP email sent to chosen address                       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│ 3. POST /api/admin/auth/verify-otp                          │
│    { pendingToken, otp }                                     │
│    → { success, redirectTo }                                 │
│    🔐 NextAuth session created                               │
└─────────────────────────────────────────────────────────────┘
```

### Forgot Password
```
┌─────────────────────────────────────────────────────────────┐
│ 1. POST /api/admin/auth/forgot-password                     │
│    { email }                                                 │
│    → { sent: true, message: '...' }                         │
│    📧 Reset email sent to primary email                      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│ 2. POST /api/admin/auth/verify-reset-token (Optional)       │
│    { token }                                                 │
│    → { valid: true, email: 'masked' } or { valid: false }   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│ 3. POST /api/admin/auth/reset-password                      │
│    { token, newPassword, confirmPassword }                   │
│    → { success, message }                                    │
└─────────────────────────────────────────────────────────────┘
```
