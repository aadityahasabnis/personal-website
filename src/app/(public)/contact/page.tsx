import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, Clock, MessageSquare, ArrowUpRight } from 'lucide-react';

import { SITE_CONFIG, SOCIAL_LINKS } from '@/constants';
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
        <div className="min-h-screen">
            {/* Header Section */}
            <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-24 md:pt-32 pb-12 text-center">
                <p className="text-sm font-medium uppercase tracking-widest text-[var(--accent)] mb-4">
                    Contact
                </p>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-[var(--fg)]">
                    Get in Touch
                </h1>
                <p className="mt-6 text-lg text-[var(--fg-muted)] max-w-2xl mx-auto leading-relaxed">
                    Have a question, project idea, or just want to say hello?
                    I&apos;d love to hear from you. Fill out the form below or reach
                    out through any of my social channels.
                </p>
                <div className="mt-8 w-16 h-px bg-[var(--accent)] mx-auto" />
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-6 lg:px-8 pb-24">
                <div className="grid gap-12 lg:grid-cols-[1fr_320px]">
                    {/* Contact Form */}
                    <div className="order-2 lg:order-1">
                        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 sm:p-8">
                            <div className="mb-8">
                                <h2 className="text-xl font-medium text-[var(--fg)] flex items-center gap-2">
                                    <MessageSquare className="size-5 text-[var(--accent)]" />
                                    Send a Message
                                </h2>
                                <p className="mt-2 text-sm text-[var(--fg-muted)]">
                                    Fill out the form and I&apos;ll get back to you as soon as possible.
                                </p>
                            </div>
                            <ContactForm />
                        </div>
                    </div>

                    {/* Sidebar */}
                    <aside className="order-1 lg:order-2 space-y-6">
                        {/* Contact Info */}
                        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
                            <h3 className="text-sm font-medium uppercase tracking-widest text-[var(--fg-muted)] mb-6">
                                Contact Info
                            </h3>
                            <ul className="space-y-5">
                                {CONTACT_INFO.map((item) => (
                                    <li key={item.label} className="flex items-start gap-4">
                                        <div className="p-2 rounded-lg bg-[var(--surface)]">
                                            <item.icon className="size-4 text-[var(--accent)]" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-[var(--fg-muted)] mb-1">
                                                {item.label}
                                            </p>
                                            {item.href ? (
                                                <a
                                                    href={item.href}
                                                    className="text-sm text-[var(--fg)] hover:text-[var(--accent)] transition-colors"
                                                >
                                                    {item.value}
                                                </a>
                                            ) : (
                                                <p className="text-sm text-[var(--fg)]">
                                                    {item.value}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Social Links */}
                        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6">
                            <h3 className="text-sm font-medium uppercase tracking-widest text-[var(--fg-muted)] mb-6">
                                Connect Online
                            </h3>
                            <ul className="space-y-3">
                                {SOCIAL_LINKS.filter((l) => l.platform !== 'email').map(
                                    (link) => (
                                        <li key={link.platform}>
                                            <Link
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="group flex items-center justify-between text-sm text-[var(--fg)] hover:text-[var(--accent)] transition-colors capitalize"
                                            >
                                                <span className="flex items-center gap-3">
                                                    <span className="size-1.5 rounded-full bg-[var(--accent)]" />
                                                    {link.platform}
                                                </span>
                                                <ArrowUpRight className="size-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </Link>
                                        </li>
                                    )
                                )}
                            </ul>
                        </div>

                        {/* Availability */}
                        <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="size-2 rounded-full bg-[var(--success)] animate-pulse" />
                                <h3 className="font-medium text-[var(--fg)]">
                                    Currently Available
                                </h3>
                            </div>
                            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                                I&apos;m open to freelance projects, consulting work, and full-time
                                opportunities. Let&apos;s discuss how I can help with your project.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
