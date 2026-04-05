import { PageHeader } from '@/components/admin';
import { getArticleForEdit, getArticles } from '@/server/new/admin/content/article/getArticles';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArticleForm } from '../../../ArticleForm';

interface EditArticlePageProps {
    params: Promise<{
        topicSlug: string;
        slug: string;
    }>;
}

async function getFormData(topicSlug: string, slug: string) {
    const listResult = await getArticles({
        query: slug,
        pagination: { offset: 0, limit: 100 },
    });

    if (!listResult.success) notFound();

    const matched = listResult.data.find((item) => item.slug === slug && item.topicSlug === topicSlug);
    if (!matched) notFound();

    const editResult = await getArticleForEdit(matched.id);
    if (!editResult.success || !editResult.data) notFound();

    return editResult.data;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
    const { topicSlug, slug } = await params;
    const article = await getFormData(topicSlug, slug);

    return (
        <div className='space-y-6'>
            {/* Header */}
            <div className='flex items-center gap-4'>
                <Link href='/admin/articles' className='inline-flex items-center justify-center rounded-lg border bg-background p-2 hover:bg-muted transition-colors' aria-label='Back to articles'>
                    <ArrowLeft className='h-4 w-4' />
                </Link>
                <div className='flex-1'>
                    <PageHeader title={`Edit: ${article.title}`} description={`Last updated ${new Date(article.updatedAt).toLocaleDateString()}`} icon={FileText} />
                </div>
            </div>

            {/* Form - Full Width */}
            <ArticleForm article={article} isEditing />
        </div>
    );
}
