import { redirect } from 'next/navigation';

import { Settings } from 'lucide-react';

import { PageHeader } from '@/components/admin/PageHeader';
import { getAdminProfile } from '@/server/new/admin/settings';

import { SettingsForm } from './SettingsForm';

export const metadata = {
    title: 'Settings | Admin',
    description: 'Manage your account settings and preferences.',
};

const AdminSettingsPage = async (): Promise<React.ReactElement> => {
    const result = await getAdminProfile();

    if (!result.success) {
        redirect('/admin/login');
    }

    const profile = result.data;

    return (
        <div className="mx-auto max-w-2xl space-y-6 pb-6">
            <PageHeader
                icon={Settings}
                title="Settings"
                description="Manage your account settings and preferences."
            />

            <SettingsForm profile={profile} />
        </div>
    );
};

export default AdminSettingsPage;
