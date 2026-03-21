import { defineReadContract } from '../shared';
import { getPublishedBlogById } from './getPublishedBlogById';
import { getPublishedBlogByPath } from './getPublishedBlogByPath';
import { getPublishedBlogs } from './getPublishedBlogs';
import { getPublishedBlogStaticPaths } from './getPublishedBlogStaticPaths';

export const BLOG_READ_CONTRACT = defineReadContract({
	byPath: getPublishedBlogByPath,
	byId: getPublishedBlogById,
	list: getPublishedBlogs,
	staticPaths: getPublishedBlogStaticPaths,
});

export * from './getPublishedBlogById';
export * from './getPublishedBlogByPath';
export * from './getPublishedBlogs';
export * from './getPublishedBlogStaticPaths';
export * from './types';

