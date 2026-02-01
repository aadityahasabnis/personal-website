'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    FileText,
    BookOpen,
    FolderKanban,
    Settings,
    Users,
    Mail,
    BarChart3,
    Layers,
    type LucideIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { SITE_CONFIG } from '@/constants';

interface IAdminSidebarProps {
    user: {
        name: string;
        email: string;
        role: string;
    };
}

interface INavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    badge?: number;
}

const navItems: INavItem[] = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Topics', href: '/admin/topics', icon: Layers },
    { label: 'Articles', href: '/admin/articles', icon: FileText },
    { label: 'Notes', href: '/admin/notes', icon: BookOpen },
    { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { label: 'Subscribers', href: '/admin/subscribers', icon: Mail },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
];

const bottomNavItems: INavItem[] = [
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

/**
 * Admin Sidebar Navigation
 */
const AdminSidebar = ({ user }: IAdminSidebarProps): React.ReactElement => {
    const pathname = usePathname();

    const isActive = (href: string): boolean => {
        if (href === '/admin') {
            return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="sticky top-0 flex h-screen w-64 flex-col border-r bg-card">
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b px-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                    A
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-semibold">{SITE_CONFIG.name}</span>
                    <span className="text-xs text-muted-foreground">Admin Panel</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-3">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs text-destructive-foreground">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Navigation */}
            <div className="border-t p-3">
                {bottomNavItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                active
                                    ? 'bg-primary text-primary-foreground'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>

            {/* User Info */}
            <div className="border-t p-3">
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="truncate text-sm font-medium">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
