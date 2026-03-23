'use client';

import { CustomInput, CustomSelect, CustomTextArea } from '@/components/form';
import type { IFormData, IHandleChangeEvent } from '@/components/form/form';
import { SCHEMA_LIMITS, VALIDATION_PATTERNS } from '@/constants/schemaConstants';
import { useAction } from '@/hooks/useAction';
import { useFormOperations } from '@/hooks/useFormOperations';
import {
    submitPublicContact,
    type IPublicContactSubmission,
    type ISubmitPublicContactInput,
} from '@/server/new/public/contact';
import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';

type ContactIntent = 'general' | 'collaboration' | 'hiring' | 'feedback';

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

const CONTACT_TYPES = [
    { value: 'general', label: 'General' },
    { value: 'collaboration', label: 'Collaboration' },
    { value: 'hiring', label: 'Hiring' },
    { value: 'feedback', label: 'Feedback' },
] as const;

const CONTACT_TYPE_OPTIONS = CONTACT_TYPES.map((type) => ({
    label: type.label,
    value: type.value,
}));

const CONTACT_TYPE_LABELS: Record<ContactIntent, string> = {
    general: 'General',
    collaboration: 'Collaboration',
    hiring: 'Hiring',
    feedback: 'Feedback',
};

const getStringValue = (value: unknown): string => (typeof value === 'string' ? value : '');

const getContactIntent = (value: unknown): ContactIntent => {
    if (value === 'collaboration' || value === 'hiring' || value === 'feedback') return value;
    return 'general';
};

const withContactTypePrefix = (subject: string, type: ContactIntent): string => {
    const prefix = `[${CONTACT_TYPE_LABELS[type]}]`;
    if (subject.startsWith(`${prefix} `) || subject === prefix) return subject;
    return `${prefix} ${subject}`;
};

const validateContactForm = (data: {
    name: string;
    email: string;
    subject: string;
    message: string;
}): IContactFieldErrors => {
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

/**
 * ContactForm - Premium contact form with validation and status feedback
 */
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
            setMessage('Please fix the highlighted fields and try again.');
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
            setMessage(result.message ?? 'Message sent successfully');
            resetForm();
            return;
        }

        setStatus('error');
        setMessage(result.error ?? 'Something went wrong.');
    };

    const formType = getContactIntent(formData.type);
    const formName = getStringValue(formData.name);
    const formEmail = getStringValue(formData.email);
    const formSubject = getStringValue(formData.subject);
    const formMessage = getStringValue(formData.message);

    if (status === 'success') {
        return (
            <div className='rounded-2xl border border-border bg-card p-8 text-center'>
                <CheckCircle className='mx-auto size-12 text-success' />
                <h3 className='mt-4 text-title font-semibold text-foreground'>Message Sent!</h3>
                <p className='mt-2 text-body text-muted-foreground'>
                    Thank you for reaching out. I&apos;ll get back to you as soon as possible.
                </p>
                <button
                    type='button'
                    className='mt-6 inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-label font-medium text-foreground transition-fast hover:border-primary/40'
                    onClick={() => {
                        setStatus('idle');
                        setMessage('');
                    }}
                >
                    Send Another Message
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={onSubmit} className='space-y-6'>
            {status === 'error' && (
                <div className='flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-small text-destructive'>
                    <AlertCircle className='size-5 shrink-0' />
                    {message || 'Please review your message and try again.'}
                </div>
            )}

            <CustomSelect<IContactFormData, ContactIntent>
                name='type'
                label='What is this regarding?'
                value={formType}
                options={CONTACT_TYPE_OPTIONS}
                onChange={handleFormChange}
                containerClassName='w-full'
                disabled={pending}
            />

            <div className='grid gap-4 sm:grid-cols-2'>
                <CustomInput<IContactFormData>
                    name='name'
                    label='Name'
                    value={formName}
                    onChange={handleFormChange}
                    placeholder='Your name'
                    required
                    disabled={pending}
                    errorMessage={fieldErrors.name}
                    inputClassName='h-12 rounded-xl border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus:ring-primary'
                />

                <CustomInput<IContactFormData>
                    name='email'
                    label='Email'
                    type='email'
                    value={formEmail}
                    onChange={handleFormChange}
                    placeholder='you@example.com'
                    required
                    disabled={pending}
                    errorMessage={fieldErrors.email}
                    inputClassName='h-12 rounded-xl border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus:ring-primary'
                />
            </div>

            <CustomInput<IContactFormData>
                name='subject'
                label='Subject'
                value={formSubject}
                onChange={handleFormChange}
                placeholder='What is this about?'
                required
                disabled={pending}
                errorMessage={fieldErrors.subject}
                inputClassName='h-12 rounded-xl border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus:ring-primary'
            />

            <CustomTextArea<IContactFormData>
                name='message'
                label='Message'
                value={formMessage}
                onChange={handleFormChange}
                placeholder='Your message...'
                rows={6}
                required
                disabled={pending}
                errorMessage={fieldErrors.message}
                textAreaClassName='min-h-36 resize-y rounded-xl border-border bg-background px-4 py-3 text-regular text-foreground placeholder:text-muted-foreground focus:ring-primary'
            />

            <button
                type='submit'
                disabled={pending}
                className={cn(
                    'inline-flex items-center gap-2 rounded-full px-8 py-3 text-label font-medium transition-all',
                    'bg-foreground text-background',
                    'hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
            >
                {pending ? (
                    <>
                        <Loader2 className='size-4 animate-spin' />
                        Sending...
                    </>
                ) : (
                    <>
                        <Send className='size-4' />
                        Send Message
                    </>
                )}
            </button>
        </form>
    );
};

export { ContactForm };
