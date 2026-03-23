# Database Architecture

MongoDB/Mongoose schema with ObjectId references, TypeScript interfaces, and discriminated unions.

---

## Collections (8 Total)

| Collection      | Purpose                                 | Key References                        |
| --------------- | --------------------------------------- | ------------------------------------- |
| **topics**      | Top-level categories                    | → Subtopic, Content                   |
| **subtopics**   | Nested categories                       | Topic.\_id → Content                  |
| **content**     | Articles/Blogs/Projects (discriminated) | Topic.\_id, Subtopic.\_id, Admin.\_id |
| **pageStats**   | Views/Likes counters                    | Content.\_id                          |
| **comments**    | Threaded comments                       | Content.\_id, Comment.\_id            |
| **admins**      | Site administrators                     | → Content audit                       |
| **subscribers** | Email subscribers                       | Standalone                            |
| **contacts**    | Contact submissions                     | Standalone                            |

---

## Core Relationships

### Hierarchy: Topic → Subtopic → Content

```
Topic { _id, slug, contentCount }
  └─ Subtopic { _id, topicId, slug, contentCount }
       └─ Content { _id, type, topicId, subtopicId }
            ├─ PageStats { _id, contentId, views, likes }
            └─ Comment { _id, contentId, parentId }
```

**Key Pattern**: ObjectId references for integrity, slug for URLs

---

## Interface Organization

**Location**: `src/interfaces/schema/`

```
schema/
├── base.ts         # IDocument, ITimestamps, IAudit
├── topic.ts        # ITopic
├── subtopic.ts     # ISubtopic
├── content.ts      # IArticle, IBlog, IProject, ISeoMetadata
├── pageStats.ts    # IPageStats
├── comment.ts      # IComment
├── admin.ts        # IAdmin
├── subscriber.ts   # ISubscriber
├── contact.ts      # IContact
└── index.ts        # Re-exports
```

---

## Content Model (Discriminated Union)

Single `content` collection with 3 types:

### Common Base

```typescript
interface IContentBase {
    type: 'article' | 'blog' | 'project';
    slug: string;
    title: string;
    body: string;
    published: boolean;
    createdBy: ObjectId; // Admin._id
    updatedBy: ObjectId; // Admin._id
}
```

### Article

```typescript
interface IArticle extends IContentBase {
    type: 'article';
    topicId: ObjectId;
    subtopicId: ObjectId | null;
    order: number;
}
```

### Blog

```typescript
interface IBlog extends IContentBase {
    type: 'blog';
    // No additional fields
}
```

### Project

```typescript
interface IProject extends IContentBase {
    type: 'project';
    techStack: string[];
    status: 'planning' | 'in-progress' | 'completed';
    githubUrl: string | null;
    order: number;
}
```

---

## Critical Indexes

```typescript
// Content
{ type: 1, slug: 1 }                           // Unique
{ type: 1, topicId: 1, order: 1 }              // Articles by topic
{ type: 1, published: 1, publishedAt: -1 }     // Published content

// Subtopic
{ topicId: 1, slug: 1 }                        // Unique within topic

// PageStats
{ contentId: 1 }                               // Unique for valid ObjectId values (partial unique index)

// Comment
{ contentId: 1, parentId: 1, createdAt: -1 }   // Threaded comments
```

**Note**: `contentId` uses ObjectId (not slug) for data integrity

---

## Key Patterns

### 1. ObjectId References (Best Practice)

```typescript
// ✅ Correct: ObjectId reference
interface IPageStats {
    contentId: ObjectId; // References Content._id
}

// ❌ Wrong: String reference (breaks on slug change)
interface IPageStats {
    slug: string;
}
```

### 2. Denormalization (Performance)

```typescript
// Cached counts - avoid aggregation
Topic.contentCount; // Updated on article publish
Comment.replyCount; // Updated on reply create
```

### 3. Audit Trail

```typescript
// All content tracked
Content.createdBy; // Admin._id (who created)
Content.updatedBy; // Admin._id (who last edited)
```

### 4. Atomic Operations

```typescript
// PageStats updates
await PageStats.findOneAndUpdate({ contentId }, { $inc: { views: 1 } }, { upsert: true });
```

---

## Admin System

```typescript
interface IAdmin {
    email: string;
    role: 'owner' | 'editor';
    passwordHash: string | null;
    lastLoginAt: Date | null;
}

// Constants
export const ADMIN_ROLES = {
    OWNER: 'owner',
    EDITOR: 'editor',
} as const;
```

**No public users** - admin-only system

---

## Common Query Patterns

### Get Articles by Topic

```typescript
const articles = await Content.find({
    type: 'article',
    topicId,
    published: true,
}).sort({ order: 1 });
```

### Get Content with Hierarchy

```typescript
const article = await Content.findOne({ slug }).populate('topicId').populate('subtopicId').populate('createdBy', 'name email');
```

### Get Threaded Comments

```typescript
// Top-level
const comments = await Comment.find({
    contentId,
    parentId: null,
    approved: true,
}).sort({ createdAt: -1 });

// Replies
const replies = await Comment.find({
    parentId: commentId,
    approved: true,
}).sort({ createdAt: 1 });
```

### Increment Stats (Atomic)

```typescript
await PageStats.incrementViews(contentId); // Uses ObjectId!
await PageStats.incrementLikes(contentId);
```

---

## Migration Summary

| Change          | Before                | After                    |
| --------------- | --------------------- | ------------------------ |
| **References**  | `topicSlug: string`   | `topicId: ObjectId`      |
| **Admin Model** | `User` collection     | `Admin` collection       |
| **PageStats**   | `slug: string`        | `contentId: ObjectId` ✅ |
| **Comment**     | `contentSlug: string` | `contentId: ObjectId` ✅ |
| **Interfaces**  | `schema.ts` (1 file)  | `schema/` (9 files)      |

**Critical Fix**: ObjectId references ensure data integrity when slugs change
