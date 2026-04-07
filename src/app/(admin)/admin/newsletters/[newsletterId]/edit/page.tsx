import { NewsletterForm } from '@/app/(admin)/admin/newsletters/NewsletterForm';
import { PageHeader } from '@/components/admin';
import { getNewsletterForEdit } from '@/server/new/admin/newsletter';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface EditNewsletterPageProps {
    params: Promise<{
        newsletterId: string;
    }>;
}

export default async function EditNewsletterPage({ params }: EditNewsletterPageProps) {
    const { newsletterId } = await params;
    const newsletter = await getNewsletterForEdit(newsletterId);
    
    if (!newsletter.success || !newsletter.data) {
        notFound();
    }
    
    const newsletterData = newsletter.data;
    const isSent = newsletterData.status === 'sent';

    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/newsletters"
                    className="inline-flex items-center justify-center rounded-lg border bg-background p-2 transition-colors hover:bg-muted"
                    aria-label="Back to newsletters"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div className="flex-1">
                    <PageHeader
                        title={isSent ? `View: ${newsletterData.subject}` : `Edit: ${newsletterData.subject}`}
                        description={
                            isSent
                                ? `Sent newsletter • ${new Date(newsletterData.updatedAt).toLocaleDateString()}`
                                : `Last updated ${new Date(newsletterData.updatedAt).toLocaleDateString()}`
                        }
                        icon={Mail}
                    />
                </div>
            </div>

            <NewsletterForm newsletter={newsletterData} isEditing />
        </div>
    );
}
