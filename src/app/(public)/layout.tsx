import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AmbientBackground, NoiseOverlay, ScrollToTop } from '@/components/effects';

interface IPublicLayoutProps {
    children: React.ReactNode;
}

/**
 * Public Layout - Wraps all public-facing pages with Navbar, Footer, and premium effects
 *
 * Route groups like (public) don't affect the URL structure.
 * This layout applies to /articles, /notes, /projects, /about, etc.
 * 
 * Premium effects:
 * - AmbientBackground: Floating gradient spheres for depth
 * - NoiseOverlay: Subtle texture for visual richness
 * - ScrollToTop: Ensures page scrolls to top on navigation
 */
const PublicLayout = ({ children }: IPublicLayoutProps) => {
    return (
        <div className="relative flex min-h-screen flex-col">
            {/* Scroll to top on navigation */}
            <ScrollToTop />
            
            {/* Ambient Background - Floating gradient spheres */}
            <AmbientBackground />
            
            {/* Noise Overlay - Subtle texture */}
            <NoiseOverlay />
            
            {/* Main Content */}
            <Navbar />
            <main className="relative z-10 flex-1">{children}</main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
