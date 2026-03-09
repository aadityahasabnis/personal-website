'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, FileText, BookOpen, FolderKanban, Settings,
    Mail, BarChart3, Layers, ChevronLeft, ChevronRight, MessageSquare, ImageIcon, Database, Activity, Clock, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SITE_CONFIG } from '@/constants/siteConstants';

interface IAdminSidebarProps {
    user: { name: string; email: string; role: string };
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
    { label: 'Subtopics', href: '/admin/subtopics', icon: Layers },
    { label: 'Articles', href: '/admin/articles', icon: FileText },
    { label: 'Notes', href: '/admin/notes', icon: BookOpen },
    { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
    { label: 'Media', href: '/admin/media', icon: ImageIcon },
    { label: 'Comments', href: '/admin/comments', icon: MessageSquare },
    { label: 'Messages', href: '/admin/messages', icon: MessageSquare },
    { label: 'Subscribers', href: '/admin/subscribers', icon: Mail },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'Activity', href: '/admin/activity', icon: Activity },
    { label: 'Scheduled', href: '/admin/scheduled', icon: Clock },
    { label: 'Backup', href: '/admin/backup', icon: Database },
];

const bottomNavItems: INavItem[] = [
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';

const AdminSidebar = ({ user }: IAdminSidebarProps): React.ReactElement => {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        if (stored) setCollapsed(stored === 'true');
        setMounted(true);
    }, []);

    const toggleCollapsed = () => {
        const newState = !collapsed;
        setCollapsed(newState);
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(newState));
    };

    const isActive = (href: string): boolean =>
        href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

    const NavLink = ({ item }: { item: INavItem }) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
            <Link
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                    collapsed && 'justify-center px-2',
                    active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
            >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && (
                    <>
                        <span className="truncate">{item.label}</span>
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-xs text-destructive-foreground">
                                {item.badge}
                            </span>
                        )}
                    </>
                )}
            </Link>
        );
    };

    // Prevent hydration mismatch
    if (!mounted) {
        return <aside className="sticky top-0 flex h-screen w-64 flex-col border-r bg-card" />;
    }

    return (
        <aside
            className={cn(
                'sticky top-0 flex h-screen flex-col border-r bg-card transition-all duration-300',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className={cn(
                'flex h-16 items-center border-b px-4',
                collapsed ? 'justify-center' : 'gap-2'
            )}>
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                    A
                </div>
                {!collapsed && (
                    <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold truncate">{SITE_CONFIG.name}</span>
                        <span className="text-xs text-muted-foreground">Admin Panel</span>
                    </div>
                )}
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleCollapsed}
                className={cn(
                    'absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground'
                )}
                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
                {navItems.map((item) => <NavLink key={item.href} item={item} />)}
            </nav>

            {/* Bottom Navigation */}
            <div className="border-t p-3">
                {bottomNavItems.map((item) => <NavLink key={item.href} item={item} />)}
            </div>

            {/* User Info */}
            <div className="border-t p-3">
                <div className={cn(
                    'flex items-center rounded-lg bg-muted/50 p-3 transition-all duration-200',
                    collapsed ? 'justify-center' : 'gap-3'
                )}>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 overflow-hidden min-w-0">
                            <p className="truncate text-sm font-medium">{user.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{user.role}</p>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
