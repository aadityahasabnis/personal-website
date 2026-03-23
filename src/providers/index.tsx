'use client';

import { type ReactNode } from 'react';
import { Toaster } from 'sonner';
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
                </LenisProvider>
            </ThemeProvider>
        </QueryProvider>
    );
};
