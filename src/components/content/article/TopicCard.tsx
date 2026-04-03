import Image from 'next/image';

import { ArrowUpRight, BookOpen } from 'lucide-react';
import Link from 'next/link';
import type { IArticleTopicListItem } from './types';

interface ITopicCardProps {
    topic: IArticleTopicListItem;
    className?: string;
}

const TopicCard = ({ topic, className }: ITopicCardProps) => {
    return (
        <article className={className ?? 'relative h-full'}>
            <Link href={`/articles/${topic.slug}`} aria-label={`Open topic ${topic.title}`} className='group relative block h-full focus-visible:outline-none'>
                <div className='relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 group-hover:border-primary/25 group-hover:shadow-md group-focus-visible:border-primary/40 group-focus-visible:shadow-glow-sm'>
                    {/* Cover Image */}
                    <div className='relative h-34 w-full shrink-0 overflow-hidden bg-muted'>
                        {topic.coverImage ? (
                            <Image
                                src={topic.coverImage}
                                alt={topic.title}
                                fill
                                className='object-cover transition-transform duration-500 group-hover:scale-105'
                                sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                            />
                        ) : (
                            <div className='flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 to-primary/5'>
                                <BookOpen className='size-8 text-muted-foreground' aria-hidden='true' />
                            </div>
                        )}

                        {/* Featured Badge */}
                        {topic.featured && (
                            <div className='absolute top-0 right-0 z-10 h-24 w-24 overflow-hidden'>
                                <span className='absolute top-3 -right-10 flex w-32 items-center justify-center py-1 text-xs font-semibold tracking-normal uppercase bg-primary text-primary-foreground shadow-glow-sm rotate-45'>
                                    Featured
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className='relative flex flex-1 flex-col gap-2 p-6'>
                        <div className='flex items-center justify-between text-small text-muted-foreground'>
                            <div className='flex items-center gap-1.5'>
                                <BookOpen className='size-3.5' aria-hidden='true' />
                                <span>
                                    {topic.contentCount} article{topic.contentCount !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <span className='rounded-full bg-primary/8 px-3 py-0.5 font-medium text-primary'>
                                {topic.subTopicCount} section{topic.subTopicCount !== 1 ? 's' : ''}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className='overflow-hidden text-h3 font-semibold leading-9 text-foreground'>{topic.title}</h3>

                        {/* Description */}
                        <p className='overflow-hidden text-body leading-6 text-muted-foreground line-clamp-2'>{topic.description}</p>

                        {/* Hover CTA Icon */}
                        <ArrowUpRight
                            className='absolute right-5 bottom-5 size-4 text-muted-foreground opacity-0 transition-all duration-300 translate-x-1 group-hover:translate-x-0 group-hover:opacity-100 group-hover:text-primary group-focus-visible:translate-x-0 group-focus-visible:opacity-100 group-focus-visible:text-primary'
                            aria-hidden='true'
                        />
                    </div>
                </div>
            </Link>
        </article>
    );
};

export { TopicCard };
export type { ITopicCardProps };
