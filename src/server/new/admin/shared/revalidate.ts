import { revalidatePath } from 'next/cache';
import { revalidateContent } from '../../utils/helper';

// ========================================================
// Revalidation
// ========================================================

export const revalidateTopicPaths = (topicSlug?: string): void => {
    // Topic operations affect topic admin lists plus article content trees.
    const paths = ['/admin/topics', '/admin/articles'];
    paths.forEach((path) => revalidatePath(path));
    revalidateContent('article', undefined, topicSlug);
};

export const revalidateSubtopicPaths = (topicSlug?: string): void => {
    // Subtopic operations affect subtopic admin lists plus article content trees.
    const paths = ['/admin/subtopics', '/admin/articles'];
    paths.forEach((path) => revalidatePath(path));
    revalidateContent('article', undefined, topicSlug);
};

export const revalidateArticlePaths = (topicSlug?: string, articleSlug?: string): void => {
    revalidateContent('article', articleSlug, topicSlug);
};

export const revalidateBlogPaths = (blogSlug?: string): void => {
    revalidateContent('blog', blogSlug);
};

export const revalidateProjectPaths = (projectSlug?: string): void => {
    revalidateContent('project', projectSlug);
};
