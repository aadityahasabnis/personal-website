'use client';

import { useState, useTransition, useEffect, lazy, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Code, Type, Eye } from 'lucide-react';
import type { YooptaContentValue } from '@yoopta/editor';

import { cn } from '@/lib/utils';
import { createArticle, updateArticle } from '@/server/actions/articles';
import type { IArticle, ITopic, ISubtopic, EditorType } from '@/interfaces';
import { extractPlainText, getContentStats, markdownToYooptaContent, isContentEmpty } from '@/lib/editor';

// Lazy load editors to avoid SSR issues
const HybridEditor = lazy(() => 
    import('@/components/admin/HybridEditor').then(mod => ({ default: mod.HybridEditor }))
);

const YooptaRichEditor = lazy(() => 
    import('@/components/common/YooptaRichEditor').then(mod => ({ default: mod.YooptaRichEditor }))
);

interface IArticleFormProps {
    article?: IArticle;
    topics: ITopic[];
    allSubtopics: ISubtopic[];
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

const calculateReadingTime = (text: string): number => {
    const wordsPerMinute = 200;
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

export const ArticleForm = ({ 
    article, 
    topics, 
    allSubtopics, 
    isEditing = false 
}: IArticleFormProps): React.ReactElement => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Editor type state - 'yoopta' is the new default for new articles
    const [editorType, setEditorType] = useState<EditorType>(
        article?.editorType || (isEditing ? 'markdown' : 'yoopta')
    );

    // Form state
    const [title, setTitle] = useState(article?.title ?? '');
    const [slug, setSlug] = useState(article?.slug ?? '');
    const [topicSlug, setTopicSlug] = useState(article?.topicSlug ?? '');
    const [subtopicSlug, setSubtopicSlug] = useState(article?.subtopicSlug ?? '');
    const [description, setDescription] = useState(article?.description ?? '');
    
    // Content state - supports both markdown and Yoopta
    const [markdownBody, setMarkdownBody] = useState(article?.body ?? '');
    const [yooptaContent, setYooptaContent] = useState<YooptaContentValue>(
        article?.content ?? {}
    );
    
    const [tags, setTags] = useState<string[]>(article?.tags ?? []);
    const [tagInput, setTagInput] = useState('');
    const [coverImage, setCoverImage] = useState(article?.coverImage ?? '');
    const [order, setOrder] = useState(article?.order ?? 0);
    const [published, setPublished] = useState(article?.published ?? false);
    const [featured, setFeatured] = useState(article?.featured ?? false);
    
    // SEO fields
    const [seoTitle, setSeoTitle] = useState(article?.seo?.title ?? '');
    const [seoDescription, setSeoDescription] = useState(article?.seo?.description ?? '');
    const [seoKeywords, setSeoKeywords] = useState<string[]>(article?.seo?.keywords ?? []);
    const [seoKeywordInput, setSeoKeywordInput] = useState('');
    const [ogImage, setOgImage] = useState(article?.seo?.ogImage ?? '');

    const [autoSlug, setAutoSlug] = useState(!isEditing);

    // Filter subtopics based on selected topic
    const availableSubtopics = allSubtopics.filter(st => st.topicSlug === topicSlug);

    // Calculate stats based on editor type
    const stats = editorType === 'yoopta' 
        ? getContentStats(yooptaContent)
        : {
            wordCount: markdownBody.trim().split(/\s+/).filter(Boolean).length,
            readingTime: calculateReadingTime(markdownBody),
        };

    // Handle editor type switch
    const handleEditorTypeChange = useCallback((newType: EditorType) => {
        if (newType === editorType) return;

        // Warn about data conversion
        if (editorType === 'markdown' && newType === 'yoopta' && markdownBody.trim()) {
            const shouldConvert = window.confirm(
                'Would you like to convert your existing markdown content to the rich editor? ' +
                'Note: Some complex formatting may not convert perfectly.'
            );
            
            if (shouldConvert) {
                const converted = markdownToYooptaContent(markdownBody);
                setYooptaContent(converted);
            }
        } else if (editorType === 'yoopta' && newType === 'markdown' && !isContentEmpty(yooptaContent)) {
            const plainText = extractPlainText(yooptaContent);
            setMarkdownBody(plainText);
        }

        setEditorType(newType);
    }, [editorType, markdownBody, yooptaContent]);

    // Editor loading wrapper
    const EditorLoadingFallback = () => (
        <div className="flex items-center justify-center h-[600px] border rounded-lg bg-muted/30">
            <div className="text-center space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Loading editor...</p>
            </div>
        </div>
    );

    // Reset subtopic if topic changes
    useEffect(() => {
        if (topicSlug && !availableSubtopics.find(st => st.slug === subtopicSlug)) {
            setSubtopicSlug('');
        }
    }, [topicSlug, subtopicSlug, availableSubtopics]);

    const handleTitleChange = (value: string): void => {
        setTitle(value);
        if (autoSlug) {
            setSlug(generateSlug(value));
        }
    };

    const handleAddTag = (): void => {
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove: string): void => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleAddKeyword = (): void => {
        const trimmed = seoKeywordInput.trim();
        if (trimmed && !seoKeywords.includes(trimmed)) {
            setSeoKeywords([...seoKeywords, trimmed]);
            setSeoKeywordInput('');
        }
    };

    const handleRemoveKeyword = (keywordToRemove: string): void => {
        setSeoKeywords(seoKeywords.filter(keyword => keyword !== keywordToRemove));
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError(null);

        if (!topicSlug) {
            setError('Please select a topic');
            return;
        }

        // Validate content based on editor type
        if (editorType === 'yoopta') {
            if (isContentEmpty(yooptaContent)) {
                setError('Please add some content to the article');
                return;
            }
        } else {
            if (markdownBody.trim().length < 100) {
                setError('Article body must be at least 100 characters');
                return;
            }
        }

        startTransition(async () => {
            // Prepare body - for yoopta, extract plain text as fallback
            const body = editorType === 'yoopta' 
                ? extractPlainText(yooptaContent)
                : markdownBody;

            const data = {
                title,
                slug,
                topicSlug,
                subtopicSlug: subtopicSlug || undefined,
                description,
                body,
                content: editorType === 'yoopta' ? yooptaContent : undefined,
                editorType,
                tags: tags.length > 0 ? tags : undefined,
                coverImage: coverImage || undefined,
                order,
                readingTime: stats.readingTime,
                seo: {
                    title: seoTitle || undefined,
                    description: seoDescription || undefined,
                    keywords: seoKeywords.length > 0 ? seoKeywords : undefined,
                    ogImage: ogImage || undefined,
                },
            };

            const result = isEditing && article
                ? await updateArticle(article.topicSlug, article.slug, data)
                : await createArticle(data);

            if (result.success) {
                router.push('/admin/articles');
                router.refresh();
            } else {
                setError(result.error ?? 'Something went wrong');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Basic Info Section */}
            <div className="space-y-6 rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Basic Information</h3>

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
                        placeholder="e.g., Introduction to Binary Search"
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
                            placeholder="binary-search"
                            className={cn(
                                'flex-1 rounded-lg border bg-background px-4 py-2.5',
                                'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                                'placeholder:text-muted-foreground'
                            )}
                            required
                            pattern="^[a-z0-9-]+$"
                            minLength={3}
                            maxLength={100}
                        />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Lowercase letters, numbers, and hyphens only
                    </p>
                </div>

                {/* Topic */}
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium mb-2">
                        Topic <span className="text-destructive">*</span>
                    </label>
                    <select
                        id="topic"
                        value={topicSlug}
                        onChange={(e) => setTopicSlug(e.target.value)}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                        )}
                        required
                    >
                        <option value="">Select a topic</option>
                        {topics.map((topic) => (
                            <option key={topic.slug} value={topic.slug}>
                                {topic.title}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Subtopic (optional) */}
                {availableSubtopics.length > 0 && (
                    <div>
                        <label htmlFor="subtopic" className="block text-sm font-medium mb-2">
                            Subtopic (optional)
                        </label>
                        <select
                            id="subtopic"
                            value={subtopicSlug}
                            onChange={(e) => setSubtopicSlug(e.target.value)}
                            className={cn(
                                'w-full rounded-lg border bg-background px-4 py-2.5',
                                'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                            )}
                        >
                            <option value="">None</option>
                            {availableSubtopics.map((subtopic) => (
                                <option key={subtopic.slug} value={subtopic.slug}>
                                    {subtopic.title}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Description */}
                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2">
                        Description <span className="text-destructive">*</span>
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="A brief description that appears in article cards and meta tags..."
                        rows={3}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                            'placeholder:text-muted-foreground resize-none'
                        )}
                        required
                        maxLength={160}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description.length}/160 characters
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
                        placeholder="https://..."
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                            'placeholder:text-muted-foreground'
                        )}
                    />
                </div>

                {/* Tags */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Tags
                    </label>
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddTag();
                                    }
                                }}
                                placeholder="Add a tag..."
                                className={cn(
                                    'flex-1 rounded-lg border bg-background px-4 py-2.5',
                                    'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                                    'placeholder:text-muted-foreground'
                                )}
                            />
                            <button
                                type="button"
                                onClick={handleAddTag}
                                className="rounded-lg border px-4 py-2.5 hover:bg-muted transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        {tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-sm"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-destructive"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
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
            </div>

            {/* Content Section */}
            <div className="space-y-6 rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h3 className="text-lg font-semibold">Content</h3>
                    
                    {/* Editor Type Selector */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{stats.wordCount} words</span>
                            <span>·</span>
                            <span>{stats.readingTime} min read</span>
                        </div>
                        
                        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                            <button
                                type="button"
                                onClick={() => handleEditorTypeChange('yoopta')}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                                    editorType === 'yoopta'
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                )}
                                title="Rich Text Editor (Recommended)"
                            >
                                <Type className="h-4 w-4" />
                                <span className="hidden sm:inline">Rich Editor</span>
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => handleEditorTypeChange('markdown')}
                                className={cn(
                                    'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                                    editorType === 'markdown'
                                        ? 'bg-background shadow-sm text-foreground'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                )}
                                title="Markdown Editor"
                            >
                                <Code className="h-4 w-4" />
                                <span className="hidden sm:inline">Markdown</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Editor Content */}
                <div>
                    <label className="block text-sm font-medium mb-3">
                        Article Body <span className="text-destructive">*</span>
                    </label>
                    
