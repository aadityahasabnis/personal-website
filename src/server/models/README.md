# Mongoose Models Documentation

Professional Mongoose models for the personal website database.

## Overview

All models are built with:
- **TypeScript** for type safety
-  **Mongoose** schemas with proper validation
- **Indexes** for query performance
- **Instance methods** for business logic
- **Static methods** for complex queries
- **Middleware hooks** for maintaining data consistency

## Models

### 1. Topic (`Topic.ts`)
Organized knowledge categories (e.g., "JavaScript", "React").

**Schema Fields:**
- `slug`: Unique URL-friendly identifier
- `title`: Display name
- `description`: Topic overview
- `coverImage`: Optional cover image URL
- `order`: Display order (ascending)
- `published`: Visibility status
- `featured`: Featured topic flag
- `contentCount`: Denormalized count of published articles

**Indexes:**
- `slug` (unique)
- `order` (ascending)
- `published + order` (compound)
- `featured + published` (compound)

**Instance Methods:**
- `incrementContentCount()`: Increment article count
- `decrementContentCount()`: Decrement article count

**Usage:**
```typescript
import { Topic } from '@/server/models';

// Create topic
const topic = await Topic.create({
    slug: 'javascript',
    title: 'JavaScript',
    description: 'Core JavaScript concepts',
    order: 1,
    published: true,
});

// Increment count when article is published
await topic.incrementContentCount();

// Find all published topics
const topics = await Topic.find({ published: true }).sort({ order: 1 });
```

---

### 2. Subtopic (`Subtopic.ts`)
Nested categories within topics.

**Schema Fields:**
- `topicSlug`: Parent topic reference
- `slug`: URL-friendly identifier (unique per topic)
- `title`: Display name
- `description`: Optional description
- `order`: Display order within topic
- `published`: Visibility status
- `contentCount`: Count of published articles

**Indexes:**
- `topicSlug + slug` (compound unique)
- `topicSlug + order` (compound)
- `topicSlug + published` (compound)

**Instance Methods:**
- `incrementContentCount()`: Increment article count
- `decrementContentCount()`: Decrement article count

**Usage:**
```typescript
import { Subtopic } from '@/server/models';

// Create subtopic
const subtopic = await Subtopic.create({
    topicSlug: 'javascript',
    slug: 'async-await',
    title: 'Async/Await',
    description: 'Asynchronous JavaScript patterns',
    order: 3,
    published: true,
});

// Find all subtopics for a topic
const subtopics = await Subtopic.find({ 
    topicSlug: 'javascript', 
    published: true 
}).sort({ order: 1 });
```

---

### 3. Content (`Content.ts`)
Discriminated union for articles, blogs, and projects.

**Content Types:**
1. **Article**: Topic-organized technical content
2. **Blog**: Chronological blog posts
3. **Project**: Portfolio projects

**Common Fields:**
- `type`: Content type (article | blog | project)
- `slug`: Unique URL identifier
- `title`: Content title
- `description`: Meta description
- `body`: Markdown/HTML content
- `tags`: Array of tags
- `coverImage`: Cover image URL
- `readingTime`: Estimated reading time (minutes)
- `published`: Publish status
- `publishedAt`: Publish date
- `scheduledAt`: Scheduled publish date
- `featured`: Featured content flag
- `seo`: SEO metadata object

**Article-Specific Fields:**
- `topicSlug`: Parent topic
- `subtopicSlug`: Optional subtopic
- `order`: Display order within topic

**Project-Specific Fields:**
- `techStack`: Technologies used
- `githubUrl`: GitHub repository URL
- `liveUrl`: Live demo URL
- `demoVideo`: Demo video URL
- `gallery`: Array of screenshot URLs
- `status`: Project status (In Progress | Live | Archived)
- `startDate`: Project start date
- `completedDate`: Project completion date
- `order`: Display order

**Indexes:**
- `type + slug` (compound unique)
- `type + published + publishedAt` (compound)
- `type + topicSlug + order` (for articles)
- `type + status + order` (for projects)
- `published + featured` (compound)
- `tags` (multikey)

