'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';

import { slugify } from '@/lib/utils';
import { createSubtopic, updateSubtopic } from '@/server/actions/subtopics';
import type { ISubtopic, ITopic } from '@/interfaces';
import {
    FormInput,
    FormTextarea,
    FormSelect,
    FormCheckbox,
    FormSection,
    FormActions,
    FormError,
} from '@/components/admin/form';

interface ISubtopicFormProps {
    subtopic?: ISubtopic;
    topics: ITopic[];
    isEditing?: boolean;
}

export const SubtopicForm = ({ subtopic, topics, isEditing = false }: ISubtopicFormProps): React.ReactElement => {
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

    // Auto-generate slug
    useEffect(() => {
        if (autoSlug && title) setSlug(slugify(title));
    }, [title, autoSlug]);

    // Topic options for select
    const topicOptions = topics.map((t) => ({ value: t.slug, label: t.title }));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!topicSlug) {
            setError('Please select a parent topic');
            return;
        }

        startTransition(async () => {
            const data = { title, slug, topicSlug, description, order, published };
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
            <FormError message={error} />

            <FormSection title="Subtopic Details">
                <FormSelect
                    label="Parent Topic"
                    value={topicSlug}
                    onChange={setTopicSlug}
                    options={topicOptions}
                    placeholder="Select a parent topic"
                    required
                    hint="Choose which topic this subtopic belongs to"
                />

                <FormInput
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., DSA Fundamentals"
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
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            /articles/{topicSlug || '...'}/
                        </span>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
                            placeholder="dsa-fundamentals"
                            required
                            pattern="^[a-z0-9-]+$"
                            minLength={2}
                            maxLength={50}
                            className="flex-1 px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only</p>
                </div>

                <FormTextarea
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief description of this subtopic..."
                    maxLength={500}
                    showCount
                />
            </FormSection>

            <FormSection title="Display Settings">
                <div className="space-y-2">
                    <label htmlFor="order" className="text-sm font-medium">Display Order</label>
                    <input
                        id="order"
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                        min={0}
                        className="w-32 px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="text-xs text-muted-foreground">Lower numbers appear first within the parent topic</p>
                </div>

                <FormCheckbox
                    label="Published"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                />
            </FormSection>

            <FormActions
                cancelHref="/admin/subtopics"
                submitLabel={isEditing ? 'Update Subtopic' : 'Create Subtopic'}
                isPending={isPending}
                submitIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            />
        </form>
    );
};
