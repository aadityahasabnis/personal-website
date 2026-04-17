import type { Metadata } from 'next';

import AdminHeader from '@/components/admin/layout/AdminHeader';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import { auth } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Admin',
    robots: 'noindex, nofollow',
};

export const dynamic = 'force-dynamic';

interface IAdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout = async ({ children }: IAdminLayoutProps): Promise<React.ReactElement> => {
    const session = await auth();

    // Extra protection - redirect if not logged in
    if (!session?.user) {
        redirect('/admin/login');
    }

    const adminUser = {
        name: session.user.name ?? 'Admin',
        email: session.user.email ?? '',
        role: 'owner',
    };

    return (
        <div className='flex h-screen overflow-hidden bg-muted/30'>
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main content area */}
            <div className='flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden'>
                <AdminHeader user={adminUser} />

                <main className='min-w-0 min-h-0 flex-1 overflow-y-auto p-6'>{children}</main>
            </div>
        </div>
    );
};

export default AdminLayout;
