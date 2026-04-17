'use client';

import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
import { DialogProvider } from './DialogProvider';
import { LenisProvider } from './LenisProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
interface IProvidersProps {
    children: ReactNode;
}
/**
 * Root providers wrapper
 *
 * Hierarchy: QueryProvider → ThemeProvider → LenisProvider → children
 */
export const Providers = ({ children }: IProvidersProps) => {
    return (
        <QueryProvider>
            <ThemeProvider>
                <LenisProvider>
                    <DialogProvider>
                        <Analytics />
                        <SpeedInsights />
                        {children}
                        <Toaster
                            position='bottom-right'
                            toastOptions={{
                                classNames: {
                                    toast: 'bg-background border border-border shadow-lg',
                                    title: 'text-foreground font-semibold',
                                    description: 'text-muted-foreground',
                                    actionButton: 'bg-primary text-primary-foreground',
                                    cancelButton: 'bg-muted text-muted-foreground',
                                },
                            }}
                        />
                    </DialogProvider>
                </LenisProvider>
            </ThemeProvider>
        </QueryProvider>
    );
};
