import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { BlogContent, BlogHeader } from '@/components/content';
import { ContentComment } from '@/components/content/common/comment/ContentComment';
import { ContentLikes, ContentViews } from '@/components/content/common/stats';
import { FadeIn } from '@/components/motion/FadeIn';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { getPublishedBlogByPath, getPublishedBlogStaticPaths, type IPublicBlogDetail } from '@/server/new/public/content/blog';

interface IBlogDetailPageProps {
    params: Promise<{ blogSlug: string }>;
}

export const revalidate = 3600;

export const generateStaticParams = async (): Promise<Array<{ blogSlug: string }>> => {
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
    const image =
        blog.seo?.ogImage ??
        blog.coverImage ??
        buildDynamicOgImageUrl({
            title,
            eyebrow: 'Blog Post',
            subtitle: description,
            tags: (blog.tags ?? []).slice(0, 4),
        });
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
        imageUrl: image,
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
        <main className='mx-auto px-4 py-16 max-w-5xl sm:px-6 lg:px-8 md:py-20'>
            <article>
                <BlogHeader
                    title={blog.title}
                    description={blog.description}
                    tags={blog.tags}
                    breadcrumbs={[
                        { label: 'Blogs', href: '/blogs' },
                        { label: blog.title, href: `/blogs/${blogSlug}` },
                    ]}
                    coverImage={blog.coverImage}
                    publishedAt={blog.publishedAt}
                    readingTime={blog.readingTime}
                    updatedAt={blog.updatedAt}
                />

                {content ? (
                    <FadeIn direction='up' distance={20} duration={0.5} delay={0.2} trigger='always'>
                        <BlogContent content={content} />
                    </FadeIn>
                ) : (
                    <p className='text-body text-muted-foreground'>This blog post is being prepared.</p>
                )}

                <FadeIn direction='up' distance={12} duration={0.4} delay={0.3} trigger='always'>
                    <section className='flex items-center gap-3 mt-8' aria-label='Blog engagement stats'>
                        <ContentViews contentType='blogs' contentId={blog.id} />
                        <ContentLikes contentType='blogs' contentId={blog.id} />
                    </section>
                </FadeIn>

                <FadeIn direction='up' distance={16} duration={0.45} delay={0.35} trigger='always'>
                    <ContentComment contentType='blogs' contentId={blog.id} className='mt-12' />
                </FadeIn>
            </article>
        </main>
    );
}
