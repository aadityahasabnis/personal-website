'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AdminEntityForm, type IFieldConfig } from '@/components/form';
import type { IFormData } from '@/components/form/form';
import { useFormOperations, useSnackbar } from '@/hooks/form';
import { useActionQuery } from '@/hooks/server/useActionQuery';
import { slugify } from '@/lib/utils';
import { createSubtopic } from '@/server/new/admin/subtopic/createSubtopic';
import type { ISubtopicCreateInput, ISubtopicEdit } from '@/server/new/admin/subtopic/types';
import { updateSubtopic } from '@/server/new/admin/subtopic/updateSubtopic';
import { getTopicOptions, type ITopicOption } from '@/server/new/admin/topic/getTopicOptions';

// =============================================================
// Form Data Type
// =============================================================

interface ISubtopicFormData extends IFormData {
    topicId: string;
    title: string;
    slug: string;
    description: string;
    order: number;
}

// =============================================================
// Field Config
// =============================================================

const buildFields = (formData: ISubtopicFormData, isEditing: boolean, topicOptions: Array<{ label: string; value: string }>, isLoadingTopics: boolean): Array<IFieldConfig<ISubtopicFormData>> => [
    {
        fieldtype: 'group',
        title: 'Parent Topic',
        subText: 'Select which topic this subtopic belongs to.',
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
                colsize: 'full',
            },
        ],
    },
    {
        fieldtype: 'group',
        title: 'Subtopic Details',
        subText: 'Core identity used in URLs and article sub-categorisation.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'input',
                name: 'title',
                label: 'Title',
                placeholder: 'e.g., Arrays & Strings',
                required: true,
                colsize: 'full',
            },
            {
                fieldtype: 'input',
                name: 'slug',
                label: 'Slug',
                placeholder: 'arrays-and-strings',
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
                placeholder: 'A brief description of this subtopic. Shown in listings and meta tags.',
                rows: 3,
                colsize: 'full',
            },
        ],
    },
];

// =============================================================
// Props
// =============================================================

interface ISubtopicFormProps {
    subtopic?: ISubtopicEdit;
    isEditing?: boolean;
    defaultTopicId?: string;
}

// =============================================================
// SubtopicForm
// =============================================================

export const SubtopicForm = ({ subtopic, isEditing = false, defaultTopicId }: ISubtopicFormProps) => {
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

    const topicSelectOptions = useMemo(() => topics.map((t) => ({ label: t.title, value: t.id })), [topics]);

    // =============================================================
    // Form State
    // =============================================================

    const initialData: ISubtopicFormData = {
        topicId: subtopic?.topicId ?? defaultTopicId ?? '',
        title: subtopic?.title ?? '',
        slug: subtopic?.slug ?? '',
        description: subtopic?.description ?? '',
        order: subtopic?.order ?? 0,
    };

    const { formData, handleChange, setFormData, isModified, resetForm, submitBtnRef } = useFormOperations<ISubtopicFormData>(initialData);

    // =============================================================
    // Field Config (dynamic based on formData)
    // =============================================================

    const resolvedFields = useMemo(() => buildFields(formData, isEditing, topicSelectOptions, isLoadingTopics), [formData, isEditing, topicSelectOptions, isLoadingTopics]);

    // =============================================================
    // Handlers
    // =============================================================

    const handleSubmit = async (data: ISubtopicFormData) => {
        setIsSubmitting(true);
        const loadingToast = showLoading(isEditing ? 'Updating subtopic...' : 'Creating subtopic...');

        try {
            const payload: ISubtopicCreateInput = {
                topicId: data.topicId,
                title: data.title,
                slug: data.slug || slugify(data.title),
                description: data.description || null,
                order: Number(data.order) || 0,
            };

            const res = isEditing && subtopic ? await updateSubtopic(subtopic._id, payload) : await createSubtopic(payload);

            dismiss(loadingToast);

            if (!res.success) {
                showError(res.error ?? 'Failed to save subtopic', 'Please check your inputs and try again.');
                return;
            }

            showSuccess(res.message ?? (isEditing ? 'Subtopic updated successfully' : 'Subtopic created successfully'), 'Redirecting to subtopics list...');

            setTimeout(() => {
                router.push('/admin/subtopics');
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
        <AdminEntityForm<ISubtopicFormData>
            entityName='Subtopic'
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
        />
    );
};

export default SubtopicForm;
