# Premium Hybrid Editor with Cloudinary Integration

## 🎉 Implementation Complete!

A professional, feature-rich content editor for your admin panel with seamless image uploads to Cloudinary.

---

## 📋 What Was Built

### 1. **Hybrid Editor System** (`HybridEditor.tsx`)
A premium multi-mode editor with four editing modes:

- **Markdown Mode**: Monaco editor (VS Code-like) with syntax highlighting & autocomplete
- **Rich Text Mode**: Tiptap WYSIWYG editor (Notion/Medium-style)
- **Split Mode**: Side-by-side markdown editing + live preview
- **Preview Mode**: Full preview with table of contents

### 2. **Image Upload System**
- **Cloudinary Integration**: Server-side upload utility
- **Drag & Drop Component**: Beautiful file uploader with progress
- **Direct Content Insertion**: Images insert directly into markdown at cursor position
- **Image Management**: Preview, copy URL, or insert markdown syntax

### 3. **Monaco Markdown Editor** (`MarkdownEditor.tsx`)
- VS Code-like editing experience
- Syntax highlighting for markdown
- Autocomplete snippets (headings, links, images, tables, code blocks, etc.)
- Keyboard shortcuts (Ctrl+B for bold, Ctrl+I for italic)
- Theme synchronization with site theme

### 4. **Rich Text Editor** (`RichTextEditor.tsx`)
- WYSIWYG editing (What You See Is What You Get)
- Full toolbar with formatting options:
  - Text: Bold, Italic, Strikethrough, Code
  - Headings: H1, H2, H3
  - Lists: Bullet, Numbered, Task lists
  - Blocks: Quotes, Code blocks, Tables
  - Insert: Links, Images, Tables
  - Undo/Redo support
- Converts to markdown for storage
- Syntax highlighting in code blocks

### 5. **Live Preview** (`ContentPreview.tsx`)
- Real-time markdown rendering
- Auto-generated table of contents
- Smooth scrolling to headings
- Debounced rendering for performance
- Professional styling with GitHub-like syntax highlighting

### 6. **API Routes**
- `POST /api/upload`: Authenticated image upload to Cloudinary
- Validates file type and size (10MB max)
- Returns optimized Cloudinary URLs

---

## 🚀 Setup Instructions

### Step 1: Configure Cloudinary

1. **Create a Cloudinary account** at https://cloudinary.com
2. **Get your credentials** from the dashboard
3. **Update `.env.local`** with your credentials:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here

# Optional: For client-side uploads (not currently used)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=unsigned_preset_name
```

### Step 2: Test the Installation

```bash
# Run development server
pnpm dev

# Navigate to admin articles
# http://localhost:3000/admin/articles/new
```

---

## 💡 How to Use

### Creating/Editing Content

1. **Navigate to** `/admin/articles/new` or edit an existing article
2. **Choose your editing mode:**
   - Click **"Markdown"** for code-like editing with full control
   - Click **"Rich Text"** for visual WYSIWYG editing
   - Click **"Split"** to see live preview while editing
   - Click **"Preview"** to see final rendered output

### Uploading Images

#### Method 1: Using the Image Uploader
1. Click **"Upload Image"** button at the top
2. Drag & drop an image or click to browse
3. Wait for upload to complete
4. Click **"Insert"** to add image markdown to your content

#### Method 2: In Markdown Mode
1. Upload image using uploader
2. Copy the Cloudinary URL
3. Type manually: `![Alt text](cloudinary-url)`

#### Method 3: In Rich Text Mode
1. Click the **Image icon** in toolbar
2. Upload using the dialog
3. Image appears inline immediately

### Editor Features

#### Markdown Mode
- Type `/` or start typing to see autocomplete
- Use `Ctrl+B` for **bold**, `Ctrl+I` for *italic*
- Create headings with `#`, `##`, `###`
- Insert code blocks with triple backticks: ` ``` `
- Create tables, lists, quotes, and more

#### Rich Text Mode
- Use the toolbar for formatting
- Drag to select text, then click toolbar buttons
- Insert tables with the table icon
- Add task lists with checkboxes
- Create code blocks with syntax highlighting

#### Split/Preview Mode
- See live rendering as you type
- Table of contents auto-generated from headings
- Click TOC items to jump to sections
- Syntax highlighting in code blocks

---

## 📂 Project Structure

```
src/
├── components/admin/
│   ├── HybridEditor.tsx         # Main editor wrapper (mode switching)
│   ├── MarkdownEditor.tsx       # Monaco code editor component
│   ├── RichTextEditor.tsx       # Tiptap WYSIWYG editor
│   ├── ContentPreview.tsx       # Live preview with TOC
│   └── ImageUpload.tsx          # Cloudinary image uploader
├── lib/
│   └── cloudinary.ts             # Cloudinary server utilities
├── app/
│   ├── api/
│   │   └── upload/route.ts      # Image upload API endpoint
│   └── (admin)/admin/articles/
│       └── ArticleForm.tsx      # Updated with HybridEditor
└── interfaces/index.ts          # IArticle interface (html field exists)
```

---

## 🎨 Features Breakdown

### 1. Image Upload Workflow
```
User uploads image
    ↓
