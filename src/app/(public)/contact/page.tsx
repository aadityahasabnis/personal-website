import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, Clock, MessageSquare } from 'lucide-react';

import { SITE_CONFIG, SOCIAL_LINKS } from '@/constants';
import { Card } from '@/components/ui/card';
import { ContactForm } from '@/components/sections/ContactForm';

export const metadata: Metadata = {
    title: 'Contact',
    description: `Get in touch with ${SITE_CONFIG.author.name}. I am open to collaboration, job opportunities, and general inquiries.`,
    openGraph: {
        title: `Contact | ${SITE_CONFIG.name}`,
        description: `Get in touch with ${SITE_CONFIG.author.name}. I am open to collaboration, job opportunities, and general inquiries.`,
    },
};

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
        value: 'San Francisco, CA',
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
        <div className="container-narrow py-12">
            {/* Page Header */}
            <header className="mb-12 text-center">
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                    Get in Touch
                </h1>
                <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
                    Have a question, project idea, or just want to say hello?
                    I would love to hear from you. Fill out the form below or reach
                    out through any of my social channels.
                </p>
            </header>

            <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
                {/* Contact Form */}
                <div>
                    <Card className="p-6 sm:p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                Send a Message
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Fill out the form and I will get back to you as soon as
                                possible.
                            </p>
                        </div>
                        <ContactForm />
                    </Card>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                    {/* Contact Info */}
                    <Card className="p-6">
                        <h3 className="mb-4 font-semibold">Contact Information</h3>
                        <ul className="space-y-4">
                            {CONTACT_INFO.map((item) => (
                                <li key={item.label} className="flex items-start gap-3">
                                    <item.icon className="mt-0.5 h-5 w-5 text-primary shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">{item.label}</p>
                                        {item.href ? (
                                            <a
                                                href={item.href}
                                                className="text-sm text-muted-foreground hover:text-primary transition-colors"
                                            >
                                                {item.value}
                                            </a>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {item.value}
                                            </p>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card>

                    {/* Social Links */}
                    <Card className="p-6">
                        <h3 className="mb-4 font-semibold">Connect Online</h3>
                        <ul className="space-y-3">
                            {SOCIAL_LINKS.filter((l) => l.platform !== 'email').map(
                                (link) => (
                                    <li key={link.platform}>
                                        <Link
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors capitalize"
                                        >
                                            <span className="h-2 w-2 rounded-full bg-primary/60" />
                                            {link.platform}
                                        </Link>
                                    </li>
                                )
                            )}
                        </ul>
                    </Card>

                    {/* Availability */}
                    <Card className="p-6 bg-primary/5 border-primary/20">
                        <h3 className="mb-2 font-semibold text-primary">
                            Currently Available
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            I am open to freelance projects, consulting work, and full-time
                            opportunities. Let us discuss how I can help with your project.
                        </p>
                    </Card>
                </aside>
            </div>
        </div>
    );
};

export default ContactPage;
