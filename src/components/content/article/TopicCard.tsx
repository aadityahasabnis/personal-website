import Image from 'next/image';

import { ArrowUpRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

import { Pill } from '@/components/ui/pill';
import { cn } from '@/lib/utils';

import type { IArticleTopicListItem } from './types';

interface ITopicCardProps {
    topic: IArticleTopicListItem;
    className?: string;
}

const TopicCard = ({ topic, className }: ITopicCardProps) => {
    const detailHref = `/articles/${topic.slug}`;

    return (
        <article className={cn('relative h-full', className)}>
            <div className='group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-none transition-slow hover:border-primary/25 hover:shadow-md focus-within:border-primary/40 focus-within:shadow-glow-sm'>
                <Link href={detailHref} aria-label={`Open topic ${topic.title}`} className='absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring' />

                <div className='relative h-34 w-full shrink-0 overflow-hidden bg-muted'>
                    {topic.coverImage ? (
                        <Image src={topic.coverImage} alt={topic.title} fill className='object-cover' sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' />
                    ) : (
                        <div className='flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 to-primary/5'>
                            <BookOpen className='size-8 text-muted-foreground' aria-hidden='true' />
                        </div>
                    )}

                    {topic.featured && (
                        <div className='absolute top-0 right-0 z-20 h-24 w-24 overflow-hidden'>
                            <span className='absolute top-3 -right-10 flex w-32 items-center justify-center bg-primary py-1 text-xs font-semibold tracking-normal text-primary-foreground uppercase shadow-glow-sm rotate-45'>
                                Featured
                            </span>
                        </div>
                    )}

                    <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent opacity-0 transition-slow group-hover:opacity-100 group-focus-within:opacity-100' />
                </div>

                <div className='relative flex flex-1 flex-col gap-2 p-6'>
                    <div className='flex items-center justify-between text-small text-muted-foreground'>
                        <div className='flex items-center gap-1.5'>
                            <BookOpen className='size-3.5' aria-hidden='true' />
                            <span>
                                {topic.contentCount} article{topic.contentCount !== 1 ? 's' : ''}
                            </span>
                        </div>
                        <Pill variant='subtle' size='status'>
                            {topic.subTopicCount} section{topic.subTopicCount !== 1 ? 's' : ''}
                        </Pill>
                    </div>

                    <h3 className='overflow-hidden text-h3 font-semibold leading-9 text-foreground'>{topic.title}</h3>

                    <p className='line-clamp-2 overflow-hidden text-body leading-6 text-muted-foreground'>{topic.description}</p>

                    <ArrowUpRight
                        className='absolute right-5 bottom-5 z-20 size-4 translate-x-1 text-muted-foreground opacity-0 transition-slow group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-primary group-focus-within:translate-x-0 group-focus-within:opacity-100 group-focus-within:text-primary'
                        aria-hidden='true'
                    />
                </div>
            </div>
        </article>
    );
};

export { TopicCard };
export type { ITopicCardProps };
