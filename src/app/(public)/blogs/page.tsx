import type { Metadata } from 'next';

import { BlogCard } from '@/components/content/blog/BlogCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { getPublishedBlogs, type IPublicBlogListItem } from '@/server/new/public/content/blog';

const description = `Blog posts by ${SITE_CONFIG.author.name} on engineering, web development, and continuous learning.`;
const BLOGS_PAGE_LIMIT = 60;
const FEATURED_BLOGS_LIMIT = 1;

const getBlogsPageData = async (): Promise<{ featuredBlog: IPublicBlogListItem | null; regularBlogs: IPublicBlogListItem[] }> => {
    const [featuredResult, blogsResult] = await Promise.all([
        getPublishedBlogs({
            featuredOnly: true,
            pagination: {
                offset: 0,
                limit: FEATURED_BLOGS_LIMIT,
            },
        }),
        getPublishedBlogs({
            pagination: {
                offset: 0,
                limit: BLOGS_PAGE_LIMIT,
            },
        }),
    ]);

    const featuredBlog = featuredResult.success ? (featuredResult.data[0] ?? null) : null;
    const allBlogs: IPublicBlogListItem[] = blogsResult.success ? blogsResult.data : [];

    return {
        featuredBlog,
        regularBlogs: featuredBlog ? allBlogs.filter((blog) => blog.featured !== true) : allBlogs,
    };
};

export const metadata: Metadata = createPageMetadata({
    title: 'Blogs',
    description,
    canonicalPath: '/blogs',
    includeSocial: true,
    socialType: 'website',
    robots: {
        index: true,
        follow: true,
    },
});

export const revalidate = 3600;

export default async function BlogsPage() {
    const { featuredBlog, regularBlogs } = await getBlogsPageData();
    const hasBlogs = Boolean(featuredBlog) || regularBlogs.length > 0;

    return (
        <main className='mx-auto px-6 py-20 md:py-24 lg:px-8 max-w-5xl'>
            <PageHeader label='Writing' title='Blogs' description='Thoughts on software engineering, systems, and building reliable products on the web.' />

            {!hasBlogs ? (
                <p className='text-body text-muted-foreground'>No blogs published yet.</p>
            ) : (
                <section className='flex flex-col gap-8'>
                    {featuredBlog && <BlogCard blog={featuredBlog} />}

                    {regularBlogs.length > 0 && (
                        <ul className='grid gap-6'>
                            {regularBlogs.map((blog) => (
                                <li key={blog.id}>
                                    <BlogCard blog={blog} />
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            )}
        </main>
    );
}
