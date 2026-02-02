'use client';

import React, { isValidElement, memo, useState } from 'react';

import { isInvalidAndEmptyObject } from '@byteswrite-admin/bep-core/utils';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

export interface ITooltipProps {
    children: React.ReactNode;
    title?: string;
    description: React.JSX.Element | string | number | undefined;
    side?: 'top' | 'right' | 'bottom' | 'left';
    asChild?: boolean;
    className?: string;
    color?: 'white' | 'black';
    maxWidth?: string;
}

const Tooltip = ({ children, title, description, side = 'bottom', asChild = true, className, color = 'black', maxWidth = '280px' }: ITooltipProps) => {
    const [open, setOpen] = useState(false);

    if (isInvalidAndEmptyObject(description)) return <React.Fragment>{children}</React.Fragment>;

    const isChildDisabled = React.isValidElement(children) && (children.props as { disabled?: boolean }).disabled;

    const handleTriggerClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setOpen(prev => !prev);
    };

    return (
        <TooltipPrimitive.Provider delayDuration={500}>
            <TooltipPrimitive.Root open={open} onOpenChange={setOpen}>

                <TooltipPrimitive.Trigger asChild={!isChildDisabled && asChild} onClick={handleTriggerClick}>
                    {isChildDisabled ? <span className="inline-flex cursor-not-allowed">
                        {children}
                    </span> : React.isValidElement(children) ? children : <span>{children}</span>}
                </TooltipPrimitive.Trigger>

                <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content side={side} sideOffset={4} className={cn('flex flex-col gap-1 z-100 overflow-hidden rounded-md px-3 py-2.5 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2', color === 'black' ? 'bg-neutral-dark text-[#FCFCFD]' : 'bg-[#FCFCFD] text-neutral-dark border', className)} style={{ maxWidth }}>
                        <TooltipPrimitive.Arrow className={color === 'black' ? 'fill-neutral-dark' : 'fill-transparent'} />
                        {title?.length ? <p className={`text-label ${color === 'white' ? 'text-neutral-dark' : 'text-white'}`}>{title}</p> : null}
                        {description ? (isValidElement(description) ? <p className="text-xs">{description}</p> : <p className={`text-xs ${color === 'white' ? 'text-neutral-medium' : 'text-muted-background'}`} dangerouslySetInnerHTML={{ __html: String(description) }} />) : null}
                    </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
            </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
    );
};

export default memo(Tooltip);
