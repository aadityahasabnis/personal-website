import * as React from 'react';

import Link from 'next/link';

import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { type StrongOmit } from '@/common/interfaces/genericInterfaces';

import { cn } from '@/lib/utils';

import Tooltip, { type ITooltipProps } from './tooltip';

type ButtonSizeVariant = 'regular_lg' | 'regular_default' | 'regular_sm' | 'icon_lg' | 'icon_default' | 'icon_sm';

const buttonVariants = cva('group inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring  disabled:opacity-50 disabled:cursor-not-allowed', {
    variants: {
        variant: {
            default: 'bg-blue-dark text-white hover:brightness-90',
            secondary: 'bg-blue-light text-blue-dark hover:brightness-90',
            neutral: 'bg-muted text-neutral-medium hover:bg-muted-foreground',
            ghost: 'text-neutral-medium hover:bg-muted-foreground',
            success: 'bg-status-success text-white hover:brightness-90',
            error: 'bg-status-error text-white hover:brightness-95',
            outline: 'border text-neutral-medium bg-white hover:bg-muted-foreground',
            link: 'bg-transparent text-blue-medium hover:underline p-0! min-h-fit!'
        },
        size: {
            regular_lg: 'min-h-11 rounded px-6 py-2.5',
            regular_default: 'min-h-9 rounded px-5 py-2',
            regular_sm: 'min-h-8 rounded px-3 py-1.5 text-xs',
            icon_lg: 'size-11',
            icon_default: 'size-10',
            icon_sm: 'size-8'
        },
        shape: {
            rounded: 'rounded-full',
            squared: 'rounded'
        }
    },
    defaultVariants: {
        variant: 'default'
    }
});

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, StrongOmit<VariantProps<typeof buttonVariants>, 'size' | 'shape'> {
    asChild?: boolean;
    pending?: boolean;
    icon?: React.ReactElement<{ className?: string }>;
    startIcon?: React.ReactElement<{ className?: string }>;
    endIcon?: React.ReactElement<{ className?: string }>;
    buttonType?: 'icon' | 'regular'; // <-- Required prop
    size?: 'default' | 'sm' | 'lg' | undefined; // simplified
    shape?: 'rounded' | 'squared'; // only for type=icon
    tooltipProps?: StrongOmit<ITooltipProps, 'children'>;
    href?: string;
    target?: React.AnchorHTMLAttributes<HTMLAnchorElement>['target'];
    rel?: React.AnchorHTMLAttributes<HTMLAnchorElement>['rel'];
    referrerPolicy?: React.AnchorHTMLAttributes<HTMLAnchorElement>['referrerPolicy'];
    prefetch?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(({
    className, buttonType = 'regular', size, shape = 'squared', variant, pending = false, asChild = false,
    startIcon, endIcon, icon, disabled, type = 'button', tooltipProps, href, target, rel, referrerPolicy, prefetch = false, ...props
}, ref) => {

    const Comp = asChild ? Slot : 'button';
    const finalSize: ButtonSizeVariant = buttonType === 'icon'
        ? (size === 'sm' ? 'icon_sm' : size === 'lg' ? 'icon_lg' : 'icon_default')
        : (size === 'sm' ? 'regular_sm' : size === 'lg' ? 'regular_lg' : 'regular_default');

    const buttonClassName = cn(buttonVariants({ variant, size: finalSize, shape: buttonType === 'icon' ? shape : undefined, className }));
    const content = <React.Fragment>
        {pending ? <span className="mr-2 animate-spin h-4 w-4 border-2 border-t-transparent border-current rounded-full" /> : null}
        {startIcon && !icon ? React.cloneElement(startIcon, { className: cn(startIcon.props.className, 'mr-2 size-4 shrink-0') }) : null}
        {icon ?? props.children}
        {endIcon && !icon ? React.cloneElement(endIcon, { className: cn(endIcon.props.className, 'ml-2 size-4 shrink-0') }) : null}
    </React.Fragment>;

    return <Tooltip {...tooltipProps} description={tooltipProps?.description}>
        {href ? <Link prefetch={prefetch} href={href} target={target} rel={rel} referrerPolicy={referrerPolicy} className={buttonClassName} onClick={props?.onClick as never}>{content}</Link> : <Comp ref={ref} disabled={pending || disabled} type={type} {...props} className={buttonClassName}>{content}</Comp>}
    </Tooltip>;
});

Button.displayName = 'Button';

export { Button, buttonVariants };
