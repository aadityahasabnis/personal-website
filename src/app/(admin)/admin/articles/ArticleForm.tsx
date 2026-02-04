"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { type MDXEditorMethods } from "@mdxeditor/editor";

import { cn } from "@/lib/utils";
import { createArticle, updateArticle } from "@/server/actions/articles";
import type { IArticle, ITopic, ISubtopic } from "@/interfaces";
import { ForwardRefEditor } from "@/components/mdx/ForwardRefEditor";

// Import MDX editor CSS like project-use-lexical
import "@/styles/mdx-editor.css";

interface IArticleFormProps {
  article?: IArticle;
  topics: ITopic[];
  allSubtopics: ISubtopic[];
  isEditing?: boolean;
}

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
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
  isEditing = false,
}: IArticleFormProps): React.ReactElement => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const mdxEditorRef = useRef<MDXEditorMethods>(null);

  // Form state
  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [topicSlug, setTopicSlug] = useState(article?.topicSlug ?? "");
  const [subtopicSlug, setSubtopicSlug] = useState(article?.subtopicSlug ?? "");
  const [description, setDescription] = useState(article?.description ?? "");
  const [markdownBody, setMarkdownBody] = useState(article?.body ?? "");

  const [tags, setTags] = useState<string[]>(article?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "");
  const [order, setOrder] = useState(article?.order ?? 0);
  const [published, setPublished] = useState(article?.published ?? false);
  const [featured, setFeatured] = useState(article?.featured ?? false);

  // SEO fields
  const [seoTitle, setSeoTitle] = useState(article?.seo?.title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    article?.seo?.description ?? "",
  );
  const [seoKeywords, setSeoKeywords] = useState<string[]>(
    article?.seo?.keywords ?? [],
  );
  const [seoKeywordInput, setSeoKeywordInput] = useState("");
  const [ogImage, setOgImage] = useState(article?.seo?.ogImage ?? "");

  const [autoSlug, setAutoSlug] = useState(!isEditing);

  // Filter subtopics based on selected topic
  const availableSubtopics = allSubtopics.filter(
    (st) => st.topicSlug === topicSlug,
  );

  // Calculate stats
  const stats = {
    wordCount: markdownBody.trim().split(/\s+/).filter(Boolean).length,
    readingTime: calculateReadingTime(markdownBody),
  };

  // Reset subtopic if topic changes
  useEffect(() => {
    if (topicSlug) {
      const hasValidSubtopic = availableSubtopics.find(
        (st) => st.slug === subtopicSlug,
      );
      if (!hasValidSubtopic && subtopicSlug) {
        setSubtopicSlug("");
      }
    }
  }, [topicSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && title) {
      const newSlug = generateSlug(title);
      if (newSlug !== slug) {
        setSlug(newSlug);
      }
    }
  }, [title, autoSlug]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }
    if (!topicSlug) {
      setError("Topic is required");
      return;
    }
    if (!markdownBody.trim()) {
      setError("Article content is required");
      return;
    }

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
          keywords: seoKeywords.length > 0 ? seoKeywords : undefined,
          ogImage: ogImage || undefined,
        },
      };

      try {
        let result;
        if (isEditing && article) {
          result = await updateArticle(article.topicSlug, article.slug, data);
        } else {
          result = await createArticle(data);
        }

        if (result.success) {
          router.push("/admin/articles");
          router.refresh();
        } else {
          setError(result.error ?? "Failed to save article");
        }
      } catch (err) {
        console.error("Error saving article:", err);
        setError("An unexpected error occurred");
      }
    });
  };

  // Tag handlers
  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // SEO Keyword handlers
  const handleAddKeyword = () => {
    if (
      seoKeywordInput.trim() &&
      !seoKeywords.includes(seoKeywordInput.trim())
    ) {
      setSeoKeywords([...seoKeywords, seoKeywordInput.trim()]);
      setSeoKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setSeoKeywords(seoKeywords.filter((kw) => kw !== keywordToRemove));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Articles
          </Link>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Edit Article" : "Create New Article"}
          </h1>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="space-y-6 p-6 border rounded-lg bg-card">
          <h2 className="text-lg font-semibold">Basic Information</h2>

          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Enter article title"
              required
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="slug" className="text-sm font-medium">
                Slug <span className="text-destructive">*</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={autoSlug}
                  onChange={(e) => setAutoSlug(e.target.checked)}
                  className="rounded"
                />
                Auto-generate
              </label>
            </div>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              disabled={autoSlug}
              className={cn(
                "w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring",
                autoSlug && "opacity-50 cursor-not-allowed",
              )}
              placeholder="article-slug"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-destructive">*</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-25"
              placeholder="Brief description of the article"
              required
            />
            <p className="text-xs text-muted-foreground">
              {description.length} characters
            </p>
          </div>

          {/* Topic & Subtopic */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="topic" className="text-sm font-medium">
                Topic <span className="text-destructive">*</span>
              </label>
              <select
                id="topic"
                value={topicSlug}
                onChange={(e) => setTopicSlug(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
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

            <div className="space-y-2">
              <label htmlFor="subtopic" className="text-sm font-medium">
                Subtopic
              </label>
              <select
                id="subtopic"
                value={subtopicSlug}
                onChange={(e) => setSubtopicSlug(e.target.value)}
                disabled={!topicSlug || availableSubtopics.length === 0}
                className={cn(
                  "w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring",
                  (!topicSlug || availableSubtopics.length === 0) &&
                    "opacity-50 cursor-not-allowed",
                )}
              >
                <option value="">No subtopic</option>
                {availableSubtopics.map((subtopic) => (
                  <option key={subtopic.slug} value={subtopic.slug}>
                    {subtopic.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Order */}
          <div className="space-y-2">
            <label htmlFor="order" className="text-sm font-medium">
              Order
            </label>
            <input
              id="order"
              type="number"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              Display order within topic/subtopic
            </p>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label htmlFor="tag-input" className="text-sm font-medium">
              Tags
            </label>
            <div className="flex gap-2">
              <input
                id="tag-input"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddTag())
                }
                className="flex-1 px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label htmlFor="coverImage" className="text-sm font-medium">
              Cover Image URL
            </label>
            <input
              id="coverImage"
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Flags */}
          <div className="flex gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded"
              />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded"
              />
              Featured
            </label>
          </div>
        </div>

        {/* Content Editor */}
        <div className="space-y-4 p-6 border rounded-lg bg-card">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Content</h2>
            <div className="text-sm text-muted-foreground">
              {stats.wordCount} words · {stats.readingTime} min read
            </div>
          </div>

          <ForwardRefEditor
            ref={mdxEditorRef}
            markdown={markdownBody}
            onChange={setMarkdownBody}
            placeholder="Start writing your article in MDX format..."
            contentEditableClassName="prose prose-slate max-w-none"
          />
        </div>

        {/* SEO Section */}
        <div className="space-y-6 p-6 border rounded-lg bg-card">
          <h2 className="text-lg font-semibold">SEO Settings</h2>

          {/* SEO Title */}
          <div className="space-y-2">
            <label htmlFor="seoTitle" className="text-sm font-medium">
              SEO Title
            </label>
            <input
              id="seoTitle"
              type="text"
              value={seoTitle}
              onChange={(e) => setSeoTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Leave empty to use article title"
            />
          </div>

          {/* SEO Description */}
          <div className="space-y-2">
            <label htmlFor="seoDescription" className="text-sm font-medium">
              SEO Description
            </label>
            <textarea
              id="seoDescription"
              value={seoDescription}
              onChange={(e) => setSeoDescription(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring min-h-20"
              placeholder="Leave empty to use article description"
            />
          </div>

          {/* SEO Keywords */}
          <div className="space-y-2">
            <label htmlFor="keyword-input" className="text-sm font-medium">
              SEO Keywords
            </label>
            <div className="flex gap-2">
              <input
                id="keyword-input"
                type="text"
                value={seoKeywordInput}
                onChange={(e) => setSeoKeywordInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddKeyword())
                }
                className="flex-1 px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Add a keyword"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
            {seoKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {seoKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {kw}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(kw)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* OG Image */}
          <div className="space-y-2">
            <label htmlFor="ogImage" className="text-sm font-medium">
              Open Graph Image URL
            </label>
            <input
              id="ogImage"
              type="url"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://example.com/og-image.jpg"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/admin/articles"
            className="px-6 py-2 border rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors",
              isPending && "opacity-50 cursor-not-allowed",
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
                {isEditing ? "Update Article" : "Create Article"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
