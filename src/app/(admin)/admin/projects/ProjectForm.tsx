'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AdminEntityForm, type IFieldConfig, type IStepConfig } from '@/components/form';
import { getSeoFieldConfig } from '@/components/form/config/seoFields';
import type { IFormData, IHandleChange } from '@/components/form/form';
import { PROJECT_STATUS, PUBLISH_STATUS, type ProjectStatusType, type PublishStatusType } from '@/constants/schemaConstants';
import { useFormOperations, useSnackbar } from '@/hooks/form';
import { slugify } from '@/lib/utils';
import { createProject } from '@/server/new/admin/content/project/createProject';
import type { IProjectCreateInput, IProjectEdit } from '@/server/new/admin/content/project/types';
import { updateProject } from '@/server/new/admin/content/project/updateProject';

// =============================================================
// Form Data Type
// =============================================================

interface IProjectFormData extends IFormData {
    // Step 1: Project Details
    title: string;
    slug: string;
    description: string;
    publishStatus: PublishStatusType;
    featured: boolean;
    order: number;
    tags: string[];
    coverImage: string;

    // Step 2: Tech & Links
    techStack: string[];
    githubUrl: string;
    liveUrl: string;
    demoVideo: string;
    gallery: string[];
    status: ProjectStatusType | '';
    startDate: string;
    completedDate: string;

    // Step 3: Content & SEO
    body: string;
    'seo.title': string;
    'seo.description': string;
    'seo.keywords': string[];
    'seo.ogImage': string;
    'seo.canonicalUrl': string;
    'seo.noIndex': boolean;
}

interface IProjectFormSeed extends Partial<IProjectEdit> {
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

type IProjectSeoPayload = Exclude<IProjectCreateInput['seo'], undefined>;

const parseSeo = (data: IProjectFormData): IProjectSeoPayload => {
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

const buildDetailsFields = (formData: IProjectFormData, isEditing: boolean): Array<IFieldConfig<IProjectFormData>> => [
    {
        fieldtype: 'group',
        title: 'Project Details',
        subText: 'Identity fields used for URL, listing cards, and metadata defaults.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'input',
                name: 'title',
                label: 'Title',
                placeholder: 'e.g., Portfolio Website',
                required: true,
                colsize: 'full',
            },
            {
                fieldtype: 'input',
                name: 'slug',
                label: 'Slug',
                placeholder: 'portfolio-website',
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
                name: 'order',
                label: 'Display Order',
                type: 'number',
                inputType: 'number',
                hint: 'Lower numbers appear first. Default is 0.',
                colsize: 2,
            },
            {
                fieldtype: 'toggle',
                name: 'featured',
                label: 'Featured',
                hint: 'Featured projects can be pinned in highlights.',
                colsize: 2,
            },
        ],
    },
];

const buildTechLinksFields = (_formData: IProjectFormData): Array<IFieldConfig<IProjectFormData>> => [
    {
        fieldtype: 'group',
        title: 'Technology Stack',
        subText: 'Technologies, frameworks, and tools used in this project.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'tagInput',
                name: 'techStack',
                label: 'Tech Stack',
                placeholder: 'e.g., React, TypeScript, Node.js…',
                maxTags: 20,
                colsize: 'full',
            },
        ],
    },
    {
        fieldtype: 'group',
        title: 'Project Links',
        subText: 'External URLs related to this project.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'input',
                name: 'githubUrl',
                label: 'GitHub URL',
                placeholder: 'https://github.com/username/repo',
                type: 'url',
                allowCopy: true,
                colsize: 3,
            },
            {
                fieldtype: 'input',
                name: 'liveUrl',
                label: 'Live URL',
                placeholder: 'https://example.com',
                type: 'url',
                allowCopy: true,
                colsize: 3,
            },
            {
                fieldtype: 'input',
                name: 'demoVideo',
                label: 'Demo Video URL',
                placeholder: 'https://youtube.com/watch?v=...',
                type: 'url',
                allowCopy: true,
                colsize: 'full',
            },
        ],
    },
    {
        fieldtype: 'group',
        title: 'Project Lifecycle',
        subText: 'Track the status and timeline of the project.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'select',
                name: 'status',
                label: 'Lifecycle Status',
                options: [
                    { label: 'Not Set', value: '' },
                    { label: 'In Progress', value: PROJECT_STATUS.IN_PROGRESS },
                    { label: 'Live', value: PROJECT_STATUS.LIVE },
                    { label: 'Archived', value: PROJECT_STATUS.ARCHIVED },
                ],
                hint: 'Current development/deployment status.',
                colsize: 2,
            },
            {
                fieldtype: 'input',
                name: 'startDate',
                label: 'Start Date',
                type: 'date',
                hint: 'When did work begin?',
                colsize: 2,
            },
            {
                fieldtype: 'input',
                name: 'completedDate',
                label: 'Completed Date',
                type: 'date',
                hint: 'When was it finished or launched?',
                colsize: 2,
            },
        ],
    },
    {
        fieldtype: 'group',
        title: 'Gallery',
        subText: 'Add screenshot URLs for the project gallery (one per line or comma-separated).',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'tagInput',
                name: 'gallery',
                label: 'Gallery Images',
                placeholder: 'Paste image URL and press Enter…',
                maxTags: 10,
                colsize: 'full',
            },
        ],
    },
];

