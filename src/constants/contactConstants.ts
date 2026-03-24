// ============================================================
// Contact Form Constants
// ============================================================

export const CONTACT_INTENT_VALUES = ['general', 'collaboration', 'hiring', 'feedback'] as const;

export type ContactIntent = (typeof CONTACT_INTENT_VALUES)[number];

export const CONTACT_TYPE_OPTIONS: Array<{ value: ContactIntent; label: string }> = [
    { value: 'general', label: 'General' },
    { value: 'collaboration', label: 'Collaboration' },
    { value: 'hiring', label: 'Hiring' },
    { value: 'feedback', label: 'Feedback' },
];

export const CONTACT_TYPE_LABELS: Record<ContactIntent, string> = {
    general: 'General',
    collaboration: 'Collaboration',
    hiring: 'Hiring',
    feedback: 'Feedback',
};

export const CONTACT_FORM_COPY = {
    typeLabel: 'What is this regarding?',
    fields: {
        name: {
            label: 'Name',
            placeholder: 'Your name',
        },
        email: {
            label: 'Email',
            placeholder: 'you@example.com',
        },
        subject: {
            label: 'Subject',
            placeholder: 'What is this about?',
        },
        message: {
            label: 'Message',
            placeholder: 'Your message...',
        },
    },
    status: {
        successTitle: 'Message Sent!',
        successDescription: "Thank you for reaching out. I'll get back to you as soon as possible.",
        sendAnotherAction: 'Send Another Message',
        submitLabel: 'Send Message',
        submittingLabel: 'Sending...',
        validationError: 'Please fix the highlighted fields and try again.',
        genericError: 'Something went wrong.',
        errorFallback: 'Please review your message and try again.',
    },
} as const;
