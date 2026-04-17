'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AdminEntityForm, type IFieldConfig, type IStepConfig } from '@/components/form';
import { getSeoFieldConfig } from '@/components/form/config/seoFields';
import type { IFormData, IHandleChange } from '@/components/form/form';
import { OPEN_GRAPH_TYPES, PUBLISH_STATUS, isOpenGraphType, type PublishStatusType } from '@/constants/schemaConstants';
import { useFormOperations, useSnackbar } from '@/hooks/form';
import { slugify } from '@/lib/utils';
import { createBlog } from '@/server/new/admin/content/blog/createBlog';
import type { IBlogCreateInput, IBlogEdit } from '@/server/new/admin/content/blog/types';
import { updateBlog } from '@/server/new/admin/content/blog/updateBlog';

// =============================================================
// Form Data Type
// =============================================================

interface IBlogFormData extends IFormData {
    title: string;
    slug: string;
    description: string;
    body: string;
    tags: string[];
    coverImage: string;
    readingTime: number;
    publishStatus: PublishStatusType;
    featured: boolean;
    'seo.title': string;
    'seo.description': string;
    'seo.keywords': string[];
    'seo.ogImage': string;
    'seo.ogType': string;
    'seo.canonicalUrl': string;
    'seo.noIndex': boolean;
}

interface IBlogFormSeed extends Partial<IBlogEdit> {
    _id?: string;
}

// =============================================================
// Payload helpers
// =============================================================

const estimateReadingTime = (html: string): number => {
    const plain = html
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    if (!plain) return 0;
    const words = plain.split(' ').filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
};

type IBlogSeoPayload = Exclude<IBlogCreateInput['seo'], undefined>;

const parseSeo = (data: IBlogFormData): IBlogSeoPayload => {
    const {
        'seo.title': title,
        'seo.description': description,
        'seo.keywords': keywords,
        'seo.ogImage': ogImage,
        'seo.ogType': ogType,
        'seo.canonicalUrl': canonicalUrl,
        'seo.noIndex': noIndex,
    } = data;
    const resolvedOgType = ogType && isOpenGraphType(ogType) ? ogType : OPEN_GRAPH_TYPES.ARTICLE;
    const hasSeoOverrides = Boolean(title || description || keywords?.length || ogImage || canonicalUrl || noIndex || resolvedOgType !== OPEN_GRAPH_TYPES.ARTICLE);
    if (!hasSeoOverrides) return null;
    return {
        title: title || null,
        description: description || null,
        keywords: keywords && keywords.length > 0 ? keywords.filter(Boolean) : [],
        ogImage: ogImage || null,
        ogType: resolvedOgType,
        canonicalUrl: canonicalUrl || null,
        noIndex: Boolean(noIndex),
    };
};

// =============================================================
// Step Field Builders
// =============================================================

const buildDetailsFields = (formData: IBlogFormData, isEditing: boolean): Array<IFieldConfig<IBlogFormData>> => [
    {
        fieldtype: 'group',
        title: 'Blog Details',
        subText: 'Identity fields used for URL, listing cards, and metadata defaults.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'input',
                name: 'title',
                label: 'Title',
                placeholder: 'e.g., My Journey into Machine Learning',
                required: true,
                colsize: 'full',
            },
            {
                fieldtype: 'input',
                name: 'slug',
                label: 'Slug',
                placeholder: 'my-journey-into-machine-learning',
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
                placeholder: 'A brief summary shown in listings and metadata.',
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
                colsize: 3,
            },
            {
                fieldtype: 'input',
                name: 'coverImage',
                label: 'Cover Image URL',
                placeholder: 'https://example.com/cover.png',
                type: 'url',
                allowCopy: true,
                colsize: 3,
            },
        ],
    },
    {
        fieldtype: 'group',
        title: 'Publishing',
        subText: 'Control publication state and visibility.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'select',
                name: 'publishStatus',
                label: 'Publish Status',
                required: true,
                options: [
                    { label: 'Draft', value: PUBLISH_STATUS.DRAFT },
                    { label: 'Published', value: PUBLISH_STATUS.PUBLISHED },
                    { label: 'Archived', value: PUBLISH_STATUS.ARCHIVED },
                ],
                colsize: 2,
            },
            {
                fieldtype: 'input',
                name: 'readingTime',
                label: 'Reading Time (minutes)',
                type: 'number',
                inputType: 'number',
                hint: 'Leave 0 to auto-calculate from content.',
                colsize: 2,
            },
            {
                fieldtype: 'toggle',
                name: 'featured',
                label: 'Featured',
                hint: 'Featured blogs can be pinned in highlights.',
                colsize: 2,
            },
        ],
    },
];

