# Constants

Application-wide constants organized by domain.

## Files

### `schemaConstants.ts`

Database schema constants, route mappings, status enums, and validation limits.

**Exports:**

- `CONTENT_TYPES`
- `PUBLIC_READ_CONTENT_TYPE_VALUES`
- `CONTENT_ROUTE_SEGMENTS`
- `CONTENT_TYPE_TO_ROUTE_SEGMENT`
- `PROJECT_STATUS`
- `PROJECT_STATUS_OPTIONS`
- `CONTACT_STATUS`
- `COMMENT_STATUS`
- `SUBSCRIBER_STATUS`
- `PUBLISH_STATUS`
- `SCHEMA_LIMITS`
- `VALIDATION_PATTERNS`

### `siteConstants.ts`

Site metadata, navigation links, social links, and collection names.

**Exports:**

- `SITE_CONFIG`
- `NAV_LINKS`
- `FOOTER_LINKS`
- `SOCIAL_LINKS` (includes `icon`, `ariaLabel`, and external-link metadata)
- `COLLECTIONS`

### `emailConstants.ts`

Email and auth-email configuration.

**Exports:**

- `EMAIL_TYPE`
- `EMAIL_STATUS`
- `GMAIL_SMTP_CONFIG`
- `EMAIL_RETRY_CONFIG`
- `EMAIL_RATE_LIMIT`
- `DEFAULT_SENDER`
- `EMAIL_COLORS`
- `EMAIL_VALIDATION`
- `OTP_CONFIG`
- `PASSWORD_RESET_CONFIG`
- `PENDING_LOGIN_CONFIG`

### `mediaConstants.ts`

Media upload constraints, MIME groups, API constants, and media helpers.

**Exports:**

- `MEDIA_FILE_TYPES`
- `MEDIA_FOLDERS`
- `MEDIA_FOLDER_OPTIONS`
- `MEDIA_UPLOAD_LIMITS`
- `ALLOWED_IMAGE_TYPES`
- `ALLOWED_VIDEO_TYPES`
- `ALLOWED_FILE_TYPES`
- `ALL_ALLOWED_MIME_TYPES`
- `MEDIA_SERVICE_CONFIG`
- `getMediaTypeFromMimeType()`
- `isAllowedMimeType()`
- `getMaxFileSizeForType()`
- `formatBytes()`
- `isValidFolder()`

## Usage

```typescript
import { SCHEMA_LIMITS, VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import { SITE_CONFIG, NAV_LINKS, SOCIAL_LINKS } from '@/constants/siteConstants';
import { EMAIL_VALIDATION } from '@/constants/emailConstants';
import { MEDIA_UPLOAD_LIMITS, isAllowedMimeType } from '@/constants/mediaConstants';

// Schema constraints
maxlength: [SCHEMA_LIMITS.TITLE_MAX_LENGTH, 'Title too long'];
match: [VALIDATION_PATTERNS.SLUG, 'Invalid slug'];

// Navigation and social UI
NAV_LINKS.map((link) => link.href);
SOCIAL_LINKS.map((link) => link.icon);

// Input validation
const validEmail = EMAIL_VALIDATION.regex.test(value);
const validMimeType = isAllowedMimeType(file.type);
const maxSize = MEDIA_UPLOAD_LIMITS.MAX_IMAGE_SIZE;

// Metadata
const siteTitle = SITE_CONFIG.title;
```

## Best Practices

- Always use constants for shared values.
- Keep feature-specific constants in their domain file.
- Keep literal unions inferred via `as const`.
- Add new constants before using values in components/services.
- Avoid hardcoded strings and limits in business logic.
