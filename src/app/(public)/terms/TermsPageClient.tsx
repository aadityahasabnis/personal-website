'use client';

import LegalPageClient from '@/components/content/legal/LegalPageClient';
import { TERMS_PAGE_CONTENT } from '@/constants/legalConstants';

// =============================================================
// Terms Page — Client Component
// =============================================================
export default function TermsPageClient() {
    return <LegalPageClient content={TERMS_PAGE_CONTENT} />;
}
