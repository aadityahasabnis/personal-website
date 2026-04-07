import { Mail } from 'lucide-react';
import { Suspense } from 'react';

import { PageHeader } from '@/components/admin';
import { DataTableSkeleton } from '@/components/admin/table';
import { getSubscribers } from '@/server/new/admin/subscribers';

import { SUBSCRIBERS_TABLE_SKELETON_PROPS } from './config';
import { SubscribersTable } from './SubscribersTable';

// =============================================================
// Subscribers Table Wrapper (Server Component)
// =============================================================

const SubscribersTableWrapper = async (): Promise<React.ReactElement> => {
    const response = await getSubscribers();

    if (!response.success || !response.data) {
        return (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed">
                <p className="text-muted-foreground">Failed to load subscribers</p>
            </div>
        );
    }

    return (
        <SubscribersTable
            initialData={response.data}
            initialTotal={response.pagination.total}
        />
    );
};

// =============================================================
// Subscribers Page (Server Component)
// =============================================================

const SubscribersPage = (): React.ReactElement => {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Subscribers"
                description="Manage your newsletter subscribers. View, confirm, or remove subscribers."
                icon={Mail}
            />

            <Suspense fallback={<DataTableSkeleton {...SUBSCRIBERS_TABLE_SKELETON_PROPS} />}>
                <SubscribersTableWrapper />
            </Suspense>
        </div>
    );
};

export default SubscribersPage;
