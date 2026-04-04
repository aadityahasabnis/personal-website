import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

const pillVariants = cva(
    "relative inline-flex shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border font-medium transition-base focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
    {
        variants: {
            variant: {
                default: 'border-transparent bg-primary text-primary-foreground! [a&]:hover:bg-primary/90',
                subtle: 'border-transparent bg-primary/8 text-primary [a&]:hover:bg-primary/12',
                neutral: 'border-border bg-background/85 text-muted-foreground [a&]:hover:border-primary/30 [a&]:hover:text-foreground',
                outline: 'border-border bg-background text-foreground [a&]:hover:border-primary/40 [a&]:hover:text-primary',
                success: 'border-success/35 bg-success/15 text-success',
                warning: 'border-warning/35 bg-warning/15 text-warning',
                destructive: 'border-destructive/30 bg-destructive/15 text-destructive',
            },
            size: {
                chip: 'px-2.5 py-1 text-label',
                status: 'px-3 py-0.5 text-xs',
                cta: 'px-3 py-1 text-small',
            },
        },
        defaultVariants: {
            variant: 'subtle',
            size: 'chip',
        },
    },
);

function Pill({
    className,
    variant = 'subtle',
    size = 'chip',
    asChild = false,
    ...props
}: React.ComponentProps<'span'> &
    VariantProps<typeof pillVariants> & {
        asChild?: boolean;
    }) {
    const Comp = asChild ? Slot.Root : 'span';

    return <Comp data-slot='pill' data-variant={variant} data-size={size} className={cn(pillVariants({ variant, size }), className)} {...props} />;
}

export { Pill, pillVariants };
