'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type FormEvent, useMemo } from 'react';

import FormWrapper, { type IFieldConfig } from '@/components/form/FormWrapper';
import { getSeoFieldConfig } from '@/components/form/config/seoFields';
import type { IFormData } from '@/components/form/form';
import { VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import { useFormOperations } from '@/hooks/form/useFormOperations';
import { slugify } from '@/lib/utils';
import { createTopic } from '@/server/new/admin/topic/createTopic';
import type { ITopicCreateInput, ITopicEdit, ITopicSeoInput } from '@/server/new/admin/topic/types';
import { updateTopic } from '@/server/new/admin/topic/updateTopic';
import { useState } from 'react';

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
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const resolvedFields = useMemo(() => buildFields(formData, isEditing), [formData, isEditing]);

    const showImagePreview = Boolean(formData.coverImage && VALIDATION_PATTERNS.URL.test(formData.coverImage));

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const tags = formData.tags;
            const seo = parseSeo(formData);
            let res;

            if (isEditing && topic) {
                const payload: Partial<ITopicCreateInput> = {
                    title: formData.title,
                    slug: formData.slug || slugify(formData.title),
                    description: formData.description,
                    coverImage: formData.coverImage || null,
                    order: Number(formData.order) || 0,
                    tags,
                    seo,
                };
                res = await updateTopic(topic._id, payload);
            } else {
                const payload: ITopicCreateInput = {
                    title: formData.title,
                    slug: formData.slug || slugify(formData.title),
                    description: formData.description,
                    coverImage: formData.coverImage || null,
                    tags,
                    seo,
                };
                res = await createTopic(payload);
            }

            if (res.success) {
                router.push('/admin/topics');
                router.refresh();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='flex flex-col gap-5'>
            {/* Cover Image Preview */}
            {showImagePreview && (
                <div className='relative w-full h-44 overflow-hidden rounded-lg border border-border bg-muted'>
                    <Image src={formData.coverImage} alt='Cover image preview' fill className='object-cover' unoptimized />
                </div>
            )}

            <FormWrapper
                formConfig={resolvedFields}
                handleSubmit={handleSubmit}
                handleSecondaryClick={resetForm}
                handleChange={handleChange}
                setFormData={setFormData}
                formData={formData}
                isModified={isEditing ? isModified : true}
                isSubmitting={isSubmitting}
                submitBtnRef={submitBtnRef}
                submitLabel={isEditing ? 'Update Topic' : 'Create Topic'}
                cancelLabel='Discard'
                navigateBackRequired={false}
            />
        </div>
    );
};

export default TopicForm;
