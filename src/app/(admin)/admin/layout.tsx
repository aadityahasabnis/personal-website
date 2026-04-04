import type { Metadata } from 'next';

import AdminHeader from '@/components/admin/layout/AdminHeader';
import AdminSidebar from '@/components/admin/layout/AdminSidebar';
import { auth } from '@/lib/auth/admin';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
    title: 'Admin | Aaditya Hasabnis',
    robots: 'noindex, nofollow',
};

interface IAdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout = async ({ children }: IAdminLayoutProps): Promise<React.ReactElement> => {
    const session = await auth();

    // Extra protection - redirect if not logged in
    if (!session?.user) {
        redirect('/admin/login');
    }

    return (
        <div className='flex min-h-screen bg-muted/30'>
            {/* Sidebar */}
            <AdminSidebar user={session.user} />

            {/* Main content area */}
            <div className='flex flex-1 flex-col'>
                <AdminHeader user={session.user} />

                <main className='flex-1 p-6'>{children}</main>
            </div>
        </div>
    );
};

export default AdminLayout;
