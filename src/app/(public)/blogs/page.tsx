import type { Metadata } from 'next';

import { BlogCard } from '@/components/content/blog/BlogCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { FadeIn } from '@/components/motion/FadeIn';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { getPublishedBlogs, type IPublicBlogListItem } from '@/server/new/public/content/blog';

const description = `Blog posts by ${SITE_CONFIG.author.name} on engineering, web development, and continuous learning.`;
const BLOGS_PAGE_LIMIT = 60;
const blogsOgImage = buildDynamicOgImageUrl({
    title: 'Blogs',
    eyebrow: 'Writing',
    subtitle: 'Engineering notes, lessons, and practical web development insights.',
    tags: ['blogs', 'engineering', 'writing', 'web'],
});

const getBlogsPageData = async (): Promise<{ blogs: IPublicBlogListItem[] }> => {
    const blogsResult = await getPublishedBlogs({
        pagination: {
            offset: 0,
            limit: BLOGS_PAGE_LIMIT,
        },
    });

    return {
        blogs: blogsResult.success ? blogsResult.data : [],
    };
};

export const metadata: Metadata = createPageMetadata({
    title: 'Blogs',
    description,
    canonicalPath: '/blogs',
    includeSocial: true,
    socialType: 'website',
    imageUrl: blogsOgImage,
    robots: {
        index: true,
        follow: true,
    },
});

export const revalidate = 3600;

export default async function BlogsPage() {
    const { blogs } = await getBlogsPageData();
    const hasBlogs = blogs.length > 0;

    return (
        <main className='mx-auto px-6 py-20 md:py-24 lg:px-8 max-w-5xl'>
            <PageHeader label='Writing' title='Blogs' description='Thoughts on software engineering, systems, and building reliable products on the web.' />

            {!hasBlogs ? (
                <p className='text-body text-muted-foreground'>No blogs published yet.</p>
            ) : (
                <FadeIn direction='up' distance={20} duration={0.5} delay={0.32}>
                    <section className='flex flex-col gap-8'>
                        {blogs && blogs.length > 0 && (
                            <ul className='grid gap-6'>
                                {blogs.map((blog) => (
                                    <li key={blog.id}>
                                        <BlogCard blog={blog} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </FadeIn>
            )}
        </main>
    );
}
