# Image Gallery Feature Guide

## 🎉 What's New

You now have a **complete image management system** with two ways to add images to your content:

### 1. **Gallery Tab** (Browse & Reuse Images)
- View all previously uploaded images from Cloudinary
- Search images by filename
- Click any image to insert it into your content
- Perfect for reusing images across multiple articles

### 2. **Upload New Tab** (Upload Fresh Images)
- Drag & drop new images
- Upload directly to Cloudinary
- Automatically insert into content after upload

---

## 🚀 How to Use

### Step 1: Open the Editor
Navigate to:
- **Create Article**: `/admin/articles/new`
- **Edit Article**: `/admin/articles/[topic]/[slug]/edit`

### Step 2: Click "Add Image" Button
Look for the button in the top-right corner of the editor (next to mode switcher buttons).

### Step 3: Choose Your Method

#### Option A: Use Gallery (Recommended for Reusing Images)
1. **Gallery tab is open by default**
2. Browse your existing images in a grid view
3. Use the search bar to filter by filename
4. Click any image to insert it into your content
5. ✅ Image is inserted as markdown: `![filename](cloudinary-url)`

#### Option B: Upload New Image
1. Click the **"Upload New"** tab
2. Drag & drop an image or click to browse
3. Wait for upload to complete (progress bar shows status)
4. ✅ Image is automatically inserted into your content

### Step 4: Continue Writing
- The image is now in your markdown/rich text content
- You can switch between editor modes to see it rendered
- In preview mode, you'll see the actual image displayed

---

## 🎨 Features

### Image Gallery
- ✅ Grid view with thumbnails
- ✅ Search by filename
- ✅ Shows image metadata (dimensions, file size)
- ✅ Hover to see details
- ✅ Click to insert
- ✅ Visual feedback when selected (green checkmark)

### Image Upload
- ✅ Drag & drop support
- ✅ File type validation (JPG, PNG, GIF, WebP, SVG)
- ✅ File size limit (10MB)
- ✅ Progress bar during upload
- ✅ Auto-insert after upload
- ✅ Stored in Cloudinary CDN

### Editor Integration
- ✅ Works in all 4 editor modes (Markdown, Rich Text, Split, Preview)
- ✅ Images inserted as markdown syntax
- ✅ Cloudinary URLs for fast loading
- ✅ Responsive images

---

## 📁 What Was Built

### New Components
```
src/components/admin/ImageGallery.tsx       - Browse uploaded images
```

### New API Endpoints
```
GET /api/images                              - Fetch images from Cloudinary
POST /api/upload                             - Upload new images (existing)
```

### Updated Components
```
src/components/admin/HybridEditor.tsx        - Added gallery + upload tabs
src/components/admin/ImageUpload.tsx         - Existing uploader
```

---

## 🔧 Configuration

Images are stored in Cloudinary at:
```
Folder: portfolio/content
```

To change the folder, modify the `folder` prop in `HybridEditor.tsx`:
```tsx
<ImageGallery
    onSelect={handleGallerySelect}
    folder="your-custom-folder"  // Change this
/>
```

---

## 🎯 Keyboard Shortcuts

While in the editor:
- **Ctrl + Click** on Gallery tab = Select multiple images (coming soon)
- **Esc** = Close image picker
- **Enter** in search = Filter images

---

## 💡 Tips

1. **Organize Your Images**: Use descriptive filenames before uploading
2. **Reuse Images**: Save bandwidth by using the gallery for repeated images
3. **Search Efficiently**: Use keywords from your filenames to find images quickly
4. **Preview First**: Switch to Preview mode to see how images look before publishing

---

## 🐛 Troubleshooting

### Images Not Loading in Gallery
- Check that Cloudinary credentials are in `.env.local`
- Verify you're logged in as admin
- Check browser console for errors

### Upload Fails
- Ensure file is under 10MB
- Check file type (must be image)
- Verify Cloudinary API credentials

### Image Not Inserting
- Make sure you clicked the image in gallery
- Check for green checkmark confirmation
- Try switching editor modes to refresh

---

## 📊 Current Status

✅ **Fully Functional**
- Gallery browsing
- Image search
- Upload new images
- Insert into content
- Works in all editor modes

⏳ **Future Enhancements** (if needed)
- Multi-select images
- Image editing (crop, resize)
- Image organization (folders, tags)
- Bulk upload
- Image compression before upload

---

## 🎉 Ready to Use!

Your image gallery is **production-ready**. Just make sure your Cloudinary credentials are set in `.env.local`:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Then start the dev server and go create content with images! 🚀
