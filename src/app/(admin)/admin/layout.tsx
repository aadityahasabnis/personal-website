import type { Metadata } from 'next';

import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export const metadata: Metadata = {
    title: 'Admin | Aaditya Hasabnis',
    robots: 'noindex, nofollow',
};

interface IAdminLayoutProps {
    children: React.ReactNode;
}

/**
 * Admin Layout
 *
 * Wraps all admin pages with:
 * - Authentication check
 * - Sidebar navigation
 * - Header with user info
 */
const AdminLayout = async ({ children }: IAdminLayoutProps): Promise<React.ReactElement> => {
    const session = await auth();

    // Extra protection - redirect if not logged in
    if (!session?.user) {
        redirect('/admin/login');
    }

    return (
        <div className="flex min-h-screen bg-muted/30">
            {/* Sidebar */}
            <AdminSidebar user={session.user} />

            {/* Main content area */}
            <div className="flex flex-1 flex-col">
                {/* Header */}
                <AdminHeader user={session.user} />

                {/* Page content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
