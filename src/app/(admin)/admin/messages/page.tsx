import { PageHeader } from '@/components/admin';
import { getMessages } from '@/server/actions/contact';
import { MessagesTable } from './MessagesTable';

export const metadata = { title: 'Messages | Admin' };

export default async function MessagesPage() {
    const messages = await getMessages();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Messages"
                description="View and manage contact form submissions"
            />
            <MessagesTable messages={messages} />
        </div>
    );
}
