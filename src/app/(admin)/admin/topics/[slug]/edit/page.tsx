import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { notFound } from 'next/navigation';

import { getTopic } from '@/server/queries/topics';
import { TopicForm } from '../../TopicForm';

interface IEditTopicPageProps {
    params: Promise<{
        slug: string;
    }>;
}

/**
 * Edit Topic Page
 */
const EditTopicPage = async ({ params }: IEditTopicPageProps): Promise<React.ReactElement> => {
    const { slug } = await params;
    const topic = await getTopic(slug);

    if (!topic) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Link 
                    href="/admin/topics"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Topics
                </Link>
                <h1 className="text-2xl font-bold">Edit Topic</h1>
                <p className="text-muted-foreground">
                    Update &ldquo;{topic.title}&rdquo; topic settings.
                </p>
            </div>

            {/* Warning for topics with articles */}
            {(topic.metadata?.articleCount ?? 0) > 0 && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">This topic has {topic.metadata.articleCount} article(s)</p>
                        <p className="mt-1 text-amber-700">
                            Changing the slug will update all article URLs. Make sure to set up redirects if needed.
                        </p>
                    </div>
                </div>
            )}

            {/* Form */}
            <div className="rounded-xl border bg-card p-6">
                <TopicForm topic={topic} isEditing />
            </div>
        </div>
    );
};

export default EditTopicPage;
