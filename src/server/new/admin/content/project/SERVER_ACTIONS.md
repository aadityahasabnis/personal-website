# Project Server Actions Guide

## Purpose

This module provides project-focused server actions for admin workflows:

- create, update, delete
- publish status changes (`draft | published | archived`)
- project lifecycle status changes (`In Progress | Live | Archived | null`)
- featured changes
- list and edit queries
- reorder and bulk operations

Use these actions as the backend contract for admin routes and server-side workflows.

## Canonical Usage

- Use these actions as the canonical backend contract in server contexts.
- Route handlers under `src/app/api/admin/content/projects/**` are optional adapters and must delegate to these actions.
- Client components should use server boundaries; keep mutation logic centralized in these actions.

## Action Map

### `createProject(input)`

- inserts content document with `type: project`
- computes reading time when missing
- writes project-specific fields (`techStack`, links, gallery, dates, status, order)
- triggers project path revalidation

### `updateProject(projectId, input)`

- updates core and project-specific fields
- updates publish timestamps on publish-boundary transitions
- validates date relationships (`completedDate >= startDate`)
- triggers revalidation for old and new slug paths

### `deleteProject(projectId)`

- deletes project document
- deletes related `pageStats` and `comments`
- triggers revalidation

### `changeProjectPublishStatus(projectId, status)`

- sets `publishStatus` to `draft | published | archived`
- updates `publishedAt` during transitions
- triggers revalidation

### `setProjectStatus(projectId, status)`

- validates publish status
- delegates to `changeProjectPublishStatus`

### `setProjectLifecycleStatus(projectId, status)`

- sets project lifecycle `status`
- updates `updatedAt`
- triggers revalidation

### `setProjectFeatured(projectId, featured)`

- sets `featured: true | false`
- updates `updatedAt`
- triggers revalidation

### `toggleProjectFeatured(projectId)`

- flips `featured`
- delegates to `setProjectFeatured`

### `getProjects(params)`

- read-only query for admin listing with filters, pagination, and sort
- returns compact rows optimized for tables

### `getProjectForEdit(projectId)`

- read-only query for edit prefill
- returns full edit payload for one project

### `reorderProjects(projectIds, status?)`

- validates all IDs are in the requested scope
- updates `order` and `updatedAt` in bulk
- triggers revalidation

### Bulk helpers

- `bulkSetProjectStatus(projectIds, status)`
- `bulkPublishProjects(projectIds)`
- `bulkArchiveProjects(projectIds)`
- `bulkDraftProjects(projectIds)`
- `bulkSetProjectLifecycleStatus(projectIds, status)`
- `bulkDeleteProjects(projectIds)`

Use bulk helpers for high-throughput admin operations with batched database writes.

## Quick Decision Guide

- Create project: `createProject`
- Edit project: `updateProject`
- Change publish state: `setProjectStatus`
- Change lifecycle state: `setProjectLifecycleStatus`
- Change featured state: `setProjectFeatured`
- Reorder cards/listing: `reorderProjects`
- List projects: `getProjects`
- Get edit payload: `getProjectForEdit`
- Bulk operations: bulk helpers

## Revalidation Contract

- Revalidation is helper-driven through admin shared delegates and `revalidateContent`.
- No dedicated `/api/revalidate` dependency is part of the mutation pipeline.
