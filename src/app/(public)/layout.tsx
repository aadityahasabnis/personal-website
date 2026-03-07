import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AmbientBackground, NoiseOverlay, ScrollReset } from '@/components/effects';

interface IPublicLayoutProps {
    children: React.ReactNode;
}

/**
 * Public Layout — Wraps all public-facing pages with Navbar, Footer, and premium effects.
 *
 * Premium effects:
 * - AmbientBackground: Floating gradient spheres for depth
 * - NoiseOverlay: Subtle texture for visual richness
 * - ScrollReset: Ensures page scrolls to top on navigation
 */
const PublicLayout = ({ children }: IPublicLayoutProps) => {
    return (
        <div className="relative flex min-h-screen flex-col">
            <ScrollReset />
            <AmbientBackground />
            <NoiseOverlay />
            <Navbar />
            <main className="relative z-10 flex-1">{children}</main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
