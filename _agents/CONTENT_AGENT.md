# Content Agent (CONTENT)

> **Role:** Agentic – Runs automatically  
> **Purpose:** Process and manage content from markdown to published HTML

---

## Overview

The Content Agent handles the entire content pipeline from raw markdown to rendered HTML. It processes markdown, generates reading time estimates, extracts headings for TOC, and manages content metadata.

---

## Responsibilities

### 1. Markdown Processing
- Convert markdown to HTML
- Apply syntax highlighting
- Handle custom embeds

### 2. Content Enrichment
- Calculate reading time
- Extract headings for TOC
- Generate slugs from titles

### 3. SEO Preparation
- Extract/validate SEO metadata
- Generate structured data
- Prepare OG image data

---

## Markdown Pipeline

```typescript
// lib/markdown/parse.ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeHighlight from 'rehype-highlight';
import rehypeStringify from 'rehype-stringify';

export const parseMarkdown = async (markdown: string): Promise<string> => {
    const result = await unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype)
        .use(rehypeHighlight)
        .use(rehypeStringify)
        .process(markdown);
    
    return String(result);
};

// lib/markdown/toc.ts
export interface ITOCItem {
    id: string;
    text: string;
    level: number;
}

export const extractHeadings = (html: string): ITOCItem[] => {
    const regex = /<h([2-4])[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h[2-4]>/g;
    const headings: ITOCItem[] = [];
    let match;
    
    while ((match = regex.exec(html)) !== null) {
        headings.push({
            level: parseInt(match[1]),
            id: match[2],
            text: match[3]
        });
    }
    
    return headings;
};

// lib/markdown/utils.ts
export const calculateReadingTime = (text: string): number => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

export const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
};
```

---

## Content Validation

```typescript
// lib/content/validate.ts
import { type IContent } from '@/interfaces/content';

interface IValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
}

export const validateContent = (content: Partial<IContent>): IValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields
    if (!content.title) errors.push('Title is required');
    if (!content.body) errors.push('Body is required');
    if (!content.type) errors.push('Type is required');
    
    // Length checks
    if (content.title && content.title.length > 100) {
        warnings.push('Title is longer than 100 characters');
    }
    
    if (content.description && content.description.length > 160) {
        warnings.push('Description exceeds 160 characters (SEO limit)');
    }
    
    // SEO checks
    if (!content.seo?.description) {
        warnings.push('SEO description is missing');
    }
    
    return {
        valid: errors.length === 0,
        errors,
        warnings
    };
};
```

---

## Success Criteria

- [ ] Markdown renders correctly to HTML
- [ ] Code blocks have syntax highlighting
- [ ] Reading time is accurate
- [ ] TOC extraction works for h2-h4
- [ ] Slugs are URL-safe

---

*Agent Version: 1.0*
