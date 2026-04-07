'use client';

import { BeamLine } from '@/components/common/BeamLine';
import { FadeIn } from '@/components/motion/FadeIn';
import { cn } from '@/lib/utils';

interface IPageHeaderProps {
    title: string;
    description?: string;
    label?: string;
    align?: 'left' | 'center';
    className?: string;
    animationDelay?: number;
    animationStagger?: number;
    animationDuration?: number;
}

export const PageHeader = ({ title, description, label, align = 'left', className, animationDelay = 0.05, animationStagger = 0.1, animationDuration = 0.5 }: IPageHeaderProps) => {
    const titleDelay = animationDelay + animationStagger;
    const descriptionDelay = titleDelay + animationStagger;

    return (
        <header className={cn('relative mb-8 md:mb-10', align === 'center' && 'text-center', className)}>
            {label && (
                <FadeIn direction='up' distance={10} duration={animationDuration} delay={animationDelay} trigger='always'>
                    <p className='text-label font-semibold uppercase font-nunito tracking-widest text-primary'>{label}</p>
                </FadeIn>
            )}

            <FadeIn direction='up' distance={20} duration={animationDuration} delay={titleDelay} trigger='always'>
                <h1 className='text-title font-bold font-nunito tracking-wide text-foreground'>{title}</h1>
            </FadeIn>

            {description && (
                <FadeIn direction='up' distance={20} duration={animationDuration} delay={descriptionDelay} trigger='always'>
                    <p className='text-h5 font-nunito tracking-wide text-muted-foreground'>{description}</p>
                </FadeIn>
            )}

            <BeamLine origin={align === 'center' ? 'center' : 'left'} className={align === 'center' ? 'mx-auto max-w-xs' : ''} />
        </header>
    );
};

export default PageHeader;
