'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { submitContact } from '@/server/actions/contact';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface IContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    type: 'general' | 'collaboration' | 'hiring' | 'feedback';
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const CONTACT_TYPES = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'collaboration', label: 'Collaboration' },
    { value: 'hiring', label: 'Job Opportunity' },
    { value: 'feedback', label: 'Feedback' },
] as const;

/**
 * ContactForm - Professional contact form with validation and status feedback
 */
const ContactForm = () => {
    const [status, setStatus] = useState<FormStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<IContactFormData>({
        defaultValues: {
            type: 'general',
        },
    });

    const onSubmit = async (data: IContactFormData) => {
        setStatus('submitting');
        setErrorMessage('');

        const result = await submitContact(data);

        if (result.success) {
            setStatus('success');
            reset();
        } else {
            setStatus('error');
            setErrorMessage(result.error ?? 'Something went wrong.');
        }
    };

    if (status === 'success') {
        return (
            <Card className="p-8 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-4 text-xl font-semibold">Message Sent!</h3>
                <p className="mt-2 text-muted-foreground">
                    Thank you for reaching out. I will get back to you as soon as
                    possible.
                </p>
                <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => setStatus('idle')}
                >
                    Send Another Message
                </Button>
            </Card>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Alert */}
            {status === 'error' && (
                <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    {errorMessage}
                </div>
            )}

            {/* Contact Type */}
            <div className="space-y-2">
                <label className="text-sm font-medium">
                    What is this regarding?
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {CONTACT_TYPES.map((type) => (
                        <label
                            key={type.value}
                            className={cn(
                                'flex cursor-pointer items-center justify-center rounded-lg border p-3 text-sm transition-all',
                                'hover:border-primary/50 hover:bg-primary/5',
                                'has-[:checked]:border-primary has-[:checked]:bg-primary/10'
                            )}
                        >
                            <input
                                type="radio"
                                value={type.value}
                                {...register('type')}
                                className="sr-only"
                            />
                            {type.label}
                        </label>
                    ))}
                </div>
            </div>

            {/* Name & Email Row */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">
                        Name <span className="text-destructive">*</span>
                    </label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-3 text-sm',
                            'placeholder:text-muted-foreground',
                            'focus:outline-none focus:ring-2 focus:ring-ring',
                            errors.name && 'border-destructive focus:ring-destructive'
                        )}
                        {...register('name', {
                            required: 'Name is required',
                            minLength: {
                                value: 2,
                                message: 'Name must be at least 2 characters',
                            },
                        })}
                    />
                    {errors.name && (
                        <p className="text-xs text-destructive">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-destructive">*</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-3 text-sm',
                            'placeholder:text-muted-foreground',
                            'focus:outline-none focus:ring-2 focus:ring-ring',
                            errors.email && 'border-destructive focus:ring-destructive'
                        )}
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Please enter a valid email',
                            },
                        })}
                    />
                    {errors.email && (
                        <p className="text-xs text-destructive">
                            {errors.email.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                    Subject <span className="text-destructive">*</span>
                </label>
                <input
                    id="subject"
                    type="text"
                    placeholder="What is this about?"
                    className={cn(
                        'w-full rounded-lg border bg-background px-4 py-3 text-sm',
                        'placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring',
                        errors.subject && 'border-destructive focus:ring-destructive'
                    )}
                    {...register('subject', {
                        required: 'Subject is required',
                        minLength: {
                            value: 5,
                            message: 'Subject must be at least 5 characters',
                        },
                    })}
                />
                {errors.subject && (
                    <p className="text-xs text-destructive">
                        {errors.subject.message}
                    </p>
                )}
            </div>

            {/* Message */}
            <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                    Message <span className="text-destructive">*</span>
                </label>
                <textarea
                    id="message"
                    rows={6}
                    placeholder="Your message..."
                    className={cn(
                        'w-full resize-none rounded-lg border bg-background px-4 py-3 text-sm',
                        'placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring',
                        errors.message && 'border-destructive focus:ring-destructive'
                    )}
                    {...register('message', {
                        required: 'Message is required',
                        minLength: {
                            value: 20,
                            message: 'Message must be at least 20 characters',
                        },
                    })}
                />
                {errors.message && (
                    <p className="text-xs text-destructive">
                        {errors.message.message}
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto"
                disabled={status === 'submitting'}
            >
                {status === 'submitting' ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                    </>
                ) : (
                    <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                    </>
                )}
            </Button>
        </form>
    );
};

export { ContactForm };
