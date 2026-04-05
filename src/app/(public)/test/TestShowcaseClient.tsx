'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/animate-ui/components/animate/tooltip';
import { PreviewCard, PreviewCardPanel, PreviewCardTrigger } from '@/components/animate-ui/components/base/preview-card';
import { Button } from '@/components/animate-ui/components/buttons/button';
import { CopyButton } from '@/components/animate-ui/components/buttons/copy';
import { ThemeTogglerButton } from '@/components/animate-ui/components/buttons/theme-toggler';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/animate-ui/components/radix/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/animate-ui/components/radix/hover-card';
import { BeamLine } from '@/components/common/BeamLine';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { HoverTextSwap } from '@/components/interactive/HoverTextSwap';
import ScalesWithImageDemo from '@/components/scales-with-image-demo';
import TextRevealCardPreview from '@/components/text-reveal-card-demo';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import AvatarCircles, { type IAvatarData } from '@/components/ui/avatar-circles';
import { GridPattern } from '@/components/ui/GridPattern';
import { Highlighter } from '@/components/ui/highlighter';
import { ScalesContainer } from '@/components/ui/scales';
import { ScrollVelocityContainer, ScrollVelocityRow } from '@/components/ui/scroll-based-velocity';
import { StickyScroll } from '@/components/ui/sticky-scroll-reveal';
import { COLLECTIONS, NAV_LINKS, SITE_CONFIG, SOCIAL_LINKS } from '@/constants/siteConstants';
import { useDialog } from '@/hooks/ui/useDialog';

type NavigationMode = 'internal' | 'external';

const SHOWCASED_COMPONENTS = [
    'Scales',
    'ScalesContainer',
    'GridPattern',
    'Highlighter',
    'HoverTextSwap',
    'AvatarCircles',
    'StickyScroll',
    'ScrollVelocityContainer',
    'ScrollVelocityRow',
    'TextRevealCard',
    'Button',
    'CopyButton',
    'ThemeTogglerButton',
    'Tooltip',
    'DropdownMenu',
    'HoverCard',
    'PreviewCard',
    'Accordion',
    'BeamLine',
    'ScrollToTop',
] as const;

const avatarData: IAvatarData[] = SOCIAL_LINKS.map((social, index) => ({
    icon: `/avatars/avatar-${index + 1}.png`,
    link: social.url,
    label: social.platform,
}));

const knowledgeTags = [...SITE_CONFIG.author.knowsAbout];
const collectionNames = Object.values(COLLECTIONS);

