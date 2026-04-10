import { ArrowLeft, Reply } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import ContactResponseForm from '@/app/(admin)/admin/contacts/ContactResponseForm';
import { PageHeader } from '@/components/admin';
import { getContactById } from '@/server/new/admin/contacts';

interface IContactResponsePageProps {
    params: Promise<{
        contactId: string;
    }>;
}

const ContactResponsePage = async ({ params }: IContactResponsePageProps): Promise<React.ReactElement> => {
    const { contactId } = await params;
    const result = await getContactById(contactId);

    if (!result.success || !result.data) {
        notFound();
    }

    const contact = result.data;

    return (
        <div className='mx-auto max-w-5xl space-y-6 pb-6'>
            <div className='flex items-center gap-4'>
                <Link href='/admin/contacts' className='inline-flex items-center justify-center rounded-lg border bg-background p-2 transition-colors hover:bg-muted' aria-label='Back to contacts'>
                    <ArrowLeft className='h-4 w-4' />
                </Link>

                <div className='flex-1'>
                    <PageHeader title={`Respond to ${contact.name}`} description={`Replying to: ${contact.subject}`} icon={Reply} />
                </div>
            </div>

            <ContactResponseForm contact={contact} />
        </div>
    );
};

export default ContactResponsePage;
