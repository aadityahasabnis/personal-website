# Quick Start: Rich Text Editor + Cloudinary

## ⚡ 5-Minute Setup

### 1. Get Cloudinary Credentials
```bash
# Sign up at: https://cloudinary.com
# Copy from dashboard: Cloud Name, API Key, API Secret
```

### 2. Update Environment Variables
```bash
# Copy .env.example to .env.local
cp .env.example .env.local

# Edit .env.local and add:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Start Development Server
```bash
pnpm dev
# Open: http://localhost:3000/admin/articles/new
```

---

## 🎯 Common Tasks

### Upload & Insert Image in Content

**Option 1: Quick Insert**
1. Click "Upload Image" button
2. Drag & drop your image
3. Click "Insert" when done
4. Image markdown inserted at cursor!

**Option 2: Manual**
1. Upload image (get URL)
2. Type in editor: `![Description](paste-url-here)`

### Switch Editor Modes
- **Markdown**: For developers, full control
- **Rich Text**: For visual editing, no markdown needed  
- **Split**: Edit markdown + see preview
- **Preview**: See final result with TOC

### Format Text
**In Markdown:**
- Bold: `**text**` or `Ctrl+B`
- Italic: `*text*` or `Ctrl+I`
- Heading: `# H1`, `## H2`, `### H3`
- Code: `` `code` ``
- Link: `[text](url)`

**In Rich Text:**
- Use toolbar buttons
- Select text → click format
- All standard shortcuts work

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `components/admin/HybridEditor.tsx` | Main editor |
| `components/admin/ImageUpload.tsx` | Image uploader |
| `lib/cloudinary.ts` | Upload utilities |
| `app/api/upload/route.ts` | Upload API |

---

## 🔥 Pro Tips

1. **Alt Text**: Always describe images for accessibility
2. **Code Blocks**: Specify language: ` ```typescript `
3. **Headings**: Use H1 → H2 → H3 order for SEO
4. **Preview**: Check preview mode before publishing
5. **TOC**: Headings auto-generate table of contents

---

## 🐛 Quick Fixes

**Editor won't load?**
```bash
# Clear cache and restart
rm -rf .next
pnpm dev
```

**Images won't upload?**
```bash
# Check .env.local has correct Cloudinary credentials
# Verify you're logged in as admin
```

**Preview not rendering?**
```bash
# Check markdown syntax
# Close all code blocks with ```
# Escape special characters
```

---

## 📚 Full Documentation
See `EDITOR_DOCUMENTATION.md` for complete details.
