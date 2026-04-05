import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { TopicForm } from '../TopicForm';

const NewTopicPage = (): React.ReactElement => {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <Link
                    href="/admin/topics"
                    className="inline-flex items-center gap-2 mb-4 text-label text-muted-foreground transition-fast hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to Topics
                </Link>
                <h1 className="text-h1 text-foreground">Create New Topic</h1>
                <p className="mt-1 text-regular text-muted-foreground">
                    Topics help organize your articles into categories.
                </p>
            </div>

            <div className="p-6 bg-card border border-border rounded-xl">
                <TopicForm />
            </div>
        </div>
    );
};

export default NewTopicPage;
