---
description: Create, edit, and publish content through the admin panel
---

# Content Publishing Workflow

Publish content on AadityaHasabnis.site through the admin panel.

## Content Types

| Type | URL Pattern | Description |
|------|-------------|-------------|
| Article | `/articles/[slug]` | Long-form blog posts |
| Series | `/series/[slug]` | Collection of articles |
| Note | `/notes/[slug]` | Short knowledge snippets |
| Log | `/logs/[date]` | Daily learning logs |
| Page | `/[slug]` | Static pages (about, projects) |

## Steps

### 1. Access Admin Panel

Navigate to `/admin` and log in with your credentials.

### 2. Create New Content

1. Click **"New Content"** button
2. Select content type (Article, Note, etc.)
3. Fill in metadata:
   - **Title** (required)
   - **Slug** (auto-generated from title)
   - **Description** (for SEO)
   - **Tags** (comma-separated)

### 3. Write Content

Use Markdown in the editor:

```markdown
# Heading 1
## Heading 2

Regular paragraph with **bold** and *italic*.

- List item 1
- List item 2

```javascript
const code = 'highlighted';
```​
```

### 4. Preview

Click **"Preview"** to see rendered HTML in the right panel.

### 5. Save Draft

Click **"Save Draft"** to save without publishing.
- Content is saved to database
- Not visible on public site
- Can be edited later

### 6. Publish

Click **"Publish"** when ready:
- Sets `published: true`
- Sets `publishedAt` to current time
- Triggers ISR revalidation
- Content goes live immediately

### 7. Update Existing Content

1. Go to `/admin/content`
2. Find the content in the list
3. Click **"Edit"**
4. Make changes
5. Click **"Save"** or **"Publish"**

## SEO Best Practices

- **Title**: Keep under 60 characters
- **Description**: Keep under 160 characters
- **Use headings**: H2 for main sections, H3 for sub-sections
- **Add images**: Use descriptive alt text
- **Link internally**: Reference related articles

## Scheduling (Future)

Set `publishedAt` to a future date to schedule publishing.

## Unpublishing

1. Edit the content
2. Toggle **"Published"** off
3. Save changes
4. Content removed from public site
