'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';

import { slugify } from '@/lib/utils';
import { createNote, updateNote } from '@/server/actions/notes';
import type { INote } from '@/interfaces';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import {
    FormInput,
    FormTextarea,
    FormCheckbox,
    TagInput,
    FormSection,
    FormActions,
    FormError,
} from '@/components/admin/form';

interface INoteFormProps {
    note?: INote;
    isEditing?: boolean;
}

export const NoteForm = ({ note, isEditing = false }: INoteFormProps): React.ReactElement => {
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
    const [featured, setFeatured] = useState(note?.featured ?? false);
    const [autoSlug, setAutoSlug] = useState(!isEditing);

    // Auto-generate slug
    useEffect(() => {
        if (autoSlug && title) setSlug(slugify(title));
    }, [title, autoSlug]);

    // Stats
    const stats = useMemo(() => {
        const wordCount = body.trim().split(/\s+/).filter(Boolean).length;
        return { wordCount, readingTime: Math.ceil(wordCount / 200) };
    }, [body]);

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            const data = { title, slug, description, body, coverImage: coverImage || undefined, tags, featured };
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <FormError message={error} />

            <FormSection title="Note Details">
                <FormInput
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Understanding React Server Components"
                    required
                    minLength={3}
                    maxLength={100}
                />

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                            Slug <span className="text-destructive">*</span>
                        </label>
                        <FormCheckbox
                            label="Auto-generate"
                            checked={autoSlug}
                            onChange={(e) => setAutoSlug(e.target.checked)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">/notes/</span>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
                            placeholder="understanding-react-server-components"
                            required
                            pattern="^[a-z0-9-]+$"
                            className="flex-1 px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only</p>
                </div>

                <FormTextarea
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief summary of this note..."
                    required
                    maxLength={160}
                    showCount
                    hint="Used for SEO meta description"
                />
            </FormSection>

            <FormSection title="Content">
                <RichTextEditor
                    value={body}
                    onChange={setBody}
                    onSave={(html) => setBody(html)}
                    placeholder="Write your note… press '/' for commands"
                    minHeight="400px"
                />
                <p className="text-xs text-muted-foreground">
                    {stats.wordCount} words · {stats.readingTime} min read
                </p>
            </FormSection>

            <FormSection title="Media & Organization">
                <FormInput
                    label="Cover Image URL"
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                />

                <TagInput label="Tags" tags={tags} onChange={setTags} placeholder="Add a tag" />

                <FormCheckbox
                    label="Featured Note"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                />
            </FormSection>

            <FormActions
                cancelHref="/admin/notes"
                submitLabel={isEditing ? 'Update Note' : 'Create Note'}
                isPending={isPending}
                submitIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            />
        </form>
    );
};
