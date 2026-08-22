'use client';

import type { ReactElement, ReactNode } from 'react';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { SITE_CONFIG } from '@/constants/siteConstants';

interface IAdminAuthShellProps {
    eyebrow: string;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    backHref?: string;
    backLabel?: string;
}

export function AdminAuthShell({
    eyebrow,
    title,
    children,
    footer,
    backHref = '/admin/login',
    backLabel = 'Back to login',
}: IAdminAuthShellProps): ReactElement {
    return (
        <main className='relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 text-foreground bg-background sm:px-6'>
            <div className='ambient-bg' aria-hidden='true'>
                <span className='ambient-sphere ambient-sphere-1' />
                <span className='ambient-sphere ambient-sphere-3' />
                <span className='ambient-sphere ambient-sphere-4' />
            </div>
            <section className='relative flex w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-glow-lg' aria-label={title}>
                <div className='flex min-w-0 flex-col gap-7 p-5 sm:p-8'>
                    <div className='flex items-center justify-between gap-4'>
                        <div className='flex items-center gap-2'>
                            <span className='flex size-8 items-center justify-center text-small font-semibold text-primary-foreground bg-primary rounded-lg'>{SITE_CONFIG.name.charAt(0)}</span>
                            <span className='text-small font-medium text-foreground'>{SITE_CONFIG.name}</span>
                        </div>
                        <span className='text-label font-medium uppercase tracking-[0.14em] text-muted-foreground'>{eyebrow}</span>
                    </div>
                    <div className='min-w-0'>{children}</div>
                    {footer ?? (
                        <div className='flex justify-end border-t border-border pt-4'>
                            <Button asChild type='button' variant='ghost' size='sm' className='cursor-pointer gap-2'>
                                <Link href={backHref}>
                                    <ArrowLeft className='size-4' />
                                    {backLabel}
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default AdminAuthShell;
