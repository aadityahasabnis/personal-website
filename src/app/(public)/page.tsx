import AboutPreview from '@/components/sections/AboutPreview';
import HeroSection from '@/components/sections/HeroSection';
import NewsletterSection from '@/components/sections/NewsletterSection';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { createPageMetadata } from '@/lib/metadata';
import { JsonLd, combineSchemas, generateHomeWebPageSchema, generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

// Static homepage with schema-first SEO output.

const description = `Official site of ${SITE_CONFIG.author.name}. Explore articles, blogs, projects, and insights on software engineering and web systems.`;

export const metadata: Metadata = createPageMetadata({
    title: SITE_CONFIG.title,
    description,
    canonicalPath: '/',
    keywords: ['portfolio', 'software engineer', 'articles', 'blogs', 'projects', SITE_CONFIG.author.name],
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
    const schema = combineSchemas(generateWebSiteSchema(), generateOrganizationSchema(), generateHomeWebPageSchema());

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
