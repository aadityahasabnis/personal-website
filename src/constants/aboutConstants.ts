export interface IAboutListItem {
    title: string;
    description: string;
}

export interface IAboutSkillRow {
    title: string;
    items: readonly string[];
    baseVelocity: number;
    direction?: 1 | -1;
}

export interface IAboutExperienceItem {
    title: string;
    period: string;
    company: string;
    description: readonly string[];
    current?: boolean;
}

export const ABOUT_PAGE_CONTENT = {
    identity: {
        label: 'About',
        title: 'Software Engineer · Product & Systems Builder',
        tagline: 'Building scalable products across frontend, backend, and infrastructure',
        summary:
            'I design and build end-to-end systems — from UI architecture to backend services and cloud infrastructure. I focus on creating fast, scalable, and maintainable software that solves real engineering problems.',
        location: 'Pune, Kothrud',

        cardRole: 'Engineer and Writer',
        cardUsername: 'creative_northstar',
        cardImage: 'https://cdn.aadityahasabnis.workers.dev/cdn/images/gallery/aadizz-emoji.png-MW',
        cardTagline: 'Building clarity at scale.',

        ctas: {
            primary: { label: 'Discuss a Project', href: '/contact' },
            secondary: { label: 'Architecture Notes', href: '/articles' },
            tertiary: { label: 'View Projects', href: '/projects' },
        },
    },

    skills: {
        title: 'Skills & Technologies',
        rows: [
            {
                title: 'Languages & Frameworks',
                items: ['TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'Python'],
                baseVelocity: 4,
            },
            {
                title: 'Databases & Tools',
                items: ['MongoDB', 'PostgreSQL', 'Redis', 'Docker', 'Git'],
                baseVelocity: 3,
                direction: -1,
            },
            {
                title: 'Design & UI',
                items: ['Tailwind CSS', 'Framer Motion', 'Figma', 'CSS-in-JS'],
                baseVelocity: 2.5,
            },
        ] satisfies readonly IAboutSkillRow[],
    },

    principles: {
        title: 'What I Believe',
        items: [
            {
                title: 'Clarity Over Cleverness',
                description: 'I write code that humans can read. The best code is not the cleverest, but the clearest.',
            },
            {
                title: 'Learn in Public',
                description: 'I share what I learn through writing. Teaching is the best way to solidify understanding.',
            },
            {
                title: 'Ship Early, Iterate Often',
                description: 'Perfect is the enemy of good. I believe in getting feedback early and improving continuously.',
            },
        ] satisfies readonly IAboutListItem[],
    },

    experience: {
        title: 'Experience',
        items: [
            {
                title: 'SDE Intern',
                period: 'July 2025 - Jan 2026',
                company: 'BytesWrite Solution Pvt. Ltd.',
                description: [
                    'Designed and implemented recruitment workflows with role-based access control (RBAC), and built scalable REST APIs for end-to-end job lifecycle management.',
                    'Engineered SSR-based data fetching pipelines for improved performance and reliability, and developed an internal ERP workflow system with approval pipelines, task tracking, and centralized API logging to improve observability and maintainability.',
                    'Built backend-driven prediction workflows using Server Actions and REST APIs for a college recommendation platform, while contributing actively to Agile delivery and code reviews.',
                ],
                current: false,
            },
            {
                title: 'Software Development Intern',
                period: 'July 2024 - May 2025',
                company: 'Two Register Pvt Ltd.',
                description: [
                    'Contributed to an enterprise-grade inventory and materials management system (UMMS) by delivering backend features and designing scalable REST APIs.',
                    'Optimized PostgreSQL schemas and queries with Express.js and Prisma ORM to improve production performance, reliability, and data consistency.',
                ],
                current: false,
            },
        ] satisfies readonly IAboutExperienceItem[],
    },

    collaboration: {
        title: 'Open for collaboration',
        subtitle: 'Focused on high-impact engineering partnerships across product, platform, and infrastructure.',

        available: [
            {
                title: 'Full-Stack Product Engineering',
                description:
                    'Building end-to-end applications across frontend, backend, and infrastructure, focusing on scalable, production-ready systems using Next.js, Node.js, and cloud services.',
            },
            {
                title: 'Frontend Architecture and UI Systems',
                description:
                    'Designing scalable UI architectures, component systems, and performance-optimized web applications with modern React and Next.js ecosystems.',
            },
            {
                title: 'Backend and API Engineering',
                description:
                    'Developing REST APIs, backend services, authentication systems, and data-driven architectures with Node.js, Express, and strong database design across PostgreSQL and MongoDB.',
            },
            {
                title: 'DevOps and Cloud Infrastructure',
                description:
                    'Working with Cloudflare Workers, AWS, CI/CD pipelines, and edge deployments to build fast, reliable, and scalable systems.',
            },
        ],
    },
} as const;