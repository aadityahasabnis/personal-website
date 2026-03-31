'use client';

import { BeamLine } from '@/components/common/BeamLine';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface IPageHeaderProps {
    title: string;
    description?: string;
    label?: string;
    align?: 'left' | 'center';
    className?: string;
}

export const PageHeader = ({ title, description, label, align = 'left', className }: IPageHeaderProps) => {
    return (
        <header className={cn('relative mb-16 md:mb-20', align === 'center' && 'text-center', className)}>
            {label && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className='text-label font-medium uppercase font-nunito tracking-widest text-primary'
                >
                    {label}
                </motion.p>
            )}

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className='text-display font-medium font-nunito tracking-wide text-foreground'
            >
                {title}
            </motion.h1>

            {description && (
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className={cn('text-h6 font-light tracking-wider text-muted-foreground')}
                >
                    {description}
                </motion.p>
            )}

            <BeamLine origin={align === 'center' ? 'center' : 'left'} className={align === 'center' ? 'mx-auto max-w-xs' : ''} />
        </header>
    );
};

export default PageHeader;