Upload to Cloudinary (server-side)
    ↓
Returns secure HTTPS URL
    ↓
Insert markdown into editor: ![Image](url)
    ↓
Stored in database as markdown
    ↓
Rendered as <img> in preview/public pages
```

### 2. Content Storage
```typescript
// In MongoDB
{
  body: "# Article\n\n![My Image](https://res.cloudinary.com/...)\n\nContent...",
  html: "<h1>Article</h1><img src='...' /><p>Content...</p>",  // Pre-rendered
  tableOfContents: [{ id: "article", text: "Article", level: 1 }]
}
```

### 3. Editor Modes
| Mode | Use Case | Features |
|------|----------|----------|
| **Markdown** | Power users, developers | Full control, syntax highlighting, autocomplete |
| **Rich Text** | Visual writers | WYSIWYG, toolbar, inline formatting |
| **Split** | Best of both | See preview while editing markdown |
| **Preview** | Final check | Exactly how it will look with TOC |

---

## 🔧 Technical Details

### Dependencies Installed
```json
{
  "@monaco-editor/react": "^4.7.0",        // VS Code editor
  "@tiptap/react": "^3.18.0",               // Rich text editor core
  "@tiptap/starter-kit": "^3.18.0",         // Basic extensions
  "@tiptap/extension-*": "^3.18.0",         // Various extensions
  "lowlight": "^3.3.0",                     // Syntax highlighting
  "cloudinary": "^2.9.0",                   // Cloudinary SDK
  "react-dropzone": "^14.4.0"               // Drag & drop uploads
}
```

### Security Features
- ✅ Authenticated uploads (requires admin login)
- ✅ File type validation (images only)
- ✅ File size limits (10MB max)
- ✅ Server-side processing
- ✅ Secure Cloudinary URLs (HTTPS)

### Performance Optimizations
- ⚡ Lazy loading of Monaco editor (avoids SSR issues)
- ⚡ Debounced preview rendering (300ms)
- ⚡ Cloudinary automatic optimization
- ⚡ Code splitting with React Suspense

---

## 🎯 Best Practices

### For Writing Articles

1. **Use Headings Properly**: Start with H1 (`#`), then H2 (`##`), H3 (`###`)
   - Creates proper document structure
   - Auto-generates table of contents
   - Better for SEO

2. **Image Alt Text**: Always include descriptive alt text
   ```markdown
   ![Screenshot of the dashboard showing analytics](url)
   ```

3. **Code Blocks**: Specify language for syntax highlighting
   ````markdown
   ```typescript
   const example = "Hello World";
   ```
   ````

4. **Tables**: Use markdown tables for structured data
   ```markdown
   | Feature | Status |
   |---------|--------|
   | Editor  | ✅ Done |
   ```

