import AboutPreview from '@/components/sections/AboutPreview';
import HeroSection from '@/components/sections/HeroSection';
import NewsletterSection from '@/components/sections/NewsletterSection';
import { JsonLd, combineSchemas, generateHomeWebPageSchema, generateOrganizationSchema, generateWebSiteSchema } from '@/lib/seo';

export const dynamic = 'force-static';

// Static homepage with schema-first SEO output.

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