**Instance Methods:**
- `publish()`: Publish content immediately
- `unpublish()`: Unpublish content
- `schedule(date)`: Schedule for future publish
- `isArticle()`: Type guard for articles
- `isBlog()`: Type guard for blogs
- `isProject()`: Type guard for projects

**Usage:**
```typescript
import { Content, CONTENT_TYPES } from '@/server/models';

// Create article
const article = await Content.create({
    type: CONTENT_TYPES.ARTICLE,
    slug: 'promises-explained',
    title: 'JavaScript Promises Explained',
    description: 'Deep dive into promises',
    body: '# Promises...',
    topicSlug: 'javascript',
    subtopicSlug: 'async-await',
    tags: ['javascript', 'async'],
    readingTime: 10,
    order: 1,
});

// Publish article
await article.publish();

// Create project
const project = await Content.create({
    type: CONTENT_TYPES.PROJECT,
    slug: 'portfolio-website',
    title: 'Personal Portfolio',
    description: 'Modern portfolio built with Next.js',
    body: '# Portfolio...',
    techStack: ['Next.js', 'TypeScript', 'MongoDB'],
    githubUrl: 'https://github.com/...',
    liveUrl: 'https://example.com',
    status: 'Live',
    order: 1,
});

// Find all published articles in a topic
const articles = await Content.find({
    type: CONTENT_TYPES.ARTICLE,
    topicSlug: 'javascript',
    published: true,
}).sort({ order: 1 });

// Find all live projects
const projects = await Content.find({
    type: CONTENT_TYPES.PROJECT,
    status: 'Live',
    published: true,
}).sort({ order: 1 });
```

---

### 4. PageStats (`PageStats.ts`)
View and like statistics for content.

**Why Separate?**
- Write-heavy (views updated frequently)
- Atomic counter operations ($inc)
- Independent scaling/sharding
- Separate caching strategy

**Schema Fields:**
- `slug`: Content slug reference
- `views`: Total view count
- `likes`: Total like count
- `lastViewedAt`: Last view timestamp

**Indexes:**
- `slug` (unique)
- `views` (descending - for popular content)
- `likes` (descending - for most liked)
- `lastViewedAt` (descending - for recent activity)

**Static Methods:**
- `incrementViews(slug)`: Atomic view increment (upsert)
- `incrementLikes(slug)`: Atomic like increment (upsert)
- `decrementLikes(slug)`: Atomic like decrement
- `getTopViewed(limit)`: Get most viewed content
- `getTopLiked(limit)`: Get most liked content

**Usage:**
```typescript
import { PageStats } from '@/server/models';

// Increment views (creates document if not exists)
const stats = await PageStats.incrementViews('promises-explained');

// Increment likes
await PageStats.incrementLikes('promises-explained');

// Get top 10 most viewed
const popular = await PageStats.getTopViewed(10);

// Get stats for content
const articleStats = await PageStats.findOne({ slug: 'promises-explained' });
```

---

### 5. Comment (`Comment.ts`)
Flat comment architecture with unlimited threading depth.

**Why Flat?**
- No MongoDB document size limits
- Flexible pagination
- Scalable to any depth
- Efficient queries

**Schema Fields:**
- `contentSlug`: Content reference
- `parentId`: Parent comment ID (null for top-level)
- `author`: Author information object
  - `name`: Commenter name
  - `email`: Email address
  - `avatar`: Gravatar or uploaded avatar URL
  - `website`: Optional website
  - `isOwner`: Site owner flag
- `content`: Comment text (markdown supported)
- `upvotes`: Upvote count
- `approved`: Moderation status
- `replyCount`: Denormalized reply count
- `ipHash`: Hashed IP for spam prevention

**Indexes:**
- `contentSlug + parentId + createdAt` (compound)
- `approved + createdAt` (compound)
- `parentId + approved` (compound)
- `contentSlug + approved + parentId` (compound)

