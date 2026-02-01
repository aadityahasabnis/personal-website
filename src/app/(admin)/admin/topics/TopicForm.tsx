'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

import { cn } from '@/lib/utils';
import { createTopic, updateTopic } from '@/server/actions/topics';
import type { ITopic } from '@/interfaces';

// Common Lucide icon names for topics
const ICON_OPTIONS = [
    'Code', 'Database', 'Globe', 'Server', 'Cpu', 'Terminal', 
    'GitBranch', 'Layers', 'Box', 'Puzzle', 'Lightbulb', 'BookOpen',
    'FileCode', 'Braces', 'Binary', 'Network', 'Cloud', 'Shield',
];

interface ITopicFormProps {
    topic?: ITopic;
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

export const TopicForm = ({ topic, isEditing = false }: ITopicFormProps): React.ReactElement => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState(topic?.title ?? '');
    const [slug, setSlug] = useState(topic?.slug ?? '');
    const [description, setDescription] = useState(topic?.description ?? '');
    const [icon, setIcon] = useState(topic?.icon ?? 'Code');
    const [order, setOrder] = useState(topic?.order ?? 0);
    const [published, setPublished] = useState(topic?.published ?? false);
    const [featured, setFeatured] = useState(topic?.featured ?? false);

    const [autoSlug, setAutoSlug] = useState(!isEditing);

    const handleTitleChange = (value: string): void => {
        setTitle(value);
        if (autoSlug) {
            setSlug(generateSlug(value));
        }
    };

    const handleSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            const data = {
                title,
                slug,
                description,
                icon,
                order,
                published,
                featured,
            };

            const result = isEditing && topic
                ? await updateTopic(topic.slug, data)
                : await createTopic(data);

            if (result.success) {
                router.push('/admin/topics');
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
                    placeholder="e.g., Data Structures & Algorithms"
                    className={cn(
                        'w-full rounded-lg border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                        'placeholder:text-muted-foreground'
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
                    <span className="text-muted-foreground">/articles/</span>
                    <input
                        id="slug"
                        type="text"
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setAutoSlug(false);
                        }}
                        placeholder="dsa"
                        className={cn(
                            'flex-1 rounded-lg border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                            'placeholder:text-muted-foreground'
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
                    Description <span className="text-destructive">*</span>
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of this topic..."
                    rows={3}
                    className={cn(
                        'w-full rounded-lg border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                        'placeholder:text-muted-foreground resize-none'
                    )}
                    required
                    maxLength={500}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    {description.length}/500 characters
                </p>
            </div>

            {/* Icon */}
            <div>
                <label className="block text-sm font-medium mb-2">
                    Icon
                </label>
                <div className="flex flex-wrap gap-2">
                    {ICON_OPTIONS.map((iconName) => (
                        <button
                            key={iconName}
                            type="button"
                            onClick={() => setIcon(iconName)}
                            className={cn(
                                'rounded-lg border px-3 py-1.5 text-sm transition-colors',
                                icon === iconName
                                    ? 'border-primary bg-primary/10 text-primary'
                                    : 'hover:border-primary/50 hover:bg-muted'
                            )}
                        >
                            {iconName}
                        </button>
                    ))}
                </div>
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
                        'w-32 rounded-lg border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                    )}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    Lower numbers appear first
                </p>
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-6">
                {/* Published */}
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Published</span>
                </label>

                {/* Featured */}
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Featured on homepage</span>
                </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t">
                <button
                    type="submit"
                    disabled={isPending}
                    className={cn(
                        'inline-flex items-center gap-2 rounded-lg px-6 py-2.5',
                        'bg-primary text-primary-foreground',
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
                            {isEditing ? 'Update Topic' : 'Create Topic'}
                        </>
                    )}
                </button>
                <Link
                    href="/admin/topics"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
};
