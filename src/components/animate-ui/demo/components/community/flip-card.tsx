'use client';

import { FlipCard } from '@/components/animate-ui/components/community/flip-card';
import { SOCIAL_LINKS } from '@/constants/siteConstants';

export const FlipCardDemo = () => {
    return (
        <FlipCard
            name='Aaditya Hasabnis'
            role='Frontend Engineer • UI Systems Builder'
            username='creative_northstar'
            image='https://cdn.aadityahasabnis.workers.dev/cdn/images/gallery/aadizz-emoji.png-MW'
            tagline='Building high-performance, animated UI systems with clean architecture and premium user experiences.'
            links={SOCIAL_LINKS}
        />
    );
};
