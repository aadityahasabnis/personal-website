import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * On-Demand Revalidation API Route
 *
 * Triggers ISR revalidation for specific paths.
 * Used when content is published/updated from the admin panel.
 *
 * Security: Requires a secret token to prevent unauthorized revalidation.
 *
 * Usage:
 * - POST /api/revalidate
 *   Body: { path?: string, type?: 'article' | 'note' | 'project' }
 *   Headers: { Authorization: Bearer <REVALIDATE_SECRET> }
 *
 * Examples:
 * - Revalidate specific article: { path: '/articles/my-article-slug' }
 * - Revalidate by type: { type: 'article' } (revalidates listing + all article paths)
 */

interface IRevalidateBody {
    path?: string;
    type?: 'article' | 'note' | 'project' | 'page';
    slug?: string;
}

const validateSecret = (request: NextRequest): boolean => {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.REVALIDATE_SECRET;

    if (!secret) {
        console.warn('REVALIDATE_SECRET is not set in environment variables');
        return false;
    }

    if (!authHeader) {
        return false;
    }

    const token = authHeader.replace('Bearer ', '');
    return token === secret;
};

export const POST = async (request: NextRequest): Promise<NextResponse> => {
    // Validate authorization
    if (!validateSecret(request)) {
        return NextResponse.json(
            { error: 'Unauthorized', message: 'Invalid or missing authorization token' },
            { status: 401 }
        );
    }

    try {
        const body = (await request.json()) as IRevalidateBody;
        const { path, type, slug } = body;

        const revalidated: string[] = [];

        // Revalidate specific path
        if (path) {
            revalidatePath(path);
            revalidated.push(`path: ${path}`);
        }

        // Revalidate by content type
        if (type) {
            switch (type) {
                case 'article':
                    revalidatePath('/articles');
                    revalidatePath('/', 'layout'); // Home page may show articles
                    if (slug) {
                        revalidatePath(`/articles/${slug}`);
                        revalidated.push(`path: /articles/${slug}`);
                    }
                    revalidated.push('path: /articles', 'path: / (layout)');
                    break;

                case 'note':
                    revalidatePath('/notes');
                    if (slug) {
                        revalidatePath(`/notes/${slug}`);
                        revalidated.push(`path: /notes/${slug}`);
                    }
                    revalidated.push('path: /notes');
                    break;

                case 'project':
                    revalidatePath('/projects');
                    revalidatePath('/', 'layout'); // Home page may show projects
                    if (slug) {
                        revalidatePath(`/projects/${slug}`);
                        revalidated.push(`path: /projects/${slug}`);
                    }
                    revalidated.push('path: /projects', 'path: / (layout)');
                    break;

                case 'page':
                    if (slug) {
                        revalidatePath(`/${slug}`);
                        revalidated.push(`path: /${slug}`);
                    }
                    break;
            }
        }

        // Always revalidate sitemap when content changes
        if (type || path) {
            revalidatePath('/sitemap.xml');
            revalidated.push('path: /sitemap.xml');
        }

        if (revalidated.length === 0) {
            return NextResponse.json(
                {
                    error: 'Bad Request',
                    message: 'No valid revalidation target provided. Use path, tag, or type.',
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            revalidated,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Revalidation error:', error);

        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
};

// GET method for health check
export const GET = (): NextResponse => {
    return NextResponse.json({
        status: 'ok',
        endpoint: '/api/revalidate',
        method: 'POST',
        description: 'On-demand ISR revalidation endpoint',
        requiredHeaders: ['Authorization: Bearer <REVALIDATE_SECRET>'],
        bodyOptions: {
            path: 'Specific path to revalidate (e.g., /articles/my-slug)',
            type: 'Content type: article | note | project | page',
            slug: 'Content slug (used with type)',
        },
    });
};
