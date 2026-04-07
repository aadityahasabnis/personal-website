'use client';

import { CustomInput, CustomSelect, CustomTextArea } from '@/components/form';
import type { IFormData, IHandleChangeEvent } from '@/components/form/form';
import { CONTACT_FORM_COPY, CONTACT_INTENT_VALUES, CONTACT_TYPE_LABELS, CONTACT_TYPE_OPTIONS, type ContactIntent } from '@/constants/contactConstants';
import { SCHEMA_LIMITS, VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import { useFormOperations } from '@/hooks/form/useFormOperations';
import { useAction } from '@/hooks/server/useAction';
import { submitPublicContact, type IPublicContactSubmission, type ISubmitPublicContactInput } from '@/server/new/public/contact';
import { AlertCircle, CheckCircle, Loader2, Send } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface IContactFormData extends IFormData {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
    type?: ContactIntent;
}

type FormStatus = 'idle' | 'success' | 'error';

interface IContactFieldErrors {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
}

const getStringValue = (value: unknown): string => (typeof value === 'string' ? value : '');

const getContactIntent = (value: unknown): ContactIntent => {
    if (typeof value === 'string' && CONTACT_INTENT_VALUES.includes(value as ContactIntent)) return value as ContactIntent;
    return 'general';
};

const withContactTypePrefix = (subject: string, type: ContactIntent): string => {
    const prefix = `[${CONTACT_TYPE_LABELS[type]}]`;
    if (subject.startsWith(`${prefix} `) || subject === prefix) return subject;
    return `${prefix} ${subject}`;
};

const validateContactForm = (data: { name: string; email: string; subject: string; message: string }): IContactFieldErrors => {
    const errors: IContactFieldErrors = {};

    if (data.name.length < 2) {
        errors.name = 'Name must be at least 2 characters';
    } else if (data.name.length > SCHEMA_LIMITS.CONTACT_NAME_MAX_LENGTH) {
        errors.name = `Name cannot exceed ${String(SCHEMA_LIMITS.CONTACT_NAME_MAX_LENGTH)} characters`;
    }

    if (!VALIDATION_PATTERNS.EMAIL.test(data.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (data.subject.length < 5) {
        errors.subject = 'Subject must be at least 5 characters';
    } else if (data.subject.length > SCHEMA_LIMITS.CONTACT_SUBJECT_MAX_LENGTH) {
        errors.subject = `Subject cannot exceed ${String(SCHEMA_LIMITS.CONTACT_SUBJECT_MAX_LENGTH)} characters`;
    }

    if (data.message.length < 10) {
        errors.message = 'Message must be at least 10 characters';
    } else if (data.message.length > SCHEMA_LIMITS.CONTACT_MESSAGE_MAX_LENGTH) {
        errors.message = `Message cannot exceed ${String(SCHEMA_LIMITS.CONTACT_MESSAGE_MAX_LENGTH)} characters`;
    }

    return errors;
};

const ContactForm = () => {
    const [status, setStatus] = useState<FormStatus>('idle');
    const [message, setMessage] = useState<string>('');
    const [fieldErrors, setFieldErrors] = useState<IContactFieldErrors>({});

    const { formData, handleChange, resetForm } = useFormOperations<IContactFormData>({
        type: 'general',
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const { mutateAsync, pending } = useAction<IPublicContactSubmission, [ISubmitPublicContactInput]>({
        action: submitPublicContact,
    });

    const handleFormChange = (event: IHandleChangeEvent) => {
        handleChange(event);

        const field = event.target.name;
        if (field === 'name' || field === 'email' || field === 'subject' || field === 'message') {
            setFieldErrors((prev) => {
                if (!prev[field]) return prev;
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (pending) return;

        setMessage('');

        const name = getStringValue(formData.name).trim();
        const email = getStringValue(formData.email).trim();
        const subject = getStringValue(formData.subject).trim();
        const messageBody = getStringValue(formData.message).trim();
        const type = getContactIntent(formData.type);

        const nextErrors = validateContactForm({
            name,
            email,
            subject,
            message: messageBody,
        });

        setFieldErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            setStatus('error');
            setMessage(CONTACT_FORM_COPY.status.validationError);
            return;
        }

        const result = await mutateAsync({
            name,
            email,
            subject: withContactTypePrefix(subject, type),
            message: messageBody,
        });

        if (result.success) {
            setStatus('success');
            setFieldErrors({});
            setMessage(result.message ?? CONTACT_FORM_COPY.status.successTitle);
            resetForm();
            return;
        }

        setStatus('error');
        setMessage(result.error ?? CONTACT_FORM_COPY.status.genericError);
    };

    const formType = getContactIntent(formData.type);
    const formName = getStringValue(formData.name);
    const formEmail = getStringValue(formData.email);
    const formSubject = getStringValue(formData.subject);
    const formMessage = getStringValue(formData.message);

    if (status === 'success') {
        return (
            <div className='p-8 text-center bg-card border border-border rounded-2xl'>
                <CheckCircle className='mx-auto size-12 text-success' />
                <h3 className='mt-4 text-title font-semibold text-foreground'>{CONTACT_FORM_COPY.status.successTitle}</h3>
                <p className='mt-2 text-body text-muted-foreground'>{CONTACT_FORM_COPY.status.successDescription}</p>
                <button
                    type='button'
                    className='inline-flex items-center justify-center gap-2 mt-6 px-6 py-3 text-label font-medium text-foreground bg-card border border-border rounded-full transition-fast hover:border-primary/40'
                    onClick={() => {
                        setStatus('idle');
                        setMessage('');
                    }}
                >
                    {CONTACT_FORM_COPY.status.sendAnotherAction}
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className='space-y-6'>
            {status === 'error' && (
                <div className='flex items-center gap-3 p-4 text-small text-destructive bg-destructive/10 border border-destructive/30 rounded-xl'>
                    <AlertCircle className='size-5 shrink-0' />
                    {message || CONTACT_FORM_COPY.status.errorFallback}
                </div>
            )}

            <CustomSelect<IContactFormData, ContactIntent>
                name='type'
                label={CONTACT_FORM_COPY.typeLabel}
                value={formType}
                options={CONTACT_TYPE_OPTIONS}
                onChange={handleFormChange}
                containerClassName='w-full'
                disabled={pending}
            />

            <div className='grid gap-4 sm:grid-cols-2'>
                <CustomInput<IContactFormData>
                    name='name'
                    label={CONTACT_FORM_COPY.fields.name.label}
                    value={formName}
                    onChange={handleFormChange}
                    placeholder={CONTACT_FORM_COPY.fields.name.placeholder}
                    required
                    disabled={pending}
                    errorMessage={fieldErrors.name}
                    inputClassName='px-4 h-12 text-foreground placeholder:text-muted-foreground bg-background border-border rounded-xl focus:ring-primary'
                />

                <CustomInput<IContactFormData>
                    name='email'
                    label={CONTACT_FORM_COPY.fields.email.label}
                    type='email'
                    value={formEmail}
                    onChange={handleFormChange}
                    placeholder={CONTACT_FORM_COPY.fields.email.placeholder}
                    required
                    disabled={pending}
                    errorMessage={fieldErrors.email}
                    inputClassName='px-4 h-12 text-foreground placeholder:text-muted-foreground bg-background border-border rounded-xl focus:ring-primary'
                />
            </div>

            <CustomInput<IContactFormData>
                name='subject'
                label={CONTACT_FORM_COPY.fields.subject.label}
                value={formSubject}
                onChange={handleFormChange}
                placeholder={CONTACT_FORM_COPY.fields.subject.placeholder}
                required
                disabled={pending}
                errorMessage={fieldErrors.subject}
                inputClassName='px-4 h-12 text-foreground placeholder:text-muted-foreground bg-background border-border rounded-xl focus:ring-primary'
            />

            <CustomTextArea<IContactFormData>
                name='message'
                label={CONTACT_FORM_COPY.fields.message.label}
                value={formMessage}
                onChange={handleFormChange}
                placeholder={CONTACT_FORM_COPY.fields.message.placeholder}
                rows={6}
                required
                disabled={pending}
                errorMessage={fieldErrors.message}
                textAreaClassName='px-4 py-3 min-h-36 resize-y text-regular text-foreground placeholder:text-muted-foreground bg-background border-border rounded-xl focus:ring-primary'
            />

            <button
                type='submit'
                disabled={pending}
                className={cn(
                    'inline-flex items-center gap-2 px-8 py-3 text-label font-medium rounded-full transition-fast',
                    'text-primary-foreground bg-primary',
                    'hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
                )}
            >
                {pending ? (
                    <>
                        <Loader2 className='size-4 animate-spin' />
                        {CONTACT_FORM_COPY.status.submittingLabel}
                    </>
                ) : (
                    <>
                        <Send className='size-4' />
                        {CONTACT_FORM_COPY.status.submitLabel}
                    </>
                )}
            </button>
        </form>
    );
};

export { ContactForm };
