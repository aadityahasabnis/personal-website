import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { TopicForm } from '../TopicForm';

/**
 * Create New Topic Page
 */
const NewTopicPage = (): React.ReactElement => {
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
                <h1 className="text-2xl font-bold">Create New Topic</h1>
                <p className="text-muted-foreground">
                    Topics help organize your articles into categories.
                </p>
            </div>

            {/* Form */}
            <div className="rounded-xl border bg-card p-6">
                <TopicForm />
            </div>
        </div>
    );
};

export default NewTopicPage;
