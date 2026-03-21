import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ArticleContent } from '@/components/content/ArticleContent';
import { SITE_CONFIG } from '@/constants/siteConstants';
import {
    getPublishedProjectByPath,
    getPublishedProjectStaticPaths,
} from '@/server/new/public/content/project';

interface IProjectDetailPageProps {
    params: Promise<{ projectSlug: string }>;
}

export const revalidate = 3600;

export const generateStaticParams = async () => {
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
    const image = project.seo?.ogImage ?? project.coverImage ?? `${SITE_CONFIG.url}${SITE_CONFIG.seo.ogImage}`;
    const canonical = `${SITE_CONFIG.url}/projects/${projectSlug}`;

    return {
        title,
        description,
        alternates: {
            canonical,
        },
        openGraph: {
            title,
            description,
            url: canonical,
            siteName: SITE_CONFIG.name,
            locale: 'en_US',
            type: 'article',
            images: [{ url: image, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            creator: SITE_CONFIG.seo.twitterHandle,
            site: SITE_CONFIG.seo.twitterHandle,
            images: [image],
        },
        robots: {
            index: true,
            follow: true,
        },
    };
};

export default async function ProjectDetailPage({ params }: IProjectDetailPageProps) {
    const { projectSlug } = await params;
    const projectResult = await getPublishedProjectByPath(projectSlug);

    if (!projectResult.success || !projectResult.data) {
        notFound();
    }

    const project = projectResult.data;
    const content = project.html ?? project.body ?? '';

    return (
        <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
            <article>
                <header className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-(--fg)">{project.title}</h1>
                    <p className="mt-4 text-lg text-(--fg-muted)">{project.description}</p>

                    <div className="mt-5 flex flex-wrap gap-3 text-sm">
                        {project.githubUrl && (
                            <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-(--accent) hover:underline">
                                View source
                            </Link>
                        )}
                        {project.liveUrl && (
                            <Link href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-(--accent) hover:underline">
                                Live demo
                            </Link>
                        )}
                    </div>
                </header>

                {content ? (
                    <ArticleContent content={content} />
                ) : (
                    <p className="text-(--fg-muted)">This project write-up is being prepared.</p>
                )}
            </article>
        </main>
    );
}
