import { TopicCard } from './TopicCard';
import type { IArticleTopicListItem } from './types';

interface ITopicGridProps {
    topics: IArticleTopicListItem[];
    /** Additional className */
    className?: string;
}

/**
 * TopicGrid - Server Component for displaying topics in a grid
 *
 * Renders a responsive grid of TopicCard components.
 * Used on the main articles page.
 */
const TopicGrid = ({ topics, className }: ITopicGridProps) => {
    if (topics.length === 0) {
        return (
            <div className='py-20 text-center'>
                <p className='text-body text-muted-foreground'>No topics available yet. Check back soon.</p>
            </div>
        );
    }

    return (
        <div className={className ?? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3'}>
            {topics.map((topic) => (
                <TopicCard key={topic.id} topic={topic} />
            ))}
        </div>
    );
};

export { TopicGrid };
export type { ITopicGridProps };
