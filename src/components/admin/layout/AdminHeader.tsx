'use client';

import { ExternalLink, LogOut, Moon, RefreshCw, Search, Settings, Sun } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { cn } from '@/lib/utils';
import { CommandPalette } from '../CommandPalette';

interface IAdminHeaderProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
}

/**
 * Admin Header with search, theme toggle, and user menu
 */
const AdminHeader = ({ user }: IAdminHeaderProps): React.ReactElement => {
    const { theme, setTheme } = useTheme();
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Command palette keyboard shortcut
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSignOut = async (): Promise<void> => {
        startTransition(async () => {
            await signOut({ callbackUrl: '/admin/login' });
        });
    };

    const toggleTheme = (): void => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <TooltipProvider delayDuration={0}>
            <header
                className={cn(
                    // Positioning
                    'sticky top-0 z-40',
                    // Layout
                    'flex h-16 items-center justify-between',
                    // Spacing - extra padding on left for mobile hamburger
                    'border-b border-border px-4 pl-16 lg:pl-6',
                    // Background
                    'bg-card',
                )}
            >
                {/* Search */}
                <div className='flex items-center'>
                    <button
                        onClick={() => setIsCommandPaletteOpen(true)}
                        className={cn(
                            // Layout
                            'flex items-center gap-2',
                            // Sizing
                            'h-9 w-48 sm:w-64 rounded-lg border border-border px-3',
                            // Background
                            'bg-background',
                            // Typography
                            'text-sm text-muted-foreground',
                            // Transitions
                            'transition-all duration-200',
                            'hover:border-primary/50 hover:bg-muted/50',
                            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                        )}
                    >
                        <Search className='h-4 w-4 shrink-0' />
                        <span className='flex-1 text-left truncate'>Search...</span>
                        <kbd className='hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-block'>⌘K</kbd>
                    </button>
                </div>

                {/* Actions */}
                <div className='flex items-center gap-1'>
                    {/* View Site */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant='ghost' size='icon' asChild className='h-9 w-9 text-muted-foreground hover:text-foreground'>
                                <Link href='/' target='_blank' aria-label='View Site'>
                                    <ExternalLink className='h-4 w-4' />
                                </Link>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side='bottom'>View Site</TooltipContent>
                    </Tooltip>

                    {/* Theme Toggle */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant='ghost' size='icon' onClick={toggleTheme} className='h-9 w-9 text-muted-foreground hover:text-foreground' aria-label='Toggle theme'>
                                <Sun className='h-4 w-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0' />
                                <Moon className='absolute h-4 w-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100' />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side='bottom'>Toggle theme</TooltipContent>
                    </Tooltip>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='icon' className={cn('relative h-9 w-9 rounded-full p-0', 'hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0')}>
                                <span className='relative h-8 w-8 shrink-0 overflow-hidden rounded-full shadow-sm'>
                                    <Image src={SITE_CONFIG.author.adminProfileImage} alt={`${SITE_CONFIG.name} profile`} fill sizes='32px' className='object-cover' />
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' sideOffset={8} className='w-56 p-1'>
                            {/* User Info - Not hoverable */}
                            <div className='flex items-center gap-3 px-2 py-3 select-none'>
                                <div className='flex flex-1 flex-col overflow-hidden'>
                                    <span className='truncate text-sm font-medium text-foreground'>{user.name}</span>
                                    <span className='truncate text-xs text-muted-foreground'>{user.email}</span>
                                </div>
                            </div>

                            <DropdownMenuSeparator />

                            {/* Menu Items */}
                            <DropdownMenuGroup>
                                <DropdownMenuItem asChild>
                                    <Link href='/admin/settings' className='cursor-pointer'>
                                        <Settings className='h-4 w-4' />
                                        <span>Settings</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            {/* Sign Out */}
                            <DropdownMenuItem onClick={handleSignOut} disabled={isPending} variant='destructive' className='cursor-pointer'>
                                {isPending ? <RefreshCw className='h-4 w-4 animate-spin' /> : <LogOut className='h-4 w-4' />}
                                <span>Sign out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Command Palette */}
            <CommandPalette isOpen={isCommandPaletteOpen} onClose={() => setIsCommandPaletteOpen(false)} />
        </TooltipProvider>
    );
};

export default AdminHeader;
