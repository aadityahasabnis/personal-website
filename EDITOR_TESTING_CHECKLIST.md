# ✅ Editor Testing Checklist

## Before You Start

### Prerequisites
- [ ] Cloudinary credentials added to `.env.local`
- [ ] Development server running (`pnpm dev`)
- [ ] Navigate to: `http://localhost:3000/admin/articles/new`

---

## 1️⃣ Mode Switching Tests

### Test Markdown Mode
- [ ] Click "Markdown" button
- [ ] Editor shows Monaco code editor
- [ ] Type some markdown: `# Hello World`
- [ ] Syntax highlighting works
- [ ] Line numbers visible

### Test Rich Text Mode
- [ ] Click "Rich Text" button
- [ ] Editor shows WYSIWYG toolbar
- [ ] Toolbar buttons are clickable
- [ ] Type some text
- [ ] Bold/italic buttons work

### Test Split Mode
- [ ] Click "Split" button
- [ ] Two panels appear side-by-side
- [ ] Left panel: Monaco editor
- [ ] Right panel: Live preview
- [ ] Type in left, see update in right

### Test Preview Mode
- [ ] Click "Preview" button
- [ ] Only preview panel visible
- [ ] Table of contents appears (if headings exist)
- [ ] Content renders properly

---

## 2️⃣ Image Upload Tests

### Basic Upload
- [ ] Click "Upload Image" button
- [ ] Upload panel appears
- [ ] Drag & drop an image OR click to browse
- [ ] Progress bar shows during upload
- [ ] Success message appears
- [ ] Image URL displayed

### Image Insertion
- [ ] After upload completes
- [ ] Click "Insert" button
- [ ] Markdown syntax inserted: `![Image](url)`
- [ ] Check in preview mode - image renders

### Upload Validation
- [ ] Try uploading non-image file → Should fail
- [ ] Try uploading large file (>10MB) → Should fail
- [ ] Try uploading PNG → Should succeed
- [ ] Try uploading JPG → Should succeed
- [ ] Try uploading GIF → Should succeed

---

## 3️⃣ Markdown Editor Tests

### Autocomplete
- [ ] Type `#` → See heading suggestions
- [ ] Press Tab/Enter → Heading inserted
- [ ] Type `**` → Bold suggestion
- [ ] Type `` ` `` → Code suggestion

### Keyboard Shortcuts
- [ ] Select text, press `Ctrl+B` → Text wraps in `**`
- [ ] Select text, press `Ctrl+I` → Text wraps in `*`
- [ ] Shortcuts work consistently

### Code Blocks
- [ ] Type triple backticks: `` ``` ``
- [ ] Add language: `` ```typescript ``
- [ ] Type code inside
- [ ] Check preview → Syntax highlighting works

---

## 4️⃣ Rich Text Editor Tests

### Toolbar Formatting
- [ ] Click Bold button → Text becomes bold
- [ ] Click Italic button → Text becomes italic
- [ ] Click Strikethrough → Text has line through
- [ ] Click H1/H2/H3 → Heading created

### Lists
- [ ] Click bullet list button → List created
- [ ] Click numbered list button → Numbered list created
- [ ] Click task list button → Checkboxes created
- [ ] Check/uncheck boxes → Works

### Advanced Features
- [ ] Click quote button → Blockquote created
- [ ] Click code block button → Code block inserted
- [ ] Click table button → 3x3 table inserted
- [ ] Type in table cells → Works

### Links
- [ ] Click link button
- [ ] Dialog appears
- [ ] Enter URL, click Insert
- [ ] Link created in text

---

## 5️⃣ Preview & TOC Tests

### Preview Rendering
- [ ] Add multiple headings: `# H1`, `## H2`, `### H3`
- [ ] Switch to Preview mode
- [ ] All headings render correctly
- [ ] Heading hierarchy preserved

### Table of Contents
- [ ] Create 3+ headings with different levels
- [ ] Switch to Preview/Split mode
- [ ] TOC appears on left side
- [ ] TOC shows all headings
- [ ] Correct indentation for H2/H3

### TOC Navigation
- [ ] Click TOC item
- [ ] Page scrolls to that heading
- [ ] Smooth scroll animation
- [ ] Works for all headings

