export interface IResumeProfile {
    name: string;
    role: string;
    email: string;
    location: string;
    summary: string;
    avatarSrc: string;
    resumePdfUrl: string;
}

export interface IResumeLink {
    label: string;
    href: string;
}

export interface IResumeEducationItem {
    title: string;
    institution: string;
    institutionUrl?: string;
    timeline?: string;
    resultLabel: 'CGPA' | 'Grade';
    resultValue: string;
}

export interface IResumeSkills {
    languages: readonly string[];
    frameworksAndBackend: readonly string[];
    databasesAndCloud: readonly string[];
}

export interface IResumeExperienceItem {
    role: string;
    company: string;
    companyUrl?: string;
    duration: string;
    bullets: readonly string[];
}

export interface IResumeProjectItem {
    title: string;
    descriptor: string;
    stack: string;
    githubUrl?: string;
    liveUrls?: readonly IResumeLink[];
    bullets: readonly string[];
}

export interface IResumeData {
    profile: IResumeProfile;
    profiles: readonly IResumeLink[];
    education: readonly IResumeEducationItem[];
    skills: IResumeSkills;
    experience: readonly IResumeExperienceItem[];
    projects: readonly IResumeProjectItem[];
    activities: readonly IResumeExperienceItem[];
    languages: string;
    certifications: readonly string[];
}

