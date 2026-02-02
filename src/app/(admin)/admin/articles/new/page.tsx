import { Suspense } from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/admin';
import { ArticleForm } from '../ArticleForm';
import { getAllTopics } from '@/server/queries/topics';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ISubtopic } from '@/interfaces';

async function getFormData() {
    const topics = await getAllTopics();
    
    // Get all subtopics (not filtered by published for admin)
    const subtopicsCollection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);
    const allSubtopics = await subtopicsCollection
        .find({})
        .sort({ topicSlug: 1, order: 1 })
        .toArray();

    // Serialize data for client component (convert ObjectId to string)
    return { 
        topics: JSON.parse(JSON.stringify(topics)), 
        allSubtopics: JSON.parse(JSON.stringify(allSubtopics))
    };
}

export default async function NewArticlePage() {
    const { topics, allSubtopics } = await getFormData();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/articles"
                    className="inline-flex items-center justify-center rounded-lg border bg-background p-2 hover:bg-muted transition-colors"
                    aria-label="Back to articles"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <PageHeader
                    title="Create New Article"
                    description="Write and publish a new article"
                    icon={FileText}
                />
            </div>

            {/* Form - Full Width */}
            <ArticleForm 
                topics={topics} 
                allSubtopics={allSubtopics}
            />
        </div>
    );
}
