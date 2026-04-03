'use client';

import { NAV_LINKS, SITE_CONFIG } from '@/constants/siteConstants';
import { useScrollPosition } from '@/hooks';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const mobileFooterDomain = SITE_CONFIG.url.replace(/^https?:\/\//, '');

    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const scrolled = useScrollPosition(50);
    const pathname = usePathname();
    const currentYear = new Date().getFullYear();

    const isActivePath = (href: string): boolean => pathname === href || (href !== '/' && pathname.startsWith(href));

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

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
            <motion.header initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className='fixed inset-x-0 top-0 z-50 pointer-events-none'>
                <div className={cn('absolute inset-0 opacity-0 bg-linear-to-b from-background to-transparent transition-slow', scrolled && 'opacity-100')} aria-hidden='true' />

                <nav className='relative pointer-events-auto' aria-label='Primary navigation'>
                    <div className='mx-auto flex items-center justify-between px-6 lg:px-8 py-4 max-w-5xl'>
                        <Link
                            href='/'
                            aria-label='Go to homepage'
                            className='group relative inline-flex rounded-sm text-h4 font-medium font-nunito tracking-wide text-foreground transition-base hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        >
                            <motion.span whileHover={{ scale: 1.02 }} className='relative'>
                                {SITE_CONFIG.shortName}
                                <motion.span
                                    className='absolute inset-x-0 -bottom-1 h-px bg-linear-to-r from-primary to-transparent'
                                    initial={{ width: 0 }}
                                    whileHover={{ width: '100%' }}
                                    transition={{ duration: 0.3 }}
                                />
                            </motion.span>
                        </Link>

                        <div className='hidden md:flex md:items-center md:gap-6'>
                            {NAV_LINKS.filter((link) => !link.hideOnDesktop).map((link) => {
                                const isActive = isActivePath(link.href);

                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={cn(
                                            'relative inline-flex items-center py-2 text-small font-medium tracking-tight transition-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                            isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                                        )}
                                    >
                                        {isActive && (
                                            <motion.span
                                                layoutId='nav-active-line'
                                                className='absolute inset-x-0 bottom-0 h-px bg-foreground'
                                                transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                                            />
                                        )}

                                        <span className='relative'>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className='hidden md:flex md:items-center md:gap-5'>
                            <ThemeToggle />

                            <Link
                                href='/contact'
                                aria-label='Go to contact page'
                                className='group relative inline-flex items-center justify-center gap-2 px-5 py-2.5 text-small font-medium text-foreground rounded-full border border-border bg-background transition-base hover:border-primary/40 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                            >
                                <span>Contact</span>
                                <ArrowUpRight className='size-4 transition-base group-hover:-translate-y-0.5 group-hover:translate-x-0.5' aria-hidden='true' />
                            </Link>
                        </div>

                        <div className='flex items-center gap-4 md:hidden'>
                            <ThemeToggle />
                            <button
                                type='button'
                                onClick={() => setMobileMenuOpen((prev) => !prev)}
                                aria-controls='mobile-navigation-menu'
                                aria-expanded={isMobileMenuOpen}
                                aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                                className='inline-flex items-center justify-center size-10 rounded-md text-foreground transition-base hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                            >
                                <AnimatePresence mode='wait'>
                                    {isMobileMenuOpen ? (
                                        <motion.span
                                            key='close'
                                            initial={{ opacity: 0, rotate: -90 }}
                                            animate={{ opacity: 1, rotate: 0 }}
                                            exit={{ opacity: 0, rotate: 90 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <X className='size-6' aria-hidden='true' />
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key='menu'
                                            initial={{ opacity: 0, rotate: 90 }}
                                            animate={{ opacity: 1, rotate: 0 }}
                                            exit={{ opacity: 0, rotate: -90 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <Menu className='size-6' aria-hidden='true' />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>
                </nav>
            </motion.header>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className='fixed inset-0 z-40 md:hidden'
                        role='dialog'
                        aria-modal='true'
                        aria-label='Mobile navigation'
                    >
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className='absolute inset-0 bg-background/95 backdrop-blur-2xl'
                            onClick={() => setMobileMenuOpen(false)}
                            aria-hidden='true'
                        />

                        <motion.nav
                            id='mobile-navigation-menu'
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className='relative flex h-full flex-col justify-center px-8'
                            aria-label='Mobile navigation'
                        >
                            <div className='flex flex-col gap-2'>
                                {NAV_LINKS.map((link, index) => {
                                    const isActive = isActivePath(link.href);

                                    return (
                                        <motion.div key={link.href} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
                                            <Link
                                                href={link.href}
                                                onClick={() => setMobileMenuOpen(false)}
                                                aria-current={isActive ? 'page' : undefined}
                                                className={cn(
                                                    'relative inline-flex items-center py-2 text-small font-medium tracking-tight transition-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                                    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                                                )}
                                            >
                                                {isActive && (
                                                    <motion.span
                                                        layoutId='mobile-nav-active-line'
                                                        className='absolute inset-x-0 -bottom-1 h-px bg-foreground'
                                                        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                                                    />
                                                )}

                                                <span className='relative'>{link.label}</span>
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className='mt-12'>
                                <Link
                                    href='/contact'
                                    onClick={() => setMobileMenuOpen(false)}
                                    aria-label='Go to contact page'
                                    className='inline-flex items-center gap-3 pb-1 text-h3 font-medium text-foreground border-b border-foreground transition-base hover:text-primary hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                                >
                                    Contact
                                    <ArrowUpRight className='size-5' aria-hidden='true' />
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className='absolute inset-x-8 bottom-12 flex items-center justify-between text-small text-muted-foreground'
                            >
                                <span>{`© ${currentYear}`}</span>
                                <span>{mobileFooterDomain}</span>
                            </motion.div>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Navbar;