export const RESUME_DATA: IResumeData = {
    profile: {
        name: 'Aaditya Hasabnis',
        role: 'Full Stack Software Engineer',
        email: 'aaditya.hasabnis@gmail.com',
        location: 'Pune, India',
        summary: 'Building scalable, secure, and maintainable web applications using modern technologies and frameworks.',
        avatarSrc: 'https://cdn.aadityahasabnis.workers.dev/cdn/images/gallery/aaditya-hasabnisidentity-photo.jpg-cK',
        resumePdfUrl: 'https://cdn.aadityahasabnis.workers.dev/cdn/files/documents/aaditya-hasabnis-latest-resume.pdf-6a',
    },
    profiles: [
        { label: 'LinkedIn', href: 'https://linkedin.com/in/aaditya-hasabnis' },
        { label: 'GitHub', href: 'https://github.com/aadityahasabnis' },
    ],
    education: [
        {
            title: 'Bachelor of Technology: Computer Engineering',
            institution: 'Vishwakarma Institute of Information Technology, Pune.',
            institutionUrl: 'https://www.linkedin.com/school/viitpune/posts/',
            timeline: '2022 - 2026',
            resultLabel: 'CGPA',
            resultValue: '8.45',
        },
        {
            title: 'Higher Secondary Certificate',
            institution: 'Vidyamandir High School & Jr. College, Ishwarpur.',
            timeline: '2020 - 2022',
            resultLabel: 'Grade',
            resultValue: '91.50%',
        },
        {
            title: 'Secondary School Certificate',
            institution: 'Shri Parvati Khemchand Vidyamandir, Takari',
            timeline: '2014 - 2020',
            resultLabel: 'Grade',
            resultValue: '99.40%',
        },
    ],
    skills: {
        languages: ['TypeScript', 'JavaScript', 'Java', 'Python'],
        frameworksAndBackend: ['React', 'Next.js', 'Node.js', 'Express.js', 'Tailwind CSS', 'REST APIs', 'Authentication'],
        databasesAndCloud: ['PostgreSQL', 'MongoDB', 'Redis', 'Cloudflare Workers (R2, KV)', 'AWS (EC2, S3)', 'Docker', 'Git', 'CI/CD'],
    },
    experience: [
        {
            role: 'SDE Intern',
            company: 'BytesWrite Solution Pvt. Ltd. (6 months)',
            companyUrl: 'https://www.linkedin.com/company/byteswrite',
            duration: 'July 2025 - Jan 2026',
            bullets: [
                'Designed and implemented recruitment workflows and RBAC; built REST APIs for end-to-end job lifecycle management with optimized SSR-based data fetching for improved performance.',
                'Engineered an internal ERP and workflow system with approval pipelines, task tracking, and centralized API logging; improved reliability through query optimization.',
                'Developed backend-driven prediction workflows using Server Actions and REST APIs for a college recommendation platform, enabling ranking and filtering; contributed to Agile development cycles and code reviews.',
            ],
        },
        {
            role: 'Software Development Intern',
            company: 'Two Register Pvt Ltd.',
            companyUrl: 'https://www.linkedin.com/company/tworegisters/',
            duration: 'July 2024 - May 2025',
            bullets: [
                'Contributed to an enterprise-grade inventory and materials management system (UMMS) by developing backend features, designing REST APIs, and optimizing PostgreSQL schemas using Express.js and Prisma ORM to improve performance and reliability.',
            ],
        },
        {
            role: 'Secretary CSI VIIT (Computer Society of India)',
            company: 'VIIT Chapter, Pune, MH',
            companyUrl: 'https://www.linkedin.com/company/csi-viit/',
            duration: 'Sept 2023 - March 2025',
            bullets: [
                'Orchestrated 5 technical events for a 500+ member community and mentored 40 volunteers, ensuring seamless execution.',
            ],
        },
    ],
    projects: [
        {
            title: 'Authorly',
            descriptor: 'High-Performance React Rich Text Editor (400+ downloads on npm)',
            stack: 'React.js • TypeScript • NPM • HTML5 • Cloudinary • AWS S3',
            githubUrl: 'https://github.com/aadityahasabnis/authorly',
            liveUrls: [{ label: 'Live', href: 'https://authorly.vercel.app' }],
            bullets: [
                'Built a lightweight, extensible rich text editor for blogs and documentation, serving as a structured alternative to markdown with semantic content blocks and clean HTML output.',
                'Published as a production-ready npm package (400+ downloads) with modular builds, custom shortcuts, and integrated media upload support.',
                'Designed modular architecture with reusable components and extensibility for custom block types and integrations.',
            ],
        },
        {
            title: 'Personal Website (aadityahasabnis.com)',
            descriptor: 'Static-first portfolio and CMS',
            stack: 'Next.js • TypeScript • Server Actions • Tailwind • System Design',
            githubUrl: 'https://github.com/aadityahasabnis/personal-website',
            liveUrls: [{ label: 'Live', href: 'https://aadityahasabnis.com' }],
            bullets: [
                'Developed a full-stack content platform with an in-house CMS and admin dashboard, supporting articles, blogs, and project content without external dependencies.',
                'Architected structured content models (hierarchical topics, typed schemas) and implemented SSR/ISR-based rendering with optimized data fetching and caching for scalable delivery.',
            ],
        },        
        {
            title: 'Media Service API (Cloudflare Edge CDN Backend)',
            descriptor: 'Edge media infrastructure',
            stack: 'TypeScript • Cloudflare Workers • R2 • D1 • KV • Hono • REST APIs • CI/CD',
            githubUrl: 'https://github.com/aadityahasabnis/cdn',
            liveUrls: [{ label: 'Live', href: 'https://cdn.aadityahasabnis.workers.dev/' }],
            bullets: [
                'Built a production-grade media hosting and CDN backend using Cloudflare Workers, enabling secure upload, storage, and global delivery; implemented caching and invalidation to reduce latency.',
                'Designed a scalable edge architecture (R2, D1, KV) and built authenticated APIs with rate limiting and CI/CD for reliable, low-latency performance.',
            ],
        },
        {
            title: 'Trendify',
            descriptor: 'Full Stack AI-Powered E-commerce Platform',
            stack: 'React.js • Node.js • Express.js • MongoDB • REST API • JWT • Tailwind CSS • LLaMA 3.1 • Docker',
            githubUrl: 'https://github.com/aadityahasabnis/Trendify-Full-Stack',
            liveUrls: [
                { label: 'Live', href: 'https://trendify-smoky.vercel.app/' },
                { label: 'API', href: 'https://trendify-backend-eight.vercel.app/' },
            ],
            bullets: [
                'Built and launched a secure MERN stack e-commerce platform with JWT authentication, role-based access, and optimized backend APIs, enabling 500+ daily transactions and reducing response time by ~35%.',
                'Embedded an on-device AI assistant using Ollama (LLaMA 3.1) to deliver personalized product support and recommendations, boosting user engagement and reducing drop-offs by 30%.',
            ],
        },
        // {
        //     title: 'Launchboard',
        //     descriptor: 'Modern startup idea submission and discovery platform',
        //     stack: 'Next.js 15 • React.js • TypeScript • Sanity • Tailwind CSS • ShadCN UI • GitHub Auth • PPR',
        //     bullets: [
        //         'Developed a secure startup pitch exploration platform using GitHub authentication and Sanity Headless CMS, earning recognition as the most innovative intern project by senior engineering leadership.',
        //         'Leveraged Next.js 15 Partial Prerendering, improving crawlability and reducing load time by ~40%.',
        //     ],
        // },
        // {
        //     title: 'ML Based Detection Of Fruit and Their Freshness',
        //     descriptor: 'Computer vision quality assessment system',
        //     stack: 'Deep Learning • Computer Vision • TensorFlow • Python',
        //     bullets: [
        //         'Developed and deployed a CNN-based system to classify fruit types and predict freshness on a 0-10 scale.',
        //         'Achieved 95% accuracy on real-world agricultural datasets with enhanced performance through data augmentation.',
        //         'Delivered results through a Flask web app, enabling real-time insights for end users.',
        //     ],
        // },
        // {
        //     title: 'Lunar Rover Project',
        //     descriptor: 'IoT sensor fusion prototype',
        //     stack: 'Arduino UNO • IoT Sensor Fusion • Embedded Systems',
        //     bullets: [
        //         'Engineered a sensor-integrated prototype inspired by the Pragyan Rover using Arduino UNO and 6+ IoT modules.',
        //         'Programmed an IoT framework for real-time fusion and environmental monitoring, improving prototype data fidelity.',
        //     ],
        // },
        {
            title: 'Additional Projects',
            descriptor: 'Cross-domain product builds',
            stack: 'Expense Splitting App • Learning Platform • TensorFlow • Computer Vision • Arduino • IoT',
            bullets: [
                'Developed a CNN-based fruit freshness detection system achieving 95% accuracy using TensorFlow.',
                'Engineered an IoT-based rover prototype with real-time sensor fusion using Arduino.',
            ],
        }
    ],
    activities: [
        {
            role: 'Event Manager',
            company: 'Competitive Examination Cell, VIIT - Pune, Maharashtra, India',
            companyUrl: 'https://www.linkedin.com/company/competitive-examination-cell-viit',
            duration: 'Aug 2023 - Aug 2024',
            bullets: [
                'Planned and executed exam-focused workshops, mentorship sessions, and preparation drives to improve student participation and readiness.',
                'Coordinated cross-functional volunteers, schedules, and on-ground logistics to deliver events smoothly and on time.',
            ],
        },
        {
            role: 'Volunteer',
            company: 'Competitive Examination Cell, VIIT - Pune, Maharashtra, India',
            companyUrl: 'https://www.linkedin.com/company/competitive-examination-cell-viit',
            duration: 'Nov 2022 - Jul 2023',
            bullets: [
                'Supported end-to-end event operations including registrations, attendee support, and communication workflows for competitive exam initiatives.',
                'Assisted in outreach and session coordination to improve awareness and engagement across the student community.',
            ],
        },
        {
            role: 'Secretary',
            company: 'Computer Society of India - VIIT Chapter, Pune, MH',
            companyUrl: 'https://www.linkedin.com/company/csi-viit/',
            duration: 'Sep 2023 - March 2025',
            bullets: [
                'Orchestrated the execution of 5 technical events for a 500+ member community as Secretary of CSI VIIT.',
                'Mentored 40 volunteers while streamlining event operations and logistics for efficient on-ground coordination.',
            ],
        },
    ],
    languages: 'Marathi (Native), English (Professional Proficiency), Hindi (Conversational)',
    certifications: [
        'The Complete Full-Stack Web Development Bootcamp by Dr. Angela Yu (Udemy)',
        'The Data Science Course: Complete Data Science Bootcamp 2024 by 365 Careers (Udemy)',
        'AWS Academy Cloud Foundations (AWS T&C)',
        'IBM Data Science (Coursera)',
    ],
};
