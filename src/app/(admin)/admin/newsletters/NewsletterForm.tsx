'use client';

// =============================================================
// NewsletterForm - Professional Form for Creating/Editing Newsletters
// Uses AdminEntityForm with Authorly rich text editor
// Supports create and edit modes with read-only state for sent newsletters
// =============================================================

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AdminEntityForm, type IFieldConfig, type IStepConfig } from '@/components/form';
import type { IFormData, IHandleChange } from '@/components/form/form';
import { SCHEMA_LIMITS } from '@/constants/schemaConstants';
import { useFormOperations, useSnackbar } from '@/hooks/form';
import {
    createNewsletter,
    updateNewsletter,
    type ICreateNewsletterInput,
} from '@/server/new/admin/newsletter';

// =============================================================
// Form Data Type
// =============================================================

interface INewsletterFormData extends IFormData {
    subject: string;
    previewText: string;
    body: string;
}

interface INewsletterFormSeed {
    id?: string;
    subject?: string;
    previewText?: string | null;
    body?: string;
    status?: 'draft' | 'sent';
}

// =============================================================
// Step Field Builders
// =============================================================

const buildDetailsFields = (): Array<IFieldConfig<INewsletterFormData>> => [
    {
        fieldtype: 'group',
        title: 'Newsletter Details',
        subText: 'Subject line and preview text that subscribers see in their inbox.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'input',
                name: 'subject',
                label: 'Subject',
                placeholder: 'e.g., Monthly Update: New Articles & Features',
                required: true,
                hint: `Subject line for your newsletter (${SCHEMA_LIMITS.NEWSLETTER_SUBJECT_MIN_LENGTH}-${SCHEMA_LIMITS.NEWSLETTER_SUBJECT_MAX_LENGTH} characters)`,
                colsize: 'full',
            },
            {
                fieldtype: 'input',
                name: 'previewText',
                label: 'Preview Text',
                placeholder: 'Brief preview shown in email clients...',
                hint: `Optional preview text shown alongside subject in inbox (max ${SCHEMA_LIMITS.NEWSLETTER_PREVIEW_TEXT_MAX_LENGTH} characters)`,
                colsize: 'full',
            },
        ],
    },
];

const buildContentFields = (): Array<IFieldConfig<INewsletterFormData>> => [
    {
        fieldtype: 'group',
        title: 'Newsletter Content',
        subText: 'Use the rich editor to compose your newsletter. HTML content will be sent to subscribers.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'authorly',
                name: 'body',
                label: 'Body',
                required: true,
                placeholder: 'Write your newsletter content here...',
                minHeight: '480px',
                colsize: 'full',
            },
        ],
    },
];

// =============================================================
// Step Validators
// =============================================================

const isDetailsValid = (formData: INewsletterFormData): boolean =>
    formData.subject.trim().length >= SCHEMA_LIMITS.NEWSLETTER_SUBJECT_MIN_LENGTH &&
    formData.subject.trim().length <= SCHEMA_LIMITS.NEWSLETTER_SUBJECT_MAX_LENGTH;

const isContentValid = (formData: INewsletterFormData): boolean =>
    formData.body.trim().length >= 10;

// =============================================================
// Props
// =============================================================

interface INewsletterFormProps {
    newsletter?: INewsletterFormSeed;
    isEditing?: boolean;
}

// =============================================================
// NewsletterForm
// =============================================================

export const NewsletterForm = ({ newsletter, isEditing = false }: INewsletterFormProps): React.ReactElement => {
    const router = useRouter();
    const { showSuccess, showError, showLoading, dismiss } = useSnackbar();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if newsletter is sent (read-only mode)
    const isSent = newsletter?.status === 'sent';

    // =============================================================
    // Form State
    // =============================================================

    const initialData: INewsletterFormData = {
        subject: newsletter?.subject ?? '',
        previewText: newsletter?.previewText ?? '',
        body: newsletter?.body ?? '',
    };

    const { formData, handleChange, setFormData, isModified, resetForm, submitBtnRef } =
        useFormOperations<INewsletterFormData>(initialData);

    // =============================================================
    // Step Configuration
    // =============================================================

    const steps: Array<IStepConfig<INewsletterFormData>> = useMemo(
        () => [
            {
                id: 'details',
                label: 'Details',
                description: 'Subject & preview',
                fields: (_fd: INewsletterFormData, _hc: IHandleChange) => buildDetailsFields(),
                validate: isDetailsValid,
                errorMessage: `Subject is required (${SCHEMA_LIMITS.NEWSLETTER_SUBJECT_MIN_LENGTH}-${SCHEMA_LIMITS.NEWSLETTER_SUBJECT_MAX_LENGTH} characters).`,
            },
            {
                id: 'content',
                label: 'Content',
                description: 'Newsletter body',
                fields: (_fd: INewsletterFormData, _hc: IHandleChange) => buildContentFields(),
                validate: isContentValid,
                errorMessage: 'Newsletter content must be at least 10 characters.',
            },
        ],
        [],
    );

    // =============================================================
    // Handlers
    // =============================================================

    const handleValidationError = (step: IStepConfig<INewsletterFormData>) => {
        showError('Validation Error', step.errorMessage ?? 'Please fill in all required fields.');
    };

    const handleSubmit = async (data: INewsletterFormData) => {
        if (isSent) {
            showError('Cannot modify sent newsletter', 'Sent newsletters are read-only.');
            return;
        }

        setIsSubmitting(true);
        const loadingToast = showLoading(isEditing ? 'Updating newsletter...' : 'Creating newsletter...');

        try {
            const previewText = data.previewText.trim();
            const payload: ICreateNewsletterInput = {
                subject: data.subject.trim(),
                ...(previewText ? { previewText } : {}),
                body: data.body,
            };

            const response = isEditing && newsletter?.id
                ? await updateNewsletter(newsletter.id, payload)
                : await createNewsletter(payload);

            dismiss(loadingToast);

            if (!response.success) {
                showError(response.error, 'Please check your inputs and try again.');
                return;
            }

            showSuccess(
                response.message ?? (isEditing ? 'Newsletter updated successfully' : 'Newsletter created successfully'),
                'Redirecting to newsletters list...'
            );

            setTimeout(() => {
                router.push('/admin/newsletters');
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
    // Read-Only View for Sent Newsletters
    // =============================================================

    if (isSent) {
        return (
            <div className="space-y-6">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/50">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                        This newsletter has been sent and cannot be modified. You can view its contents below.
                    </p>
                </div>

                <div className="space-y-6 rounded-lg border p-6">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Subject</label>
                        <p className="mt-1 text-lg font-semibold">{newsletter?.subject}</p>
                    </div>

                    {newsletter?.previewText && (
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Preview Text</label>
                            <p className="mt-1 text-sm italic">{newsletter.previewText}</p>
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Content</label>
                        <div
                            className="prose prose-sm mt-2 max-w-none rounded-md border bg-muted/50 p-4 dark:prose-invert"
                            dangerouslySetInnerHTML={{ __html: newsletter?.body ?? '' }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // =============================================================
    // Render Form
    // =============================================================

    return (
        <AdminEntityForm<INewsletterFormData>
            entityName="Newsletter"
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
                submitting: 'Saving...',
            }}
        />
    );
};

export default NewsletterForm;
