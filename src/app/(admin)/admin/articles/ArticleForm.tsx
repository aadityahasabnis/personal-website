'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

import { calculateReadingTime, slugify } from '@/lib/utils';
import { createArticle, updateArticle } from '@/server/actions/articles';
import type { IArticle, ITopic, ISubtopic } from '@/interfaces/schema';
import { RichTextEditor } from '@/components/admin/RichTextEditor';
import {
    FormInput,
    FormTextarea,
    FormSelect,
    FormCheckbox,
    TagInput,
    FormSection,
    FormActions,
    FormError,
} from '@/components/admin/form';

interface IArticleFormProps {
    article?: IArticle;
    topics: ITopic[];
    allSubtopics: ISubtopic[];
    isEditing?: boolean;
}

export const ArticleForm = ({ article, topics, allSubtopics, isEditing = false }: IArticleFormProps): React.ReactElement => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState(article?.title ?? '');
    const [slug, setSlug] = useState(article?.slug ?? '');
    const [topicSlug, setTopicSlug] = useState(article?.topicSlug ?? '');
    const [subtopicSlug, setSubtopicSlug] = useState(article?.subtopicSlug ?? '');
    const [description, setDescription] = useState(article?.description ?? '');
    const [markdownBody, setMarkdownBody] = useState(article?.body ?? '');
    const [tags, setTags] = useState<string[]>(article?.tags ?? []);
    const [coverImage, setCoverImage] = useState(article?.coverImage ?? '');
    const [order, setOrder] = useState(article?.order ?? 0);
    const [published, setPublished] = useState(article?.published ?? false);
    const [featured, setFeatured] = useState(article?.featured ?? false);

    // SEO state
    const [seoTitle, setSeoTitle] = useState(article?.seo?.title ?? '');
    const [seoDescription, setSeoDescription] = useState(article?.seo?.description ?? '');
    const [seoKeywords, setSeoKeywords] = useState<string[]>(article?.seo?.keywords ?? []);
    const [ogImage, setOgImage] = useState(article?.seo?.ogImage ?? '');

    const [autoSlug, setAutoSlug] = useState(!isEditing);

    // Computed values
    const availableSubtopics = useMemo(() =>
        allSubtopics.filter((st) => st.topicSlug === topicSlug),
        [allSubtopics, topicSlug]
    );

    const topicOptions = useMemo(() =>
        topics.map((t) => ({ value: t.slug, label: t.title })),
        [topics]
    );

    const subtopicOptions = useMemo(() =>
        availableSubtopics.map((st) => ({ value: st.slug, label: st.title })),
        [availableSubtopics]
    );

    const stats = useMemo(() => ({
        wordCount: markdownBody.trim().split(/\s+/).filter(Boolean).length,
        readingTime: calculateReadingTime(markdownBody),
    }), [markdownBody]);

    // Reset subtopic when topic changes
    useEffect(() => {
        if (topicSlug && subtopicSlug) {
            const hasValid = availableSubtopics.some((st) => st.slug === subtopicSlug);
            if (!hasValid) setSubtopicSlug('');
        }
    }, [topicSlug, subtopicSlug, availableSubtopics]);

    // Auto-generate slug from title
    useEffect(() => {
        if (autoSlug && title) setSlug(slugify(title));
    }, [title, autoSlug]);

    // Form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!title.trim()) return setError('Title is required');
        if (!slug.trim()) return setError('Slug is required');
        if (!description.trim()) return setError('Description is required');
        if (!topicSlug) return setError('Topic is required');
        if (!markdownBody.trim()) return setError('Article content is required');

        startTransition(async () => {
            const data = {
                title,
                slug,
                description,
                topicSlug,
                subtopicSlug: subtopicSlug || undefined,
                body: markdownBody,
                tags,
                coverImage: coverImage || undefined,
                order,
                readingTime: stats.readingTime,
                seo: {
                    title: seoTitle || undefined,
                    description: seoDescription || undefined,
                    keywords: seoKeywords.length ? seoKeywords : undefined,
                    ogImage: ogImage || undefined,
                },
            };

            try {
                const result = isEditing && article
                    ? await updateArticle(article.topicSlug, article.slug, data)
                    : await createArticle(data);

                if (result.success) {
                    router.push('/admin/articles');
                    router.refresh();
                } else {
                    setError(result.error ?? 'Failed to save article');
                }
            } catch {
                setError('An unexpected error occurred');
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/articles"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Articles
                </Link>
                <h1 className="text-2xl font-bold">{isEditing ? 'Edit Article' : 'Create New Article'}</h1>
            </div>

            <FormError message={error} />

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Info */}
                <FormSection title="Basic Information">
                    <FormInput
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter article title"
                        required
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
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            disabled={autoSlug}
                            placeholder="article-slug"
                            required
                            className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                    </div>

                    <FormTextarea
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of the article"
                        showCount
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormSelect
                            label="Topic"
                            value={topicSlug}
                            onChange={setTopicSlug}
                            options={topicOptions}
                            placeholder="Select a topic"
                            required
                        />
                        <FormSelect
                            label="Subtopic"
                            value={subtopicSlug}
                            onChange={setSubtopicSlug}
                            options={subtopicOptions}
                            placeholder="No subtopic"
                            disabled={!topicSlug || !availableSubtopics.length}
                        />
                    </div>

                    <FormInput
                        label="Order"
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                        hint="Display order within topic/subtopic"
                        min={0}
                    />

                    <TagInput label="Tags" tags={tags} onChange={setTags} placeholder="Add a tag" />

                    <FormInput
                        label="Cover Image URL"
                        type="url"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                    />

                    <div className="flex gap-6">
                        <FormCheckbox label="Published" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                        <FormCheckbox label="Featured" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                    </div>
                </FormSection>

                {/* Content Editor */}
                <FormSection title="Content">
                    <div className="flex items-center justify-between -mt-2 mb-4">
                        <span className="text-sm text-muted-foreground">
                            {stats.wordCount} words · {stats.readingTime} min read
                        </span>
                    </div>
                    <RichTextEditor
                        value={markdownBody}
                        onChange={setMarkdownBody}
                        onSave={(html) => setMarkdownBody(html)}
                        placeholder="Start writing your article… press '/' for commands"
                        minHeight="500px"
                    />
                </FormSection>

                {/* SEO Section */}
                <FormSection title="SEO Settings">
                    <FormInput
                        label="SEO Title"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Leave empty to use article title"
                    />
                    <FormTextarea
                        label="SEO Description"
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Leave empty to use article description"
                    />
                    <TagInput label="SEO Keywords" tags={seoKeywords} onChange={setSeoKeywords} placeholder="Add a keyword" />
                    <FormInput
                        label="Open Graph Image URL"
                        type="url"
                        value={ogImage}
                        onChange={(e) => setOgImage(e.target.value)}
                        placeholder="https://example.com/og-image.jpg"
                    />
                </FormSection>

                {/* Actions */}
                <FormActions
                    cancelHref="/admin/articles"
                    submitLabel={isEditing ? 'Update Article' : 'Create Article'}
                    isPending={isPending}
                    submitIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                />
            </form>
        </div>
    );
};
