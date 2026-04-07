import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { TopicForm } from '../TopicForm';

const NewTopicPage = (): React.ReactElement => {
    return (
        <div className="mx-auto max-w-2xl space-y-6 pb-6">
            <div>
                <Link
                    href="/admin/topics"
                    className="mb-4 inline-flex items-center gap-2 text-label text-muted-foreground transition-fast hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to Topics
                </Link>
                <h1 className="text-h1 text-foreground">Create New Topic</h1>
                <p className="mt-1 text-regular text-muted-foreground">
                    Topics help organize your articles into categories.
                </p>
            </div>

            <TopicForm />
        </div>
    );
};

export default NewTopicPage;
