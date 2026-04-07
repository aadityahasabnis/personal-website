'use client';

// =============================================================
// ProjectsTable - Professional Server-Side Table
// Uses DataTable component with server-action-first architecture
// Uses useAction hook for TanStack Query mutation benefits
// =============================================================

import { FolderKanban } from 'lucide-react';
import Link from 'next/link';
import { useMemo } from 'react';

import { StatusBadge } from '@/components/admin';
import { DataTable } from '@/components/admin/table';
import { PROJECT_STATUS, type ProjectStatusType, type PublishStatusType } from '@/constants/schemaConstants';
import { useSnackbar } from '@/hooks/form/useSnackbar';
import { useAction } from '@/hooks/server/useAction';
import { formatDate } from '@/lib/utils';
import type { IProjectRow } from '@/server/new/admin/content/project';
import {
    bulkArchiveProjects,
    bulkDeleteProjects,
    bulkDraftProjects,
    bulkPublishProjects,
    deleteProject,
    getProjects,
    setProjectLifecycleStatus,
    setProjectStatus,
    toggleProjectFeatured,
} from '@/server/new/admin/content/project';

import {
    createProjectsTableConfig,
    type IProjectActionHandlers,
    type IProjectBulkActionHandlers,
} from './config';

// =============================================================
// Types
// =============================================================

interface IProjectsTableProps {
    /** Initial server-side data for hydration */
    initialData?: IProjectRow[] | undefined;
    /** Initial total count for pagination */
    initialTotal?: number | undefined;
}

// =============================================================
// ProjectsTable Component
// =============================================================

