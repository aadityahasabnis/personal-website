import { AdminLoginFlow } from '@/components/admin/auth/AdminLoginFlow';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { env } from '@/env';
import { auth } from '@/lib/auth/admin';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense, type ReactElement } from 'react';

export const metadata: Metadata = {
    title: `Admin Login | ${SITE_CONFIG.name}`,
    robots: 'noindex, nofollow',
};

const AdminLoginPage = async (): Promise<ReactElement> => {
    const session = await auth();
    if (session?.user) redirect('/admin');

    const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET);

    return (
        <Suspense
            fallback={
                <div className='relative flex min-h-screen items-center justify-center px-4 py-8 text-regular text-muted-foreground bg-muted/30'>
                    <div className='flex items-center gap-2'>
                        <Loader2 className='size-5 animate-spin' />
                        <span>Loading login flow...</span>
                    </div>
                </div>
            }
        >
            <AdminLoginFlow googleEnabled={googleEnabled} />
        </Suspense>
    );
};

export default AdminLoginPage;
