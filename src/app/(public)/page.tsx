import { AboutPreview, HeroSection, NewsletterSection } from '@/components/sections';
import { JsonLd, combineSchemas, generateHomeWebPageSchema, generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';

// Force static generation - no DB calls needed for core page
export const dynamic = 'force-static';

/**
 * Premium Landing Page - Fully Static
 *
 * This page is 100% static and requires no database connection.
 * Featured projects and articles are handled separately via client-side
 * or can be added later once DB is configured properly.
 */
const HomePage = () => {
    const schema = combineSchemas(generateWebSiteSchema(), generateOrganizationSchema(), generateHomeWebPageSchema());

    return (
        <>
            {/* JSON-LD Structured Data */}
            <JsonLd data={schema} />

            <HeroSection />
            <AboutPreview />
            <NewsletterSection />
        </>
    );
};

export default HomePage;
