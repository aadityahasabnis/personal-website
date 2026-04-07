import { Mail } from 'lucide-react';
import { Suspense } from 'react';

import { PageHeader } from '@/components/admin';
import { DataTableSkeleton } from '@/components/admin/table';
import { getContacts } from '@/server/new/admin/contacts';
import { ContactsTable } from './ContactsTable';
import { CONTACTS_TABLE_SKELETON_PROPS } from './config';

const ContactsTableWrapper = async (): Promise<React.ReactElement> => {
    const response = await getContacts();

    if (!response.success || !response.data) {
        return (
            <div className='flex h-64 items-center justify-center rounded-xl border border-dashed'>
                <p className='text-muted-foreground'>Failed to load contacts</p>
            </div>
        );
    }

    return <ContactsTable initialData={response.data} initialTotal={response.pagination.total} />;
};

const ContactsPage = (): React.ReactElement => {
    return (
        <div className='space-y-6'>
            <PageHeader
                title='Contact Messages'
                description='View and manage messages from your contact form.'
                icon={Mail}
            />

            <Suspense fallback={<DataTableSkeleton {...CONTACTS_TABLE_SKELETON_PROPS} />}>
                <ContactsTableWrapper />
            </Suspense>
        </div>
    );
};

export default ContactsPage;
