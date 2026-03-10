# Constants

Application-wide constants organized by domain.

## Files

### `schemaConstants.ts`
Database schema-related constants and validation rules.

**Exports:**
- `CONTENT_TYPES` - Content types (article, blog, project)
- `PROJECT_STATUS` - Project statuses (In Progress, Live, Archived)
- `CONTACT_STATUS` - Contact message statuses
- `COMMENT_STATUS` - Comment moderation statuses
- `SUBSCRIBER_STATUS` - Newsletter subscriber statuses
- `PUBLISH_STATUS` - Content publishing statuses
- `SCHEMA_LIMITS` - Validation limits (max lengths, counts)
- `VALIDATION_PATTERNS` - Regex patterns (slug, email, URL)

### `siteConstants.ts`
Site configuration and navigation.

**Exports:**
- `SITE_CONFIG` - Site metadata and author info
- `NAV_LINKS` - Main navigation items
- `FOOTER_LINKS` - Footer navigation
- `SOCIAL_LINKS` - Social media links

## Usage

```typescript
import { CONTENT_TYPES, SCHEMA_LIMITS } from '@/constants/schemaConstants';
import { SITE_CONFIG, NAV_LINKS } from '@/constants/siteConstants';

// In schemas
enum: Object.values(CONTENT_TYPES),
maxlength: [SCHEMA_LIMITS.TITLE_MAX_LENGTH, 'Title too long'],
match: [VALIDATION_PATTERNS.SLUG, 'Invalid slug'],

// In components
<title>{SITE_CONFIG.title}</title>
{NAV_LINKS.map(link => <Link href={link.href}>{link.label}</Link>)}
```

## Best Practices

✅ **Always use constants** - Never hardcode strings/numbers  
✅ **Import types** - Use exported TypeScript types  
✅ **Stay consistent** - Follow the established patterns

```typescript
// ❌ Bad
if (user.role === 'admin') { }
maxLength={200}

// ✅ Good
if (user.role === USER_ROLES.ADMIN) { }
maxLength={SCHEMA_LIMITS.TITLE_MAX_LENGTH}
```
