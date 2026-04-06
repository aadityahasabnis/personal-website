'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { AdminEntityForm, type IFieldConfig, type IStepConfig } from '@/components/form';
import { getSeoFieldConfig } from '@/components/form/config/seoFields';
import type { IFormData, IHandleChange } from '@/components/form/form';
import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import { useFormOperations, useSnackbar } from '@/hooks/form';
import { useActionQuery } from '@/hooks/server/useActionQuery';
import { slugify } from '@/lib/utils';
import { createArticle } from '@/server/new/admin/content/article/createArticle';
import type { IArticleCreateInput, IArticleEdit } from '@/server/new/admin/content/article/types';
import { updateArticle } from '@/server/new/admin/content/article/updateArticle';
import { getSubtopicOptions, type ISubtopicOption } from '@/server/new/admin/subtopic/getSubtopicOptions';
import { getTopicOptions, type ITopicOption } from '@/server/new/admin/topic/getTopicOptions';

// =============================================================
// Form Data Type
// =============================================================

interface IArticleFormData extends IFormData {
    topicId: string;
    subtopicId: string;
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
    'seo.canonicalUrl': string;
    'seo.noIndex': boolean;
}

interface IArticleFormSeed extends Partial<IArticleEdit> {
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

type IArticleSeoPayload = Exclude<IArticleCreateInput['seo'], undefined>;

const parseSeo = (data: IArticleFormData): IArticleSeoPayload => {
    const { 'seo.title': title, 'seo.description': description, 'seo.keywords': keywords, 'seo.ogImage': ogImage, 'seo.canonicalUrl': canonicalUrl, 'seo.noIndex': noIndex } = data;
    if (!title && !description && !keywords?.length && !ogImage && !canonicalUrl && !noIndex) return null;
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
// Step Field Builders
// =============================================================

const buildClassificationFields = (
    formData: IArticleFormData,
    topicOptions: Array<{ label: string; value: string }>,
    subtopicOptions: Array<{ label: string; value: string }>,
    isLoadingTopics: boolean,
    isLoadingSubtopics: boolean,
): Array<IFieldConfig<IArticleFormData>> => [
    {
        fieldtype: 'group',
        title: 'Topic Mapping',
        subText: 'Attach this article to a topic and optional subtopic.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'select',
                name: 'topicId',
                label: 'Topic',
                placeholder: 'Select a topic…',
                options: topicOptions,
                required: true,
                isSearchable: true,
                isLoading: isLoadingTopics,
                noOptionsMessage: 'No topics found. Create a topic first.',
                colsize: 3,
            },
            {
                fieldtype: 'select',
                name: 'subtopicId',
                label: 'Subtopic',
                placeholder: formData.topicId ? 'Select a subtopic…' : 'Choose a topic first…',
                options: subtopicOptions,
                isSearchable: true,
                isLoading: isLoadingSubtopics,
                disabled: !formData.topicId,
                noOptionsMessage: formData.topicId ? 'No subtopics for selected topic.' : 'Select a topic first.',
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
                colsize: 3,
            },
            {
                fieldtype: 'toggle',
                name: 'featured',
                label: 'Featured',
                hint: 'Featured articles can be pinned in highlights.',
                colsize: 3,
            },
        ],
    },
];

const buildDetailsFields = (formData: IArticleFormData, isEditing: boolean): Array<IFieldConfig<IArticleFormData>> => [
    {
        fieldtype: 'group',
        title: 'Article Details',
        subText: 'Identity fields used for URL, listing cards, and metadata defaults.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'input',
                name: 'title',
                label: 'Title',
                placeholder: 'e.g., Dynamic Programming Patterns',
                required: true,
                colsize: 'full',
            },
            {
                fieldtype: 'input',
                name: 'slug',
                label: 'Slug',
                placeholder: 'dynamic-programming-patterns',
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
            {
                fieldtype: 'input',
                name: 'readingTime',
                label: 'Reading Time (minutes)',
                type: 'number',
                inputType: 'number',
                hint: 'Leave 0 to auto-calculate from content.',
                colsize: 2,
            },
        ],
    },
];

const buildContentSeoFields = (formData: IArticleFormData): Array<IFieldConfig<IArticleFormData>> => [
    {
        fieldtype: 'group',
        title: 'Article Content',
        subText: 'Use the rich editor for the full article body.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'authorly',
                name: 'body',
                label: 'Body',
                required: true,
                placeholder: 'Write your article content…',
                minHeight: '560px',
                colsize: 'full',
            },
        ],
    },
    ...getSeoFieldConfig(formData, '/articles'),
];

// =============================================================
// Step Validators
// =============================================================

const isClassificationValid = (formData: IArticleFormData): boolean => Boolean(formData.topicId);

const isDetailsValid = (formData: IArticleFormData): boolean => Boolean(formData.title.trim() && (formData.slug || slugify(formData.title)).trim() && formData.description.trim());

const isContentSeoValid = (formData: IArticleFormData): boolean => Boolean(formData.body.trim());

// =============================================================
// Props
// =============================================================

interface IArticleFormProps {
    article?: IArticleFormSeed;
    isEditing?: boolean;
}

// =============================================================
// ArticleForm
// =============================================================

