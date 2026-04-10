'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { AdminEntityForm, type IFieldConfig } from '@/components/form';
import type { IFormData } from '@/components/form/form';
import { SCHEMA_LIMITS } from '@/constants/schemaConstants';
import { useFormOperations, useSnackbar } from '@/hooks/form';
import { formatDate } from '@/lib/utils';
import { sendContactResponse, type IAdminContactRow, type IContactResponseInput } from '@/server/new/admin/contacts';

interface IContactResponseFormData extends IFormData {
    subject: string;
    body: string;
}

interface IContactResponseFormProps {
    contact: IAdminContactRow;
}

const stripHtml = (value: string): string =>
    value
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const buildDefaultResponseSubject = (subject: string): string => {
    const prefixed = /^re:/i.test(subject) ? subject : `Re: ${subject}`;
    if (prefixed.length <= SCHEMA_LIMITS.CONTACT_SUBJECT_MAX_LENGTH) return prefixed;
    return prefixed.slice(0, SCHEMA_LIMITS.CONTACT_SUBJECT_MAX_LENGTH);
};

const buildFields = (): Array<IFieldConfig<IContactResponseFormData>> => [
    {
        fieldtype: 'group',
        title: 'Response',
        subText: 'Compose your reply and send it directly to this contact.',
        colsize: 'full',
        fields: [
            {
                fieldtype: 'input',
                name: 'subject',
                label: 'Email Subject',
                required: true,
                hint: `Keep this between 2 and ${String(SCHEMA_LIMITS.CONTACT_SUBJECT_MAX_LENGTH)} characters.`,
                placeholder: 'Re: Your message',
                colsize: 'full',
            },
            {
                fieldtype: 'authorly',
                name: 'body',
                label: 'Response Body',
                required: true,
                placeholder: 'Write your response here...',
                hint: 'Use the rich editor to format your reply professionally.',
                minHeight: '420px',
                colsize: 'full',
            },
        ],
    },
];

export const ContactResponseForm = ({ contact }: IContactResponseFormProps): React.ReactElement => {
    const router = useRouter();
    const { showSuccess, showError, showLoading, dismiss } = useSnackbar();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const initialData: IContactResponseFormData = {
        subject: buildDefaultResponseSubject(contact.subject),
        body: '',
    };

    const { formData, handleChange, setFormData, isModified, resetForm, submitBtnRef } = useFormOperations<IContactResponseFormData>(initialData);

    const resolvedFields = useMemo(() => buildFields(), []);

    const handleSubmit = async (data: IContactResponseFormData) => {
        setIsSubmitting(true);
        const loadingToast = showLoading('Sending response...');

        try {
            const payload: IContactResponseInput = {
                subject: data.subject,
                body: data.body,
            };

            const response = await sendContactResponse(contact.id, payload);

            dismiss(loadingToast);

            if (!response.success) {
                showError(response.error ?? 'Failed to send response', 'Please review your input and try again.');
                return;
            }

            showSuccess(response.message ?? 'Response sent successfully', `Reply sent to ${contact.email}`);

            setTimeout(() => {
                router.push('/admin/contacts');
                router.refresh();
            }, 1000);
        } catch {
            dismiss(loadingToast);
            showError('An unexpected error occurred', 'Please try again or contact support.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = formData.subject.trim().length >= 2 && formData.subject.trim().length <= SCHEMA_LIMITS.CONTACT_SUBJECT_MAX_LENGTH && stripHtml(formData.body).length >= 10;

    return (
        <AdminEntityForm<IContactResponseFormData>
            entityName='Contact Response'
            title='Send Contact Response'
            fields={resolvedFields}
            formData={formData}
            handleChange={handleChange}
            setFormData={setFormData}
            isModified={isModified}
            onSubmit={handleSubmit}
            onReset={resetForm}
            isSubmitting={isSubmitting}
            submitBtnRef={submitBtnRef}
            disabled={!isFormValid}
            labels={{
                submit: 'Send Response',
                submitting: 'Sending...',
            }}
            headerContent={
                <div className='space-y-4 rounded-lg border border-border bg-card p-4'>
                    <div className='grid gap-4 sm:grid-cols-2'>
                        <div>
                            <p className='text-small text-muted-foreground'>Recipient</p>
                            <p className='text-regular font-medium text-foreground'>{contact.name}</p>
                            <p className='text-small text-muted-foreground'>{contact.email}</p>
                        </div>
                        <div>
                            <p className='text-small text-muted-foreground'>Received</p>
                            <p className='text-regular text-foreground'>{formatDate(contact.createdAt)}</p>
                            <p className='text-small capitalize text-muted-foreground'>Status: {contact.status}</p>
                        </div>
                    </div>

                    <div>
                        <p className='text-small text-muted-foreground'>Original Subject</p>
                        <p className='text-regular font-medium text-foreground'>{contact.subject}</p>
                    </div>

                    <div className='rounded-md border border-border bg-background p-3'>
                        <p className='text-small text-muted-foreground'>Original Message</p>
                        <p className='mt-1 whitespace-pre-wrap text-regular text-foreground'>{contact.message}</p>
                    </div>
                </div>
            }
        />
    );
};

export default ContactResponseForm;