                    <Suspense fallback={<EditorLoadingFallback />}>
                        {editorType === 'yoopta' ? (
                            <YooptaRichEditor
                                value={yooptaContent}
                                onChange={setYooptaContent}
                                placeholder="Start writing your article... Type / for commands"
                                height="600px"
                                showStats={false}
                            />
                        ) : (
                            <HybridEditor
                                value={markdownBody}
                                onChange={setMarkdownBody}
                                placeholder="Start writing your article..."
                                height="600px"
                            />
                        )}
                    </Suspense>
                    
                    <p className="mt-2 text-xs text-muted-foreground">
                        {editorType === 'yoopta' 
                            ? 'Use the rich editor above. Type / to see available blocks like headings, images, tables, and more.'
                            : 'Use the markdown editor above. Minimum 100 characters required.'}
                    </p>
                </div>
            </div>

            {/* SEO Section */}
            <div className="space-y-6 rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">SEO & Metadata</h3>

                {/* SEO Title */}
                <div>
                    <label htmlFor="seoTitle" className="block text-sm font-medium mb-2">
                        SEO Title (optional)
                    </label>
                    <input
                        id="seoTitle"
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder={title || 'Leave empty to use article title'}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                            'placeholder:text-muted-foreground'
                        )}
                        maxLength={100}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        {seoTitle.length}/100 characters
                    </p>
                </div>

                {/* SEO Description */}
                <div>
                    <label htmlFor="seoDescription" className="block text-sm font-medium mb-2">
                        SEO Description (optional)
                    </label>
                    <textarea
                        id="seoDescription"
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder={description || 'Leave empty to use article description'}
                        rows={2}
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                            'placeholder:text-muted-foreground resize-none'
                        )}
                        maxLength={160}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                        {seoDescription.length}/160 characters
                    </p>
                </div>

                {/* SEO Keywords */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        SEO Keywords (optional)
                    </label>
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={seoKeywordInput}
                                onChange={(e) => setSeoKeywordInput(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddKeyword();
                                    }
                                }}
                                placeholder="Add a keyword..."
                                className={cn(
                                    'flex-1 rounded-lg border bg-background px-4 py-2.5',
                                    'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                                    'placeholder:text-muted-foreground'
                                )}
                            />
                            <button
                                type="button"
                                onClick={handleAddKeyword}
                                className="rounded-lg border px-4 py-2.5 hover:bg-muted transition-colors"
                            >
                                Add
                            </button>
                        </div>
                        {seoKeywords.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {seoKeywords.map((keyword) => (
                                    <span
                                        key={keyword}
                                        className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-sm"
                                    >
                                        {keyword}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveKeyword(keyword)}
                                            className="hover:text-destructive"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* OG Image */}
                <div>
                    <label htmlFor="ogImage" className="block text-sm font-medium mb-2">
                        Open Graph Image URL (optional)
                    </label>
                    <input
                        id="ogImage"
                        type="url"
                        value={ogImage}
                        onChange={(e) => setOgImage(e.target.value)}
                        placeholder="https://..."
                        className={cn(
                            'w-full rounded-lg border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                            'placeholder:text-muted-foreground'
                        )}
                    />
                </div>
            </div>

            {/* Publishing Options */}
            <div className="space-y-6 rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Publishing Options</h3>

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
                        <span className="text-sm">Featured</span>
                    </label>
                </div>
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
                            {isEditing ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        <>
                            <Save className="h-4 w-4" />
                            {isEditing ? 'Update Article' : 'Create Article'}
                        </>
                    )}
                </button>
                <Link
                    href="/admin/articles"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
};
