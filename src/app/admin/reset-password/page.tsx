import { AdminResetPasswordFlow } from '@/components/admin/auth/AdminResetPasswordFlow';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { auth } from '@/lib/auth/admin';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense, type ReactElement } from 'react';

export const metadata: Metadata = {
    title: `Reset Password | Admin | ${SITE_CONFIG.name}`,
    robots: 'noindex, nofollow',
};

const AdminResetPasswordPage = async (): Promise<ReactElement> => {
    const session = await auth();
    if (session?.user) redirect('/admin');
    return (
        <Suspense
            fallback={
                <div className='relative flex min-h-screen items-center justify-center px-4 py-8 text-regular text-muted-foreground bg-muted/30'>
                    <div className='flex items-center gap-2'>
                        <Loader2 className='size-5 animate-spin' />
                        <span>Loading reset flow...</span>
                    </div>
                </div>
            }
        >
            <AdminResetPasswordFlow />
        </Suspense>
    );
};

export default AdminResetPasswordPage;
