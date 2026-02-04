'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Search, 
    FileText, 
    BookOpen, 
    FolderKanban, 
    Layers,
    Settings,
    BarChart3,
    Mail,
    Plus,
    Edit,
    Home,
    type LucideIcon 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
    id: string;
    label: string;
    description?: string;
    icon: LucideIcon;
    action: () => void;
    keywords?: string[];
    category: 'navigation' | 'create' | 'settings';
}

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    // Define all commands
    const commands: CommandItem[] = useMemo(() => [
        // Navigation
        {
            id: 'nav-dashboard',
            label: 'Dashboard',
            description: 'Go to admin dashboard',
            icon: Home,
            action: () => router.push('/admin'),
            keywords: ['home', 'overview'],
            category: 'navigation',
        },
        {
            id: 'nav-topics',
            label: 'Topics',
            description: 'Manage topics',
            icon: Layers,
            action: () => router.push('/admin/topics'),
            keywords: ['categories'],
            category: 'navigation',
        },
        {
            id: 'nav-subtopics',
            label: 'Subtopics',
            description: 'Manage subtopics',
            icon: Layers,
            action: () => router.push('/admin/subtopics'),
            keywords: ['subcategories'],
            category: 'navigation',
        },
        {
            id: 'nav-articles',
            label: 'Articles',
            description: 'Manage articles',
            icon: FileText,
            action: () => router.push('/admin/articles'),
            keywords: ['posts', 'blog'],
            category: 'navigation',
        },
        {
            id: 'nav-notes',
            label: 'Notes',
            description: 'Manage notes',
            icon: BookOpen,
            action: () => router.push('/admin/notes'),
            keywords: ['til', 'snippets'],
            category: 'navigation',
        },
        {
            id: 'nav-projects',
            label: 'Projects',
            description: 'Manage projects',
            icon: FolderKanban,
            action: () => router.push('/admin/projects'),
            keywords: ['portfolio', 'work'],
            category: 'navigation',
        },
        {
            id: 'nav-subscribers',
            label: 'Subscribers',
            description: 'Manage subscribers',
            icon: Mail,
            action: () => router.push('/admin/subscribers'),
            keywords: ['newsletter', 'email'],
            category: 'navigation',
        },
        {
            id: 'nav-analytics',
            label: 'Analytics',
            description: 'View analytics',
            icon: BarChart3,
            action: () => router.push('/admin/analytics'),
            keywords: ['stats', 'metrics'],
            category: 'navigation',
        },
        {
            id: 'nav-settings',
            label: 'Settings',
            description: 'Configure settings',
            icon: Settings,
            action: () => router.push('/admin/settings'),
            keywords: ['config', 'preferences'],
            category: 'settings',
        },
        // Create actions
        {
            id: 'create-topic',
            label: 'New Topic',
            description: 'Create a new topic',
            icon: Plus,
            action: () => router.push('/admin/topics/new'),
            keywords: ['add topic', 'create category'],
            category: 'create',
        },
        {
            id: 'create-subtopic',
            label: 'New Subtopic',
            description: 'Create a new subtopic',
            icon: Plus,
            action: () => router.push('/admin/subtopics/new'),
            keywords: ['add subtopic', 'create subcategory'],
            category: 'create',
        },
        {
            id: 'create-article',
            label: 'New Article',
            description: 'Create a new article',
            icon: Plus,
            action: () => router.push('/admin/articles/new'),
            keywords: ['add article', 'write post', 'new blog'],
            category: 'create',
        },
        {
            id: 'create-note',
            label: 'New Note',
            description: 'Create a new note',
            icon: Plus,
            action: () => router.push('/admin/notes/new'),
            keywords: ['add note', 'til', 'snippet'],
            category: 'create',
        },
        {
            id: 'create-project',
            label: 'New Project',
            description: 'Create a new project',
            icon: Plus,
            action: () => router.push('/admin/projects/new'),
            keywords: ['add project', 'portfolio'],
            category: 'create',
        },
    ], [router]);

    // Filter commands based on search
    const filteredCommands = useMemo(() => {
        if (!search) return commands;

        const query = search.toLowerCase();
        return commands.filter((cmd) => {
            const matchesLabel = cmd.label.toLowerCase().includes(query);
            const matchesDescription = cmd.description?.toLowerCase().includes(query);
            const matchesKeywords = cmd.keywords?.some((kw) => kw.toLowerCase().includes(query));
            return matchesLabel || matchesDescription || matchesKeywords;
        });
    }, [commands, search]);

    // Group commands by category
    const groupedCommands = useMemo(() => {
        const groups: Record<string, CommandItem[]> = {
            navigation: [],
            create: [],
            settings: [],
        };

        filteredCommands.forEach((cmd) => {
            groups[cmd.category].push(cmd);
        });

        return groups;
    }, [filteredCommands]);

    // Handle command execution
    const executeCommand = useCallback((command: CommandItem) => {
        command.action();
        onClose();
        setSearch('');
        setSelectedIndex(0);
    }, [onClose]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex((prev) => 
                    prev < filteredCommands.length - 1 ? prev + 1 : prev
                );
            }

            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
            }

            if (e.key === 'Enter') {
                e.preventDefault();
                const command = filteredCommands[selectedIndex];
                if (command) {
                    executeCommand(command);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, filteredCommands, selectedIndex, executeCommand]);

    // Reset selected index when search changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Command Palette */}
            <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-2xl -translate-x-1/2">
                <div className="mx-4 overflow-hidden rounded-xl border bg-background shadow-2xl">
                    {/* Search Input */}
                    <div className="flex items-center gap-3 border-b px-4">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search commands..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted-foreground"
                            autoFocus
                        />
                        <kbd className="hidden rounded bg-muted px-2 py-1 text-xs text-muted-foreground sm:inline-block">
                            ESC
                        </kbd>
                    </div>

                    {/* Commands List */}
                    <div className="max-h-[400px] overflow-y-auto p-2">
                        {filteredCommands.length === 0 ? (
                            <div className="py-12 text-center text-sm text-muted-foreground">
                                No commands found
                            </div>
                        ) : (
                            <>
                                {/* Navigation Commands */}
                                {groupedCommands.navigation.length > 0 && (
                                    <div className="mb-2">
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                            Navigation
                                        </div>
                                        {groupedCommands.navigation.map((cmd, index) => {
                                            const globalIndex = filteredCommands.indexOf(cmd);
                                            return (
                                                <CommandItem
                                                    key={cmd.id}
                                                    command={cmd}
                                                    isSelected={globalIndex === selectedIndex}
                                                    onClick={() => executeCommand(cmd)}
                                                />
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Create Commands */}
                                {groupedCommands.create.length > 0 && (
                                    <div className="mb-2">
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                            Create
                                        </div>
                                        {groupedCommands.create.map((cmd) => {
                                            const globalIndex = filteredCommands.indexOf(cmd);
                                            return (
                                                <CommandItem
                                                    key={cmd.id}
                                                    command={cmd}
                                                    isSelected={globalIndex === selectedIndex}
                                                    onClick={() => executeCommand(cmd)}
                                                />
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Settings Commands */}
                                {groupedCommands.settings.length > 0 && (
                                    <div className="mb-2">
                                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                            Settings
                                        </div>
                                        {groupedCommands.settings.map((cmd) => {
                                            const globalIndex = filteredCommands.indexOf(cmd);
                                            return (
                                                <CommandItem
                                                    key={cmd.id}
                                                    command={cmd}
                                                    isSelected={globalIndex === selectedIndex}
                                                    onClick={() => executeCommand(cmd)}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="rounded bg-muted px-1.5 py-0.5">↑</kbd>
                                <kbd className="rounded bg-muted px-1.5 py-0.5">↓</kbd>
                                <span className="ml-1">to navigate</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="rounded bg-muted px-1.5 py-0.5">Enter</kbd>
                                <span className="ml-1">to select</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

interface CommandItemProps {
    command: CommandItem;
    isSelected: boolean;
    onClick: () => void;
}

function CommandItem({ command, isSelected, onClick }: CommandItemProps) {
    const Icon = command.icon;

    return (
        <button
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
            )}
        >
            <div className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md',
                isSelected 
                    ? 'bg-primary-foreground/10' 
                    : 'bg-muted'
            )}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="truncate text-sm font-medium">{command.label}</div>
                {command.description && (
                    <div className={cn(
                        'truncate text-xs',
                        isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}>
                        {command.description}
                    </div>
                )}
            </div>
        </button>
    );
}
