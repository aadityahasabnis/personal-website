'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
    Bell,
    Search,
    LogOut,
    User,
    ExternalLink,
    Moon,
    Sun,
    RefreshCw,
} from 'lucide-react';
import { useTheme } from 'next-themes';

import { cn } from '@/lib/utils';
import { CommandPalette } from './CommandPalette';
import { NotificationsPanel } from './NotificationsPanel';

interface IAdminHeaderProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
}

/**
 * Admin Header with search, notifications, and user menu
 */
const AdminHeader = ({ user }: IAdminHeaderProps): React.ReactElement => {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isNotificationsPanelOpen, setIsNotificationsPanelOpen] = useState(false);
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
        <>
            <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-6">
                {/* Search */}
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search..."
                            onClick={() => setIsCommandPaletteOpen(true)}
                            readOnly
                            className={cn(
                                'h-9 w-64 rounded-lg border bg-background pl-9 pr-3 text-sm cursor-pointer',
                                'placeholder:text-muted-foreground',
                                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
                            )}
                        />
                        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden rounded border bg-muted px-1.5 text-xs text-muted-foreground sm:inline-block pointer-events-none">
                            ⌘K
                        </kbd>
                    </div>
                </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                {/* View Site */}
                <Link
                    href="/"
                    target="_blank"
                    className={cn(
                        'flex h-9 items-center gap-2 rounded-lg px-3 text-sm',
                        'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                    )}
                >
                    <ExternalLink className="h-4 w-4" />
                    <span className="hidden sm:inline">View Site</span>
                </Link>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-lg',
                        'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors'
                    )}
                    aria-label="Toggle theme"
                >
                    <Sun className="h-4 w-4 dark:hidden" />
                    <Moon className="hidden h-4 w-4 dark:block" />
                </button>

                {/* Notifications */}
                <button
                    onClick={() => setIsNotificationsPanelOpen(!isNotificationsPanelOpen)}
                    className={cn(
                        'relative flex h-9 w-9 items-center justify-center rounded-lg',
                        'text-muted-foreground hover:bg-muted hover:text-foreground transition-colors',
                        isNotificationsPanelOpen && 'bg-muted'
                    )}
                    aria-label="Notifications"
                >
                    <Bell className="h-4 w-4" />
                    {/* Notification dot */}
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-destructive" />
                </button>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className={cn(
                            'flex h-9 items-center gap-2 rounded-lg px-2',
                            'hover:bg-muted transition-colors',
                            isUserMenuOpen && 'bg-muted'
                        )}
                    >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden text-sm font-medium sm:inline">{user.name}</span>
                    </button>

                    {/* Dropdown */}
                    {isUserMenuOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setIsUserMenuOpen(false)}
                            />
                            {/* Menu */}
                            <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border bg-card p-1 shadow-lg">
                                <div className="border-b px-3 py-2">
                                    <p className="text-sm font-medium">{user.name}</p>
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                                <div className="py-1">
                                    <Link
                                        href="/admin/settings"
                                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                                        onClick={() => setIsUserMenuOpen(false)}
                                    >
                                        <User className="h-4 w-4" />
                                        Profile Settings
                                    </Link>
                                </div>
                                <div className="border-t py-1">
                                    <button
                                        onClick={handleSignOut}
                                        disabled={isPending}
                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                                    >
                                        {isPending ? (
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <LogOut className="h-4 w-4" />
                                        )}
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>

        {/* Command Palette */}
        <CommandPalette 
            isOpen={isCommandPaletteOpen} 
            onClose={() => setIsCommandPaletteOpen(false)} 
        />

        {/* Notifications Panel */}
        <NotificationsPanel
            isOpen={isNotificationsPanelOpen}
            onClose={() => setIsNotificationsPanelOpen(false)}
        />
    </>
    );
};

export default AdminHeader;
