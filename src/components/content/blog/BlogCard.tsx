import Link from 'next/link';

import type { IPublicBlogListItem } from '@/server/new/public/content/blog';

import { BlogMeta } from './BlogMeta';

interface IBlogCardProps {
    blog: IPublicBlogListItem;
}

export const BlogCard = ({ blog }: IBlogCardProps) => {
    return (
        <article className='bg-card border border-border rounded-xl transition-base hover:border-primary/40'>
            <Link href={`/blogs/${blog.slug}`} className='group block p-5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'>
                <h2 className='text-h3 font-medium text-foreground transition-base group-hover:text-primary'>{blog.title}</h2>
                <p className='mt-2 text-body text-muted-foreground'>{blog.description}</p>
                <BlogMeta className='mt-4' publishedAt={blog.publishedAt} readingTime={blog.readingTime} updatedAt={blog.updatedAt} />
            </Link>
        </article>
    );
};

export type { IBlogCardProps };
