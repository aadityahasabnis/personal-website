'use client';

import { SOCIAL_LINKS } from '@/constants/siteConstants';
import { motion } from 'motion/react';
import Image from 'next/image';
import * as React from 'react';

type TFlipCardLink = {
    id: (typeof SOCIAL_LINKS)[number]['id'];
    url: string;
    ariaLabel: string;
};

type Props = {
    name: string;
    role: string;
    username: string;
    image: string;
    tagline: string;
    links: ReadonlyArray<TFlipCardLink>;
    centerContent?: React.ReactNode;
};

export const FlipCard = ({ name, role, username, image, tagline, links, centerContent }: Props) => {
    const [flip, setFlip] = React.useState(false);
    const touch = typeof window !== 'undefined' && 'ontouchstart' in window;

    const toggle = () => (touch ? setFlip(!flip) : null);

    const variants = { front: { rotateY: 0 }, back: { rotateY: 180 } };

    return (
        <div className='relative w-72 h-96 perspective-1000 mx-auto cursor-pointer' onClick={toggle} onMouseEnter={() => !touch && setFlip(true)} onMouseLeave={() => !touch && setFlip(false)}>
            {/* FRONT */}
            <motion.div
                className='absolute inset-0 backface-hidden rounded-2xl bg-linear-to-br from-violet-500/10 via-card/80 to-violet-600/5 backdrop-blur-sm border border-violet-500/20 flex flex-col items-center justify-center text-center p-6'
                animate={flip ? 'back' : 'front'}
                variants={variants}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div className='pointer-events-none absolute inset-0 overflow-hidden rounded-2xl'>
                    <div className='shimmer' />
                </div>

                <div className='relative size-48 mb-4'>
                    <Image src={image} alt={name} fill sizes='176px' loading='eager' fetchPriority='high' className='object-contain drop-shadow-glow-sm' />
                </div>

                <h2 className='text-2xl font-semibold bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent'>{name}</h2>
                <p className='text-sm text-violet-400 font-medium mt-1'>{role}</p>
                <p className='text-xs text-muted-foreground mt-2'>@{username}</p>
            </motion.div>

            {/* BACK */}
            <motion.div
                className='absolute inset-0 backface-hidden rounded-2xl bg-linear-to-tr from-violet-600/10 via-card/90 to-violet-500/5 backdrop-blur-sm border border-violet-500/20 flex flex-col items-center justify-between p-6 text-center'
                initial={{ rotateY: 180 }}
                animate={flip ? 'front' : 'back'}
                variants={variants}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                <div className='pointer-events-none absolute inset-0 overflow-hidden rounded-2xl'>
                    <div className='shimmer' />
                </div>

                <div className='mt-2'>
                    <p className='text-sm text-muted-foreground leading-relaxed'>{tagline}</p>
                </div>

                {centerContent ? <React.Fragment key='back-center-content'>{centerContent}</React.Fragment> : null}

                <div className='w-full mt-4'>
                    <p className='mb-2 text-xs font-semibold tracking-wide text-violet-400'>CONNECT</p>
                    <div className='flex flex-wrap items-center justify-center gap-1'>
                        {links.map(({ id, url, ariaLabel }) => {
                            const Icon = SOCIAL_LINKS.find((item) => item.id === id)?.icon;

                            if (!Icon) {
                                return null;
                            }

                            return (
                                <a
                                    key={id}
                                    href={url}
                                    aria-label={ariaLabel}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='flex size-8 items-center justify-center rounded-full border border-violet-500/20 bg-violet-500/10 transition-all duration-300 hover:scale-105 hover:border-violet-500/40 hover:bg-violet-500/20'
                                >
                                    <Icon size={14} className='text-violet-400 transition-colors hover:text-violet-300' />
                                </a>
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
