import { ABOUT_PAGE_CONTENT } from '@/constants/aboutConstants';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { JsonLd, combineSchemas, generateBreadcrumbSchema, generatePersonSchema, generateWebPageSchema, generateWebSiteSchema } from '@/lib/seo';
import { Clock, Mail, MapPin, MessageSquare } from 'lucide-react';
import type { Metadata } from 'next';

import { ContactForm } from '@/app/(public)/contact/ContactForm';
import PageHeader from '@/components/layout/PageHeader';
import FadeIn from '@/components/motion/FadeIn';

const description = `Connect with ${SITE_CONFIG.author.name} for thoughtful collaboration in web development, hiring, product engineering projects, software architecture, writing, and community-focused work.`;

const keywordSet = new Set<string>(['contact', SITE_CONFIG.author.name, 'web development', 'software engineering', 'collaboration', 'technical writing', 'system design', 'community building']);

const contactOgImage = buildDynamicOgImageUrl({
    title: 'Collaboration Rooted in Clear Engineering Thinking',
    eyebrow: 'Collaboration',
    subtitle: 'Start a focused conversation around product goals, practical tradeoffs, and delivery.',
    tags: ['collaboration', 'engineering', 'writing', 'community'],
});

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = createPageMetadata({
    title: 'Contact',
    description,
    canonicalPath: '/contact',
    keywords: Array.from(keywordSet),
    includeAuthor: true,
    includeSocial: true,
    socialType: 'website',
    imageUrl: contactOgImage,
    robots: {
        index: true,
        follow: true,
    },
});

const contactSchema = combineSchemas(
    generatePersonSchema(),
    generateWebSiteSchema(),
    generateWebPageSchema({
        title: 'Contact',
        description,
        path: '/contact',
    }),
    generateBreadcrumbSchema([
        { name: 'Home', url: SITE_CONFIG.url },
        { name: 'Contact', url: `${SITE_CONFIG.url}/contact` },
    ]),
);

// Contact info items
const CONTACT_INFO = [
    {
        icon: Mail,
        label: 'Email',
        value: SITE_CONFIG.email,
        href: `mailto:${SITE_CONFIG.email}`,
    },
    {
        icon: MapPin,
        label: 'Location',
        value: ABOUT_PAGE_CONTENT.identity.location,
        href: null,
    },
    {
        icon: Clock,
        label: 'Response Time',
        value: 'Usually within 24-48 hours',
        href: null,
    },
];

/**
 * Contact Page
 *
 * Professional contact page with:
 * - Contact form with server action
 * - Contact information
 * - Social links
 * - Availability info
 */
const ContactPage = () => {
    return (
        <>
            <JsonLd data={contactSchema} />

            <main className='relative mx-auto flex flex-col px-6 py-20 lg:px-8 md:py-24 max-w-5xl'>
                <PageHeader
                    title='Build Something Reliable Together'
                    label='Contact'
                    description='Open to collaboration, consulting, and product engineering opportunities. Share your context, timeline, and goals, and I will respond with a clear next step.'
                />

                <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]'>
                    <FadeIn direction='up' delay={0.05} duration={0.55} distance={18}>
                        <section className='relative flex flex-col gap-6 p-6 sm:p-8 rounded-xl border border-border bg-card shadow-none transition-slow hover:border-primary/25 hover:shadow-md'>
                            <div className='flex flex-col gap-2'>
                                <h2 className='flex items-center gap-2 text-h3 font-semibold text-foreground'>
                                    <MessageSquare className='size-5 text-primary' />
                                    Send a Message
                                </h2>
                                <p className='text-body text-muted-foreground'>Use the form for project inquiries, hiring conversations, or collaboration requests.</p>
                            </div>
                            <ContactForm />
                        </section>
                    </FadeIn>

                    <aside className='flex flex-col gap-5'>
                        <FadeIn direction='up' delay={0.1} duration={0.55} distance={18}>
                            <section className='relative flex flex-col gap-5 p-6 rounded-xl border border-border bg-card shadow-none transition-slow hover:border-primary/25 hover:shadow-md'>
                                <h2 className='text-h6 font-semibold text-foreground'>Contact Info</h2>
                                <ul className='flex flex-col gap-4'>
                                    {CONTACT_INFO.map((item) => (
                                        <li key={item.label} className='flex items-start gap-3'>
                                            <span className='flex size-9 items-center justify-center rounded-lg border border-border bg-background'>
                                                <item.icon className='size-4 text-primary' />
                                            </span>
                                            <div className='flex flex-col gap-1'>
                                                <p className='text-small font-medium uppercase tracking-wide text-muted-foreground'>{item.label}</p>
                                                {item.href ? (
                                                    <a href={item.href} className='text-body text-foreground transition-fast hover:text-primary'>
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <p className='text-body text-foreground'>{item.value}</p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        </FadeIn>

                        <FadeIn direction='up' delay={0.2} duration={0.55} distance={18}>
                            <section className='relative flex flex-col gap-3 p-6 rounded-xl border border-primary/30 bg-primary/5'>
                                <div className='flex items-center gap-2'>
                                    <span className='size-2 rounded-full bg-success animate-pulse' />
                                    <h2 className='text-h6 font-semibold text-foreground'>Currently Available</h2>
                                </div>
                                <p className='text-body leading-relaxed text-muted-foreground'>Available for freelance projects, technical consulting, and full-time product engineering roles.</p>
                            </section>
                        </FadeIn>
                    </aside>
                </div>
            </main>
        </>
    );
};

export default ContactPage;
