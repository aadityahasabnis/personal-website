import type { Metadata } from 'next';

import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';

import TestShowcaseClient from './TestShowcaseClient';

export const metadata: Metadata = createPageMetadata({
    title: 'Component Test Lab',
    description: `Internal component showcase for ${SITE_CONFIG.author.name}. Preview UI/interactive components with live constants before production placement.`,
    canonicalPath: '/test',
    keywords: ['component testing', 'ui preview', 'design QA', SITE_CONFIG.author.name],
    robots: {
        index: false,
        follow: false,
    },
});

export default function TestPage() {
    return <TestShowcaseClient />;
}
