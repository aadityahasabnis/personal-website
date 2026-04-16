'use client';

import LegalPageClient from '@/components/content/legal/LegalPageClient';
import { PRIVACY_PAGE_CONTENT } from '@/constants/legalConstants';

// =============================================================
// Privacy Page — Client Component
// =============================================================
export default function PrivacyPageClient() {
    return <LegalPageClient content={PRIVACY_PAGE_CONTENT} />;
}
