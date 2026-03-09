/**
 * Admin Project Actions – Barrel Export
 */

// Mutations
export { createProject } from './createProject';
export { updateProject } from './updateProject';
export { deleteProject } from './deleteProject';
export {
    publishProject,
    unpublishProject,
    toggleProjectFeatured,
    updateProjectStatus,
    reorderProjects,
} from './publishProject';

// Queries
export { getProjects, getProjectForEdit } from './getProjects';

// Types – admin serialized types from getProjects, input types from types.ts
export type { SerializedProject, SerializedProjectForEdit } from './getProjects';
export type { ProjectCreateInput, ProjectUpdateInput } from './types';
