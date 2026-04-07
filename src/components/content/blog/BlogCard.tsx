import { ArrowUpRight, Newspaper } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Pill } from '@/components/ui/pill';
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
    const detailHref = `/blogs/${blog.slug}`;

    return (
        <article className={cn('relative h-full', className)}>
            <div className='group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-none transition-slow hover:border-primary/25 hover:shadow-md focus-within:border-primary/40 focus-within:shadow-glow-sm md:flex-row'>
                <Link href={detailHref} aria-label={`Read blog ${blog.title}`} className='absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring' />

                <div className='relative h-56 w-full shrink-0 overflow-hidden bg-muted md:h-auto md:w-[46%] lg:w-1/2'>
                    {blog.coverImage ? (
                        <Image src={blog.coverImage} alt={blog.title} fill sizes={imageSizes} className='object-cover' />
                    ) : (
                        <div className='flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 to-primary/5'>
                            <Newspaper className='size-10 text-muted-foreground' aria-hidden='true' />
                        </div>
                    )}

                    {blog.featured && (
                        <div className='absolute top-0 left-0 z-20 h-24 w-24 overflow-hidden'>
                            <span className='absolute top-3 -left-10 flex w-32 items-center justify-center bg-primary py-1 text-xs font-semibold tracking-normal text-primary-foreground uppercase shadow-glow-sm -rotate-45'>
                                Featured
                            </span>
                        </div>
                    )}

                    <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-slow group-hover:opacity-100 group-focus-within:opacity-100' />

                    <div className='pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-center p-4 opacity-0 transition-slow group-hover:opacity-100 group-focus-within:opacity-100'>
                        <Pill variant='default' size='cta' className='text-primary-foreground!'>
                            Read Blog
                            <ArrowUpRight
                                className='size-4 transition-slow group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-focus-within:translate-x-0.5 group-focus-within:-translate-y-0.5'
                                aria-hidden='true'
                            />
                        </Pill>
                    </div>
                </div>

                <div className='relative flex flex-1 flex-col gap-3 p-6 md:justify-center md:p-8'>
                    <BlogMeta className='text-small' publishedAt={blog.publishedAt} readingTime={blog.readingTime} updatedAt={blog.updatedAt} showUpdated={false} />

                    <h2 className='line-clamp-2 text-h2 font-semibold leading-tight text-foreground md:text-h1'>{blog.title}</h2>

                    <p className='line-clamp-2 text-body leading-7 text-muted-foreground md:max-w-[56ch]'>{blog.description}</p>

                    {visibleTags.length > 0 && (
                        <ul className='flex flex-wrap gap-2 pt-1' aria-label='Blog tags'>
                            {visibleTags.map((tag) => (
                                <li key={`${blog.id}-${tag}`}>
                                    <Pill variant='subtle' size='chip'>
                                        {tag}
                                    </Pill>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </article>
    );
};

export type { IBlogCardProps };