const buildContentSeoFields = (formData: IProjectFormData): Array<IFieldConfig<IProjectFormData>> => [
    {
        fieldtype: 'group',
        title: 'Project Content',
        subText: 'Use the rich editor for detailed project description and documentation.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'authorly',
                name: 'body',
                label: 'Body',
                required: true,
                placeholder: 'Describe your project in detail…',
                minHeight: '560px',
                colsize: 'full',
            },
        ],
    },
    ...getSeoFieldConfig(formData, '/projects'),
];

// =============================================================
// Step Validators
// =============================================================

const isDetailsValid = (formData: IProjectFormData): boolean => Boolean(formData.title.trim() && (formData.slug || slugify(formData.title)).trim() && formData.description.trim());

const isTechLinksValid = (_formData: IProjectFormData): boolean => {
    // Tech & Links step has no required fields
    return true;
};

const isContentSeoValid = (formData: IProjectFormData): boolean => Boolean(formData.body.trim());

// =============================================================
// Props
// =============================================================

interface IProjectFormProps {
    project?: IProjectFormSeed;
    isEditing?: boolean;
}

// =============================================================
// ProjectForm
// =============================================================

export const ProjectForm = ({ project, isEditing = false }: IProjectFormProps): React.ReactElement => {
    const router = useRouter();
    const { showSuccess, showError, showLoading, dismiss } = useSnackbar();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // =============================================================
    // Form State
    // =============================================================

    const initialData: IProjectFormData = {
        // Step 1: Details
        title: project?.title ?? '',
        slug: project?.slug ?? '',
        description: project?.description ?? '',
        publishStatus: project?.publishStatus ?? PUBLISH_STATUS.DRAFT,
        featured: project?.featured ?? false,
        order: project?.order ?? 0,
        tags: project?.tags ?? [],
        coverImage: project?.coverImage ?? '',

        // Step 2: Tech & Links
        techStack: project?.techStack ?? [],
        githubUrl: project?.githubUrl ?? '',
        liveUrl: project?.liveUrl ?? '',
        demoVideo: project?.demoVideo ?? '',
        gallery: project?.gallery ?? [],
        status: project?.status ?? '',
        startDate: project?.startDate ? project.startDate.split('T')[0] : '',
        completedDate: project?.completedDate ? project.completedDate.split('T')[0] : '',

        // Step 3: Content & SEO
        body: project?.body ?? '',
        'seo.title': project?.seo?.title ?? '',
        'seo.description': project?.seo?.description ?? '',
        'seo.keywords': project?.seo?.keywords ?? [],
        'seo.ogImage': project?.seo?.ogImage ?? '',
        'seo.canonicalUrl': project?.seo?.canonicalUrl ?? '',
        'seo.noIndex': project?.seo?.noIndex ?? false,
    };

    const { formData, handleChange, setFormData, isModified, resetForm, submitBtnRef } = useFormOperations<IProjectFormData>(initialData);

    // =============================================================
    // Step Configuration
    // =============================================================

    const steps: Array<IStepConfig<IProjectFormData>> = useMemo(
        () => [
            {
                id: 'details',
                label: 'Project Details',
                description: 'Title, slug & status',
                fields: (fd: IProjectFormData, _hc: IHandleChange) => buildDetailsFields(fd, isEditing),
                validate: isDetailsValid,
                errorMessage: 'Please fill in the required fields (title, slug, description).',
            },
            {
                id: 'techLinks',
                label: 'Tech & Links',
                description: 'Stack, URLs & lifecycle',
                fields: (fd: IProjectFormData, _hc: IHandleChange) => buildTechLinksFields(fd),
                validate: isTechLinksValid,
                errorMessage: 'Please check the Tech & Links fields.',
            },
            {
                id: 'contentSeo',
                label: 'Content & SEO',
                description: 'Body & optimization',
                fields: (fd: IProjectFormData, _hc: IHandleChange) => buildContentSeoFields(fd),
                validate: isContentSeoValid,
                errorMessage: 'Please add content to your project.',
            },
        ],
        [isEditing],
    );

    // =============================================================
    // Handlers
    // =============================================================

    const handleValidationError = (step: IStepConfig<IProjectFormData>) => {
        showError('Validation Error', step.errorMessage ?? 'Please fill in all required fields.');
    };

    const handleSubmit = async (data: IProjectFormData) => {
        setIsSubmitting(true);
        const loadingToast = showLoading(isEditing ? 'Updating project...' : 'Creating project...');

        try {
            const projectId = project?.id ?? project?._id;
            const resolvedSlug = data.slug || slugify(data.title);
            const readingTime = estimateReadingTime(data.body);

            const payload: IProjectCreateInput = {
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
                techStack: data.techStack,
                githubUrl: data.githubUrl || null,
                liveUrl: data.liveUrl || null,
                demoVideo: data.demoVideo || null,
                gallery: data.gallery,
                status: data.status || null,
                startDate: data.startDate || null,
                completedDate: data.completedDate || null,
                order: Number(data.order) || 0,
            };

            const response = isEditing && projectId ? await updateProject(projectId, payload) : await createProject(payload);

            dismiss(loadingToast);

            if (!response.success) {
                showError(response.error, 'Please check your inputs and try again.');
                return;
            }

            showSuccess(response.message ?? (isEditing ? 'Project updated successfully' : 'Project created successfully'), 'Redirecting to projects list...');

            setTimeout(() => {
                router.push('/admin/projects');
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
        <AdminEntityForm<IProjectFormData>
            entityName='Project'
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

export default ProjectForm;
