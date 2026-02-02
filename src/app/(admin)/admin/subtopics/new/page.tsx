import { ArrowLeft, Layers } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/admin';
import { SubtopicForm } from '../SubtopicForm';
import { getAllTopics } from '@/server/queries/topics';

async function getFormData() {
    const topics = await getAllTopics();
    return { topics };
}

export default async function NewSubtopicPage() {
    const { topics } = await getFormData();

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
                <PageHeader
                    title="Create New Subtopic"
                    description="Add a subtopic to organize articles within a topic"
                    icon={Layers}
                />
            </div>

            {/* Form */}
            <div className="max-w-2xl">
                <div className="rounded-xl border border-border bg-card p-6">
                    <SubtopicForm topics={topics} />
                </div>
            </div>
        </div>
    );
}
