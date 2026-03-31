import { AmbientBackground, NoiseOverlay } from '@/components/effects';
import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

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
        <div className='relative flex flex-col min-h-screen'>
            {/* <ScrollReset /> */}
            <AmbientBackground />
            <NoiseOverlay />
            <Navbar />
            <main className='relative flex-1 z-10'>{children}</main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
