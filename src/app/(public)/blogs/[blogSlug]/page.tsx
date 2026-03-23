import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleContent } from '@/components/content/ArticleContent';
import { createPageMetadata } from '@/lib/metadata';
import {
    getPublishedBlogByPath,
    getPublishedBlogStaticPaths,
} from '@/server/new/public/content/blog';

interface IBlogDetailPageProps {
    params: Promise<{ blogSlug: string }>;
}

export const revalidate = 3600;

export const generateStaticParams = async () => {
    const pathsResult = await getPublishedBlogStaticPaths();
    if (!pathsResult.success) return [];

    return pathsResult.data.map((item) => ({ blogSlug: item.blogSlug }));
};

export const generateMetadata = async ({ params }: IBlogDetailPageProps): Promise<Metadata> => {
    const { blogSlug } = await params;
    const blogResult = await getPublishedBlogByPath(blogSlug);

    if (!blogResult.success || !blogResult.data) {
        return { title: 'Blog Not Found' };
    }

    const blog = blogResult.data;
    const title = blog.seo?.title ?? blog.title;
    const description = blog.seo?.description ?? blog.description;
    const image = blog.seo?.ogImage ?? blog.coverImage ?? undefined;

    return createPageMetadata({
        title,
        description,
        canonicalPath: `/blogs/${blogSlug}`,
        includeSocial: true,
        socialType: 'article',
        ...(image ? { imageUrl: image } : {}),
        robots: {
            index: true,
            follow: true,
        },
    });
};

export default async function BlogDetailPage({ params }: IBlogDetailPageProps) {
    const { blogSlug } = await params;
    const blogResult = await getPublishedBlogByPath(blogSlug);

    if (!blogResult.success || !blogResult.data) {
        notFound();
    }

    const blog = blogResult.data;
    const content = blog.html ?? blog.body ?? '';

    return (
        <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
            <article>
                <header className="mb-10">
                    <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-(--fg)">{blog.title}</h1>
                    <p className="mt-4 text-lg text-(--fg-muted)">{blog.description}</p>
                </header>

                {content ? (
                    <ArticleContent content={content} />
                ) : (
                    <p className="text-(--fg-muted)">This blog post is being prepared.</p>
                )}
            </article>
        </main>
    );
}
