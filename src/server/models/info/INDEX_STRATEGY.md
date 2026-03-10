# Database Index Strategy

All indexes are explicitly defined using `Schema.index()` for clarity and control.

---

## ✅ Index Principles

1. **No field-level `index: true` or `unique: true`** - All indexes defined explicitly
2. **Compound indexes** cover multiple query patterns
3. **Unique constraints** enforce data integrity
4. **Sort order matters** - `-1` for descending (recent first)

---

## Indexes by Model

### Admin

```ts
AdminSchema.index({ email: 1 }, { unique: true });
AdminSchema.index({ lastLoginAt: -1 });
```

**Purpose:**

- `email` - Fast login lookup + uniqueness
- `lastLoginAt` - Admin activity tracking

---

### Topic

```ts
TopicSchema.index({ slug: 1 }, { unique: true });
TopicSchema.index({ order: 1 });
TopicSchema.index({ published: 1, order: 1 });
TopicSchema.index({ featured: 1, published: 1 });
```

**Purpose:**

- `slug` - URL routing + uniqueness
- `published + order` - List published topics sorted
- `featured + published` - Homepage featured topics

---

### Subtopic

```ts
SubtopicSchema.index({ topicId: 1, slug: 1 }, { unique: true });
SubtopicSchema.index({ topicId: 1, order: 1 });
SubtopicSchema.index({ topicId: 1, published: 1 });
```

**Purpose:**

- `topicId + slug` - Unique slug per topic
- `topicId + order` - Ordered subtopics within topic
- `topicId + published` - Filter published subtopics

---

### Content

```ts
ContentSchema.index({ type: 1, slug: 1 }, { unique: true });
ContentSchema.index({ type: 1, published: 1, publishedAt: -1 });
ContentSchema.index({ type: 1, topicId: 1, order: 1 });
ContentSchema.index({ type: 1, subtopicId: 1, order: 1 });
ContentSchema.index({ type: 1, status: 1, order: 1 });
ContentSchema.index({ published: 1, featured: 1 });
ContentSchema.index({ tags: 1 });
ContentSchema.index({ createdBy: 1 });
ContentSchema.index({ updatedBy: 1 });
```

**Purpose:**

- `type + slug` - Unique slug per content type (articles/blogs/projects)
- `type + published + publishedAt` - Recent published content by type
- `type + topicId + order` - Articles sorted within topic
- `tags` - Tag-based filtering
- `createdBy/updatedBy` - Content audit trail

---

### PageStats

```ts
PageStatsSchema.index({ contentId: 1 }, { unique: true });
PageStatsSchema.index({ views: -1 });
PageStatsSchema.index({ likes: -1 });
PageStatsSchema.index({ lastViewedAt: -1 });
```

**Purpose:**

- `contentId` - One stats doc per content (unique)
- `views/likes` - Top content queries (descending)
- `lastViewedAt` - Recently viewed content

---

### Comment

```ts
CommentSchema.index({ contentId: 1, parentId: 1, createdAt: -1 });
CommentSchema.index({ contentId: 1, approved: 1, parentId: 1 });
CommentSchema.index({ approved: 1, createdAt: -1 });
CommentSchema.index({ parentId: 1, approved: 1 });
```

**Purpose:**

- `contentId + parentId + createdAt` - Threaded comments sorted
- `contentId + approved + parentId` - Approved comments per page
- `approved + createdAt` - Moderation queue (pending first)
- `parentId + approved` - Approved replies to comment

---

### Subscriber

```ts
SubscriberSchema.index({ email: 1 }, { unique: true });
SubscriberSchema.index({ confirmed: 1 });
SubscriberSchema.index({ subscribedAt: -1 });
```

**Purpose:**

- `email` - Prevent duplicate subscriptions
- `confirmed` - Filter active subscribers
- `subscribedAt` - Recent subscribers

---

### Contact

```ts
ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ status: 1, createdAt: -1 });
ContactSchema.index({ email: 1 });
```

**Purpose:**

- `createdAt` - Recent messages first
- `status + createdAt` - Filter by status (new, read, replied)
- `email` - Lookup messages by sender

---

## Query Pattern Examples

### Get published articles in topic

```ts
Content.find({
    type: 'article',
    topicId: topicObjectId,
    published: true,
}).sort({ order: 1 });
// Uses: { type: 1, topicId: 1, order: 1 }
```

### Get top viewed content

```ts
PageStats.find().sort({ views: -1 }).limit(10);
// Uses: { views: -1 }
```

### Get approved comments for article

```ts
Comment.find({
    contentId: articleObjectId,
    approved: true,
    parentId: null,
}).sort({ createdAt: -1 });
// Uses: { contentId: 1, approved: 1, parentId: 1 }
```

### Admin login

```ts
Admin.findOne({ email: 'user@example.com' });
// Uses: { email: 1 } (unique index)
```

---

## Index Metrics

| Model      | Total Indexes | Unique | Compound |
| ---------- | ------------- | ------ | -------- |
| Admin      | 2             | 1      | 0        |
| Topic      | 4             | 1      | 3        |
| Subtopic   | 3             | 1      | 2        |
| Content    | 9             | 1      | 8        |
| PageStats  | 4             | 1      | 0        |
| Comment    | 4             | 0      | 4        |
| Subscriber | 3             | 1      | 0        |
| Contact    | 3             | 0      | 1        |
| **Total**  | **32**        | **7**  | **18**   |

---

## Best Practices Applied

✅ **Compound indexes match query patterns** - Most frequent queries covered  
✅ **Unique constraints prevent duplicates** - Email, slugs, contentId  
✅ **Sort order optimized** - `-1` for DESC (recent first)  
✅ **No redundant indexes** - Removed all field-level `index: true`  
✅ **Audit trail indexed** - `createdBy`, `updatedBy` for tracking  
✅ **Reference fields indexed** - Foreign keys (`topicId`, `contentId`, etc.)

---

## Maintenance

### Check Index Usage (MongoDB Shell)

```js
db.content.aggregate([{ $indexStats: {} }]);
```

### Drop Unused Indexes

```js
db.content.dropIndex('indexName');
```

### Rebuild Indexes (if needed)

```js
db.content.reIndex();
```

### Sync Indexes from Mongoose

```ts
await Content.syncIndexes();
```
