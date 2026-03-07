/**
 * Projects Domain - Barrel Export
 */

// Types
export type { CreateProjectRequest, CreateProjectResponse } from './createProject';
export type { UpdateProjectRequest, UpdateProjectResponse } from './updateProject';
export type { DeleteProjectResponse } from './deleteProject';
export type { ToggleProjectResponse, UpdateStatusResponse, ReorderProjectsResponse } from './toggleProject';
export type { SerializedProject, ProjectForEdit } from './getProjects';

// Actions
export { createProject } from './createProject';
export { updateProject } from './updateProject';
export { deleteProject } from './deleteProject';
export { toggleProjectFeatured, updateProjectStatus, reorderProjects } from './toggleProject';

// Queries
export { getProjects, getProjectForEdit, getFeaturedProjects } from './getProjects';
