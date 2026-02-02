'use client';

import { useState, useTransition, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Save, X, Plus } from 'lucide-react';

// Lazy load the editor to avoid SSR issues with Monaco
const HybridEditor = lazy(() => 
    import('@/components/admin/HybridEditor').then(mod => ({ default: mod.HybridEditor }))
);

import { cn } from '@/lib/utils';
import { createProject, updateProject } from '@/server/actions/projects';
import type { IProject } from '@/interfaces';

interface IProjectFormProps {
    project?: IProject;
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

export const ProjectForm = ({ 
    project, 
    isEditing = false 
}: IProjectFormProps): React.ReactElement => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [title, setTitle] = useState(project?.title ?? '');
    const [slug, setSlug] = useState(project?.slug ?? '');
    const [description, setDescription] = useState(project?.description ?? '');
    const [longDescription, setLongDescription] = useState(project?.longDescription ?? '');
    const [coverImage, setCoverImage] = useState(project?.coverImage ?? '');
    const [techStack, setTechStack] = useState<string[]>(project?.techStack ?? []);
    const [newTech, setNewTech] = useState('');
    const [tags, setTags] = useState<string[]>(project?.tags ?? []);
    const [newTag, setNewTag] = useState('');
    const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? '');
    const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? '');
    const [status, setStatus] = useState<'active' | 'wip' | 'archived'>(project?.status ?? 'active');
    const [featured, setFeatured] = useState(project?.featured ?? false);

    const [autoSlug, setAutoSlug] = useState(!isEditing);

    const handleTitleChange = (value: string): void => {
        setTitle(value);
        if (autoSlug) {
            setSlug(generateSlug(value));
        }
    };

    const handleAddTech = (): void => {
        const trimmedTech = newTech.trim();
        if (trimmedTech && !techStack.includes(trimmedTech)) {
            setTechStack([...techStack, trimmedTech]);
            setNewTech('');
        }
    };

    const handleRemoveTech = (techToRemove: string): void => {
        setTechStack(techStack.filter((tech) => tech !== techToRemove));
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
                longDescription,
                coverImage: coverImage || undefined,
                techStack,
                tags,
                githubUrl: githubUrl || undefined,
                liveUrl: liveUrl || undefined,
                status,
                featured,
                order: project?.order ?? 0,
            };

            const result = isEditing && project
                ? await updateProject(project.slug, data)
                : await createProject(data);

            if (result.success) {
                router.push('/admin/projects');
                router.refresh();
            } else {
                setError(result.error ?? 'Something went wrong');
            }
        });
    };

    const wordCount = longDescription.trim().split(/\s+/).filter(Boolean).length;

    // Editor wrapper component to handle loading state
    const HybridEditorWrapper = ({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) => (
        <Suspense fallback={
            <div className="flex items-center justify-center h-[600px] border rounded-lg bg-muted/30">
                <div className="text-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">Loading editor...</p>
                </div>
            </div>
        }>
            <HybridEditor
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                height="600px"
            />
        </Suspense>
    );

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
                    placeholder="e.g., Personal Portfolio Website"
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
                        /projects/
                    </span>
                    <input
                        id="slug"
                        type="text"
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setAutoSlug(false);
                        }}
                        placeholder="personal-portfolio-website"
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
                    Short Description <span className="text-destructive">*</span>
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief summary of this project..."
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
                    {description.length}/160 characters (used for SEO and project cards)
                </p>
            </div>

            {/* Long Description */}
            <div>
                <label htmlFor="longDescription" className="block text-sm font-medium mb-2">
                    Full Description <span className="text-destructive">*</span>
                </label>
                <HybridEditorWrapper
                    value={longDescription}
                    onChange={setLongDescription}
                    placeholder="Write a detailed description of this project (Markdown supported)..."
                />
                <p className="mt-1 text-xs text-muted-foreground">
                    {wordCount} words
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
                    placeholder="https://example.com/project-screenshot.jpg"
                    className={cn(
                        'w-full rounded-lg border border-border bg-background px-4 py-2.5',
                        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                        'placeholder:text-muted-foreground transition-colors'
                    )}
                />
            </div>

            {/* Tech Stack */}
            <div>
                <label htmlFor="techStack" className="block text-sm font-medium mb-2">
                    Tech Stack <span className="text-destructive">*</span>
                </label>
                <div className="flex items-center gap-2">
                    <input
                        id="techStack"
                        type="text"
                        value={newTech}
                        onChange={(e) => setNewTech(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddTech();
                            }
                        }}
                        placeholder="e.g., Next.js, TypeScript, Tailwind CSS"
                        className={cn(
                            'flex-1 rounded-lg border border-border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                            'placeholder:text-muted-foreground transition-colors'
                        )}
                    />
                    <button
                        type="button"
                        onClick={handleAddTech}
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
                {techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {techStack.map((tech) => (
                            <span
                                key={tech}
                                className="inline-flex items-center gap-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 px-3 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-400"
                            >
                                {tech}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveTech(tech)}
                                    className="hover:text-destructive transition-colors"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
                {techStack.length === 0 && (
                    <p className="mt-1 text-xs text-destructive">
                        At least one technology is required
                    </p>
                )}
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

            {/* URLs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GitHub URL */}
                <div>
                    <label htmlFor="githubUrl" className="block text-sm font-medium mb-2">
                        GitHub URL (optional)
                    </label>
                    <input
                        id="githubUrl"
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username/repo"
                        className={cn(
                            'w-full rounded-lg border border-border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                            'placeholder:text-muted-foreground transition-colors'
                        )}
                    />
                </div>

                {/* Live URL */}
                <div>
                    <label htmlFor="liveUrl" className="block text-sm font-medium mb-2">
                        Live URL (optional)
                    </label>
                    <input
                        id="liveUrl"
                        type="url"
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        placeholder="https://project-demo.com"
                        className={cn(
                            'w-full rounded-lg border border-border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                            'placeholder:text-muted-foreground transition-colors'
                        )}
                    />
                </div>
            </div>

            {/* Status & Featured */}
            <div className="flex items-center gap-6">
                {/* Status */}
                <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-2">
                        Status
                    </label>
                    <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as 'active' | 'wip' | 'archived')}
                        className={cn(
                            'rounded-lg border border-border bg-background px-4 py-2.5',
                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary',
                            'transition-colors'
                        )}
                    >
                        <option value="active">Active</option>
                        <option value="wip">Work in Progress</option>
                        <option value="archived">Archived</option>
                    </select>
                </div>

                {/* Featured Toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Featured Project</span>
                </label>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-4 border-t border-border">
                <button
                    type="submit"
                    disabled={isPending || techStack.length === 0}
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
                            {isEditing ? 'Update Project' : 'Create Project'}
                        </>
                    )}
                </button>
                <Link
                    href="/admin/projects"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
};
