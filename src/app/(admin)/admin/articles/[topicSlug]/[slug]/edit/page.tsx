import { notFound } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/admin';
import { ArticleForm } from '../../../ArticleForm';
import { getArticleForEdit } from '@/server/queries/admin';
import { getAllTopics } from '@/server/queries/topics';
import { getCollection } from '@/lib/db/connect';
import { COLLECTIONS } from '@/constants';
import type { ISubtopic } from '@/interfaces';

interface EditArticlePageProps {
    params: Promise<{
        topicSlug: string;
        slug: string;
    }>;
}

async function getFormData(topicSlug: string, slug: string) {
    const [article, topics] = await Promise.all([
        getArticleForEdit(topicSlug, slug),
        getAllTopics(),
    ]);

    if (!article) {
        notFound();
    }

    // Get all subtopics (not filtered by published for admin)
    const subtopicsCollection = await getCollection<ISubtopic>(COLLECTIONS.subtopics);
    const allSubtopics = await subtopicsCollection
        .find({})
        .sort({ topicSlug: 1, order: 1 })
        .toArray();

    // Serialize data for client component (convert ObjectId to string)
    return { 
        article: JSON.parse(JSON.stringify(article)),
        topics: JSON.parse(JSON.stringify(topics)), 
        allSubtopics: JSON.parse(JSON.stringify(allSubtopics))
    };
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
    const { topicSlug, slug } = await params;
    const { article, topics, allSubtopics } = await getFormData(topicSlug, slug);

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
                <div className="flex-1">
                    <PageHeader
                        title={`Edit: ${article.title}`}
                        description={`Last updated ${new Date(article.updatedAt).toLocaleDateString()}`}
                        icon={FileText}
                    />
                </div>
            </div>

            {/* Form - Full Width */}
            <ArticleForm 
                article={article}
                topics={topics} 
                allSubtopics={allSubtopics}
                isEditing
            />
        </div>
    );
}
