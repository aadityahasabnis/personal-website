import { notFound } from 'next/navigation';
import { ArrowLeft, Layers } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/admin';
import { SubtopicForm } from '../../../SubtopicForm';
import { getSubtopicForEdit } from '@/server/queries/admin';
import { getAllTopics } from '@/server/queries/topics';

interface EditSubtopicPageProps {
    params: Promise<{
        topicSlug: string;
        slug: string;
    }>;
}

async function getFormData(topicSlug: string, slug: string) {
    const [subtopic, topics] = await Promise.all([
        getSubtopicForEdit(topicSlug, slug),
        getAllTopics(),
    ]);

    if (!subtopic) {
        notFound();
    }

    return { subtopic, topics };
}

export default async function EditSubtopicPage({ params }: EditSubtopicPageProps) {
    const { topicSlug, slug } = await params;
    const { subtopic, topics } = await getFormData(topicSlug, slug);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/subtopics"
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-background p-2 hover:bg-muted transition-colors"
                    aria-label="Back to subtopics"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="flex-1">
                    <PageHeader
                        title={`Edit: ${subtopic.title}`}
                        description={`Last updated ${new Date(subtopic.updatedAt).toLocaleDateString()}`}
                        icon={Layers}
                    />
                </div>
            </div>

            {/* Form */}
            <div className="max-w-2xl">
                <div className="rounded-xl border border-border bg-card p-6">
                    <SubtopicForm 
                        subtopic={subtopic}
                        topics={topics}
                        isEditing
                    />
                </div>
            </div>
        </div>
    );
}
