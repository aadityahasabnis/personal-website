'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowUpRight, Calendar, Lightbulb, Tag } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

interface INoteCardProps {
    note: {
        slug: string;
        title: string;
        description?: string;
        tags?: string[];
        publishedAt?: Date | string;
    };
    /** Animation delay index */
    index?: number;
    /** Additional className */
    className?: string;
}

/**
 * NoteCard - Premium card component for displaying notes
 * 
 * Features:
 * - Elegant hover animations
 * - Tag display with gradient background
 * - Visual hierarchy with icons
 * - Arrow indicator on hover
 * - Professional typography and spacing
 */
export const NoteCard = ({ note, index = 0, className }: INoteCardProps) => {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            className={cn('group relative', className)}
        >
            <Link href={`/notes/${note.slug}`} className="block h-full">
                <div
                    className={cn(
                        'relative rounded-2xl border-2 border-[var(--border-color)] bg-[var(--card-bg)]',
                        'p-6 transition-all duration-300 h-full flex flex-col',
                        'hover:border-[#9b87f5] hover:shadow-xl hover:shadow-[#9b87f5]/10',
                        'hover:-translate-y-1',
                        'dark:hover:shadow-[0_0_40px_-10px_#9b87f5]'
                    )}
                >
                    {/* Icon Badge */}
                    <div className="mb-4 inline-flex items-center justify-center size-12 rounded-xl bg-gradient-to-br from-[#9b87f5]/10 to-[#9b87f5]/5 text-[#9b87f5] border border-[#9b87f5]/20">
                        <Lightbulb className="size-6" />
                    </div>

                    {/* Title */}
                    <h3 className="text-lg md:text-xl font-semibold text-[var(--fg)] mb-3 transition-colors group-hover:text-[#9b87f5] line-clamp-2">
                        {note.title}
                    </h3>

                    {/* Description */}
                    {note.description && (
                        <p className="text-sm text-[var(--fg-muted)] line-clamp-3 flex-1 mb-4">
                            {note.description}
                        </p>
                    )}

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {note.tags.slice(0, 3).map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#9b87f5]/10 text-[#9b87f5] border border-[#9b87f5]/20"
                                >
                                    <Tag className="size-3" />
                                    {tag}
                                </span>
                            ))}
                            {note.tags.length > 3 && (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-[var(--fg-subtle)]">
                                    +{note.tags.length - 3}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-[var(--fg-subtle)] mt-auto pt-4 border-t border-[var(--border-color)]">
                        {note.publishedAt && (
                            <span className="flex items-center gap-1.5">
                                <Calendar className="size-3" />
                                <time dateTime={new Date(note.publishedAt).toISOString()}>
                                    {formatDate(note.publishedAt)}
                                </time>
                            </span>
                        )}
                    </div>

                    {/* Hover Arrow Indicator */}
                    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1 group-hover:-translate-y-1">
                        <div className="size-8 rounded-full bg-[#9b87f5] flex items-center justify-center shadow-lg shadow-[#9b87f5]/30">
                            <ArrowUpRight className="size-4 text-white" />
                        </div>
                    </div>

                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#9b87f5]/0 to-[#9b87f5]/0 group-hover:from-[#9b87f5]/[0.02] group-hover:to-[#9b87f5]/[0.05] transition-all duration-300 pointer-events-none" />
                </div>
            </Link>
        </motion.article>
    );
};

export type { INoteCardProps };
