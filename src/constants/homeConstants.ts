// ============================================================
// Home Page Sections
// ============================================================

export const HERO_SECTION = {
    badge: 'Developer & Writer',
    greeting: "Hi, I'm",
    subtitle: 'I build exceptional digital experiences and write about software development, technology, and everything in between.',
    primaryCta: {
        label: 'Read Articles',
        href: '/articles',
    },
    secondaryCta: {
        label: 'About Me',
        href: '/about',
    },
    stats: [
        { value: '5+', label: 'Years' },
        { value: '20+', label: 'Projects' },
        { value: '10k+', label: 'Lines' },
    ],
    particleCount: 1500,
} as const;

export const ABOUT_PREVIEW_SECTION = {
    label: 'About Me',
    title: 'Crafting Digital Experiences with Passion',
    paragraphs: [
        "I'm a full-stack developer with a passion for creating beautiful, functional, and user-centric digital experiences. With over 5 years of experience in the industry, I've had the privilege of working on diverse projects ranging from startups to enterprise applications.",
        "Beyond coding, I enjoy writing about technology, sharing knowledge through articles, and contributing to open-source projects. I believe in continuous learning and staying updated with the latest trends in web development.",
    ],
    skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind'],
    cta: {
        label: 'More About Me',
        href: '/about',
    },
} as const;

export const NEWSLETTER_SECTION = {
    label: 'Newsletter',
    title: 'Stay Updated with Newsletter',
    description: 'Subscribe to receive the latest articles, tutorials, blogs and updates straight to your inbox. No spam, unsubscribe anytime.',
    inlineDescription: 'Get new articles in your inbox.',
    emailPlaceholder: 'Type your email...',
    emailLabel: 'Email Address',
    submitLabel: 'Subscribe',
    inlineSubmitLabel: 'Join',
    subscribedLabel: 'Subscribed!',
    inlineSubscribedLabel: 'Joined',
    feedbackResetTimeoutMs: 5000,
    feedback: {
        emptyEmail: 'Please enter a valid email address.',
        alreadySubscribed: 'You are already subscribed with this email.',
        successFallback: 'Thanks for subscribing!',
        errorFallback: 'Something went wrong. Please try again.',
    },
    loadingMessage: 'Subscribing...',
    successMessage: 'Welcome aboard!',
} as const;

// ============================================================
// Three.js Visual Defaults
// ============================================================

export const THREE_VISUAL_CONFIG = {
    particle: {
        defaultCount: 5000,
        themeColors: {
            light: '#7c3aed',
            dark: '#a78bfa',
        },
        spread: 8,
        pointSize: 0.018,
        pointOpacity: 0.7,
        rotationXSpeed: 0.01,
        rotationYSpeed: 0.05,
        floatSpeed: 0.2,
        floatAmplitude: 0.1,
        camera: {
            position: [3, 1, 2] as const,
            fov: 65,
        },
    },
    sphere: {
        themeColors: {
            start: {
                light: '#8b5cf6',
                dark: '#a78bfa',
            },
            end: {
                light: '#ec4899',
                dark: '#c084fc',
            },
        },
        distort: 0.4,
        speed: 2,
        scale: 1.5,
        rotationXFactor: 0.1,
        rotationYFactor: 0.15,
        floatSpeed: 0.5,
        floatAmplitude: 0.1,
        camera: {
            position: [0, 0, 5] as const,
            fov: 45,
        },
        lights: {
            ambientIntensity: 0.5,
            directionalPosition: [10, 10, 5] as const,
            directionalIntensity: 1,
            pointPosition: [-10, -10, -10] as const,
            pointIntensity: 0.5,
        },
    },
} as const;