const buildContentSeoFields = (formData: IBlogFormData): Array<IFieldConfig<IBlogFormData>> => [
    {
        fieldtype: 'group',
        title: 'Blog Content',
        subText: 'Use the rich editor for the full blog body.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'authorly',
                name: 'body',
                label: 'Body',
                required: true,
                placeholder: 'Write your blog content…',
                minHeight: '560px',
                colsize: 'full',
            },
        ],
    },
    ...getSeoFieldConfig(formData, '/blogs', OPEN_GRAPH_TYPES.ARTICLE),
];

// =============================================================
// Step Validators
// =============================================================

const isDetailsValid = (formData: IBlogFormData): boolean => Boolean(formData.title.trim() && (formData.slug || slugify(formData.title)).trim() && formData.description.trim());

const isContentSeoValid = (formData: IBlogFormData): boolean => Boolean(formData.body.trim());

// =============================================================
// Props
// =============================================================

interface IBlogFormProps {
    blog?: IBlogFormSeed;
    isEditing?: boolean;
}

// =============================================================
// BlogForm
// =============================================================

export const BlogForm = ({ blog, isEditing = false }: IBlogFormProps): React.ReactElement => {
    const router = useRouter();
    const { showSuccess, showError, showLoading, dismiss } = useSnackbar();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // =============================================================
    // Form State
    // =============================================================

    const initialData: IBlogFormData = {
        title: blog?.title ?? '',
        slug: blog?.slug ?? '',
        description: blog?.description ?? '',
        body: blog?.body ?? '',
        tags: blog?.tags ?? [],
        coverImage: blog?.coverImage ?? '',
        readingTime: blog?.readingTime ?? 0,
        publishStatus: blog?.publishStatus ?? PUBLISH_STATUS.DRAFT,
        featured: blog?.featured ?? false,
        'seo.title': blog?.seo?.title ?? '',
        'seo.description': blog?.seo?.description ?? '',
        'seo.keywords': blog?.seo?.keywords ?? [],
        'seo.ogImage': blog?.seo?.ogImage ?? '',
        'seo.ogType': blog?.seo?.ogType ?? OPEN_GRAPH_TYPES.ARTICLE,
        'seo.canonicalUrl': blog?.seo?.canonicalUrl ?? '',
        'seo.noIndex': blog?.seo?.noIndex ?? false,
    };

    const { formData, handleChange, setFormData, isModified, resetForm, submitBtnRef } = useFormOperations<IBlogFormData>(initialData);

    // =============================================================
    // Step Configuration
    // =============================================================

    const steps: Array<IStepConfig<IBlogFormData>> = useMemo(
        () => [
            {
                id: 'details',
                label: 'Details & Publishing',
                description: 'Title, slug & status',
                fields: (fd: IBlogFormData, _hc: IHandleChange) => buildDetailsFields(fd, isEditing),
                validate: isDetailsValid,
                errorMessage: 'Please fill in the required fields (title, slug, description).',
            },
            {
                id: 'contentSeo',
                label: 'Content & SEO',
                description: 'Body & optimization',
                fields: (fd: IBlogFormData, _hc: IHandleChange) => buildContentSeoFields(fd),
                validate: isContentSeoValid,
                errorMessage: 'Please add content to your blog.',
            },
        ],
        [isEditing],
    );

    // =============================================================
    // Handlers
    // =============================================================

    const handleValidationError = (step: IStepConfig<IBlogFormData>) => {
        showError('Validation Error', step.errorMessage ?? 'Please fill in all required fields.');
    };

    const handleSubmit = async (data: IBlogFormData) => {
        setIsSubmitting(true);
        const loadingToast = showLoading(isEditing ? 'Updating blog...' : 'Creating blog...');

        try {
            const blogId = blog?.id ?? blog?._id;
            const resolvedSlug = data.slug || slugify(data.title);
            const readingTime = Number(data.readingTime) > 0 ? Number(data.readingTime) : estimateReadingTime(data.body);

            const payload: IBlogCreateInput = {
                slug: resolvedSlug,
                title: data.title,
                description: data.description,
                body: data.body,
                tags: data.tags,
                coverImage: data.coverImage || null,
                readingTime,
                publishStatus: data.publishStatus,
                featured: Boolean(data.featured),
                seo: parseSeo(data),
            };

            const response = isEditing && blogId ? await updateBlog(blogId, payload) : await createBlog(payload);

            dismiss(loadingToast);

            if (!response.success) {
                showError(response.error, 'Please check your inputs and try again.');
                return;
            }

            showSuccess(response.message ?? (isEditing ? 'Blog updated successfully' : 'Blog created successfully'), 'Redirecting to blogs list...');

            setTimeout(() => {
                router.push('/admin/blogs');
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
        <AdminEntityForm<IBlogFormData>
            entityName='Blog'
            isEditing={isEditing}
            steps={steps}
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
            isModified={isModified}
            onSubmit={handleSubmit}
            onReset={resetForm}
            onValidationError={handleValidationError}
            isSubmitting={isSubmitting}
            submitBtnRef={submitBtnRef}
            labels={{
                submitting: 'Saving…',
            }}
        />
    );
};

export default BlogForm;
