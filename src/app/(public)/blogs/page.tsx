import type { Metadata } from 'next';

import { BlogCard } from '@/components/content/blog/BlogCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { FadeIn } from '@/components/motion/FadeIn';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { JsonLd, combineSchemas, generateBreadcrumbSchema, generatePersonSchema, generateWebPageSchema, generateWebSiteSchema } from '@/lib/seo';
import { getPublishedBlogs, type IPublicBlogListItem } from '@/server/new/public/content/blog';

const description = `Writing by ${SITE_CONFIG.author.name} exploring everyday life, ideas, creativity, and thoughtful perspectives on how we think, work, and grow.`;
const BLOGS_PAGE_LIMIT = 60;
const blogsOgImage = buildDynamicOgImageUrl({
    title: 'Writing About Life, Ideas, and Perspective',
    eyebrow: 'Writing',
    subtitle: 'Essays on everyday experiences, creativity, and the way we think, grow, and understand the world.',
    tags: ['writing', 'life', 'ideas', 'thinking'],
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
    keywords: ['writing', 'personal essays', 'life reflections', 'creative writing', 'ideas and thinking', 'self growth', SITE_CONFIG.author.name],
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
    const schema = combineSchemas(
        generatePersonSchema(),
        generateWebSiteSchema(),
        generateWebPageSchema({
            title: 'Blogs',
            description,
            path: '/blogs',
        }),
        generateBreadcrumbSchema([
            { name: 'Home', url: SITE_CONFIG.url },
            { name: 'Blogs', url: `${SITE_CONFIG.url}/blogs` },
        ]),
    );

    return (
        <>
            <JsonLd data={schema} />
            <main className='mx-auto px-6 py-20 md:py-24 lg:px-8 max-w-5xl'>
                <PageHeader label='Writing' title='Blogs' description='Thoughts on everyday life, ideas, creativity, and the way we think, grow, and make sense of the world.' />

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
        </>
    );
}
