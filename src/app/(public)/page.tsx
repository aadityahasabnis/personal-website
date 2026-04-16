import AboutPreview from '@/components/sections/AboutPreview';
import HeroSection from '@/components/sections/HeroSection';
import NewsletterSection from '@/components/sections/NewsletterSection';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { JsonLd, combineSchemas, generatePersonSchema, generateWebPageSchema, generateWebSiteSchema } from '@/lib/seo';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

// Static homepage with schema-first SEO output.

const description = SITE_CONFIG.description;

export const metadata: Metadata = createPageMetadata({
    title: SITE_CONFIG.title,
    titleAbsolute: true,
    description,
    canonicalPath: '/',
    keywords: [...SITE_CONFIG.seo.defaultKeywords, SITE_CONFIG.author.name],
    includeAuthor: true,
    includeSocial: true,
    socialType: 'website',
    imageUrl: SITE_CONFIG.seo.ogImage,
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
});

const HomePage = () => {
    const schema = combineSchemas(
        generateWebSiteSchema(),
        generatePersonSchema(),
        generateWebPageSchema({
            title: SITE_CONFIG.title,
            description,
            path: '/',
        }),
    );

    return (
        <>
            <JsonLd data={schema} />

            <HeroSection />
            <AboutPreview />
            <NewsletterSection />
        </>
    );
};

export default HomePage;
