import ArticleForm from '@/app/(admin)/admin/articles/ArticleForm';
import { PageHeader } from '@/components/admin';
import { getArticleForEdit } from '@/server/new/admin/content/article/getArticles';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EditArticlePageProps {
    params: Promise<{
        articleId: string;
    }>;
}

export default async function EditArticlePage({ params }: EditArticlePageProps) {
    const { articleId } = await params;
    const article = await getArticleForEdit(articleId);
    if (!article.success || !article.data) notFound();
    const articleData = article.data;

    return (
        <div className='space-y-6'>
            <div className='flex items-center gap-4'>
                <Link href='/admin/articles' className='inline-flex items-center justify-center rounded-lg border bg-background p-2 hover:bg-muted transition-colors' aria-label='Back to articles'>
                    <ArrowLeft className='h-4 w-4' />
                </Link>
                <div className='flex-1'>
                    <PageHeader title={`Edit: ${articleData.title}`} description={`Last updated ${new Date(articleData.updatedAt).toLocaleDateString()}`} icon={FileText} />
                </div>
            </div>

            <ArticleForm article={articleData} isEditing />
        </div>
    );
}