### Syntax Highlighting in Preview
- [ ] Add code block: `` ```typescript ``
- [ ] Add some code inside
- [ ] Preview shows syntax colors
- [ ] Try different languages: `python`, `javascript`, `bash`

---

## 6️⃣ Image in Content Tests

### Insert Image in Markdown
- [ ] Upload an image
- [ ] Copy the Cloudinary URL
- [ ] Type: `![My Image](paste-url)`
- [ ] Switch to Preview
- [ ] Image displays correctly

### Multiple Images
- [ ] Upload image 1, insert
- [ ] Upload image 2, insert
- [ ] Upload image 3, insert
- [ ] Preview shows all 3 images
- [ ] Images don't overlap

### Image Alt Text
- [ ] Upload image
- [ ] Insert with description: `![Screenshot of dashboard](url)`
- [ ] Check HTML in preview
- [ ] Alt text present in `<img>` tag

---

## 7️⃣ Performance Tests

### Large Content
- [ ] Paste 2000+ words of content
- [ ] Editor doesn't lag
- [ ] Preview updates smoothly
- [ ] Scrolling is smooth

### Many Images
- [ ] Insert 10+ images in content
- [ ] Preview loads all images
- [ ] No performance issues
- [ ] Images load from Cloudinary CDN

### Mode Switching
- [ ] Switch between modes rapidly
- [ ] No flickering
- [ ] Content persists
- [ ] No data loss

---

## 8️⃣ Theme Tests

### Light/Dark Mode
- [ ] Toggle site theme (if available)
- [ ] Editor theme changes
- [ ] Preview theme changes
- [ ] Colors remain readable
- [ ] Code highlighting adapts

---

## 9️⃣ Form Integration Tests

### Save Content
- [ ] Fill in article title
- [ ] Write content with images
- [ ] Click "Create Article" or "Save"
- [ ] Content saves to database
- [ ] Images URLs saved correctly

### Edit Existing
- [ ] Open existing article
- [ ] Content loads in editor
- [ ] Images display in preview
- [ ] Can edit and save changes
- [ ] Changes persist

---

## 🔟 Error Handling Tests

### Upload Errors
- [ ] Disconnect internet → Upload fails gracefully
- [ ] Wrong file type → Shows error message
- [ ] File too large → Shows error message
- [ ] Invalid Cloudinary credentials → Shows error

### Editor Errors
- [ ] Invalid markdown syntax → Preview handles it
- [ ] Extremely long line → Editor handles it
- [ ] Special characters → Escaped properly
- [ ] Empty content → Handles gracefully

---

## 🎯 Final Checks

### Browser Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari (if available)
- [ ] Works in Edge

### Responsive Design
- [ ] Resize browser window
- [ ] Editor adapts to width
- [ ] Mode buttons remain accessible
- [ ] Preview readable on narrow screens

### Production Build
```bash
pnpm build
```
- [ ] Build completes without errors
- [ ] No Tiptap import errors
- [ ] No type errors
- [ ] All pages compile

---

## ✅ Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ Smooth user experience
- ✅ Images upload and display correctly
- ✅ All editor modes work
- ✅ TOC generates properly
- ✅ Content saves to database

---

## 🐛 If Something Fails

### Editor Won't Load
```bash
# Clear cache and restart
rm -rf .next
pnpm dev
```

### Images Won't Upload
- Check `.env.local` has correct Cloudinary credentials
- Verify you're logged in as admin
- Check browser console for errors

### Preview Not Working
- Check markdown syntax is valid
- Look for unclosed code blocks
- Verify no special characters breaking parser

### Build Fails
- Run `pnpm build` to see specific errors
- Check all imports use correct syntax
- Verify all dependencies installed

---

## 📊 Test Results Template

```
Date: ___________
Tester: ___________

Mode Switching: [ ] Pass [ ] Fail
Image Upload: [ ] Pass [ ] Fail
Markdown Editor: [ ] Pass [ ] Fail
Rich Text Editor: [ ] Pass [ ] Fail
Preview & TOC: [ ] Pass [ ] Fail
Images in Content: [ ] Pass [ ] Fail
Performance: [ ] Pass [ ] Fail
Theme: [ ] Pass [ ] Fail
Form Integration: [ ] Pass [ ] Fail
Error Handling: [ ] Pass [ ] Fail

Notes:
_________________________________
_________________________________
_________________________________
```

---

**Happy Testing! 🎉**
