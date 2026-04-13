import type { Metadata } from 'next';

import { createPageMetadata } from '@/lib/metadata';
import { contactResponseEmailTemplate, newsletterEmailTemplate, otpEmailTemplate, passwordResetEmailTemplate, testEmailTemplate, welcomeEmailTemplate } from '@/server/new/utils/mail-templates';

export const metadata: Metadata = createPageMetadata({
    title: 'Mail Template Lab',
    description: 'Internal route to preview all transactional and newsletter mail templates with demo content.',
    canonicalPath: '/test/mails',
    robots: {
        index: false,
        follow: false,
    },
});

type MailPreview = {
    id: string;
    label: string;
    html: string;
    text: string;
};

type MailPreviewCardProps = {
    preview: MailPreview;
    index: number;
};

function getMailPreviews(): MailPreview[] {
    const otp = otpEmailTemplate('Aaditya', '482913', '10 minutes');

    const passwordReset = passwordResetEmailTemplate('Aaditya', 'https://aadityahasabnis.com/admin/reset-password?token=demo-reset-token-1234567890', '1 hour');

    const testMail = testEmailTemplate(
        'Demo System Check',
        ['This is a demo system-check message.', 'Use this preview to validate spacing, typography, and CTA rendering.', 'Timestamp: 2026-04-13 10:15 UTC'].join('\n\n'),
    );

    const newsletter = newsletterEmailTemplate(
        'Aaditya',
        'April Build Notes - Static First, Dynamic Islands',
        `
        <p>Quick updates from this sprint:</p>
        <ul>
            <li>Refined server-action contracts for public reads and admin mutations.</li>
            <li>Completed test hardening for auth boundaries and validation-race scenarios.</li>
            <li>Improved SEO consistency for metadata and route-level discoverability.</li>
        </ul>
        <p>Thanks for reading. More deep dives are coming soon.</p>
        `,
        'April engineering updates and platform progress',
    );

    const contactResponse = contactResponseEmailTemplate(
        'Aaditya',
        'Re: Collaboration opportunity for portfolio platform',
        `
        <p>Thanks for your message and the detailed brief.</p>
        <p>I am available to discuss scope, timeline, and delivery model this week.</p>
        <p>Feel free to share your preferred time slots and project constraints.</p>
        `,
        'Collaboration opportunity for portfolio platform',
        ['Hi Aaditya,', 'I loved your architecture write-up. Would you be open to a short collaboration on a static-first publishing platform?', 'Best,', 'Priya'].join('\n'),
    );

    const welcome = welcomeEmailTemplate('Aaditya');

    return [
        { id: 'otp', label: 'OTP Verification', html: otp.html, text: otp.text },
        { id: 'password-reset', label: 'Password Reset', html: passwordReset.html, text: passwordReset.text },
        { id: 'test-mail', label: 'Test Email', html: testMail.html, text: testMail.text },
        { id: 'newsletter', label: 'Newsletter', html: newsletter.html, text: newsletter.text },
        { id: 'contact-response', label: 'Contact Response', html: contactResponse.html, text: contactResponse.text },
        { id: 'welcome', label: 'Welcome Subscriber', html: welcome.html, text: welcome.text },
    ];
}

function MailPreviewCard({ preview, index }: MailPreviewCardProps) {
    return (
        <article className='relative flex flex-col gap-4 p-5 md:p-6 rounded-2xl border border-border bg-card shadow-glow-sm'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
                <h2 className='text-h3 font-semibold text-foreground'>
                    {index + 1}. {preview.label}
                </h2>
                <span className='inline-flex items-center px-3 py-1 text-label text-muted-foreground rounded-full border border-border bg-background'>ID: {preview.id}</span>
            </div>

            <div className='flex flex-col gap-3'>
                <h3 className='text-h5 font-semibold text-foreground'>HTML Preview</h3>
                <div className='relative overflow-hidden rounded-xl border border-border bg-background shadow-glow-sm'>
                    <iframe title={`${preview.label} HTML preview`} srcDoc={preview.html} loading='lazy' sandbox='allow-same-origin' className='block h-180 w-full border-0 bg-background' />
                </div>
            </div>

            <div className='flex flex-col gap-3'>
                <h3 className='text-h5 font-semibold text-foreground'>Text Fallback</h3>
                <pre className='overflow-x-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-small leading-relaxed text-foreground'>{preview.text}</pre>
            </div>
        </article>
    );
}

export default function TestMailsPage() {
    const previews = getMailPreviews();

    return (
        <main className='relative flex flex-col gap-6 p-6 md:p-10'>
            <header className='relative flex flex-col gap-2 p-6 rounded-2xl border border-border bg-card shadow-glow-sm'>
                <p className='text-label font-semibold tracking-[0.14em] uppercase text-violet-600 dark:text-violet-300'>Mail Testing Lab</p>
                <h1 className='text-h1 font-semibold text-foreground'>Email template previews with demo content</h1>
                <p className='text-body text-muted-foreground'>
                    Use this route to test every template one by one for spacing, hierarchy, readability, and responsive behavior before production sends.
                </p>

                <div className='flex flex-wrap items-center gap-2 pt-2'>
                    <span className='inline-flex items-center px-3 py-1 text-label text-muted-foreground rounded-full border border-border bg-background'>Templates: {previews.length}</span>
                    <span className='inline-flex items-center px-3 py-1 text-label text-violet-700 dark:text-violet-300 rounded-full border border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/40'>
                        Premium Lavender Redesign
                    </span>
                </div>
            </header>

            <section className='flex flex-col gap-6'>
                {previews.map((preview, index) => (
                    <MailPreviewCard key={preview.id} preview={preview} index={index} />
                ))}
            </section>
        </main>
    );
}
