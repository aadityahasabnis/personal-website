# Quill Text Editor Implementation

## Overview

A professional, feature-complete implementation of Quill 2.0.3 with react-quill for the personal website project. This implementation includes all available Quill modules and formats, custom Tailwind CSS styling, and a comprehensive test page with live preview functionality.

## Features

### Core Editor Features
- **All Quill Modules Enabled**: Toolbar, clipboard, history, and syntax highlighting support
- **Comprehensive Formatting Options**:
  - Text formatting (bold, italic, underline, strike)
  - Headers (H1-H6)
  - Font family and size controls
  - Text and background colors
  - Lists (ordered, unordered, checklist)
  - Text alignment and indentation
  - Subscript/Superscript
  - Code blocks
  - Blockquotes
  - Links, images, and videos
  
### UI/UX Features
- **Three View Modes**:
  - Editor only
  - Preview only
  - Split view (editor + preview side-by-side)
- **Live Statistics**:
  - Word count
  - Character count
  - Reading time estimation
  - Paragraph count
- **Professional Styling**:
  - Custom Tailwind CSS theme
  - Dark mode support
  - Responsive design
  - Smooth transitions and animations

### Developer Features
- **TypeScript Support**: Full type safety
- **SSR Compatible**: Dynamic import to avoid SSR issues
- **Modular Architecture**: Reusable components
- **Custom CSS File**: Separate styling (not in globals.css)
- **Performance Optimized**: Memoized configurations

## Installation

Packages are already installed:
```bash
pnpm install quill@2.0.3 react-quill@2.0.0
```

## File Structure

```
src/
├── components/admin/
│   ├── QuillTextEditor.tsx          # Main Quill editor component
│   ├── ArticleFormWithQuill.tsx     # Article form with Quill integration
│   └── index.ts                      # Exports
├── styles/
│   └── quill-editor.css              # Separate CSS for Quill
└── app/(admin)/admin/
    ├── test-editor/page.tsx          # Test page with all features
    └── articles/new-quill/page.tsx   # Article creation with Quill
```

## Usage

### Basic Usage

```tsx
import { QuillTextEditor } from '@/components/admin/QuillTextEditor';

function MyComponent() {
  const [content, setContent] = useState('');

  return (
    <QuillTextEditor
      value={content}
      onChange={setContent}
      placeholder="Start writing..."
    />
  );
}
```

### With All Props

```tsx
<QuillTextEditor
  value={content}
  onChange={setContent}
  placeholder="Custom placeholder..."
  readOnly={false}
  className="custom-class"
  minHeight="600px"
  theme="snow"
/>
```

### Simple Editor (Minimal Configuration)

```tsx
import { SimpleQuillEditor } from '@/components/admin/QuillTextEditor';

<SimpleQuillEditor
  value={content}
  onChange={setContent}
/>
```

## Test Page

Access the comprehensive test page at:
```
/admin/test-editor
```

### Test Page Features
- Toggle between editor/preview/split view
- Real-time statistics display
- Sample content loader
- Copy HTML to clipboard
- Download HTML file
- Clear content functionality
- Responsive design
- HTML source viewer

## Article Integration

### Using Quill in Article Creation

Navigate to:
```
/admin/articles/new-quill
```

This page includes:
- Full article metadata form
- Quill editor with preview toggle
- Topic and subtopic selection
- Tags and SEO fields
- Live word count and reading time
- Image upload support
- Auto-slug generation

### Form Features
- **View Modes**: Switch between editor, split, and preview
- **Statistics**: Real-time word count, character count, reading time
- **SEO Optimization**: Meta title, description, keywords, OG image
- **Content Preview**: Live HTML rendering
- **Validation**: Required field checking
- **Auto-save Ready**: Easy to extend with auto-save functionality

## Customization

### Styling

All Quill styles are in `src/styles/quill-editor.css`. Key sections:

```css
/* Toolbar styling */
.quill-editor-wrapper .ql-toolbar { ... }

/* Editor content */
.quill-editor-wrapper .ql-editor { ... }

/* Preview content */
.quill-preview-content { ... }
```

### Toolbar Configuration

Modify the toolbar in `QuillTextEditor.tsx`:

```tsx
const modules = useMemo(
  () => ({
    toolbar: {
      container: [
        // Add or remove toolbar items here
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline'],
        // ... more options
      ],
    },
  }),
  []
);
```

### Available Formats

All standard Quill formats are enabled:

```tsx
const formats = [
  'bold', 'italic', 'underline', 'strike',
  'header', 'blockquote', 'code-block',
  'list', 'bullet', 'indent', 'align',
  'link', 'image', 'video',
  'color', 'background', 'font', 'size',
  'script', 'direction', 'formula',
];
```

## Integration with Article/New Page

### Option 1: Replace Existing Editor

Replace the MDX editor in `ArticleForm.tsx` with the Quill editor:

```tsx
import { QuillTextEditor } from '@/components/admin/QuillTextEditor';

// Replace ForwardRefEditor with:
<QuillTextEditor
  value={htmlBody}
  onChange={setHtmlBody}
  placeholder="Start writing your article..."
  minHeight="500px"
/>
```

### Option 2: Add as Alternative (Current Implementation)

The project now has two article creation pages:
- `/admin/articles/new` - Original MDX editor
- `/admin/articles/new-quill` - New Quill editor

### Migration Strategy

To use Quill as the primary editor:

1. Update `ArticleForm.tsx` to use Quill instead of MDX
2. Update the article storage to handle HTML instead of Markdown
3. Update the article display component to render HTML
4. Optional: Add HTML to Markdown converter for backward compatibility

## Best Practices

### Content Storage

The editor outputs HTML. Store content as:
```tsx
{
  body: string; // HTML content from Quill
  bodyType: 'html'; // Indicate content type
}
```

### Sanitization

For security, sanitize HTML before rendering:
```tsx
import DOMPurify from 'dompurify';

const cleanHTML = DOMPurify.sanitize(content);
```

### Reading Time Calculation

```tsx
const calculateReadingTime = (htmlContent: string): number => {
  const wordsPerMinute = 200;
  const text = htmlContent.replace(/<[^>]*>/g, '');
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

- Dynamic import prevents SSR issues
- Memoized modules configuration
- Optimized re-renders
- Efficient change handling
- Lazy loading of editor instance

## Troubleshooting

### Editor Not Loading
- Check that component is used in client component (`"use client"`)
- Verify dynamic import is working
- Check browser console for errors

### Styling Issues
- Ensure `quill-editor.css` is imported
- Check Tailwind classes are being applied
- Verify CSS specificity isn't being overridden

### Content Not Saving
- Verify `onChange` handler is called
- Check state management
- Ensure HTML is being serialized correctly

## Future Enhancements

Potential improvements:
- [ ] Auto-save functionality
- [ ] Collaborative editing
- [ ] Custom plugins/modules
- [ ] Image upload integration
- [ ] Table support module
- [ ] Emoji picker
- [ ] Mention/hashtag support
- [ ] Version history
- [ ] Export to PDF/Word

## Resources

- [Quill Documentation](https://quilljs.com/docs/)
- [React Quill GitHub](https://github.com/zenoamaro/react-quill)
- [Quill Modules](https://quilljs.com/docs/modules/)
- [Quill Formats](https://quilljs.com/docs/formats/)
- [Quill API](https://quilljs.com/docs/api/)

## Credits

- **Quill**: Open source rich text editor
- **React Quill**: React wrapper for Quill
- **Implementation**: Professional setup for personal-website project
