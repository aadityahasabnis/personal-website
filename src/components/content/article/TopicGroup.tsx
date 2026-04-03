import type { ReactNode } from 'react';

import { GroupLabel } from '@/components/common/GroupLabel';
import { cn } from '@/lib/utils';

import { TopicCard } from '@/components/content/article/TopicCard';
import type { IArticleTopicListItem } from './types';

interface ITopicGroupProps {
    label: string;
    icon?: ReactNode;
    topics: IArticleTopicListItem[];
    className?: string;
}

export interface ITopicGridProps {
    topics: IArticleTopicListItem[];
    className?: string;
}

export const TopicGrid = ({ topics, className }: ITopicGridProps) => {
    return (
        <div className={className ?? 'grid gap-6 md:grid-cols-2'}>
            {topics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
            ))}
        </div>
    );
};

export const TopicGroup = ({ label, icon, topics, className }: ITopicGroupProps) => {
    if (topics.length === 0) {
        return (
            <section className={cn('relative flex flex-col items-center justify-center rounded-xl border border-border bg-linear-to-b from-card to-card/50 px-6 py-20 md:py-28', className)}>
                <div className='relative z-10 space-y-4 text-center'>
                    <p className='text-body font-medium text-foreground'>No topics available yet for articles</p>
                    <p className='text-small text-muted-foreground'>Check back soon for updates.</p>
                </div>
            </section>
        );
    }

    return (
        <div className={cn('flex flex-col', className)}>
            <GroupLabel text={label} icon={icon} />
            <TopicGrid topics={topics} />
        </div>
    );
};
