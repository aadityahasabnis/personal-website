import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ProjectContent, ProjectHeader } from '@/components/content';
import { ContentComment } from '@/components/content/common/comment/ContentComment';
import { ContentLikes, ContentViews } from '@/components/content/common/stats';
import { FadeIn } from '@/components/motion/FadeIn';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { getPublishedProjectByPath, getPublishedProjectStaticPaths, type IPublicProjectDetail } from '@/server/new/public/content/project';

interface IProjectDetailPageProps {
    params: Promise<{ projectSlug: string }>;
}

export const revalidate = 3600;

export const generateStaticParams = async (): Promise<Array<{ projectSlug: string }>> => {
    const pathsResult = await getPublishedProjectStaticPaths();
    if (!pathsResult.success) return [];

    return pathsResult.data.map((item) => ({ projectSlug: item.projectSlug }));
};

export const generateMetadata = async ({ params }: IProjectDetailPageProps): Promise<Metadata> => {
    const { projectSlug } = await params;
    const projectResult = await getPublishedProjectByPath(projectSlug);

    if (!projectResult.success || !projectResult.data) {
        return { title: 'Project Not Found' };
    }

    const project = projectResult.data;
    const title = project.seo?.title ?? project.title;
    const description = project.seo?.description ?? project.description;
    const image =
        project.seo?.ogImage ??
        project.coverImage ??
        buildDynamicOgImageUrl({
            title,
            eyebrow: 'Project',
            subtitle: description,
            tags: [...(project.tags ?? []), ...(project.techStack ?? [])].slice(0, 4),
        });
    const keywords = Array.from(new Set([...(project.tags ?? []), ...(project.techStack ?? []), SITE_CONFIG.author.name, 'project', 'portfolio']));
    const publishedTime = project.publishedAt;

    return createPageMetadata({
        title,
        description,
        canonicalPath: `/projects/${projectSlug}`,
        keywords,
        includeAuthor: true,
        includeSocial: true,
        socialType: 'article',
        imageUrl: image,
        openGraph: {
            ...(publishedTime ? { publishedTime } : {}),
            modifiedTime: project.updatedAt,
            authors: [SITE_CONFIG.author.name],
            tags: keywords,
        },
        robots: {
            index: true,
            follow: true,
        },
    });
};

export default async function ProjectDetailPage({ params }: IProjectDetailPageProps) {
    const { projectSlug } = await params;
    const projectResult = await getPublishedProjectByPath(projectSlug);

    if (!projectResult.success || !projectResult.data) {
        notFound();
    }

    const project: IPublicProjectDetail = projectResult.data;
    const content = project.html ?? project.body ?? '';

    return (
        <main className='mx-auto px-4 py-16 max-w-5xl sm:px-6 lg:px-8 md:py-20'>
            <article>
                <ProjectHeader
                    project={project}
                    breadcrumbs={[
                        { label: 'Projects', href: '/projects' },
                        { label: project.title, href: `/projects/${projectSlug}` },
                    ]}
                />

                {content ? (
                    <FadeIn direction='up' distance={20} duration={0.5} delay={0.2} trigger='always'>
                        <ProjectContent content={content} />
                    </FadeIn>
                ) : (
                    <p className='text-body text-muted-foreground'>This project write-up is being prepared.</p>
                )}

                <FadeIn direction='up' distance={12} duration={0.4} delay={0.3} trigger='always'>
                    <section className='flex items-center gap-3 mt-8' aria-label='Project engagement stats'>
                        <ContentViews contentType='projects' contentId={project.id} />
                        <ContentLikes contentType='projects' contentId={project.id} />
                    </section>
                </FadeIn>

                <FadeIn direction='up' distance={16} duration={0.45} delay={0.35} trigger='always'>
                    <ContentComment contentType='projects' contentId={project.id} className='mt-12' />
                </FadeIn>
            </article>
        </main>
    );
}
