import type { Metadata } from 'next';
import Link from 'next/link';

import { SITE_CONFIG } from '@/constants/siteConstants';
import { getPublishedBlogs } from '@/server/new/public/content/blog';

const description = `Blog posts by ${SITE_CONFIG.author.name} on engineering, web development, and continuous learning.`;

export const metadata: Metadata = {
    title: 'Blogs',
    description,
    alternates: {
        canonical: `${SITE_CONFIG.url}/blogs`,
    },
    openGraph: {
        title: `Blogs | ${SITE_CONFIG.name}`,
        description,
        url: `${SITE_CONFIG.url}/blogs`,
        siteName: SITE_CONFIG.name,
        locale: 'en_US',
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
    },
};

export const revalidate = 3600;

export default async function BlogsPage() {
    const blogsResult = await getPublishedBlogs({
        pagination: {
            offset: 0,
            limit: 200,
        },
    });

    const blogs = blogsResult.success ? blogsResult.data : [];

    return (
        <main className="max-w-4xl mx-auto px-6 lg:px-8 py-20">
            <header className="mb-10">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-(--fg)">Blogs</h1>
                <p className="mt-4 text-(--fg-muted)">
                    Thoughts on software engineering, systems, and building on the web.
                </p>
            </header>

            {blogs.length === 0 ? (
                <p className="text-(--fg-muted)">No blogs published yet.</p>
            ) : (
                <ul className="space-y-6">
                    {blogs.map((blog) => (
                        <li key={blog.id} className="border border-(--border-color) rounded-xl p-5">
                            <Link href={`/blogs/${blog.slug}`} className="group block">
                                <h2 className="text-xl font-medium text-(--fg) group-hover:text-(--accent) transition-colors">
                                    {blog.title}
                                </h2>
                                <p className="mt-2 text-(--fg-muted)">{blog.description}</p>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
