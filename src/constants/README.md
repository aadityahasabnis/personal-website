# Constants Documentation

This directory contains all application-wide constants, organized by domain.

## Files

### `schemaConstants.ts`
Database schema-related constants, enums, and validation rules.

**Exports:**
- `CONTENT_TYPES` - Content type enums (article, blog, project)
- `PROJECT_STATUS` - Project status values (In Progress, Live, Archived)
- `USER_ROLES` - User role enums (admin, viewer)
- `CONTACT_STATUS` - Contact message status values (new, read, replied, archived)
- `COMMENT_STATUS` - Comment moderation statuses (pending, approved, spam, rejected)
- `SUBSCRIBER_STATUS` - Newsletter subscriber statuses (pending, active, unsubscribed)
- `PUBLISH_STATUS` - Content publishing statuses (draft, scheduled, published, archived)
- `SCHEMA_LIMITS` - Validation limits for all fields (max lengths, counts, etc.)
- `VALIDATION_PATTERNS` - Regex patterns for validation (slug, email, URL, etc.)
- `SCHEMA_DEFAULTS` - Default values for schema fields
- Helper functions: `hasPermission()`, `getContentTypeLabel()`, `getStatusColor()`

**Usage:**
```typescript
import { CONTENT_TYPES, SCHEMA_LIMITS, VALIDATION_PATTERNS } from '@/constants/schemaConstants';

// Use in mongoose schema
const schema = new Schema({
  type: {
    type: String,
    enum: Object.values(CONTENT_TYPES),
  },
  title: {
    maxlength: [SCHEMA_LIMITS.TITLE_MAX_LENGTH, 'Title too long'],
  },
  slug: {
    match: [VALIDATION_PATTERNS.SLUG, 'Invalid slug format'],
  },
});

// Use in application logic
if (content.type === CONTENT_TYPES.ARTICLE) {
  // Handle article
}
```

### `siteConstants.ts`
Site-wide configuration and UI constants.

**Exports:**
- `SITE_CONFIG` - Site metadata (name, description, author, socials, SEO)
- `NAV_LINKS` - Navigation menu items
- `FOOTER_LINKS` - Footer navigation sections
- `SOCIAL_LINKS` - Social media platform links

**Usage:**
```typescript
import { SITE_CONFIG, NAV_LINKS } from '@/constants/siteConstants';

// Use in metadata
export const metadata = {
  title: SITE_CONFIG.title,
  description: SITE_CONFIG.description,
};

// Use in navigation
<nav>
  {NAV_LINKS.map(link => (
    <Link key={link.href} href={link.href}>{link.label}</Link>
  ))}
</nav>
```

## Schema Constants Reference

### Content Types
```typescript
CONTENT_TYPES = {
  ARTICLE: 'article',
  BLOG: 'blog',
  PROJECT: 'project',
}
```
Used for: Content type discrimination, routing, filtering

### Project Status
```typescript
PROJECT_STATUS = {
  IN_PROGRESS: 'In Progress',
  LIVE: 'Live',
  ARCHIVED: 'Archived',
}
```
Used for: Project filtering, status badges, analytics

### User Roles
```typescript
USER_ROLES = {
  ADMIN: 'admin',
  VIEWER: 'viewer',
}
```
Used for: Authorization, permission checks, admin panel access

### Contact Status
```typescript
CONTACT_STATUS = {
  NEW: 'new',
  READ: 'read',
  REPLIED: 'replied',
  ARCHIVED: 'archived',
}
```
Used for: Contact form management, inbox filtering, workflow

### Schema Limits
```typescript
SCHEMA_LIMITS = {
  TITLE_MIN_LENGTH: 2,
  TITLE_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 500,
  SLUG_MAX_LENGTH: 100,
  TAGS_MAX_COUNT: 10,
  TAG_MAX_LENGTH: 30,
  SEO_TITLE_MAX_LENGTH: 70,
  SEO_DESCRIPTION_MAX_LENGTH: 160,
  SEO_KEYWORDS_MAX_COUNT: 15,
  COMMENT_MIN_LENGTH: 2,
  COMMENT_MAX_LENGTH: 2000,
  // ... and more
}
```
Used for: Mongoose schema validation, form validation, UI constraints

### Validation Patterns
```typescript
VALIDATION_PATTERNS = {
  SLUG: /^[a-z0-9-]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  GITHUB_URL: /^https:\/\/github\.com\/.+/,
}
```
Used for: Form validation, mongoose schema validation, input sanitization

## Best Practices

1. **Always import from constants** - Never use magic strings/numbers
   ```typescript
   // ❌ Bad
   if (user.role === 'admin') { }
   
   // ✅ Good
   if (user.role === USER_ROLES.ADMIN) { }
   ```

2. **Use SCHEMA_LIMITS for validation** - Keep validation rules consistent
   ```typescript
   // ❌ Bad
   maxLength={200}
   
   // ✅ Good
   maxLength={SCHEMA_LIMITS.TITLE_MAX_LENGTH}
   ```

3. **Use helper functions** - Leverage provided utilities
   ```typescript
   // Check permissions
   if (hasPermission(userRole, USER_ROLES.ADMIN)) { }
   
   // Get labels
   const label = getContentTypeLabel(content.type);
   
   // Get colors
   const color = getStatusColor(project.status);
   ```

4. **Export types** - Use TypeScript types for type safety
   ```typescript
   import type { ContentType, ProjectStatus } from '@/constants/schemaConstants';
   
   function filterProjects(status: ProjectStatus) { }
   ```

## Where Constants Are Used

### Models (`src/server/models/`)
- Content validation rules
- Enum values
- Default values
- Pattern matching

### Queries (`src/server/new/`)
- Filtering by type/status
- Status transitions
- Permission checks

### UI Components
- Status badges
- Filtering dropdowns
- Form validation
- Error messages

### API Routes
- Request validation
- Response formatting
- Permission guards

## Backward Compatibility

For backward compatibility, `schema.ts` re-exports all schema constants:

```typescript
// Both work the same
import { CONTENT_TYPES } from '@/constants/schemaConstants';
import { CONTENT_TYPES } from '@/interfaces/schema';
```

**Recommended:** Import from `@/constants/schemaConstants` for clarity.

## Adding New Constants

1. Add to appropriate constants file
2. Export the constant and its type
3. Update this README
4. Update models/queries to use the new constant
5. Add to helper functions if needed

Example:
```typescript
// In schemaConstants.ts
export const NEW_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
} as const;

export type NewStatusType = typeof NEW_STATUS[keyof typeof NEW_STATUS];
```
