'use client';

import { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FolderKanban, Calendar, ExternalLink, Github } from 'lucide-react';

import { formatDate } from '@/lib/utils';
import type { IProject } from '@/interfaces';
import { useAdminTable } from '@/hooks';
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
import { deleteProject, toggleProjectFeatured, updateProjectStatus, reorderProjects } from '@/server/actions/projects';
import { Button } from '@/components/ui/button';

// ===== COMPONENT =====

interface IProjectsTableProps {
    projects: IProject[];
}

export function ProjectsTable({ projects }: IProjectsTableProps): React.ReactElement {
    const table = useAdminTable({
        data: projects,
        keyExtractor: (p) => p.slug,
        searchFn: (project, query) =>
            project.title.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query) ||
            project.techStack?.some((tech) => tech.toLowerCase().includes(query)) ||
            project.tags.some((tag) => tag.toLowerCase().includes(query)),
    });

    // Local items for drag-and-drop reordering
    const [localItems, setLocalItems] = useState(projects);
    const prevFilteredItemsRef = useRef(table.filteredItems);
    
    // Sync localItems when filteredItems change - use ref comparison to prevent loops
    useEffect(() => {
        if (prevFilteredItemsRef.current !== table.filteredItems) {
            prevFilteredItemsRef.current = table.filteredItems;
            setLocalItems(table.filteredItems);
        }
    }, [table.filteredItems]);

    // Get unique tech stacks for filter
    const allTechStacks = useMemo(() => {
        const techSet = new Set<string>();
        projects.forEach((p) => p.techStack?.forEach((tech) => techSet.add(tech)));
        return Array.from(techSet).sort();
    }, [projects]);

    // ===== FILTERS CONFIG =====

    const tableFilters: ITableFilter[] = useMemo(() => [
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
    ], [allTechStacks]);

    // ===== ROW ACTIONS =====

    const getRowActions = (project: IProject) => {
        const actions = [
            createEditAction(`/admin/projects/${project.slug}/edit`),
            createToggleFeaturedAction(project.featured || false, () =>
                table.optimisticUpdate(
                    project.slug,
                    (p) => ({ ...p, featured: !p.featured }),
                    () => toggleProjectFeatured(project.slug)
                )
            ),
        ];

        // Status actions
        if (project.status !== 'active') {
            actions.push({
                label: 'Mark as Active',
                icon: 'CheckCircle2',
                action: 'custom' as const,
                onClick: async () => {
                    await table.optimisticUpdate(
                        project.slug,
                        (p) => ({ ...p, status: 'active' as const }),
                        () => updateProjectStatus(project.slug, 'active')
                    );
                },
            });
        }
        if (project.status !== 'wip') {
            actions.push({
                label: 'Mark as WIP',
                icon: 'Clock',
                action: 'custom' as const,
                onClick: async () => {
                    await table.optimisticUpdate(
                        project.slug,
                        (p) => ({ ...p, status: 'wip' as const }),
                        () => updateProjectStatus(project.slug, 'wip')
                    );
                },
            });
        }
        if (project.status !== 'archived') {
            actions.push({
                label: 'Archive',
                icon: 'Pause',
                action: 'custom' as const,
                onClick: async () => {
                    await table.optimisticUpdate(
                        project.slug,
                        (p) => ({ ...p, status: 'archived' as const }),
                        () => updateProjectStatus(project.slug, 'archived')
                    );
                },
            });
        }

        actions.push(
            createDeleteAction(
                () => table.optimisticDelete(project.slug, () => deleteProject(project.slug)),
                `"${project.title}"`
            )
        );

        return actions;
    };

    // ===== COLUMNS =====

    const columns: IDataTableColumn<IProject>[] = [
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
                project.techStack?.length ? (
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
                            <span className="text-xs text-muted-foreground">+{project.techStack.length - 3}</span>
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
            cell: (project) => <DataTableActions actions={getRowActions(project)} itemName={`"${project.title}"`} />,
            align: 'right',
            width: '60px',
        },
    ];

    // ===== BULK ACTIONS =====

    const bulkActions: IBulkActionNew[] = [
        createBulkFeatureAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (p) => ({ ...p, featured: true }),
                async () => { await Promise.all(ids.filter((id) => !table.items.find((p) => p.slug === id)?.featured).map((id) => toggleProjectFeatured(id))); }
            )
        ),
        createBulkUnfeatureAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (p) => ({ ...p, featured: false }),
                async () => { await Promise.all(ids.filter((id) => table.items.find((p) => p.slug === id)?.featured).map((id) => toggleProjectFeatured(id))); }
            )
        ),
        createBulkSetActiveAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (p) => ({ ...p, status: 'active' as const }),
                async () => { await Promise.all(ids.map((id) => updateProjectStatus(id, 'active'))); }
            )
        ),
        createBulkSetWipAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (p) => ({ ...p, status: 'wip' as const }),
                async () => { await Promise.all(ids.map((id) => updateProjectStatus(id, 'wip'))); }
            )
        ),
        createBulkArchiveAction((ids) =>
            table.optimisticBulkUpdate(
                ids,
                (p) => ({ ...p, status: 'archived' as const }),
                async () => { await Promise.all(ids.map((id) => updateProjectStatus(id, 'archived'))); }
            )
        ),
        createBulkDeleteActionNew(async (ids) => {
            await Promise.all(ids.map((id) => table.optimisticDelete(id, () => deleteProject(id))));
        }),
    ];

    // ===== DRAG & DROP REORDER =====

    const handleReorder = useCallback(async (newOrder: IProject[]) => {
        setLocalItems(newOrder);
        const slugs = newOrder.map((p) => p.slug);
        await reorderProjects(slugs);
        table.refresh();
    }, [table]);

    // ===== RENDER =====

    return (
        <div className="space-y-6">
            <TableSearch
                placeholder="Search projects by title, description, or technology..."
                onSearch={table.setSearchQuery}
                filters={tableFilters}
                onFilterChange={table.setFilters}
                activeFiltersCount={table.activeFiltersCount}
            />

            <DataTable
                data={localItems}
                columns={columns}
                keyExtractor={(project) => project.slug}
                selectable
                selectedIds={table.selectedIds}
                onSelectionChange={table.setSelectedIds}
                draggable
                onReorder={handleReorder}
                emptyState={
                    <div className="p-12 text-center">
                        <FolderKanban className="mx-auto h-12 w-12 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
                        <p className="mt-2 text-muted-foreground">
                            {table.searchQuery || table.activeFiltersCount > 0
                                ? 'Try adjusting your search or filters'
                                : 'Create your first project to get started'}
                        </p>
                        {!table.searchQuery && table.activeFiltersCount === 0 && (
                            <Link href="/admin/projects/new">
                                <Button className="mt-6">Create Project</Button>
                            </Link>
                        )}
                    </div>
                }
            />

            <BulkActionsBar
                selectedCount={table.selectedIds.length}
                totalCount={localItems.length}
                actions={bulkActions}
                onClear={table.clearSelection}
                onAction={async (action) => action.action(table.selectedIds)}
            />
        </div>
    );
}
