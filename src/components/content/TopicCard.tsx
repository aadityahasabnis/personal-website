'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, FileText } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import type { ITopic } from '@/interfaces';

interface ITopicCardProps {
    topic: ITopic;
    /** Animation delay index */
    index?: number;
    /** Additional className */
    className?: string;
}

/**
 * Get Lucide icon component by name
 */
function getIconComponent(iconName?: string): React.ComponentType<{ className?: string }> {
    if (!iconName) return FileText;
    
    // Convert kebab-case or lowercase to PascalCase
    const pascalCase = iconName
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (LucideIcons as any)[pascalCase];
    return Icon || FileText;
}

/**
 * TopicCard - Card component for displaying topics
 * 
 * Used in the topics grid on the articles page.
 * Shows topic icon, title, description, and article count.
 */
const TopicCard = ({ topic, index = 0, className }: ITopicCardProps) => {
    const Icon = getIconComponent(topic.icon);
    
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={cn('group relative', className)}
        >
            <Link href={`/articles/${topic.slug}`} className="block">
                <div
                    className={cn(
                        'relative rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 transition-all duration-300',
                        'hover:border-[var(--border-hover)] hover:shadow-lg',
                        'dark:hover:shadow-[0_0_30px_-10px_var(--glow-color)]',
                        'h-full flex flex-col'
                    )}
                >
                    {/* Icon */}
                    <div className="mb-4 inline-flex items-center justify-center size-12 rounded-xl bg-[var(--accent-subtle)] text-[var(--accent)]">
                        <Icon className="size-6" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-medium text-[var(--fg)] transition-colors group-hover:text-[var(--accent)]">
                        {topic.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-2 text-sm text-[var(--fg-muted)] line-clamp-2 flex-1">
                        {topic.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-4 text-xs text-[var(--fg-subtle)]">
                        <span className="flex items-center gap-1.5">
                            <FileText className="size-3" />
                            {topic.metadata.articleCount} article{topic.metadata.articleCount !== 1 ? 's' : ''}
                        </span>
                        {topic.metadata.lastUpdated && (
                            <span>
                                Updated {formatDate(topic.metadata.lastUpdated)}
                            </span>
                        )}
                    </div>

                    {/* Arrow indicator */}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="size-5 text-[var(--accent)]" />
                    </div>

                    {/* Featured badge */}
                    {topic.featured && (
                        <div className="absolute top-4 right-4 px-2 py-0.5 text-xs font-medium uppercase tracking-wider bg-[var(--accent)] text-[var(--accent-fg)] rounded-full opacity-0 group-hover:opacity-0">
                            Featured
                        </div>
                    )}
                </div>
            </Link>
        </motion.article>
    );
};

export { TopicCard };
export type { ITopicCardProps };
