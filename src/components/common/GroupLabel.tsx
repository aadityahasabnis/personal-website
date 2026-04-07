import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface IGroupLabelProps {
    text: string;
    icon?: ReactNode;
    className?: string;
}

export const GroupLabel = ({ text, icon, className }: IGroupLabelProps) => (
    <div className={cn('flex items-center gap-2 mb-8 text-small font-medium uppercase tracking-wide text-muted-foreground', className)}>
        {icon ? <span className='inline-flex items-center'>{icon}</span> : null}
        <span>{text}</span>
    </div>
);
