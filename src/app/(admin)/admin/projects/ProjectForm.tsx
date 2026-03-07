'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';

import { slugify } from '@/lib/utils';
import { createProject, updateProject } from '@/server/actions/projects';
import type { IProject } from '@/interfaces';
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

interface IProjectFormProps {
    project?: IProject;
    isEditing?: boolean;
}

const STATUS_OPTIONS = [
    { value: 'active', label: 'Active' },
    { value: 'wip', label: 'Work in Progress' },
    { value: 'archived', label: 'Archived' },
];

export const ProjectForm = ({ project, isEditing = false }: IProjectFormProps): React.ReactElement => {
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
    const [tags, setTags] = useState<string[]>(project?.tags ?? []);
    const [githubUrl, setGithubUrl] = useState(project?.githubUrl ?? '');
    const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? '');
    const [status, setStatus] = useState<string>(project?.status ?? 'active');
    const [featured, setFeatured] = useState(project?.featured ?? false);
    const [autoSlug, setAutoSlug] = useState(!isEditing);

    // Auto-generate slug
    useEffect(() => {
        if (autoSlug && title) setSlug(slugify(title));
    }, [title, autoSlug]);

    // Word count
    const wordCount = useMemo(() => 
        longDescription.trim().split(/\s+/).filter(Boolean).length, 
        [longDescription]
    );

    // Submit handler
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (techStack.length === 0) {
            setError('At least one technology is required');
            return;
        }

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
                status: status as 'active' | 'wip' | 'archived',
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <FormError message={error} />

            <FormSection title="Project Details">
                <FormInput
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Personal Portfolio Website"
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
                        <span className="text-sm text-muted-foreground whitespace-nowrap">/projects/</span>
                        <input
                            type="text"
                            value={slug}
                            onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
                            placeholder="personal-portfolio-website"
                            required
                            pattern="^[a-z0-9-]+$"
                            className="flex-1 px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens only</p>
                </div>

                <FormTextarea
                    label="Short Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A brief summary of this project..."
                    required
                    maxLength={160}
                    showCount
                    hint="Used for SEO and project cards"
                />
            </FormSection>

            <FormSection title="Long Description">
                <RichTextEditor
                    value={longDescription}
                    onChange={setLongDescription}
                    onSave={(html) => setLongDescription(html)}
                    placeholder="Write detailed project description… press '/' for commands"
                    minHeight="400px"
                />
                <p className="text-xs text-muted-foreground">{wordCount} words</p>
            </FormSection>

            <FormSection title="Media & Tech">
                <FormInput
                    label="Cover Image URL"
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://example.com/project-screenshot.jpg"
                />

                <TagInput
                    label="Tech Stack"
                    tags={techStack}
                    onChange={setTechStack}
                    placeholder="e.g., Next.js, TypeScript, Tailwind CSS"
                />
                {techStack.length === 0 && (
                    <p className="text-xs text-destructive">At least one technology is required</p>
                )}

                <TagInput label="Tags" tags={tags} onChange={setTags} placeholder="Add a tag" />
            </FormSection>

            <FormSection title="Links & Status">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="GitHub URL"
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        placeholder="https://github.com/username/repo"
                    />
                    <FormInput
                        label="Live URL"
                        type="url"
                        value={liveUrl}
                        onChange={(e) => setLiveUrl(e.target.value)}
                        placeholder="https://project-demo.com"
                    />
                </div>

                <div className="flex items-center gap-6">
                    <FormSelect
                        label="Status"
                        value={status}
                        onChange={setStatus}
                        options={STATUS_OPTIONS}
                    />
                    <div className="pt-6">
                        <FormCheckbox
                            label="Featured Project"
                            checked={featured}
                            onChange={(e) => setFeatured(e.target.checked)}
                        />
                    </div>
                </div>
            </FormSection>

            <FormActions
                cancelHref="/admin/projects"
                submitLabel={isEditing ? 'Update Project' : 'Create Project'}
                isPending={isPending || techStack.length === 0}
                submitIcon={isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            />
        </form>
    );
};
