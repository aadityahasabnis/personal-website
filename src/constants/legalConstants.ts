// =============================================================
// Legal Page Content Types
// =============================================================

export interface ILegalListItem {
    label: string;
    description?: string;
}

export interface ILegalSection {
    id: string;
    title: string;
    content: readonly string[];
    list?: {
        items: readonly ILegalListItem[];
    };
}

export interface ILegalPageContent {
    meta: {
        title: string;
        description: string;
        lastUpdated: string;
    };
    hero: {
        label: string;
        title: string;
        description: string;
    };
    summary?: readonly {
        point: string;
    }[];
    sections: readonly ILegalSection[];
}

// =============================================================
// Privacy Policy
// =============================================================

export const PRIVACY_PAGE_CONTENT: ILegalPageContent = {
    meta: {
        title: 'Privacy Policy',
        description:
            'How data is collected, used, and protected on aadityahasabnis.com — a developer portfolio and knowledge platform.',
        lastUpdated: 'April 2026',
    },

    hero: {
        label: 'Privacy',
        title: 'Privacy Policy',
        description:
            'This website is built with a privacy-first approach: minimal data collection, no intrusive tracking, and full transparency in how information is handled.',
    },

    summary: [
        { point: 'Minimal data collection focused only on functionality and communication.' },
        { point: 'Personal data is not sold or shared for advertising or marketing purposes.' },
        { point: 'Cookies and local storage are used for functionality, security, and experience continuity.' },
        { point: 'You can request access, deletion, or clarification for your data at any time.' },
    ],

    sections: [
        {
            id: 'introduction',
            title: 'Introduction',
            content: [
                'This website (aadityahasabnis.com) is a personal portfolio, writing platform, and knowledge system operated by Aaditya Hasabnis. It serves as a space for sharing technical articles, engineering blogs, project showcases, and structured learning content.',
                'This Privacy Policy describes how information is collected, used, and protected when you visit or interact with the website. The goal is clarity and minimalism — the site collects only what is necessary and handles it responsibly.',
            ],
        },
        {
            id: 'data-collected',
            title: 'Data Collected',
            content: [
                'This website follows a minimal-data approach: collect what is needed to run the platform, improve content quality, and protect admin access.',
            ],
            list: {
                items: [
                    {
                        label: 'Contact Form Submissions',
                        description:
                            'When you submit a message through the contact page, your name, email address, and message content are collected to respond to your inquiry.',
                    },
                    {
                        label: 'Usage & Device Signals',
                        description:
                            'Non-identifiable telemetry such as browser type, device class, referrer, and page-level interactions may be collected in aggregate to understand performance and content reach.',
                    },
                    {
                        label: 'Content Interaction Data',
                        description:
                            'Engagement signals such as page views, likes, comment upvotes, and related local interaction state are used to improve information architecture and editorial prioritization.',
                    },
                    {
                        label: 'Newsletter Subscription',
                        description:
                            'If you choose to subscribe, your email may be used to deliver updates. You can unsubscribe at any time.',
                    },
                ],
            },
        },
        {
            id: 'how-data-is-used',
            title: 'Use of Data',
            content: [
                'Collected data serves a narrow set of purposes — all focused on making the site better for you.',
            ],
            list: {
                items: [
                    {
                        label: 'Responding to inquiries',
                        description: 'Contact form data is used solely to reply to your messages.',
                    },
                    {
                        label: 'Improving content',
                        description:
                            'Analytics and interaction data help identify which content is valuable and where improvements are needed.',
                    },
                    {
                        label: 'Performance monitoring',
                        description:
                            'Usage data helps optimize load times, fix issues, and ensure the site works well across devices.',
                    },
                    {
                        label: 'Newsletter delivery',
                        description:
                            'If you subscribe, your email may be used to deliver relevant content updates.',
                    },
                ],
            },
        },
        {
            id: 'cookies-and-local-storage',
            title: 'Cookies & Local Storage',
            content: [
                'This website uses cookies and browser local storage for essential functionality, secure admin authentication, and visitor experience continuity.',
            ],
            list: {
                items: [
                    {
                        label: 'Theme & UI Preference Storage',
                        description:
                            'Theme and UI preferences are persisted so your browsing experience remains consistent across sessions.',
                    },
                    {
                        label: 'Engagement State in Local Storage',
                        description:
                            'Client-side storage may include user preferences, interaction states, and session-related data necessary for functionality and experience continuity.',
                    },
                    {
                        label: 'Functional Cookies',
                        description:
                            'Functional cookies may be used to preserve interface preferences and ensure consistent behavior across sessions.',
                    },
                    {
                        label: 'Authentication & Security Cookies',
                        description:
                            'Secure authentication and session cookies may be used for protected areas of the website.',
                    },
                    {
                        label: 'Analytics Storage',
                        description:
                            'Where analytics is enabled, only privacy-conscious aggregate measurement is used to understand content performance; no personal profile is sold or built for advertising.',
                    },
                ],
            },
        },
        {
            id: 'third-party-services',
            title: 'Third-Party Services',
            content: [
                'This website relies on a small number of third-party services to operate efficiently.',
            ],
            list: {
                items: [
                    {
                        label: 'Hosting & CDN',
                        description:
                            'The site is deployed on modern hosting infrastructure with CDN caching for fast global delivery.',
                    },
                    {
                        label: 'Analytics',
                        description:
                            'Privacy-focused analytics may be used to collect anonymized, aggregate usage data. No personal data is shared with analytics providers.',
                    },
                    {
                        label: 'Media Storage',
                        description:
                            'Images and assets may be served through managed storage/CDN services for reliability and performance optimization.',
                    },
                    {
                        label: 'Authentication Services',
                        description:
                            'Admin authentication may use secure credential or provider-based authentication systems with proper session handling.',
                    },
                ],
            },
        },
        {
            id: 'data-protection',
            title: 'Data Protection',
            content: [
                'Reasonable technical and organizational measures are in place to protect your data. This includes encrypted connections (HTTPS), secure database access, and minimal data collection by design.',
                'Personal data is not sold or shared with third parties for advertising or marketing purposes.',
                'However, no system is entirely immune to risk. While best efforts are made to secure data, absolute security cannot be guaranteed.',
                'Data collection is intentionally minimized by design, not just policy.',
                'No hidden tracking mechanisms or invasive profiling techniques are used.',
            ],
        },
        {
            id: 'data-retention',
            title: 'Data Retention',
            content: [
                'Personal data is retained only for as long as necessary to fulfill its intended purpose, such as responding to inquiries or maintaining communication.',
                'Data may be deleted periodically or upon user request.',
            ],
        },
        {
            id: 'your-rights',
            title: 'Your Rights',
            content: [
                'You have control over your data. The following rights are respected and can be exercised at any time.',
            ],
            list: {
                items: [
                    {
                        label: 'Access',
                        description:
                            'You can request a copy of any personal data held about you.',
                    },
                    {
                        label: 'Deletion',
                        description:
                            'You can request deletion of your personal data, including contact submissions and newsletter subscriptions.',
                    },
                    {
                        label: 'Opt-Out',
                        description:
                            'You can limit tracking through browser privacy settings or tools such as ad blockers.',
                    },
                    {
                        label: 'Cookie Control',
                        description:
                            'You can clear or disable cookies through your browser settings at any time.',
                    },
                ],
            },
        },
        {
            id: 'changes-to-policy',
            title: 'Policy Updates',
            content: [
                'This policy may be updated occasionally to reflect changes in the website, its features, or applicable legal requirements.',
                'When meaningful changes are made, the "Last Updated" date at the top of this page will be revised. Continued use of the website after changes constitutes acceptance of the updated policy.',
            ],
        },
        {
            id: 'contact',
            title: 'Contact',
            content: [
                'For privacy-related concerns, you can contact via the Contact page or email.',
            ],
        },
    ],
} as const;

