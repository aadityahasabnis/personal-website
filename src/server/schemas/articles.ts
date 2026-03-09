// ==============================================================
// Article Schemas
// ==============================================================

import { z } from 'zod';
import { VALIDATION } from '@/constants/siteConstants';

// ==============================================================
// Base Schemas
// ==============================================================

export const headingSchema = z.object({
    id: z.string(),
    text: z.string(),
    level: z.number().int().min(1).max(6),
});

export const tableOfContentsSchema = z.array(headingSchema);

export const seoSchema = z.object({
    title: z.string().max(70).optional(),
    description: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().url().optional().or(z.literal('')),
});

// ==============================================================
// Article Schemas
// ==============================================================

export const articleCreateSchema = z.object({
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max),
    slug: z.string()
        .min(VALIDATION.slug.min)
        .max(VALIDATION.slug.max)
        .regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only'),
    description: z.string().max(VALIDATION.description.max),
        body: z.string().min(1, 'Article body is required'),
        html: z.string().optional(),
    tableOfContents: tableOfContentsSchema.optional(),
    topicSlug: z.string().min(1, 'Topic is required'),
    subtopicSlug: z.string().optional(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().url().optional().or(z.literal('')),
    order: z.number().int().min(0).default(0),
    readingTime: z.number().int().min(1).optional(),
    seo: seoSchema.optional(),
});

export const articleUpdateSchema = z.object({
    title: z.string().min(VALIDATION.title.min).max(VALIDATION.title.max).optional(),
    slug: z.string()
        .min(VALIDATION.slug.min)
        .max(VALIDATION.slug.max)
        .regex(VALIDATION.slug.pattern, 'Slug must be lowercase letters, numbers, and hyphens only')
        .optional(),
    description: z.string().max(VALIDATION.description.max).optional(),
    body: z.string().optional(),
    html: z.string().optional(),
    tableOfContents: tableOfContentsSchema.optional(),
    topicSlug: z.string().optional(),
    subtopicSlug: z.string().optional(),
    tags: z.array(z.string()).optional(),
    coverImage: z.string().url().optional().or(z.literal('')),
    order: z.number().int().min(0).optional(),
    readingTime: z.number().int().min(1).optional(),
    seo: seoSchema.optional(),
});

export const articleReorderSchema = z.object({
    topicSlug: z.string().min(1),
    subtopicSlug: z.string().optional(),
    slugs: z.array(z.string().min(1)).min(1),
});

// ==============================================================
// Inferred Types
// ==============================================================

export type Heading = z.infer<typeof headingSchema>;
export type TableOfContents = z.infer<typeof tableOfContentsSchema>;
export type ArticleSeo = z.infer<typeof seoSchema>;
export type ArticleCreateInput = z.infer<typeof articleCreateSchema>;
export type ArticleUpdateInput = z.infer<typeof articleUpdateSchema>;
export type ArticleReorderInput = z.infer<typeof articleReorderSchema>;