export function ProjectsTable({ initialData, initialTotal }: IProjectsTableProps): React.ReactElement {
    const { showSuccess, showError } = useSnackbar();

    // =============================================================
    // Row Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - DataTableActions handles invalidation
    // =============================================================

    const setStatusAction = useAction({
        action: async (project: IProjectRow, status: PublishStatusType) => 
            setProjectStatus(project.id, status),
        onSuccess: (_data, response, [, status]) => {
            const statusLabels = { draft: 'Draft', published: 'Published', archived: 'Archived' };
            showSuccess(response.message ?? `Project moved to ${statusLabels[status]}`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to change project status');
        },
    });

    const setLifecycleStatusAction = useAction({
        action: async (project: IProjectRow, status: ProjectStatusType | null) => 
            setProjectLifecycleStatus(project.id, status),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Project lifecycle status updated');
        },
        onError: (message) => {
            showError(message ?? 'Failed to change project lifecycle status');
        },
    });

    const toggleFeaturedAction = useAction({
        action: async (project: IProjectRow) => toggleProjectFeatured(project.id),
        onSuccess: (_data, response, [project]) => {
            showSuccess(response.message ?? (project.featured ? 'Project unfeatured' : 'Project featured'));
        },
        onError: (message) => {
            showError(message ?? 'Failed to toggle featured state');
        },
    });

    const deleteAction = useAction({
        action: async (project: IProjectRow) => deleteProject(project.id),
        onSuccess: (_data, response) => {
            showSuccess(response.message ?? 'Project deleted successfully');
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete project');
        },
    });

    const rowActionHandlers: IProjectActionHandlers = useMemo(
        () => ({
            onSetStatus: async (project: IProjectRow, status: PublishStatusType) => {
                await setStatusAction.mutateAsync(project, status);
            },
            onSetLifecycleStatus: async (project: IProjectRow, status: ProjectStatusType | null) => {
                await setLifecycleStatusAction.mutateAsync(project, status);
            },
            onToggleFeatured: async (project: IProjectRow) => {
                await toggleFeaturedAction.mutateAsync(project);
            },
            onDelete: async (project: IProjectRow) => {
                await deleteAction.mutateAsync(project);
            },
        }),
        [setStatusAction.mutateAsync, setLifecycleStatusAction.mutateAsync, toggleFeaturedAction.mutateAsync, deleteAction.mutateAsync],
    );

    // =============================================================
    // Bulk Action Mutations (using useAction for TanStack Query benefits)
    // Note: invalidateKeys not needed - BulkActionsBar handles invalidation
    // =============================================================

    const bulkPublishAction = useAction({
        action: async (_rows: IProjectRow[], ids: string[]) => bulkPublishProjects(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} projects published`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to publish projects');
        },
    });

    const bulkDraftAction = useAction({
        action: async (_rows: IProjectRow[], ids: string[]) => bulkDraftProjects(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} projects moved to draft`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to move projects to draft');
        },
    });

    const bulkArchiveAction = useAction({
        action: async (_rows: IProjectRow[], ids: string[]) => bulkArchiveProjects(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} projects archived`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to archive projects');
        },
    });

    const bulkDeleteAction = useAction({
        action: async (_rows: IProjectRow[], ids: string[]) => bulkDeleteProjects(ids),
        onSuccess: (_data, response, [, ids]) => {
            showSuccess(response.message ?? `${ids.length} projects deleted`);
        },
        onError: (message) => {
            showError(message ?? 'Failed to delete projects');
        },
    });

    const bulkActionHandlers: IProjectBulkActionHandlers = useMemo(
        () => ({
            onBulkPublish: async (rows: IProjectRow[], ids: string[]) => {
                await bulkPublishAction.mutateAsync(rows, ids);
            },
            onBulkDraft: async (rows: IProjectRow[], ids: string[]) => {
                await bulkDraftAction.mutateAsync(rows, ids);
            },
            onBulkArchive: async (rows: IProjectRow[], ids: string[]) => {
                await bulkArchiveAction.mutateAsync(rows, ids);
            },
            onBulkDelete: async (rows: IProjectRow[], ids: string[]) => {
                await bulkDeleteAction.mutateAsync(rows, ids);
            },
        }),
        [
            bulkPublishAction.mutateAsync,
            bulkDraftAction.mutateAsync,
            bulkArchiveAction.mutateAsync,
            bulkDeleteAction.mutateAsync,
        ],
    );

    // =============================================================
    // Table Config with Custom Cell Renderers
    // =============================================================

    const config = useMemo(() => {
        const baseConfig = createProjectsTableConfig({
            rowActions: rowActionHandlers,
            bulkActions: bulkActionHandlers,
        });

        // Add custom cell renderers
        const columnsWithRenderers = baseConfig.columns.map((col) => {
            // Project column - Icon + Title + Slug
            if (col.id === 'project') {
                return {
                    ...col,
                    cell: (project: IProjectRow) => (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <FolderKanban className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <Link
                                    href={`/admin/projects/${project.id}/edit`}
                                    className="block truncate font-medium hover:text-foreground hover:underline"
                                >
                                    {project.title}
                                </Link>
                                <p className="text-sm text-muted-foreground">/{project.slug}</p>
                            </div>
                        </div>
                    ),
                };
            }

            // Tech Stack column - Badges
            if (col.id === 'techStack') {
                return {
                    ...col,
                    cell: (project: IProjectRow) => {
                        const { techStack } = project;
                        if (!techStack || techStack.length === 0) {
                            return <span className="text-sm text-muted-foreground">—</span>;
                        }
                        
                        const displayTech = techStack.slice(0, 3);
                        const remaining = techStack.length - 3;
                        
                        return (
                            <div className="flex flex-wrap gap-1">
                                {displayTech.map((tech) => (
                                    <span
                                        key={tech}
                                        className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
                                    >
                                        {tech}
                                    </span>
                                ))}
                                {remaining > 0 && (
                                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                                        +{remaining}
                                    </span>
                                )}
                            </div>
                        );
                    },
                };
            }

            // Lifecycle Status column - Project status badge (in_progress/live/archived)
            if (col.id === 'status') {
                return {
                    ...col,
                    cell: (project: IProjectRow) => {
                        const { status } = project;
                        
                        if (!status) {
                            return <span className="text-sm text-muted-foreground">—</span>;
                        }
                        
                        const statusConfig = {
                            [PROJECT_STATUS.IN_PROGRESS]: {
                                label: 'In Progress',
                                className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                            },
                            [PROJECT_STATUS.LIVE]: {
                                label: 'Live',
                                className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                            },
                            [PROJECT_STATUS.ARCHIVED]: {
                                label: 'Archived',
                                className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                            },
                        };
                        
                        const config = statusConfig[status];
                        
                        return (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
                                {config.label}
                            </span>
                        );
                    },
                };
            }

            // Publish Status column - 3-state badge (draft/published/archived)
            if (col.id === 'publishStatus') {
                return {
                    ...col,
                    cell: (project: IProjectRow) => {
                        const { publishStatus } = project;
                        
                        const statusConfig = {
                            published: {
                                label: 'Published',
                                className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                            },
                            draft: {
                                label: 'Draft',
                                className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                            },
                            archived: {
                                label: 'Archived',
                                className: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
                            },
                        };
                        
                        const config = statusConfig[publishStatus];
                        
                        return (
                            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
                                {config.label}
                            </span>
                        );
                    },
                };
            }

            // Featured column - StatusBadge
            if (col.id === 'featured') {
                return {
                    ...col,
                    cell: (project: IProjectRow) => <StatusBadge variant="featured" value={project.featured} />,
                };
            }

            // Reading time column - Minutes badge
            if (col.id === 'readingTime') {
                return {
                    ...col,
                    cell: (project: IProjectRow) => (
                        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium">
                            {project.readingTime} min
                        </span>
                    ),
                };
            }

            // Updated column - Formatted date
            if (col.id === 'updatedAt') {
                return {
                    ...col,
                    cell: (project: IProjectRow) => (
                        <span className="text-sm text-muted-foreground">{formatDate(project.updatedAt)}</span>
                    ),
                };
            }

            return col;
        });

        return {
            ...baseConfig,
            columns: columnsWithRenderers,
        };
    }, [rowActionHandlers, bulkActionHandlers]);

    // =============================================================
    // Render
    // =============================================================

    return <DataTable config={config} serverAction={getProjects} initialData={initialData} initialTotal={initialTotal} />;
}

export default ProjectsTable;
