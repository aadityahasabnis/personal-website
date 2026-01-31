'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScrollPosition } from '@/hooks';
import { NAV_LINKS } from '@/constants';
import ThemeToggle from './ThemeToggle';

/**
 * Premium Navbar - Minimal, transparent, abstract design
 * Truly transparent so particles/stars show through
 */
const Navbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const scrolled = useScrollPosition(50);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      >
        {/* Subtle gradient fade - only when scrolled */}
        <div
          className={cn(
            'absolute inset-0 transition-opacity duration-500',
            scrolled ? 'opacity-100' : 'opacity-0',
          )}
          style={{
            background: 'linear-gradient(to bottom, var(--bg) 0%, transparent 100%)',
          }}
        />

        {/* Navbar content */}
        <nav className="relative pointer-events-auto">
          <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12">
            <div className="flex items-center justify-between h-20 md:h-24">
              
              {/* Logo - Minimal wordmark */}
              <Link href="/" className="group relative">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative"
                >
                  {/* Minimal text logo */}
                  <span className="text-xl md:text-2xl font-light tracking-tight text-[var(--fg)]">
                    aaditya
                    <span className="font-semibold">.dev</span>
                  </span>
                  
                  {/* Subtle underline on hover */}
                  <motion.span
                    className="absolute -bottom-1 left-0 h-px bg-gradient-to-r from-[var(--accent)] to-transparent"
                    initial={{ width: 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              </Link>

              {/* Desktop Navigation - Minimal links */}
              <div className="hidden md:flex items-center gap-1">
                {NAV_LINKS.filter((link) => !link.hideOnDesktop).map((link) => {
                  const isActive = pathname === link.href || 
                    (link.href !== '/' && pathname.startsWith(link.href));
                  
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group relative px-5 py-2"
                    >
                      <span
                        className={cn(
                          'relative z-10 text-sm tracking-wide transition-colors duration-300',
                          isActive
                            ? 'text-[var(--fg)] font-medium'
                            : 'text-[var(--fg-muted)] group-hover:text-[var(--fg)]',
                        )}
                      >
                        {link.label}
                      </span>
                      
                      {/* Active indicator - subtle dot */}
                      {isActive && (
                        <motion.span
                          layoutId="nav-dot"
                          className="absolute bottom-1 left-1/2 -translate-x-1/2 size-1 rounded-full bg-[var(--accent)]"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                    </Link>
                  );
                })}
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-6">
                <ThemeToggle />
                
                {/* CTA - Minimal border button */}
                <Link
                  href="/contact"
                  className="group relative flex items-center gap-2 px-5 py-2.5 rounded-full border border-[var(--fg)]/20 hover:border-[var(--fg)]/40 transition-all duration-300"
                >
                  <span className="text-sm font-medium text-[var(--fg)]">
                    Contact
                  </span>
                  <ArrowUpRight className="size-4 text-[var(--fg)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center gap-4">
                <ThemeToggle />
                <button
                  onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                  className="relative size-10 flex items-center justify-center"
                  aria-label="Toggle menu"
                >
                  <AnimatePresence mode="wait">
                    {isMobileMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X className="size-6 text-[var(--fg)]" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ opacity: 0, rotate: 90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu className="size-6 text-[var(--fg)]" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile Menu - Full screen overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            {/* Background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--bg)]/95 backdrop-blur-2xl"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Content */}
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="relative h-full flex flex-col justify-center px-8"
            >
              <div className="space-y-2">
                {NAV_LINKS.map((link, index) => {
                  const isActive = pathname === link.href || 
                    (link.href !== '/' && pathname.startsWith(link.href));
                  
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          'block py-4 text-3xl font-light tracking-tight transition-colors',
                          isActive
                            ? 'text-[var(--fg)]'
                            : 'text-[var(--fg-muted)] hover:text-[var(--fg)]',
                        )}
                      >
                        {link.label}
                        {isActive && (
                          <span className="inline-block ml-3 size-2 rounded-full bg-[var(--accent)]" />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-12"
              >
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-3 text-lg font-medium text-[var(--fg)] border-b border-[var(--fg)] pb-1"
                >
                  Get in touch
                  <ArrowUpRight className="size-5" />
                </Link>
              </motion.div>

              {/* Bottom info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-12 left-8 right-8 flex justify-between items-center text-sm text-[var(--fg-muted)]"
              >
                <span>© 2024</span>
                <span>aaditya.dev</span>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
