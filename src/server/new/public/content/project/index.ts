import { defineReadContract } from '../shared';
import { getPublishedProjectById } from './getPublishedProjectById';
import { getPublishedProjectByPath } from './getPublishedProjectByPath';
import { getPublishedProjects } from './getPublishedProjects';
import { getPublishedProjectStaticPaths } from './getPublishedProjectStaticPaths';

export const PROJECT_READ_CONTRACT = defineReadContract({
	byPath: getPublishedProjectByPath,
	byId: getPublishedProjectById,
	list: getPublishedProjects,
	staticPaths: getPublishedProjectStaticPaths,
});

export * from './getPublishedProjectById';
export * from './getPublishedProjectByPath';
export * from './getPublishedProjects';
export * from './getPublishedProjectStaticPaths';
export * from './types';

