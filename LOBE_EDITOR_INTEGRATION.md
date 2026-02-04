# Lobe Editor Integration

## Overview

This project integrates [@lobehub/editor](https://github.com/lobehub/lobe-editor) as a modern, rich text editor for article content creation. The integration maintains backward compatibility with existing markdown content while providing a powerful WYSIWYG editing experience.

## Architecture

### Editor Components

```
src/components/admin/
├── LobeEditor.tsx          # Main lobe-editor wrapper (rich text)
├── HybridEditor.tsx        # Existing hybrid markdown/rich editor
├── MarkdownEditor.tsx      # Monaco-based markdown editor
└── RichTextEditor.tsx      # TipTap-based rich text editor
```

### Content Rendering

```
src/components/content/
└── ArticleContent.tsx      # Server-rendered article content
    ├── ArticleContent      # Main content renderer
    ├── TableOfContents     # Auto-generated TOC
    └── ArticleStats        # Metadata display
```

### Utilities

```
src/lib/editor/
└── serializer.ts           # Content conversion utilities
    ├── serializeToMarkdown()
    ├── serializeToHTML()
    ├── extractPlainText()
    ├── calculateReadingTime()
    └── validateContent()
```

## Features

### LobeEditor Features

✅ **Rich Text Editing**
- WYSIWYG interface with live preview
- Slash commands (`/`) for quick formatting
- Markdown shortcuts support

✅ **Content Plugins**
- Headings (H1-H6)
- Lists (ordered & unordered)
- Tables with resizing
- Code blocks with syntax highlighting (Shiki)
- Images with drag-drop support
- Links with auto-detection
- Horizontal rules
- Blockquotes

✅ **Export Formats**
- Markdown (canonical format)
- JSON (Lexical AST)
- HTML (for rendering)

✅ **Editor API**
```typescript
interface LobeEditorHandle {
    getMarkdown: () => string;
    getJSON: () => any;
    setMarkdown: (content: string) => void;
    focus: () => void;
    insertImage: (url: string, alt?: string) => void;
    insertText: (text: string) => void;
}
```

## Usage

### Admin Panel (Creating Content)

The `ArticleForm` component now supports both editors:

```tsx
<ArticleForm
    article={article}
    topics={topics}
    allSubtopics={subtopics}
    isEditing={true}
    useRichEditor={true}  // Toggle between LobeEditor and HybridEditor
/>
```

**Using LobeEditor** (`useRichEditor={true}`):
- Modern rich text interface
- Slash commands for formatting
- Markdown shortcuts work
- Content saved as markdown

**Using HybridEditor** (`useRichEditor={false}`):
- Split view: Markdown + Preview
- Monaco editor with syntax highlighting
- Direct markdown editing

### Public Pages (Rendering Content)

Use the `ArticleContent` component to render articles:

```tsx
import { ArticleContent, ArticleStats } from '@/components/content';

export default async function ArticlePage({ params }) {
    const article = await getArticle(params.slug);
    
    return (
        <div>
            <h1>{article.title}</h1>
            
            <ArticleStats
                publishedAt={article.publishedAt}
                readingTime={article.readingTime}
                tags={article.tags}
            />
            
            <ArticleContent content={article.body} />
        </div>
    );
}
```

## Slash Commands

Type `/` in the LobeEditor to access quick formatting:

| Command | Description |
|---------|-------------|
| `/h1` | Heading 1 |
| `/h2` | Heading 2 |
| `/h3` | Heading 3 |
| `/bullet_list` | Bullet list |
| `/numbered_list` | Numbered list |
| `/table` | Insert table |
| `/link` | Insert link |
| `/image` | Insert image |
| `/code_block` | Code block |
| `/blockquote` | Quote |
| `/divider` | Horizontal rule |

## Markdown Shortcuts

The editor supports standard markdown shortcuts:

```
**bold**        → bold text
*italic*        → italic text
`code`          → inline code
# Heading       → H1
## Heading      → H2
- List item     → Bullet list
1. Item         → Numbered list
> Quote         → Blockquote
---             → Horizontal rule
[text](url)     → Link
![alt](url)     → Image
```

## Content Serialization

### Saving Content

Content is automatically saved as markdown when you edit:

```tsx
// In ArticleForm.tsx
const handleSubmit = async () => {
    const data = {
        body: markdownBody,  // This is markdown from editor
        // ... other fields
    };
    
    await createArticle(data);
};
```

### Loading Content

When editing existing content, markdown is loaded into the editor:

```tsx
<LobeEditor
    value={article.body}  // Existing markdown
    onChange={setMarkdownBody}
/>
```

### Utilities

```typescript
import { 
    extractPlainText, 
    calculateReadingTime,
    validateContent,
    extractHeadingsFromContent 
} from '@/lib/editor/serializer';

// Extract plain text for summaries
const plain = extractPlainText(markdown);

// Calculate reading time
const readTime = calculateReadingTime(markdown);

// Validate content
const validation = validateContent(markdown);
if (!validation.isValid) {
    console.error(validation.errors);
}

// Extract headings for TOC
const headings = extractHeadingsFromContent(markdown);
```

## Styling

The editor uses Tailwind's typography plugin for rendering:

```tsx
<article className="prose prose-lg dark:prose-invert">
    {/* Rendered content */}
</article>
```

Custom styling is applied via the `ArticleContent` component:
- Syntax highlighted code blocks
- Responsive images
- Styled tables
- Custom blockquotes
- Heading anchors

## Migration Path

### From Existing Markdown

All existing markdown content works without changes:

1. ✅ Markdown stored in `article.body` loads directly
2. ✅ LobeEditor can edit existing markdown
3. ✅ Content continues to save as markdown
4. ✅ Public rendering remains unchanged

### New Content

1. Author creates content using LobeEditor
2. Content saved as markdown (backward compatible)
3. Content rendered using `ArticleContent` component
4. Full rich text features available

## Performance

### Admin Panel
- Lazy loading: Editor loads on-demand
- Suspense boundaries for loading states
- Debounced markdown processing (300ms)

### Public Pages
- Server-side rendering (SSR)
- Static generation with ISR
- HTML cached at CDN edge
- No client-side markdown parsing

## Troubleshooting

### Editor Not Loading

```tsx
// Check Suspense boundary
<Suspense fallback={<LoadingEditor />}>
    <LobeEditor />
</Suspense>
```

### Content Not Saving

```typescript
// Verify onChange callback
<LobeEditor
    value={content}
    onChange={(md) => {
        console.log('Content changed:', md);
        setContent(md);
    }}
/>
```

### Images Not Inserting

```typescript
// Use the exposed API
const editorRef = useRef<LobeEditorHandle>(null);

editorRef.current?.insertImage(
    'https://example.com/image.jpg',
    'Alt text'
);
```

## Future Enhancements

- [ ] Image upload integration (Cloudinary)
- [ ] Auto-save drafts
- [ ] Collaborative editing
- [ ] Version history
- [ ] Custom markdown transformers
- [ ] Export to PDF/Word
- [ ] AI writing assistance
- [ ] Grammar and spell checking

## Dependencies

```json
{
    "@lobehub/editor": "^3.15.0",
    "@lexical/react": "^0.40.0",
    "lexical": "^0.40.0"
}
```

## Resources

- [Lobe Editor Documentation](https://github.com/lobehub/lobe-editor)
- [Lexical Documentation](https://lexical.dev/)
- [Project Architecture](../_instructions/ARCHITECTURE_PHILOSOPHY.md)