**Static Methods:**
- `getTopLevelComments(contentSlug, approved?)`: Get root comments
- `getReplies(commentId, approved?)`: Get replies to comment
- `getCommentCount(contentSlug, approved?)`: Count top-level comments

**Instance Methods:**
- `approve()`: Approve comment
- `incrementReplyCount()`: Increment reply count
- `decrementReplyCount()`: Decrement reply count
- `incrementUpvotes()`: Increment upvotes

**Middleware:**
- Auto-updates parent `replyCount` on save/delete

**Usage:**
```typescript
import { Comment } from '@/server/models';

// Create top-level comment
const comment = await Comment.create({
    contentSlug: 'promises-explained',
    parentId: null,
    author: {
        name: 'John Doe',
        email: 'john@example.com',
        avatar: 'https://gravatar.com/...',
        website: null,
        isOwner: false,
    },
    content: 'Great article!',
    approved: false,
});

// Create reply
const reply = await Comment.create({
    contentSlug: 'promises-explained',
    parentId: comment._id,
    author: { name: 'Author', email: 'author@example.com', isOwner: true },
    content: 'Thank you!',
    approved: true,
});

// Get all top-level approved comments
const comments = await Comment.getTopLevelComments('promises-explained');

// Get replies to a comment
const replies = await Comment.getReplies(comment._id);

// Approve and upvote
await comment.approve();
await comment.incrementUpvotes();
```

---

### 6. Subscriber (`Subscriber.ts`)
Newsletter subscribers.

**Schema Fields:**
- `email`: Email address (unique)
- `name`: Optional subscriber name
- `confirmed`: Email confirmation status
- `subscribedAt`: Subscription date
- `unsubscribedAt`: Unsubscribe date (null if active)

**Indexes:**
- `email` (unique)
- `confirmed`
- `subscribedAt` (descending)

**Static Methods:**
- `getActiveSubscribers()`: Get confirmed, active subscribers
- `getSubscriberCount()`: Count active subscribers
- `getPendingConfirmations()`: Get unconfirmed subscribers

**Instance Methods:**
- `confirm()`: Confirm email
- `unsubscribe()`: Unsubscribe
- `resubscribe()`: Reactivate subscription

**Usage:**
```typescript
import { Subscriber } from '@/server/models';

// Create subscriber
const subscriber = await Subscriber.create({
    email: 'user@example.com',
    name: 'User Name',
    confirmed: false,
});

// Confirm subscription
await subscriber.confirm();

// Get all active subscribers
const active = await Subscriber.getActiveSubscribers();

// Unsubscribe
await subscriber.unsubscribe();
```

---

### 7. User (`User.ts`)
Admin users.

**Schema Fields:**
- `email`: Email address (unique)
- `name`: User name
- `image`: Profile image URL
- `role`: User role (admin | viewer)
- `passwordHash`: Bcrypt password hash (excluded from queries by default)
- `lastLoginAt`: Last login timestamp

**Indexes:**
- `email` (unique)
- `role`
- `lastLoginAt` (descending)

**Static Methods:**
- `findByEmail(email)`: Find user by email (includes passwordHash)
- `getAdmins()`: Get all admin users
- `getUserCount()`: Count total users

**Instance Methods:**
- `updateLastLogin()`: Update last login timestamp
- `isAdmin()`: Check if user is admin
- `isViewer()`: Check if user is viewer

**Usage:**
```typescript
import { User, USER_ROLES } from '@/server/models';

// Create admin user
const admin = await User.create({
    email: 'admin@example.com',
    name: 'Admin User',
    role: USER_ROLES.ADMIN,
    passwordHash: await bcrypt.hash('password', 10),
});

// Find by email (for login)
const user = await User.findByEmail('admin@example.com');

// Update last login
if (user) {
    await user.updateLastLogin();
}

// Check role
if (user?.isAdmin()) {
    // Admin access
}
```

---

### 8. Contact (`Contact.ts`)
Contact form submissions.

