import { PageHeader } from '@/components/admin';
import { getAllComments } from '@/server/actions/comments';
import { CommentsTable } from './CommentsTable';

export const metadata = { title: 'Comments | Admin' };

export default async function CommentsPage() {
    const comments = await getAllComments();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Comments"
                description="Moderate and manage article comments"
            />
            <CommentsTable comments={comments} />
        </div>
    );
}
