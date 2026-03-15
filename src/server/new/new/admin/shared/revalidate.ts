import { revalidatePath } from 'next/cache';

// ========================================================
// Revalidation
// ========================================================

export const revalidateTopicPaths = (topicSlug?: string): void => {
    const paths = ['/admin/topics', '/admin/articles', '/articles', '/', '/sitemap.xml'];
    if (topicSlug) paths.push(`/articles/${topicSlug}`);
    paths.forEach((path) => revalidatePath(path));
};

export const revalidateSubtopicPaths = (topicSlug?: string): void => {
    const paths = ['/admin/subtopics', '/admin/articles', '/articles', '/', '/sitemap.xml'];
    if (topicSlug) paths.push(`/articles/${topicSlug}`);
    paths.forEach((path) => revalidatePath(path));
};

export const revalidateArticlePaths = (topicSlug?: string, articleSlug?: string): void => {
    const paths = ['/admin/articles', '/articles', '/', '/sitemap.xml'];
    if (topicSlug) paths.push(`/articles/${topicSlug}`);
    if (topicSlug && articleSlug) paths.push(`/articles/${topicSlug}/${articleSlug}`);
    paths.forEach((path) => revalidatePath(path));
};
