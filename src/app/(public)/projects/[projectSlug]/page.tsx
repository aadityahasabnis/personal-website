import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ProjectContent, ProjectHeader } from '@/components/content';
import { ContentComment } from '@/components/content/common/comment/ContentComment';
import { ContentLikes, ContentViews } from '@/components/content/common/stats';
import { FadeIn } from '@/components/motion/FadeIn';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { JsonLd, combineSchemas, generateBreadcrumbSchema, generatePersonSchema, generateProjectSchema, generateWebPageSchema, generateWebSiteSchema } from '@/lib/seo';
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
            eyebrow: 'Engineering',
            subtitle: description,
            tags: ['engineering', 'systems', 'web', 'products'],
        });
    const keywords = Array.from(
        new Set([...(project.tags ?? []), ...(project.techStack ?? []), 'web development', 'software engineering', 'system design', 'problem solving', SITE_CONFIG.author.name]),
    );
    const articleTags = Array.from(new Set([...(project.tags ?? []), ...(project.seo?.keywords ?? [])]));
    const publishedTime = project.publishedAt;
    const ogType = project.seo?.ogType ?? 'article';
    const articleMeta =
        ogType === 'article'
            ? {
                  'article:author': SITE_CONFIG.author.name,
                  'article:publisher': SITE_CONFIG.url,
                  'article:section': 'Project',
                  ...(articleTags.length > 0 ? { 'article:tag': articleTags } : {}),
                  ...(publishedTime ? { 'article:published_time': publishedTime } : {}),
                  ...(project.updatedAt ? { 'article:modified_time': project.updatedAt } : {}),
              }
            : {};

    return createPageMetadata({
        title,
        description,
        canonicalPath: project.seo?.canonicalUrl ?? `/projects/${projectSlug}`,
        keywords,
        includeAuthor: true,
        includeSocial: true,
        socialType: ogType,
        imageUrl: image,
        openGraph: {
            ...(publishedTime ? { publishedTime } : {}),
            modifiedTime: project.updatedAt,
            authors: [SITE_CONFIG.author.name],
            tags: articleTags,
        },
        robots: {
            index: !project.seo?.noIndex,
            follow: true,
            googleBot: {
                index: !project.seo?.noIndex,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        other: {
            ...articleMeta,
            ...(project.updatedAt ? { 'og:updated_time': project.updatedAt } : {}),
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
    const schema = combineSchemas(
        generatePersonSchema(),
        generateWebSiteSchema(),
        generateWebPageSchema({
            title: project.title,
            description: project.description,
            path: `/projects/${projectSlug}`,
        }),
        generateProjectSchema({
            slug: projectSlug,
            title: project.title,
            description: project.description,
            body: project.body,
            tags: project.tags,
            techStack: project.techStack,
            imageUrl: project.seo?.ogImage ?? project.coverImage,
            publishedAt: project.publishedAt,
            updatedAt: project.updatedAt,
            liveUrl: project.liveUrl,
            githubUrl: project.githubUrl,
        }),
        generateBreadcrumbSchema([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'Projects', url: `${SITE_CONFIG.url}/projects` },
            { name: project.title, url: `${SITE_CONFIG.url}/projects/${projectSlug}` },
        ]),
    );

    return (
        <>
            <JsonLd data={schema} />
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
        </>
    );
}
