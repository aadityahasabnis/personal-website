'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useMemo, useState } from 'react';

import FormWrapper, { type IFieldConfig } from '@/components/form/FormWrapper';
import type { IFormData } from '@/components/form/form';
import { useFormOperations } from '@/hooks/form/useFormOperations';
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch topic options via TanStack Query
    const { data: topics = [], isLoading: isLoadingTopics } = useActionQuery<ITopicOption[]>({
        queryKey: ['admin', 'topicOptions'],
        action: getTopicOptions,
        staleTime: 5 * 60 * 1000,
    });

    const topicSelectOptions = useMemo(() => topics.map((t) => ({ label: t.title, value: t.id })), [topics]);

    const initialData: ISubtopicFormData = {
        topicId: subtopic?.topicId ?? defaultTopicId ?? '',
        title: subtopic?.title ?? '',
        slug: subtopic?.slug ?? '',
        description: subtopic?.description ?? '',
        order: subtopic?.order ?? 0,
    };

    const { formData, handleChange, setFormData, isModified, resetForm, submitBtnRef } = useFormOperations<ISubtopicFormData>(initialData);

    const resolvedFields = useMemo(() => buildFields(formData, isEditing, topicSelectOptions, isLoadingTopics), [formData, isEditing, topicSelectOptions, isLoadingTopics]);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let res;

            if (isEditing && subtopic) {
                const payload: Partial<ISubtopicCreateInput> = {
                    topicId: formData.topicId,
                    title: formData.title,
                    slug: formData.slug || slugify(formData.title),
                    description: formData.description || null,
                    order: Number(formData.order) || 0,
                };
                res = await updateSubtopic(subtopic._id, payload);
            } else {
                const payload: ISubtopicCreateInput = {
                    topicId: formData.topicId,
                    title: formData.title,
                    slug: formData.slug || slugify(formData.title),
                    description: formData.description || null,
                    order: 0,
                };
                res = await createSubtopic(payload);
            }

            if (res.success) {
                router.push('/admin/subtopics');
                router.refresh();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
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
            submitLabel={isEditing ? 'Update Subtopic' : 'Create Subtopic'}
            cancelLabel='Discard'
            navigateBackRequired={false}
        />
    );
};

export default SubtopicForm;
