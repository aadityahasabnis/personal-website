import { ArrowUpRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import { ProjectCard } from '@/components/content/project/ProjectCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { FadeIn } from '@/components/motion/FadeIn';
import { SITE_CONFIG, SOCIAL_LINKS } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { JsonLd, combineSchemas, generateBreadcrumbSchema, generatePersonSchema, generateWebPageSchema, generateWebSiteSchema } from '@/lib/seo';
import { getPublishedProjects, type IPublicProjectListItem } from '@/server/new/public/content/project';

const description = `Selected projects by ${SITE_CONFIG.author.name} that reflect practical engineering judgment, system thinking, and product-focused execution.`;
const projectsOgImage = buildDynamicOgImageUrl({
    title: 'Building Practical Software with Structured Thinking',
    eyebrow: 'Engineering',
    subtitle: 'A portfolio of real implementations shaped by clarity, tradeoffs, and maintainability.',
    tags: ['engineering', 'systems', 'web', 'products'],
});

export const metadata: Metadata = createPageMetadata({
    title: 'Projects',
    description,
    canonicalPath: '/projects',
    keywords: ['web development', 'projects', 'open source', 'side projects', 'software engineering', 'system design', 'problem solving', 'technical writing', SITE_CONFIG.author.name],
    includeSocial: true,
    socialType: 'website',
    imageUrl: projectsOgImage,
    robots: {
        index: true,
        follow: true,
    },
});

// ISR: Revalidate every hour
export const revalidate = 3600;

export default async function ProjectsPage() {
    const projectsResult = await getPublishedProjects({
        pagination: {
            offset: 0,
            limit: 24,
        },
    });

    const projects: IPublicProjectListItem[] = projectsResult.success ? projectsResult.data : [];
    const featuredProjects = projects.filter((project) => project.featured);
    const otherProjects = projects.filter((project) => !project.featured);
    const githubUrl = SOCIAL_LINKS.find((link) => link.id === 'github')?.url ?? SITE_CONFIG.url;
    const schema = combineSchemas(
        generatePersonSchema(),
        generateWebSiteSchema(),
        generateWebPageSchema({
            title: 'Projects',
            description,
            path: '/projects',
        }),
        generateBreadcrumbSchema([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'Projects', url: `${SITE_CONFIG.url}/projects` },
        ]),
    );

    return (
        <>
            <JsonLd data={schema} />
            <main className='mx-auto px-6 lg:px-8 py-20 md:py-24 max-w-5xl'>
                <PageHeader label='Work' title='Projects' description='Open source contributions, side projects, and experiments in web development.' />

                {projects.length === 0 ? (
                    <p className='text-body text-muted-foreground'>No projects published yet.</p>
                ) : (
                    <div className='flex flex-col gap-8'>
                        {featuredProjects.length > 0 && (
                            <FadeIn direction='up' distance={20} duration={0.5} delay={0.32}>
                                <section>
                                    <ul className='grid gap-6'>
                                        {featuredProjects.map((project) => (
                                            <li key={project.id}>
                                                <ProjectCard project={project} variant='featured' />
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </FadeIn>
                        )}

                        {otherProjects.length > 0 && (
                            <FadeIn direction='up' distance={20} duration={0.5} delay={0.42}>
                                <section>
                                    <ul className='grid gap-6 md:grid-cols-2'>
                                        {otherProjects.map((project) => (
                                            <li key={project.id}>
                                                <ProjectCard project={project} />
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </FadeIn>
                        )}
                    </div>
                )}

                <div className='mt-16'>
                    <Link
                        href={githubUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-2 px-5 py-2.5 text-label font-medium text-foreground bg-card border border-border rounded-lg transition-base hover:text-primary hover:border-primary/40'
                    >
                        <ArrowUpRight className='size-4' aria-hidden='true' />
                        <span>View More on GitHub</span>
                    </Link>
                </div>
            </main>
        </>
    );
}
