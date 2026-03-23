import type { Metadata } from 'next';

import { BlogCard } from '@/components/content/blog/BlogCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { getPublishedBlogs, type IPublicBlogListItem } from '@/server/new/public/content/blog';

const description = `Blog posts by ${SITE_CONFIG.author.name} on engineering, web development, and continuous learning.`;

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
    const blogsResult = await getPublishedBlogs({
        pagination: {
            offset: 0,
            limit: 60,
        },
    });

    const blogs: IPublicBlogListItem[] = blogsResult.success ? blogsResult.data : [];

    return (
        <main className='mx-auto px-6 py-20 max-w-4xl lg:px-8'>
            <PageHeader label='Writing' title='Blogs' description='Thoughts on software engineering, systems, and building reliable products on the web.' />

            {blogs.length === 0 ? (
                <p className='text-body text-muted-foreground'>No blogs published yet.</p>
            ) : (
                <ul className='grid gap-6'>
                    {blogs.map((blog) => (
                        <li key={blog.id}>
                            <BlogCard blog={blog} />
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
