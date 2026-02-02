'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Save } from 'lucide-react';

import { cn } from '@/lib/utils';
import { createSubtopic, updateSubtopic } from '@/server/actions/subtopics';
import type { ISubtopic, ITopic } from '@/interfaces';

interface ISubtopicFormProps {
    subtopic?: ISubtopic;
    topics: ITopic[];
    isEditing?: boolean;
}

const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

export const SubtopicForm = ({ 
    subtopic, 
    topics, 
    isEditing = false 
}: ISubtopicFormProps): React.ReactElement => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState(subtopic?.title ?? '');
    const [slug, setSlug] = useState(subtopic?.slug ?? '');
    const [topicSlug, setTopicSlug] = useState(subtopic?.topicSlug ?? '');
    const [description, setDescription] = useState(subtopic?.description ?? '');
    const [order, setOrder] = useState(subtopic?.order ?? 0);
    const [published, setPublished] = useState(subtopic?.published ?? false);

    const [autoSlug, setAutoSlug] = useState(!isEditing);

    const handleTitleChange = (value: string): void => {
        setTitle(value);
        if (autoSlug) {
            setSlug(generateSlug(value));
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError(null);

        if (!topicSlug) {
            setError('Please select a parent topic');
            return;
        }

        startTransition(async () => {
            const data = {
                title,
                slug,
                topicSlug,
                description,
                order,
                published,
            };

            const result = isEditing && subtopic
                ? await updateSubtopic(subtopic.topicSlug, subtopic.slug, data)
                : await createSubtopic(data);

            if (result.success) {
                router.push('/admin/subtopics');
                router.refresh();
            } else {
                setError(result.error ?? 'Something went wrong');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Parent Topic */}
            <div>
                <label htmlFor="topic" className="block text-sm font-medium mb-2">
                    Parent Topic <span className="text-destructive">*</span>
                </label>
                <select
                    id="topic"
                    value={topicSlug}
                    onChange={(e) => setTopicSlug(e.target.value)}
                    className={cn(
                        'w-full rounded-lg border border-border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                        'transition-colors'
                    )}
                    required
                >
                    <option value="">Select a parent topic</option>
                    {topics.map((topic) => (
                        <option key={topic.slug} value={topic.slug}>
                            {topic.title}
                        </option>
                    ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                    Choose which topic this subtopic belongs to
                </p>
            </div>

            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                    Title <span className="text-destructive">*</span>
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g., DSA Fundamentals"
                    className={cn(
                        'w-full rounded-lg border border-border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                        'placeholder:text-muted-foreground transition-colors'
                    )}
                    required
                    minLength={3}
                    maxLength={100}
                />
            </div>

            {/* Slug */}
            <div>
                <label htmlFor="slug" className="block text-sm font-medium mb-2">
                    Slug <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">
                        /articles/{topicSlug || '...'}/
                    </span>
                    <input
                        id="slug"
                        type="text"
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setAutoSlug(false);
                        }}
                        placeholder="dsa-fundamentals"
                        className={cn(
                            'flex-1 rounded-lg border border-border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                            'placeholder:text-muted-foreground transition-colors'
                        )}
                        required
                        pattern="^[a-z0-9-]+$"
                        minLength={2}
                        maxLength={50}
                    />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                    Lowercase letters, numbers, and hyphens only
                </p>
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description (optional)
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of this subtopic..."
                    rows={3}
                    className={cn(
                        'w-full rounded-lg border border-border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                        'placeholder:text-muted-foreground resize-none transition-colors'
                    )}
                    maxLength={500}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    {description.length}/500 characters
                </p>
            </div>

            {/* Order */}
            <div>
                <label htmlFor="order" className="block text-sm font-medium mb-2">
                    Display Order
                </label>
                <input
                    id="order"
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                    min={0}
                    className={cn(
                        'w-32 rounded-lg border border-border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                        'transition-colors'
                    )}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    Lower numbers appear first within the parent topic
                </p>
            </div>

            {/* Published Toggle */}
            <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Published</span>
                </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-border">
                <button
                    type="submit"
                    disabled={isPending}
                    className={cn(
                        'inline-flex items-center gap-2 rounded-lg px-6 py-2.5',
                        'bg-primary text-primary-foreground font-medium',
                        'hover:bg-primary/90 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            {isEditing ? 'Update Subtopic' : 'Create Subtopic'}
                        </>
                    )}
                </button>
                <Link
                    href="/admin/subtopics"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
};