**Schema Fields:**
- `name`: Sender name
- `email`: Sender email
- `subject`: Message subject
- `message`: Message body
- `status`: Message status (new | read | replied | archived)
- `ipHash`: Hashed IP for spam prevention

**Indexes:**
- `createdAt` (descending)
- `status + createdAt` (compound)
- `email`

**Static Methods:**
- `getNewMessages()`: Get unread messages
- `getUnreadCount()`: Count unread messages
- `getByStatus(status)`: Get messages by status

**Instance Methods:**
- `markAsRead()`: Mark as read
- `markAsReplied()`: Mark as replied
- `archive()`: Archive message
- `unarchive()`: Unarchive message

**Usage:**
```typescript
import { Contact } from '@/server/models';

// Create contact submission
const contact = await Contact.create({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Question about your article',
    message: 'I have a question...',
    status: 'new',
});

// Get new messages
const newMessages = await Contact.getNewMessages();

// Mark as read
await contact.markAsRead();

// Reply and mark
await contact.markAsReplied();

// Archive
await contact.archive();
```

---

## Best Practices

### 1. Use Instance Methods for Business Logic
```typescript
// ❌ Don't
content.published = true;
content.publishedAt = new Date();
await content.save();

// ✅ Do
await content.publish();
```

### 2. Use Static Methods for Complex Queries
```typescript
// ❌ Don't
const comments = await Comment.find({ 
    contentSlug: slug, 
    parentId: null, 
    approved: true 
});

// ✅ Do
const comments = await Comment.getTopLevelComments(slug);
```

### 3. Use Atomic Operations for Counters
```typescript
// ❌ Don't (race condition)
const stats = await PageStats.findOne({ slug });
stats.views += 1;
await stats.save();

// ✅ Do (atomic)
await PageStats.incrementViews(slug);
```

### 4. Always Use Type Guards
```typescript
import { isArticle, isBlog, isProject } from '@/server/models';

const content = await Content.findOne({ slug });

if (isArticle(content)) {
    // TypeScript knows content is IArticle
    console.log(content.topicSlug);
}
```

### 5. Leverage Indexes for Performance
```typescript
// ✅ Uses index: type + published + publishedAt
const articles = await Content.find({
    type: 'article',
    published: true,
}).sort({ publishedAt: -1 });

// ✅ Uses index: topicSlug + slug (compound unique)
const subtopics = await Subtopic.find({ topicSlug: 'javascript' });
```

### 6. Handle Denormalized Counts
```typescript
// When publishing article, update topic count
const article = await Content.findById(articleId);
const topic = await Topic.findOne({ slug: article.topicSlug });
await topic?.incrementContentCount();

// When deleting article, decrement
await topic?.decrementContentCount();
```

---

## Database Connection

Models automatically reuse existing connections when hot-reloading in Next.js:

```typescript
// This pattern prevents model recompilation errors
const Content: Model<IContentDocument> =
    mongoose.models.Content || mongoose.model<IContentDocument>('Content', ContentSchema);
```

---

## Type Safety

All models extend the base interfaces from `schema.ts` with Mongoose Document methods:

```typescript
// Base interface (from schema.ts)
interface IArticle {
    type: 'article';
    slug: string;
    // ...
}

// Mongoose document (from types.ts)
interface IArticleDocument extends Omit<IArticle, '_id'>, Document {
    publish(): Promise<this>;
    unpublish(): Promise<this>;
    // ...
}
```

This provides:
- Type safety for database operations
- IntelliSense for all fields and methods
- Compile-time error checking
- Proper TypeScript inference

---

## Migration Notes

When schema changes are made:
1. Update `schema.ts` interfaces
2. Update Mongoose models
3. Create migration script if needed
4. Update existing documents in database
5. Verify indexes are created

Example migration for adding a field:
```typescript
// migrations/add-featured-to-topics.ts
import { Topic } from '@/server/models';

export async function up() {
    await Topic.updateMany(
        { featured: { $exists: false } },
        { $set: { featured: false } }
    );
}
```