// =============================================================
// Terms of Service (includes Cookies section)
// =============================================================

export const TERMS_PAGE_CONTENT: ILegalPageContent = {
    meta: {
        title: 'Terms of Service',
        description:
            'Terms governing the use of aadityahasabnis.com, including content usage, intellectual property, cookies, and responsibilities.',
        lastUpdated: 'April 2026',
    },

    hero: {
        label: 'Terms',
        title: 'Terms of Service',
        description:
            'These terms define how you may use this website and its content. They are written to be clear and fair — not to bury important details in legal jargon.',
    },

    summary: [
        { point: 'Use content with proper attribution and without abusive extraction at scale.' },
        { point: 'No warranty is provided for informational or technical material.' },
        { point: 'Misuse can lead to restricted access to the platform.' },
        { point: 'Cookies and storage usage details are described in the Privacy Policy.' },
    ],

    sections: [
        {
            id: 'acceptance-of-terms',
            title: 'Acceptance of Terms',
            content: [
                'By accessing or using aadityahasabnis.com, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you should discontinue use of the website.',
                'These terms apply to all visitors, readers, and users of the website.',
            ],
        },
        {
            id: 'use-of-content',
            title: 'Use of Content',
            content: [
                'All content published on this website — including articles, blog posts, project descriptions, code examples, images, and design elements — is the intellectual property of Aaditya Hasabnis unless explicitly stated otherwise.',
            ],
            list: {
                items: [
                    {
                        label: 'Permitted',
                        description:
                            'You may read, share, and reference content with proper attribution and a link back to the original source. Attribution must include visible credit and a source link.',
                    },
                    {
                        label: 'Restricted',
                        description:
                            'You may not copy, reproduce, republish, or redistribute content in bulk or for commercial purposes without prior written permission.',
                    },
                    {
                        label: 'Code Examples',
                        description:
                            'Code snippets shared in articles are provided for educational purposes. You may use them in your own projects with attribution, but they come without warranty.',
                    },
                ],
            },
        },
        {
            id: 'user-conduct',
            title: 'User Conduct',
            content: [
                'When using this website, you agree to engage respectfully and responsibly.',
            ],
            list: {
                items: [
                    {
                        label: 'No Misuse',
                        description:
                            'Do not attempt to disrupt the website, exploit vulnerabilities, or interfere with its functionality.',
                    },
                    {
                        label: 'Automated Access Restrictions',
                        description:
                            'You agree not to use automated systems to access the website in a manner that sends excessive requests, disrupts functionality, or extracts data at scale without permission.',
                    },
                    {
                        label: 'No Abuse',
                        description:
                            'Abusive, harmful, or spam submissions through forms or comments are prohibited.',
                    },
                ],
            },
        },
        {
            id: 'content-accuracy',
            title: 'Content Accuracy',
            content: [
                'Content on this website is provided for informational and educational purposes. While every effort is made to ensure accuracy, completeness, and relevance, no guarantees are made.',
                'Technical content — including code examples, architecture patterns, and engineering recommendations — reflects understanding at the time of writing and may become outdated as technologies evolve.',
                'Nothing on this website constitutes professional, legal, or financial advice.',
                'Always verify critical information independently before applying it to production systems.',
            ],
        },
        {
            id: 'cookies-and-tracking',
            title: 'Cookies & Tracking',
            content: [
                'This website uses cookies and local storage for functionality, personalization, and secure operations. For detailed information, please refer to the Privacy Policy.',
                'Client-side storage may include user preferences, interaction states, and session-related data necessary for functionality and experience continuity.',
            ],
        },
        {
            id: 'access-restriction',
            title: 'Access Restriction',
            content: [
                'This website owner reserves the right to restrict or block access in cases of misuse, abuse, security threats, or violations of these terms.',
            ],
        },
        {
            id: 'external-links',
            title: 'External Links',
            content: [
                'This website may contain links to external websites, tools, or resources. These links are provided for convenience and reference.',
                'This website owner is not responsible for the content, privacy practices, or availability of third-party websites. Visiting external links is at your own discretion.',
            ],
        },
        {
            id: 'limitation-of-liability',
            title: 'Limitation of Liability',
            content: [
                'This website is provided "as is" without warranties of any kind, either express or implied. The owner is not liable for any damages — direct, indirect, incidental, or consequential — arising from the use of this website or its content.',
                'This includes but is not limited to: errors in content, loss of data, interruption of service, or reliance on information provided.',
            ],
        },
        {
            id: 'modifications',
            title: 'Modifications',
            content: [
                'These terms may be updated at any time to reflect changes in the website or applicable regulations. The "Last Updated" date will be revised accordingly.',
                'Continued use of the website after changes are posted constitutes acceptance of the revised terms. It is recommended to review this page periodically.',
            ],
        },
        {
            id: 'governing-law',
            title: 'Governing Law',
            content: [
                'These terms are governed by and construed in accordance with the laws of India.',
                'Any disputes arising from the use of this website shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra, India.',
            ],
        },
        {
            id: 'contact',
            title: 'Contact',
            content: [
                'For any questions regarding these terms, you can reach out through the Contact page on this website or email directly at aaditya.hasabnis@gmail.com.',
            ],
        },
    ],
} as const;
