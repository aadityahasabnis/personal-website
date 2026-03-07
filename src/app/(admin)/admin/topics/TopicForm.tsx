'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';

import { slugify } from '@/lib/utils';
import { createTopic, updateTopic } from '@/server/actions/topics';
import type { ITopic } from '@/interfaces';
import {
    FormInput,
    FormTextarea,
    FormCheckbox,
    FormSection,
    FormActions,
    FormError,
} from '@/components/admin/form';

// Icon options for topics
const ICON_OPTIONS = [
    'Code', 'Database', 'Globe', 'Server', 'Cpu', 'Terminal',
    'GitBranch', 'Layers', 'Box', 'Puzzle', 'Lightbulb', 'BookOpen',
    'FileCode', 'Braces', 'Binary', 'Network', 'Cloud', 'Shield',
];

interface ITopicFormProps {
    topic?: ITopic;
    isEditing?: boolean;
}

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

    // Auto-generate slug
    useEffect(() => {
        if (autoSlug && title) setSlug(slugify(title));
    }, [title, autoSlug]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            const data = { title, slug, description, icon, order, published, featured };
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
            <FormError message={error} />

            <FormSection title="Topic Details">
                <FormInput
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Data Structures & Algorithms"
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
                        <span className="text-sm text-muted-foreground whitespace-nowrap">/articles/</span>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
                            placeholder="dsa"
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
                    placeholder="A brief description of this topic..."
                    required
                    maxLength={500}
                    showCount
                />
            </FormSection>

            <FormSection title="Display Settings">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Icon</label>
                    <div className="flex flex-wrap gap-2">
                        {ICON_OPTIONS.map((iconName) => (
                            <button
                                key={iconName}
                                type="button"
                                onClick={() => setIcon(iconName)}
                                className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                                    icon === iconName
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'hover:border-primary/50 hover:bg-muted'
                                }`}
                            >
                                {iconName}
                            </button>
                        ))}
                    </div>
                </div>

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
                    <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                </div>

                <div className="flex flex-wrap gap-6">
                    <FormCheckbox
                        label="Published"
                        checked={published}
                        onChange={(e) => setPublished(e.target.checked)}
                    />
                    <FormCheckbox
                        label="Featured on homepage"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                    />
                </div>
            </FormSection>

            <FormActions
                cancelHref="/admin/topics"
                submitLabel={isEditing ? 'Update Topic' : 'Create Topic'}
                isPending={isPending}
                submitIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            />
        </form>
    );
};