### For Developers

1. **Extend Editor Features**: Add custom Tiptap extensions in `RichTextEditor.tsx`
2. **Custom Markdown Syntax**: Add to Monaco autocomplete in `MarkdownEditor.tsx`
3. **Preview Styling**: Modify prose classes in `ContentPreview.tsx`
4. **Upload Folder Structure**: Change folder in `ImageUpload` component
5. **Cloudinary Transformations**: Add in `lib/cloudinary.ts`

---

## 🐛 Troubleshooting

### Editor Not Loading
**Problem**: "Loading editor..." stays forever
**Solution**: Check browser console for errors. Monaco may fail in older browsers.

### Images Not Uploading
**Problem**: Upload fails or returns error
**Solutions**:
1. Check Cloudinary credentials in `.env.local`
2. Ensure you're logged in as admin
3. Check file size (max 10MB)
4. Check file type (must be image)

### Preview Not Rendering
**Problem**: Preview shows "Failed to render preview"
**Solution**: Check markdown syntax. Common issues:
- Unclosed code blocks (` ``` `)
- Invalid markdown tables
- Special characters need escaping

### Styles Look Wrong
**Problem**: Editor or preview styles are broken
**Solution**: Ensure `globals.css` includes editor styles section

---

## 📸 Example Usage

### Markdown with Images
```markdown
# Complete Guide to Next.js

![Next.js Logo](https://res.cloudinary.com/.../nextjs-logo.png)

Next.js is a powerful React framework...

## Getting Started

Here's how to create a new project:

```bash
npx create-next-app@latest
```

![Terminal Screenshot](https://res.cloudinary.com/.../terminal.png)

## Features

- ⚡ Fast Refresh
- 📦 Optimized bundles
- 🖼️ Image Optimization
```

### Result
All images will:
- Be stored in Cloudinary
- Load optimized (WebP/AVIF when supported)
- Include proper alt text for accessibility
- Render beautifully in preview and public pages

---

## 🎓 Advanced Features

### Custom Cloudinary Transformations

Edit `lib/cloudinary.ts` to add transformations:

```typescript
const result = await cloudinary.uploader.upload(uploadSource, {
    folder,
    transformation: [
        { width: 1200, crop: 'limit' },  // Max width
        { quality: 'auto:good' },         // Auto quality
        { fetch_format: 'auto' },         // Auto format (WebP/AVIF)
        { effect: 'sharpen:100' }         // Optional: sharpen
    ],
});
```

### Adding Custom Editor Extensions

In `RichTextEditor.tsx`:

```typescript
import YourCustomExtension from '@tiptap/extension-your-extension';

const editor = useEditor({
    extensions: [
        // ... existing extensions
        YourCustomExtension.configure({ /* options */ }),
    ],
});
```

---

## ✨ What Makes This Premium?

1. **Professional UX**: Multiple editing modes for different workflows
2. **Seamless Integration**: Direct image insertion into content body
3. **Performance**: Optimized rendering, lazy loading, CDN delivery
4. **Accessibility**: Proper alt text, keyboard shortcuts, ARIA labels
5. **Developer Experience**: Type-safe, well-documented, extensible
6. **Production Ready**: Error handling, validation, security

---

## 📝 Next Steps

### Immediate Actions
1. Add Cloudinary credentials to `.env.local`
2. Test creating an article with images
3. Try all four editing modes
4. Upload various image types

### Future Enhancements
- [ ] Add image gallery/library for reusing images
- [ ] Implement image cropping before upload
- [ ] Add video upload support
- [ ] Create custom markdown shortcodes
- [ ] Add collaborative editing
- [ ] Implement autosave drafts

---

## 🎉 You're All Set!

Your premium editor is ready to use. Start creating beautiful content with professional image management!

**Questions?** Check the code comments for detailed explanations of each component.

**Need Help?** Each component has inline documentation explaining how it works.

---

*Built with ❤️ using Next.js 16, Monaco Editor, Tiptap, and Cloudinary*
