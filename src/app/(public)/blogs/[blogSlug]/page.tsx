import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ArticleContent, BlogHeader } from '@/components/content';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { getPublishedBlogByPath, getPublishedBlogStaticPaths, type IPublicBlogDetail } from '@/server/new/public/content/blog';

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
    const keywords = Array.from(new Set([...(blog.tags ?? []), SITE_CONFIG.author.name, 'blog', 'engineering']));
    const publishedTime = blog.publishedAt;

    return createPageMetadata({
        title,
        description,
        canonicalPath: `/blogs/${blogSlug}`,
        keywords,
        includeAuthor: true,
        includeSocial: true,
        socialType: 'article',
        ...(image ? { imageUrl: image } : {}),
        openGraph: {
            ...(publishedTime ? { publishedTime } : {}),
            modifiedTime: blog.updatedAt,
            authors: [SITE_CONFIG.author.name],
            tags: keywords,
        },
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

    const blog: IPublicBlogDetail = blogResult.data;
    const content = blog.html ?? blog.body ?? '';

    return (
        <main className='mx-auto px-6 py-16 max-w-4xl lg:px-8'>
            <article>
                <BlogHeader title={blog.title} description={blog.description} tags={blog.tags} publishedAt={blog.publishedAt} readingTime={blog.readingTime} updatedAt={blog.updatedAt} />

                {content ? <ArticleContent content={content} className='px-0' /> : <p className='text-body text-muted-foreground'>This blog post is being prepared.</p>}
            </article>
        </main>
    );
}
