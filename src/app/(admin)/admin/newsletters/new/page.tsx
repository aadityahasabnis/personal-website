import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { NewsletterForm } from '../NewsletterForm';

// =============================================================
// Create Newsletter Page
// =============================================================

const CreateNewsletterPage = (): React.ReactElement => {
    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-6">
            <div>
                <Link
                    href="/admin/newsletters"
                    className="mb-4 inline-flex items-center gap-2 text-label text-muted-foreground transition-fast hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to Newsletters
                </Link>
                <h1 className="text-h1 text-foreground">Create New Newsletter</h1>
                <p className="mt-1 text-regular text-muted-foreground">
                    Use the stepper to compose and preview your newsletter before sending.
                </p>
            </div>

            <NewsletterForm />
        </div>
    );
};

export default CreateNewsletterPage;
