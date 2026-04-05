'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useEffect, useMemo, useState } from 'react';

import { type IFieldConfig, renderField } from '@/components/form';
import { getSeoFieldConfig } from '@/components/form/config/seoFields';
import type { IFormData } from '@/components/form/form';
import { Button } from '@/components/ui/button';
import { PUBLISH_STATUS, type PublishStatusType } from '@/constants/schemaConstants';
import { useFormOperations } from '@/hooks/form/useFormOperations';
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
    order: number;
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
// Stepper
// =============================================================

const STEPS = [
    { id: 'classification', label: 'Classification' },
    { id: 'details', label: 'Details' },
    { id: 'contentSeo', label: 'Content & SEO' },
] as const;

type TStepIndex = 0 | 1 | 2;

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

const buildStepFields = (
    step: TStepIndex,
    formData: IArticleFormData,
    isEditing: boolean,
    topicOptions: Array<{ label: string; value: string }>,
    subtopicOptions: Array<{ label: string; value: string }>,
    isLoadingTopics: boolean,
    isLoadingSubtopics: boolean,
): Array<IFieldConfig<IArticleFormData>> => {
    if (step === 0) {
        return [
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
                subText: 'Control publication state and ranking behavior.',
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
                        name: 'order',
                        label: 'Order',
                        type: 'number',
                        inputType: 'number',
                        hint: 'Lower numbers appear first in ordered views.',
                        colsize: 2,
                    },
                    {
                        fieldtype: 'toggle',
                        name: 'featured',
                        label: 'Feature this article',
                        hint: 'Featured articles can be pinned in highlights.',
                        colsize: 2,
                    },
                ],
            },
        ];
    }

    if (step === 1) {
        return [
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
    }

    return [
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
};

const isStepValid = (step: TStepIndex, formData: IArticleFormData): boolean => {
    if (step === 0) return Boolean(formData.topicId);
    if (step === 1) return Boolean(formData.title.trim() && (formData.slug || slugify(formData.title)).trim() && formData.description.trim());
    return Boolean(formData.body.trim());
};

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
    const [step, setStep] = useState<TStepIndex>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        order: article?.order ?? 0,
        'seo.title': article?.seo?.title ?? '',
        'seo.description': article?.seo?.description ?? '',
        'seo.keywords': article?.seo?.keywords ?? [],
        'seo.ogImage': article?.seo?.ogImage ?? '',
        'seo.canonicalUrl': article?.seo?.canonicalUrl ?? '',
        'seo.noIndex': article?.seo?.noIndex ?? false,
    };

    const { formData, handleChange, setFormData, isModified, resetForm, submitBtnRef } = useFormOperations<IArticleFormData>(initialData);

    const topicSelectOptions = useMemo(() => topics.map((t) => ({ label: t.title, value: t.id })), [topics]);

    const filteredSubtopicSelectOptions = useMemo(() => subtopics.filter((s) => s.topicId === formData.topicId).map((s) => ({ label: s.title, value: s.id })), [subtopics, formData.topicId]);

    useEffect(() => {
        if (!formData.subtopicId) return;
        const isValid = subtopics.some((s) => s.id === formData.subtopicId && s.topicId === formData.topicId);
        if (!isValid) {
            setFormData((prev) => ({ ...prev, subtopicId: '' }));
        }
    }, [formData.subtopicId, formData.topicId, setFormData, subtopics]);

    const currentStepFields = useMemo(
        () => buildStepFields(step, formData, isEditing, topicSelectOptions, filteredSubtopicSelectOptions, isLoadingTopics, isLoadingSubtopics),
        [step, formData, isEditing, topicSelectOptions, filteredSubtopicSelectOptions, isLoadingTopics, isLoadingSubtopics],
    );

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (step < 2) {
            if (isStepValid(step, formData)) {
                setStep((prev) => Math.min(2, prev + 1) as TStepIndex);
            }
            return;
        }

        setIsSubmitting(true);

        try {
            const articleId = article?.id ?? article?._id;
            const resolvedSlug = formData.slug || slugify(formData.title);
            const readingTime = Number(formData.readingTime) > 0 ? Number(formData.readingTime) : estimateReadingTime(formData.body);

            const payload: IArticleCreateInput = {
                topicId: formData.topicId,
                subtopicId: formData.subtopicId || null,
                slug: resolvedSlug,
                title: formData.title,
                description: formData.description,
                body: formData.body,
                tags: formData.tags,
                coverImage: formData.coverImage || null,
                readingTime,
                publishStatus: formData.publishStatus,
                featured: Boolean(formData.featured),
                order: Number(formData.order) || 0,
                seo: parseSeo(formData),
            };

            const response = isEditing && articleId ? await updateArticle(articleId, payload) : await createArticle(payload);
            if (!response.success) return;

            router.push('/admin/articles');
            router.refresh();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='flex flex-col gap-6 pb-5'>
            <div className='flex flex-wrap items-center gap-2'>
                {STEPS.map((item, index) => {
                    const active = step === index;
                    const complete = step > index;

                    return (
                        <button
                            key={item.id}
                            type='button'
                            onClick={() => {
                                if (index <= step) setStep(index as TStepIndex);
                            }}
                            disabled={index > step}
                            className='flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-label text-foreground transition-fast disabled:cursor-not-allowed disabled:opacity-50'
                        >
                            <span className='flex size-5 items-center justify-center rounded-full bg-background text-small'>{complete ? '✓' : index + 1}</span>
                            <span className={active ? 'font-semibold' : undefined}>{item.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className='rounded-xl border border-border bg-card p-5'>
                <div className='grid gap-5 sm:grid-cols-2 md:grid-cols-6'>{currentStepFields.map((field, index) => renderField(formData, handleChange, field, index))}</div>
            </div>

            <div className='glass-card sticky bottom-6 z-40 mt-2 flex w-full items-center justify-between gap-4 rounded-xl p-4 shadow-glow-sm transition-all duration-300 hover:shadow-glow-md'>
                <div className='flex items-center gap-2'>
                    <Button type='button' variant='outline' onClick={resetForm} disabled={!isModified || isSubmitting}>
                        Discard
                    </Button>
                    <Button
                        type='button'
                        variant='outline'
                        onClick={() => {
                            setStep((prev) => Math.max(0, prev - 1) as TStepIndex);
                        }}
                        disabled={step === 0 || isSubmitting}
                    >
                        Previous
                    </Button>
                </div>
                {step < 2 ? (
                    <Button type='submit' ref={submitBtnRef} disabled={!isStepValid(step, formData) || isSubmitting}>
                        Next
                    </Button>
                ) : (
                    <Button type='submit' ref={submitBtnRef} disabled={!isStepValid(step, formData) || isSubmitting}>
                        {isSubmitting ? 'Saving…' : isEditing ? 'Update Article' : 'Create Article'}
                    </Button>
                )}
            </div>
        </form>
    );
};

export default ArticleForm;
