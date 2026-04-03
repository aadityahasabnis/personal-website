import { ArrowUpRight, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { IPublicBlogListItem } from '@/server/new/public/content/blog';

import { BlogMeta } from './BlogMeta';

const MAX_VISIBLE_TAGS = 4;

interface IBlogCardProps {
    blog: IPublicBlogListItem;
    className?: string;
}

export const BlogCard = ({ blog, className }: IBlogCardProps) => {
    const visibleTags = blog.tags.slice(0, MAX_VISIBLE_TAGS);
    const imageSizes = '(max-width: 768px) 100vw, 50vw';

    return (
        <article className={cn('relative h-full', className)}>
            <Link href={`/blogs/${blog.slug}`} aria-label={`Read blog ${blog.title}`} className='group relative block h-full focus-visible:outline-none'>
                <div className='relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-none transition-base group-hover:border-primary/25 group-hover:shadow-md group-focus-visible:border-primary/40 group-focus-visible:shadow-glow-sm md:flex-row'>
                    <div className='relative h-56 w-full shrink-0 overflow-hidden bg-muted md:h-auto md:w-[46%] lg:w-1/2'>
                        {blog.coverImage ? (
                            <Image src={blog.coverImage} alt={blog.title} fill sizes={imageSizes} className='object-cover transition-slow group-hover:scale-105 group-focus-visible:scale-105' />
                        ) : (
                            <div className='flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 to-primary/5'>
                                <BookOpen className='size-10 text-muted-foreground' aria-hidden='true' />
                            </div>
                        )}

                        {blog.featured && (
                            <div className='absolute top-0 left-0 z-10 h-24 w-24 overflow-hidden'>
                                <span className='absolute top-3 -left-10 flex w-32 items-center justify-center py-1 text-xs font-semibold tracking-normal uppercase bg-primary text-primary-foreground shadow-glow-sm -rotate-45'>
                                    Featured
                                </span>
                            </div>
                        )}

                        <div className='absolute inset-0 opacity-0 bg-linear-to-t from-background/70 via-background/15 to-transparent transition-base group-hover:opacity-100 group-focus-visible:opacity-100' />

                        <div className='absolute inset-x-0 bottom-0 z-10 flex items-center p-4 opacity-0 transition-base group-hover:opacity-100 group-focus-visible:opacity-100'>
                            <span className='flex items-center gap-1.5 px-3 py-1 text-small font-medium text-primary-foreground rounded-full bg-primary'>
                                Read Blog
                                <ArrowUpRight className='size-4 transition-base group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5' aria-hidden='true' />
                            </span>
                        </div>
                    </div>

                    <div className='relative flex flex-1 flex-col gap-3 p-6 md:justify-center md:p-8'>
                        <BlogMeta className='text-small' publishedAt={blog.publishedAt} readingTime={blog.readingTime} updatedAt={blog.updatedAt} showUpdated={false} />

                        <h2 className='line-clamp-2 text-h2 font-semibold leading-tight text-foreground transition-base group-hover:text-primary group-focus-visible:text-primary md:text-h1'>
                            {blog.title}
                        </h2>

                        <p className='line-clamp-2 text-body leading-7 text-muted-foreground md:max-w-[56ch]'>{blog.description}</p>

                        {visibleTags.length > 0 && (
                            <ul className='flex flex-wrap gap-2 pt-1' aria-label='Blog tags'>
                                {visibleTags.map((tag) => (
                                    <li key={`${blog.id}-${tag}`}>
                                        <span className='inline-flex items-center px-2.5 py-1 text-label font-medium text-primary rounded-full bg-primary/8'>{tag}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </Link>
        </article>
    );
};

export type { IBlogCardProps };
