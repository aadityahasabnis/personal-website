'use client';

import { useState, useMemo, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FolderKanban, Calendar, ExternalLink, Github } from 'lucide-react';

import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import type { IProject } from '@/interfaces';

import {
    DataTable,
    TableSearch,
    BulkActionsBar,
    StatusBadge,
    DataTableActions,
    createEditAction,
    createDeleteAction,
    createToggleFeaturedAction,
    createBulkDeleteActionNew,
    createBulkFeatureAction,
    createBulkUnfeatureAction,
    createBulkSetActiveAction,
    createBulkSetWipAction,
    createBulkArchiveAction,
    type IDataTableColumn,
    type IBulkActionNew,
    type ITableFilter,
} from '@/components/admin';
import {
    deleteProject,
    toggleProjectFeatured,
    updateProjectStatus,
    reorderProjects,
} from '@/server/actions/projects';
import { Button } from '@/components/ui/button';

interface IProjectsTableProps {
    projects: IProject[];
}

export function ProjectsTable({ projects: initialProjects }: IProjectsTableProps): React.ReactElement {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    // State
    const [projects, setProjects] = useState(initialProjects);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [filters, setFilters] = useState<Record<string, any>>({});

    // ===== FILTERING & SEARCHING =====

    const filteredProjects = useMemo(() => {
        let filtered = [...projects];

        // Search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (project) =>
                    project.title.toLowerCase().includes(query) ||
                    project.description.toLowerCase().includes(query) ||
                    project.techStack?.some((tech) => tech.toLowerCase().includes(query)) ||
                    project.tags.some((tag) => tag.toLowerCase().includes(query))
            );
        }

        // Status Filter
        if (filters.status && filters.status !== 'all') {
            filtered = filtered.filter((project) => project.status === filters.status);
        }

        // Featured Filter
        if (filters.featured === 'true') {
            filtered = filtered.filter((project) => project.featured);
        } else if (filters.featured === 'false') {
            filtered = filtered.filter((project) => !project.featured);
        }

        // Tech Stack Filter
        if (filters.techStack) {
            filtered = filtered.filter((project) =>
                project.techStack?.includes(filters.techStack)
            );
        }

        return filtered;
    }, [projects, searchQuery, filters]);

    // Get unique tech stacks for filter
    const allTechStacks = useMemo(() => {
        const techSet = new Set<string>();
        projects.forEach((project) => {
            project.techStack?.forEach((tech) => techSet.add(tech));
        });
        return Array.from(techSet).sort();
    }, [projects]);

    // ===== FILTERS CONFIGURATION =====

    const tableFilters: ITableFilter[] = useMemo(
        () => [
            {
                id: 'status',
                label: 'Status',
                type: 'select',
                options: [
                    { label: 'All Statuses', value: 'all' },
                    { label: 'Active', value: 'active' },
                    { label: 'Work in Progress', value: 'wip' },
                    { label: 'Archived', value: 'archived' },
                ],
            },
            {
                id: 'featured',
                label: 'Featured',
                type: 'select',
                options: [
                    { label: 'All', value: 'all' },
                    { label: 'Featured Only', value: 'true' },
                    { label: 'Not Featured', value: 'false' },
                ],
            },
            {
                id: 'techStack',
                label: 'Tech Stack',
                type: 'select',
                options: [
                    { label: 'All Technologies', value: '' },
                    ...allTechStacks.map((tech) => ({ label: tech, value: tech })),
                ],
            },
        ],
        [allTechStacks]
    );

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.status && filters.status !== 'all') count++;
        if (filters.featured && filters.featured !== 'all') count++;
        if (filters.techStack) count++;
        return count;
    }, [filters]);

    // ===== SERVER ACTIONS WRAPPERS =====

    const handleDelete = useCallback(async (slug: string) => {
        await deleteProject(slug);
    }, []);

    const handleToggleFeatured = useCallback(async (slug: string) => {
        await toggleProjectFeatured(slug);
    }, []);

    const handleSetStatus = useCallback(async (slug: string, status: 'active' | 'wip' | 'archived') => {
        await updateProjectStatus(slug, status);
    }, []);

    // ===== ROW ACTIONS =====

    const getRowActions = useCallback((project: IProject) => {
        const actions = [
            createEditAction(`/admin/projects/${project.slug}/edit`),
            createToggleFeaturedAction(project.featured || false, async () => {
                startTransition(async () => {
                    await handleToggleFeatured(project.slug);
                    router.refresh();
                });
            }),
        ];

        // Status actions
        if (project.status !== 'active') {
            actions.push({
                label: 'Mark as Active',
                icon: 'CheckCircle2',
                action: 'custom' as const,
                onClick: async () => {
                    startTransition(async () => {
                        await handleSetStatus(project.slug, 'active');
                        router.refresh();
                    });
                },
            });
        }
        if (project.status !== 'wip') {
            actions.push({
                label: 'Mark as WIP',
                icon: 'Clock',
                action: 'custom' as const,
                onClick: async () => {
                    startTransition(async () => {
                        await handleSetStatus(project.slug, 'wip');
                        router.refresh();
                    });
                },
            });
        }
        if (project.status !== 'archived') {
            actions.push({
                label: 'Archive',
                icon: 'Pause',
                action: 'custom' as const,
                onClick: async () => {
                    startTransition(async () => {
                        await handleSetStatus(project.slug, 'archived');
                        router.refresh();
                    });
                },
            });
        }

        actions.push(
            createDeleteAction(async () => {
                startTransition(async () => {
                    await handleDelete(project.slug);
                    router.refresh();
                });
            }, `"${project.title}"`)
        );

        return actions;
    }, [handleDelete, handleToggleFeatured, handleSetStatus, router]);

    // ===== TABLE COLUMNS =====

    const columns: IDataTableColumn<IProject>[] = useMemo(
        () => [
            {
                id: 'project',
                header: 'Project',
                accessor: (project) => (
                    <div className="min-w-0 max-w-md">
                        <Link
                            href={`/admin/projects/${project.slug}/edit`}
                            className="font-medium hover:underline hover:text-accent line-clamp-1 block"
                        >
                            {project.title}
                        </Link>
                        {project.description && (
                            <p className="mt-0.5 text-sm text-muted-foreground line-clamp-1">
                                {project.description}
                            </p>
                        )}
                    </div>
                ),
                width: '300px',
            },
            {
                id: 'status',
                header: 'Status',
                cell: (project) => <StatusBadge variant="status" value={project.status} />,
                align: 'center',
                width: '120px',
            },
            {
                id: 'featured',
                header: 'Featured',
                cell: (project) => <StatusBadge variant="featured" value={project.featured || false} />,
                align: 'center',
                width: '100px',
            },
            {
                id: 'techStack',
                header: 'Tech Stack',
                cell: (project) =>
                    project.techStack && project.techStack.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                            {project.techStack.slice(0, 3).map((tech) => (
                                <span
                                    key={tech}
                                    className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                                >
                                    {tech}
                                </span>
                            ))}
                            {project.techStack.length > 3 && (
                                <span className="text-xs text-muted-foreground">
                                    +{project.techStack.length - 3}
                                </span>
                            )}
                        </div>
                    ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                    ),
                width: '250px',
            },
            {
                id: 'links',
                header: 'Links',
                cell: (project) => (
                    <div className="flex items-center gap-2">
                        {project.githubUrl && (
                            <a
                                href={project.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Github className="h-4 w-4" />
                            </a>
                        )}
                        {project.liveUrl && (
                            <a
                                href={project.liveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        )}
                        {!project.githubUrl && !project.liveUrl && (
                            <span className="text-sm text-muted-foreground">—</span>
                        )}
                    </div>
                ),
                align: 'center',
                width: '80px',
            },
            {
                id: 'updated',
                header: 'Last Updated',
                cell: (project) => (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(project.updatedAt)}
                    </div>
                ),
                width: '150px',
            },
            {
                id: 'actions',
                header: '',
                cell: (project) => (
                    <DataTableActions actions={getRowActions(project)} itemName={`"${project.title}"`} />
                ),
                align: 'right',
                width: '60px',
            },
        ],
        [getRowActions]
    );

    // ===== BULK ACTIONS =====

    const handleBulkDelete = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                const project = projects.find((p) => p.slug === id);
                if (project) {
                    await deleteProject(project.slug);
                }
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [projects, router]);

    const handleBulkFeature = useCallback(async (ids: string[]) => {
        startTransition(async () => {
            for (const id of ids) {
                await toggleProjectFeatured(id);
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [router]);

    const handleBulkSetStatus = useCallback(async (ids: string[], status: 'active' | 'wip' | 'archived') => {
        startTransition(async () => {
            for (const id of ids) {
                await updateProjectStatus(id, status);
            }
            setSelectedIds([]);
            router.refresh();
        });
    }, [router]);

    const bulkActions: IBulkActionNew[] = useMemo(
        () => [
            createBulkFeatureAction(handleBulkFeature),
            createBulkUnfeatureAction(handleBulkFeature),
            createBulkSetActiveAction((ids) => handleBulkSetStatus(ids, 'active')),
            createBulkSetWipAction((ids) => handleBulkSetStatus(ids, 'wip')),
            createBulkArchiveAction((ids) => handleBulkSetStatus(ids, 'archived')),
            createBulkDeleteActionNew(handleBulkDelete),
        ],
        [handleBulkDelete, handleBulkFeature, handleBulkSetStatus]
    );

    // ===== DRAG & DROP REORDER =====

    const handleReorder = useCallback(async (newOrder: IProject[]) => {
        setProjects(newOrder);
        const slugs = newOrder.map((p) => p.slug);
        
        startTransition(async () => {
            await reorderProjects(slugs);
            router.refresh();
        });
    }, [router]);

    // ===== RENDER =====

    return (
        <div className="space-y-6">
            {/* Search & Filters */}
            <TableSearch
                placeholder="Search projects by title, description, or technology..."
                onSearch={setSearchQuery}
                filters={tableFilters}
                onFilterChange={setFilters}
                activeFiltersCount={activeFiltersCount}
            />

            {/* Projects Table */}
            <DataTable
                data={filteredProjects}
                columns={columns}
                keyExtractor={(project) => project.slug}
                selectable
                selectedIds={selectedIds}
                onSelectionChange={setSelectedIds}
                draggable
                onReorder={handleReorder}
                emptyState={
                    <div className="p-12 text-center">
                        <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
                        <p className="mt-2 text-muted-foreground">
                            {searchQuery || activeFiltersCount > 0
                                ? 'Try adjusting your search or filters'
                                : 'Create your first project to get started'}
                        </p>
                        {!searchQuery && activeFiltersCount === 0 && (
                            <Link href="/admin/projects/new">
                                <Button className="mt-6">Create Project</Button>
                            </Link>
                        )}
                    </div>
                }
            />

            {/* Bulk Actions Bar */}
            <BulkActionsBar
                selectedCount={selectedIds.length}
                totalCount={filteredProjects.length}
                actions={bulkActions}
                onClear={() => setSelectedIds([])}
                onAction={async (action) => {
                    await action.action(selectedIds);
                }}
            />
        </div>
    );
}
