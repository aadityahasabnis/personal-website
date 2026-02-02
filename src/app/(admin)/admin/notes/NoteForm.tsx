'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Save, X, Plus } from 'lucide-react';

import { cn } from '@/lib/utils';
import { createNote, updateNote } from '@/server/actions/notes';
import type { INote } from '@/interfaces';

interface INoteFormProps {
    note?: INote;
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

export const NoteForm = ({ 
    note, 
    isEditing = false 
}: INoteFormProps): React.ReactElement => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState(note?.title ?? '');
    const [slug, setSlug] = useState(note?.slug ?? '');
    const [description, setDescription] = useState(note?.description ?? '');
    const [body, setBody] = useState(note?.body ?? '');
    const [coverImage, setCoverImage] = useState(note?.coverImage ?? '');
    const [tags, setTags] = useState<string[]>(note?.tags ?? []);
    const [newTag, setNewTag] = useState('');
    const [featured, setFeatured] = useState(note?.featured ?? false);

    const [autoSlug, setAutoSlug] = useState(!isEditing);

    const handleTitleChange = (value: string): void => {
        setTitle(value);
        if (autoSlug) {
            setSlug(generateSlug(value));
        }
    };

    const handleAddTag = (): void => {
        const trimmedTag = newTag.trim().toLowerCase();
        if (trimmedTag && !tags.includes(trimmedTag)) {
            setTags([...tags, trimmedTag]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove: string): void => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            const data = {
                title,
                slug,
                description,
                body,
                coverImage: coverImage || undefined,
                tags,
                featured,
            };

            const result = isEditing && note
                ? await updateNote(note.slug, data)
                : await createNote(data);

            if (result.success) {
                router.push('/admin/notes');
                router.refresh();
            } else {
                setError(result.error ?? 'Something went wrong');
            }
        });
    };

    const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
    const readingTime = Math.ceil(wordCount / 200);

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
                    placeholder="e.g., Understanding React Server Components"
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
                        /notes/
                    </span>
                    <input
                        id="slug"
                        type="text"
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setAutoSlug(false);
                        }}
                        placeholder="understanding-react-server-components"
                        className={cn(
                            'flex-1 rounded-lg border border-border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                            'placeholder:text-muted-foreground transition-colors'
                        )}
                        required
                        pattern="^[a-z0-9-]+$"
                        minLength={2}
                        maxLength={100}
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
                    placeholder="A brief summary of this note..."
                    rows={2}
                    className={cn(
                        'w-full rounded-lg border border-border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                        'placeholder:text-muted-foreground resize-none transition-colors'
                    )}
                    required
                    maxLength={160}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    {description.length}/160 characters (used for SEO meta description)
                </p>
            </div>

            {/* Body */}
            <div>
                <label htmlFor="body" className="block text-sm font-medium mb-2">
                    Content <span className="text-destructive">*</span>
                </label>
                <textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your note content here (Markdown supported)..."
                    rows={15}
                    className={cn(
                        'w-full rounded-lg border border-border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                        'placeholder:text-muted-foreground resize-y transition-colors font-mono text-sm'
                    )}
                    required
                    minLength={50}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    {wordCount} words · {readingTime} min read
                </p>
            </div>

            {/* Cover Image */}
            <div>
                <label htmlFor="coverImage" className="block text-sm font-medium mb-2">
                    Cover Image URL (optional)
                </label>
                <input
                    id="coverImage"
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className={cn(
                        'w-full rounded-lg border border-border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                        'placeholder:text-muted-foreground transition-colors'
                    )}
                />
            </div>

            {/* Tags */}
            <div>
                <label htmlFor="tags" className="block text-sm font-medium mb-2">
                    Tags
                </label>
                <div className="flex items-center gap-2">
                    <input
                        id="tags"
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTag();
                            }
                        }}
                        placeholder="Add a tag..."
                        className={cn(
                            'flex-1 rounded-lg border border-border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                            'placeholder:text-muted-foreground transition-colors'
                        )}
                    />
                    <button
                        type="button"
                        onClick={handleAddTag}
                        className={cn(
                            'inline-flex items-center gap-2 rounded-lg px-4 py-2.5',
                            'border border-border bg-background',
                            'hover:bg-muted transition-colors'
                        )}
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </button>
                </div>
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
                            >
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTag(tag)}
                                    className="hover:text-destructive transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Featured Note</span>
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
                            {isEditing ? 'Update Note' : 'Create Note'}
                        </>
                    )}
                </button>
                <Link
                    href="/admin/notes"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
};
