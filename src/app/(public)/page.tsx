import {
  HeroSection,
  AboutPreview,
  NewsletterSection,
} from '@/components/sections';

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
  return (
    <>
      {/* Hero Section - Three.js particles + animated text */}
      <HeroSection />

      {/* About Preview Section */}
      <AboutPreview />

      {/* Newsletter Section */}
      <NewsletterSection />
    </>
  );
};

export default HomePage;
