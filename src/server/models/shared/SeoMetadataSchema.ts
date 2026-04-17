import { OPEN_GRAPH_TYPE_VALUES, SCHEMA_LIMITS } from '@/constants/schemaConstants';
import type { ISeoMetadata } from '@/interfaces/schema/content';
import { Schema } from 'mongoose';

// ============================================================
// Shared SEO Metadata Sub-Schema
// Reused by Content and Topic models.
// ============================================================

export const SeoMetadataSchema = new Schema<ISeoMetadata>(
    {
        title: {
            type: String,
            default: null,
            trim: true,
            maxlength: [SCHEMA_LIMITS.SEO_TITLE_MAX_LENGTH, 'SEO title cannot exceed 70 characters'],
        },
        description: {
            type: String,
            default: null,
            trim: true,
            maxlength: [SCHEMA_LIMITS.SEO_DESCRIPTION_MAX_LENGTH, 'SEO description cannot exceed 160 characters'],
        },
        keywords: {
            type: [String],
            default: [],
        },
        ogImage: {
            type: String,
            default: null,
            trim: true,
        },
        ogType: {
            type: String,
            default: null,
            enum: [...OPEN_GRAPH_TYPE_VALUES, null],
            trim: true,
        },
        canonicalUrl: {
            type: String,
            default: null,
            trim: true,
        },
        noIndex: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false }
);