export default function TestShowcaseClient() {
    const dialog = useDialog();
    const [navigationMode, setNavigationMode] = useState<NavigationMode>('internal');
    const [showKeywords, setShowKeywords] = useState(true);

    const stickyContent = [
        {
            title: `${SITE_CONFIG.author.givenName} Identity`,
            description: `${SITE_CONFIG.author.bio} This block uses your constants to verify typography, localized-name animation, and spacing choices.`,
            content: (
                <div className='flex h-full items-center justify-center p-6'>
                    <div className='space-y-3 text-center'>
                        <p className='text-h3 font-semibold text-background'>
                            <HoverTextSwap primaryText={SITE_CONFIG.author.givenName} secondaryText={SITE_CONFIG.author.marathiGivenName} />
                        </p>
                        <p className='text-small text-background/80'>{SITE_CONFIG.author.jobTitle}</p>
                    </div>
                </div>
            ),
        },
        {
            title: 'Navigation Matrix',
            description: `${NAV_LINKS.length} public routes are rendered through the constants map to verify menu labels, rhythm, and CTA density.`,
            content: (
                <ul className='space-y-2 p-6 text-small text-background'>
                    {NAV_LINKS.map((link) => (
                        <li key={link.href} className='rounded-lg border border-background/20 bg-background/10 px-3 py-2'>
                            {link.label} - {link.href}
                        </li>
                    ))}
                </ul>
            ),
        },
        {
            title: 'Data Collections',
            description: `${collectionNames.length} backend collections are surfaced as a compact audit list to sanity-check naming and information hierarchy.`,
            content: (
                <div className='grid grid-cols-2 gap-2 p-4'>
                    {collectionNames.map((name) => (
                        <span key={name} className='rounded-md border border-background/20 bg-background/10 px-2 py-1 text-label text-background'>
                            {name}
                        </span>
                    ))}
                </div>
            ),
        },
    ];

    const openViewDialog = () => {
        dialog.openView({
            title: 'Test Route Notes',
            description: 'Component playground summary',
            width: 'lg',
            content: (
                <div className='space-y-3'>
                    <p className='text-body text-foreground'>This page is wired to constants and includes interactive widgets from ui, animate-ui, and shared components.</p>
                    <p className='text-small text-muted-foreground'>Use this route for visual QA before integrating components into production sections.</p>
                </div>
            ),
        });
    };

    const openConfirmationDialog = () => {
        dialog.openConfirmation({
            title: 'Enable External Navigation Mode',
            description: 'Opens links in new tabs from the dropdown menu.',
            tone: 'warning',
            confirmLabel: 'Enable',
            cancelLabel: 'Keep Internal',
            onConfirm: () => {
                setNavigationMode('external');
            },
        });
    };

    return (
        <section className='relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-16 md:px-10 md:py-20'>
            <div className='relative overflow-hidden rounded-4xl border border-border bg-card p-8 shadow-glow-sm md:p-12'>
                <GridPattern className='mask-[radial-gradient(600px_circle_at_center,white,transparent)] opacity-40' />

                <div className='relative z-10 flex flex-col gap-6'>
                    <p className='text-label font-semibold tracking-[0.16em] uppercase text-violet-600 dark:text-violet-300'>Public Test Route</p>

                    <h1 className='max-w-3xl text-display font-semibold leading-tight text-foreground'>
                        Component Lab for
                        <span className='ml-2 inline-block'>
                            <Highlighter action='underline' color='var(--color-violet-300)' animationDuration={700} isView>
                                {SITE_CONFIG.author.name}
                            </Highlighter>
                        </span>
                    </h1>

                    <p className='max-w-2xl text-body text-muted-foreground'>
                        This page showcases real components with live constants data, so you can visually review spacing, typography, interactions, and behavior before production usage.
                    </p>

                    <div className='flex flex-wrap items-center gap-3'>
                        <HoverTextSwap
                            primaryText={SITE_CONFIG.author.givenName}
                            secondaryText={SITE_CONFIG.author.marathiGivenName}
                            className='text-h4 font-semibold text-foreground'
                            duration={0.18}
                        />
                        <span className='rounded-full border border-border bg-background px-3 py-1 text-label text-muted-foreground'>{SITE_CONFIG.author.jobTitle}</span>
                    </div>

                    <BeamLine origin='left' spacing='mt-2' className='max-w-sm' />

                    <div className='flex flex-wrap gap-2'>
                        {SHOWCASED_COMPONENTS.map((componentName) => (
                            <span key={componentName} className='rounded-full border border-border bg-secondary px-3 py-1 text-label text-secondary-foreground'>
                                {componentName}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className='grid gap-6 lg:grid-cols-2'>
                <article className='space-y-4 rounded-3xl border border-border bg-card p-6 shadow-glow-sm'>
                    <h2 className='text-h3 font-semibold text-foreground'>Constants-Driven Social Preview</h2>
                    <p className='text-body text-muted-foreground'>AvatarCircles is fed from your social constants so you can validate interactive icon clusters with real links.</p>
                    <AvatarCircles avatarData={avatarData} />
                    <ul className='space-y-2'>
                        {SOCIAL_LINKS.map((social) => (
                            <li key={social.id} className='rounded-xl border border-border bg-background px-3 py-2'>
                                <Link href={social.url} target='_blank' rel='noopener noreferrer' className='text-small font-medium text-foreground transition-base hover:text-primary'>
                                    {social.platform}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </article>

                <article className='space-y-4 rounded-3xl border border-border bg-card p-6 shadow-glow-sm'>
                    <h2 className='text-h3 font-semibold text-foreground'>Scales Pattern Container</h2>
                    <p className='text-body text-muted-foreground'>ScalesContainer and Highlighter are combined here for a polished, text-first visual block.</p>
                    <ScalesContainer size={9} color='var(--color-violet-500)' className='opacity-50' containerClassName='relative overflow-hidden rounded-2xl border border-border bg-background p-6'>
                        <p className='text-body leading-relaxed text-foreground'>
                            <Highlighter action='highlight' color='var(--color-violet-200)' strokeWidth={2} animationDuration={650} isView>
                                Professional component previews should validate aesthetics and behavior at the same time.
                            </Highlighter>
                        </p>
                    </ScalesContainer>
                </article>
            </div>

            <article className='rounded-3xl border border-border bg-card p-4 shadow-glow-sm md:p-6'>
                <h2 className='mb-3 text-h3 font-semibold text-foreground'>Scales With Image Demo</h2>
                <p className='mb-6 text-body text-muted-foreground'>This is your existing composed demo using the scales utility around an image frame.</p>
                <ScalesWithImageDemo />
            </article>

            <article className='rounded-3xl border border-border bg-card p-4 shadow-glow-sm md:p-6'>
                <h2 className='mb-3 text-h3 font-semibold text-foreground'>Text Reveal Card Demo</h2>
                <p className='mb-6 text-body text-muted-foreground'>Interactive reveal behavior is included as-is so you can assess motion quality and readability.</p>
                <TextRevealCardPreview />
            </article>

            <article className='space-y-4 rounded-3xl border border-border bg-card p-6 shadow-glow-sm'>
                <h2 className='text-h3 font-semibold text-foreground'>Sticky Scroll Narrative</h2>
                <p className='text-body text-muted-foreground'>StickyScroll is populated from constants and collection data to check progression, contrast, and sticky-card behavior.</p>
                <StickyScroll content={stickyContent} contentClassName='border border-background/20 shadow-lg' />
            </article>

            <article className='space-y-4 overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-glow-sm'>
                <h2 className='text-h3 font-semibold text-foreground'>Scroll Velocity Rows</h2>
                <p className='text-body text-muted-foreground'>This section stress-tests marquee motion and readability during continuous scrolling.</p>

                <ScrollVelocityContainer className='space-y-3'>
                    <ScrollVelocityRow baseVelocity={4} className='py-1 text-h4 font-semibold text-foreground'>
                        {knowledgeTags.map((tag) => (
                            <span key={tag} className='mx-3 inline-flex items-center'>
                                {tag}
                            </span>
                        ))}
                    </ScrollVelocityRow>

                    <ScrollVelocityRow direction={-1} baseVelocity={3} className='py-1 text-small text-muted-foreground'>
                        {SHOWCASED_COMPONENTS.map((name) => (
                            <span key={name} className='mx-3 inline-flex items-center'>
                                {name}
                            </span>
                        ))}
                    </ScrollVelocityRow>
                </ScrollVelocityContainer>
            </article>

            <div className='grid gap-6 lg:grid-cols-2'>
                <article className='space-y-4 rounded-3xl border border-border bg-card p-6 shadow-glow-sm'>
                    <h2 className='text-h3 font-semibold text-foreground'>Animate UI Controls</h2>
                    <p className='text-body text-muted-foreground'>Buttons, tooltip, copy control, and theme toggler are grouped for quick interaction checks.</p>

                    <div className='flex flex-wrap items-center gap-3'>
                        <Button variant='default' size='sm'>
                            Primary
                        </Button>
                        <Button variant='outline' size='sm'>
                            Outline
                        </Button>

                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span>
                                        <CopyButton content={SITE_CONFIG.email} size='sm' variant='secondary' aria-label='Copy email' />
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent>Copy contact email</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>

                        <ThemeTogglerButton variant='secondary' size='sm' aria-label='Toggle theme' />
                    </div>

                    <div className='flex flex-wrap items-center gap-3'>
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <Button variant='ghost' size='sm'>
                                    Hover Author Card
                                </Button>
                            </HoverCardTrigger>
                            <HoverCardContent className='w-72 space-y-2'>
                                <p className='text-small font-semibold text-foreground'>{SITE_CONFIG.author.name}</p>
                                <p className='text-small text-muted-foreground'>{SITE_CONFIG.author.bio}</p>
                            </HoverCardContent>
                        </HoverCard>

                        <PreviewCard followCursor='x'>
                            <PreviewCardTrigger className='text-small font-medium text-primary transition-base hover:text-primary/80'>Preview Quick Bio</PreviewCardTrigger>
                            <PreviewCardPanel>
                                <div className='space-y-2'>
                                    <p className='text-small font-semibold text-foreground'>{SITE_CONFIG.author.jobTitle}</p>
                                    <p className='text-small text-muted-foreground'>Focused on static-first UX, modular server actions, and reliable production quality.</p>
                                </div>
                            </PreviewCardPanel>
                        </PreviewCard>
                    </div>
                </article>

                <article className='space-y-4 rounded-3xl border border-border bg-card p-6 shadow-glow-sm'>
                    <h2 className='text-h3 font-semibold text-foreground'>Dropdown + Dialog Test Area</h2>
                    <p className='text-body text-muted-foreground'>The dropdown uses nav constants and mode toggles. Dialog buttons help validate your global dialog provider wiring.</p>

                    <div className='flex flex-wrap items-center gap-3'>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant='outline' size='sm'>
                                    Open Menu
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className='w-72'>
                                <DropdownMenuLabel>Public Navigation</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                {NAV_LINKS.map((link) => (
                                    <DropdownMenuItem
                                        key={link.href}
                                        onSelect={(event) => {
                                            event.preventDefault();

                                            if (navigationMode === 'external') {
                                                window.open(`${SITE_CONFIG.url}${link.href}`, '_blank', 'noopener,noreferrer');
                                                return;
                                            }

                                            window.location.href = link.href;
                                        }}
                                    >
                                        {link.label}
                                        <DropdownMenuShortcut>{navigationMode === 'external' ? 'new tab' : 'same tab'}</DropdownMenuShortcut>
                                    </DropdownMenuItem>
                                ))}

                                <DropdownMenuSeparator />

                                <DropdownMenuCheckboxItem
                                    checked={showKeywords}
                                    onCheckedChange={(checked) => {
                                        setShowKeywords(checked === true);
                                    }}
                                >
                                    Show SEO Keywords
                                </DropdownMenuCheckboxItem>

                                <DropdownMenuSeparator />

                                <DropdownMenuLabel>Open Behavior</DropdownMenuLabel>
                                <DropdownMenuRadioGroup value={navigationMode} onValueChange={(value) => setNavigationMode(value as NavigationMode)}>
                                    <DropdownMenuRadioItem value='internal'>Internal</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value='external'>External</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant='secondary' size='sm' onClick={openViewDialog}>
                            Open View Dialog
                        </Button>
                        <Button variant='destructive' size='sm' onClick={openConfirmationDialog}>
                            Confirm External Mode
                        </Button>
                    </div>

                    <Accordion type='single' collapsible className='rounded-2xl border border-border px-4'>
                        <AccordionItem value='keywords'>
                            <AccordionTrigger>SEO Keywords</AccordionTrigger>
                            <AccordionContent>
                                {showKeywords ? (
                                    <div className='flex flex-wrap gap-2'>
                                        {SITE_CONFIG.seo.defaultKeywords.map((keyword) => (
                                            <span key={keyword} className='rounded-full border border-border bg-secondary px-2 py-1 text-label text-secondary-foreground'>
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className='text-small text-muted-foreground'>Keyword chips are hidden from the dropdown checkbox toggle.</p>
                                )}
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value='collections'>
                            <AccordionTrigger>Database Collections</AccordionTrigger>
                            <AccordionContent>
                                <div className='grid grid-cols-2 gap-2'>
                                    {collectionNames.map((name) => (
                                        <span key={name} className='rounded-md border border-border bg-background px-2 py-1 text-label text-muted-foreground'>
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </article>
            </div>

            <ScrollToTop showAfter={180} />
        </section>
    );
}
