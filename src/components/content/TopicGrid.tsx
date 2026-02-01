import { cn } from '@/lib/utils';
import { TopicCard } from './TopicCard';
import type { ITopic } from '@/interfaces';

interface ITopicGridProps {
    topics: ITopic[];
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
            <div className="text-center py-20">
                <p className="text-[var(--fg-muted)] text-lg">
                    No topics available yet. Check back soon.
                </p>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'grid gap-6 md:grid-cols-2 lg:grid-cols-3',
                className
            )}
        >
            {topics.map((topic, index) => (
                <TopicCard
                    key={topic.slug}
                    topic={topic}
                    index={index}
                />
            ))}
        </div>
    );
};

export { TopicGrid };
export type { ITopicGridProps };