export const ArticleForm = ({ article, isEditing = false }: IArticleFormProps): React.ReactElement => {
    const router = useRouter();
    const { showSuccess, showError, showLoading, dismiss } = useSnackbar();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // =============================================================
    // Data Fetching
    // =============================================================

    const { data: topics = [], isLoading: isLoadingTopics } = useActionQuery<ITopicOption[]>({
        queryKey: ['admin', 'topicOptions'],
        action: getTopicOptions,
        staleTime: 5 * 60 * 1000,
    });

    const { data: subtopics = [], isLoading: isLoadingSubtopics } = useActionQuery<ISubtopicOption[]>({
        queryKey: ['admin', 'subtopicOptions'],
        action: getSubtopicOptions,
        staleTime: 5 * 60 * 1000,
    });

    // =============================================================
    // Form State
    // =============================================================

    const initialData: IArticleFormData = {
        topicId: article?.topicId ?? '',
        subtopicId: article?.subtopicId ?? '',
        title: article?.title ?? '',
        slug: article?.slug ?? '',
        description: article?.description ?? '',
        body: article?.body ?? '',
        tags: article?.tags ?? [],
        coverImage: article?.coverImage ?? '',
        readingTime: article?.readingTime ?? 0,
        publishStatus: article?.publishStatus ?? PUBLISH_STATUS.DRAFT,
        featured: article?.featured ?? false,
        'seo.title': article?.seo?.title ?? '',
        'seo.description': article?.seo?.description ?? '',
        'seo.keywords': article?.seo?.keywords ?? [],
        'seo.ogImage': article?.seo?.ogImage ?? '',
        'seo.canonicalUrl': article?.seo?.canonicalUrl ?? '',
        'seo.noIndex': article?.seo?.noIndex ?? false,
    };

    const { formData, handleChange, setFormData, isModified, resetForm, submitBtnRef } = useFormOperations<IArticleFormData>(initialData);

    // =============================================================
    // Derived Options
    // =============================================================

    const topicSelectOptions = useMemo(() => topics.map((t) => ({ label: t.title, value: t.id })), [topics]);

    const filteredSubtopicSelectOptions = useMemo(() => subtopics.filter((s) => s.topicId === formData.topicId).map((s) => ({ label: s.title, value: s.id })), [subtopics, formData.topicId]);

    // Reset subtopic when topic changes and subtopic doesn't belong to new topic
    useEffect(() => {
        if (!formData.subtopicId) return;
        const isValid = subtopics.some((s) => s.id === formData.subtopicId && s.topicId === formData.topicId);
        if (!isValid) {
            setFormData((prev) => ({ ...prev, subtopicId: '' }));
        }
    }, [formData.subtopicId, formData.topicId, setFormData, subtopics]);

    // =============================================================
    // Step Configuration
    // =============================================================

    const steps: Array<IStepConfig<IArticleFormData>> = useMemo(
        () => [
            {
                id: 'classification',
                label: 'Classification',
                description: 'Topic & status',
                fields: (fd: IArticleFormData, _hc: IHandleChange) => buildClassificationFields(fd, topicSelectOptions, filteredSubtopicSelectOptions, isLoadingTopics, isLoadingSubtopics),
                validate: isClassificationValid,
                errorMessage: 'Please select a topic before continuing.',
            },
            {
                id: 'details',
                label: 'Details',
                description: 'Title, slug & meta',
                fields: (fd: IArticleFormData, _hc: IHandleChange) => buildDetailsFields(fd, isEditing),
                validate: isDetailsValid,
                errorMessage: 'Please fill in the required fields (title, slug, description).',
            },
            {
                id: 'contentSeo',
                label: 'Content & SEO',
                description: 'Body & optimization',
                fields: (fd: IArticleFormData, _hc: IHandleChange) => buildContentSeoFields(fd),
                validate: isContentSeoValid,
                errorMessage: 'Please add content to your article.',
            },
        ],
        [topicSelectOptions, filteredSubtopicSelectOptions, isLoadingTopics, isLoadingSubtopics, isEditing],
    );

    // =============================================================
    // Handlers
    // =============================================================

    const handleValidationError = (step: IStepConfig<IArticleFormData>) => {
        showError('Validation Error', step.errorMessage ?? 'Please fill in all required fields.');
    };

    const handleSubmit = async (data: IArticleFormData) => {
        setIsSubmitting(true);
        const loadingToast = showLoading(isEditing ? 'Updating article...' : 'Creating article...');

        try {
            const articleId = article?.id ?? article?._id;
            const resolvedSlug = data.slug || slugify(data.title);
            const readingTime = Number(data.readingTime) > 0 ? Number(data.readingTime) : estimateReadingTime(data.body);

            const payload: IArticleCreateInput = {
                topicId: data.topicId,
                subtopicId: data.subtopicId || null,
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

            const response = isEditing && articleId ? await updateArticle(articleId, payload) : await createArticle(payload);

            dismiss(loadingToast);

            if (!response.success) {
                showError(response.error, 'Please check your inputs and try again.');
                return;
            }

            showSuccess(response.message ?? (isEditing ? 'Article updated successfully' : 'Article created successfully'), 'Redirecting to articles list...');

            setTimeout(() => {
                router.push('/admin/articles');
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
        <AdminEntityForm<IArticleFormData>
            entityName='Article'
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

export default ArticleForm;
