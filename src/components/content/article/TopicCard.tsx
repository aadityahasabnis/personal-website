import { formatDate } from '@/lib/utils';
import { ArrowUpRight, FileText } from 'lucide-react';
import Link from 'next/link';
import type { IArticleTopicListItem } from './types';

interface ITopicCardProps {
    topic: IArticleTopicListItem;
    /** Additional className */
    className?: string;
}

/**
 * TopicCard - Card component for displaying topics
 *
 * Used in the topics grid on the articles page.
 * Shows topic icon, title, description, and article count.
 */
const TopicCard = ({ topic, className }: ITopicCardProps) => {
    return (
        <article className={className ?? 'relative group'}>
            <div className='relative flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-base group-hover:border-primary/40'>
                <div className='mb-4 flex items-center gap-2 text-muted-foreground'>
                    <FileText className='size-4' aria-hidden='true' />
                    <span className='text-small'>
                        {topic.contentCount} article{topic.contentCount !== 1 ? 's' : ''}
                    </span>
                </div>

                <h3 className='text-h3 font-medium text-foreground'>
                    <Link href={`/articles/${topic.slug}`} className='transition-base hover:text-primary'>
                        {topic.title}
                    </Link>
                </h3>

                <p className='mt-3 flex-1 text-body text-muted-foreground'>{topic.description}</p>

                <div className='mt-5 flex items-center justify-between text-small text-muted-foreground'>
                    <span>{topic.subTopicCount} sections</span>
                    <span>Updated {formatDate(topic.updatedAt)}</span>
                </div>

                {topic.featured && (
                    <span className='absolute top-4 right-4 inline-flex items-center rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-label font-medium text-primary'>Featured</span>
                )}

                <ArrowUpRight className='absolute top-4 left-4 hidden size-4 text-muted-foreground transition-base group-hover:text-primary md:block' aria-hidden='true' />
            </div>
        </article>
    );
};

export { TopicCard };
export type { ITopicCardProps };
