import { AdminLoginFlow } from '@/components/admin/auth/AdminLoginFlow';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { env } from '@/env';
import { auth } from '@/lib/auth/admin';
import { createPageMetadata } from '@/lib/metadata';
import { buildDynamicOgImageUrl } from '@/lib/ogImage';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense, type ReactElement } from 'react';

const adminLoginOgImage = buildDynamicOgImageUrl({
    title: 'Admin Login',
    eyebrow: SITE_CONFIG.name,
    subtitle: 'Secure sign-in portal for content management.',
    tags: ['admin', 'secure', 'login'],
});

export const metadata: Metadata = createPageMetadata({
    title: 'Admin Login',
    description: `Secure admin login for ${SITE_CONFIG.name}.`,
    canonicalPath: '/admin/login',
    includeSocial: true,
    socialType: 'website',
    imageUrl: adminLoginOgImage,
    robots: {
        index: false,
        follow: false,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
        },
    },
});

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
