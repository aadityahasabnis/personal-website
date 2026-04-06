'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AdminEntityForm, type IFieldConfig } from '@/components/form';
import { getSeoFieldConfig } from '@/components/form/config/seoFields';
import type { IFormData } from '@/components/form/form';
import { VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import { useFormOperations, useSnackbar } from '@/hooks/form';
import { slugify } from '@/lib/utils';
import { createTopic } from '@/server/new/admin/topic/createTopic';
import type { ITopicCreateInput, ITopicEdit, ITopicSeoInput } from '@/server/new/admin/topic/types';
import { updateTopic } from '@/server/new/admin/topic/updateTopic';

// =============================================================
// Form Data Type
// =============================================================

interface ITopicFormData extends IFormData {
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    tags: string[];
    'seo.title': string;
    'seo.description': string;
    'seo.keywords': string[];
    'seo.ogImage': string;
    'seo.canonicalUrl': string;
    'seo.noIndex': boolean;
    order: number;
}

// =============================================================
// Payload helpers
// =============================================================

const parseSeo = (data: ITopicFormData): ITopicSeoInput | null => {
    const { 'seo.title': title, 'seo.description': description, 'seo.keywords': keywords, 'seo.ogImage': ogImage, 'seo.canonicalUrl': canonicalUrl, 'seo.noIndex': noIndex } = data;
    if (!title && !description && !keywords && !ogImage && !canonicalUrl && !noIndex) return null;
    return {
        title: title || null,
        description: description || null,
        keywords: keywords && keywords.length > 0 ? keywords.filter(Boolean) : [],
        ogImage: ogImage || null,
        canonicalUrl: canonicalUrl || null,
        noIndex: Boolean(noIndex),
    };
};

// =============================================================
// Field Config
// =============================================================

const buildFields = (formData: ITopicFormData, isEditing: boolean): Array<IFieldConfig<ITopicFormData>> => [
    {
        fieldtype: 'group',
        title: 'Topic Details',
        subText: 'Core identity used in URLs and article categorisation.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'input',
                name: 'title',
                label: 'Title',
                placeholder: 'e.g., Data Structures & Algorithms',
                required: true,
                colsize: 'full',
            },
            {
                fieldtype: 'input',
                name: 'slug',
                label: 'Slug',
                placeholder: 'dsa',
                value: !isEditing && formData.title && !formData.slug ? slugify(formData.title) : formData.slug,
                required: true,
                hint: 'Lowercase letters, numbers, and hyphens only. Auto-generated from title.',
                allowCopy: true,
                colsize: 'full',
            },
            {
                fieldtype: 'textArea',
                name: 'description',
                label: 'Description',
                placeholder: 'A brief description of this topic. Shown in listings and meta tags.',
                required: true,
                rows: 3,
                colsize: 'full',
            },
            {
                fieldtype: 'tagInput',
                name: 'tags',
                label: 'Tags',
                placeholder: 'Type a tag and press Enter…',
                maxTags: 10,
                colsize: 'full',
            },
            {
                fieldtype: 'input',
                name: 'coverImage',
                label: 'Cover Image URL',
                placeholder: 'https://example.com/image.png',
                type: 'url',
                hint: 'Optional. Used as the topic thumbnail.',
                allowCopy: true,
                colsize: 'full',
            },
        ],
    },

    ...getSeoFieldConfig(formData, '/articles'),
];

// =============================================================
// Props
// =============================================================

interface ITopicFormProps {
    topic?: ITopicEdit;
    isEditing?: boolean;
}

// =============================================================
// TopicForm
// =============================================================

export const TopicForm = ({ topic, isEditing = false }: ITopicFormProps) => {
    const router = useRouter();
    const { showSuccess, showError, showLoading, dismiss } = useSnackbar();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // =============================================================
    // Form State
    // =============================================================

    const initialData: ITopicFormData = {
        title: topic?.title ?? '',
        slug: topic?.slug ?? '',
        description: topic?.description ?? '',
        coverImage: topic?.coverImage ?? '',
        tags: topic?.tags ?? [],
        'seo.title': topic?.seo?.title ?? '',
        'seo.description': topic?.seo?.description ?? '',
        'seo.keywords': topic?.seo?.keywords ?? [],
        'seo.ogImage': topic?.seo?.ogImage ?? '',
        'seo.canonicalUrl': topic?.seo?.canonicalUrl ?? '',
        'seo.noIndex': topic?.seo?.noIndex ?? false,
        order: topic?.order ?? 0,
    };

    const { formData, handleChange, setFormData, isModified, resetForm, submitBtnRef } = useFormOperations<ITopicFormData>(initialData);

    // =============================================================
    // Field Config (dynamic based on formData)
    // =============================================================

    const resolvedFields = useMemo(() => buildFields(formData, isEditing), [formData, isEditing]);

    // =============================================================
    // Image Preview
    // =============================================================

    const showImagePreview = Boolean(formData.coverImage && VALIDATION_PATTERNS.URL.test(formData.coverImage));

    // =============================================================
    // Handlers
    // =============================================================

    const handleSubmit = async (data: ITopicFormData) => {
        setIsSubmitting(true);
        const loadingToast = showLoading(isEditing ? 'Updating topic...' : 'Creating topic...');

        try {
            const tags = data.tags;
            const seo = parseSeo(data);

            const payload: ITopicCreateInput = {
                title: data.title,
                slug: data.slug || slugify(data.title),
                description: data.description,
                coverImage: data.coverImage || null,
                tags,
                seo,
            };

            const res = isEditing && topic ? await updateTopic(topic._id, { ...payload, order: Number(data.order) || 0 }) : await createTopic(payload);

            dismiss(loadingToast);

            if (!res.success) {
                showError(res.error ?? 'Failed to save topic', 'Please check your inputs and try again.');
                return;
            }

            showSuccess(res.message ?? (isEditing ? 'Topic updated successfully' : 'Topic created successfully'), 'Redirecting to topics list...');

            setTimeout(() => {
                router.push('/admin/topics');
                router.refresh();
            }, 1000);
        } catch {
            dismiss(loadingToast);
            showError('An unexpected error occurred', 'Please try again or contact support.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // =============================================================
    // Render
    // =============================================================

    return (
        <AdminEntityForm<ITopicFormData>
            entityName='Topic'
            isEditing={isEditing}
            fields={resolvedFields}
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
            isModified={isModified}
            onSubmit={handleSubmit}
            onReset={resetForm}
            isSubmitting={isSubmitting}
            submitBtnRef={submitBtnRef}
            labels={{
                submitting: 'Saving…',
            }}
            headerContent={
                showImagePreview ? (
                    <div className='relative h-44 w-full overflow-hidden rounded-lg border border-border bg-muted'>
                        <Image src={formData.coverImage} alt='Cover image preview' fill className='object-cover' unoptimized />
                    </div>
                ) : null
            }
        />
    );
};

export default TopicForm;
