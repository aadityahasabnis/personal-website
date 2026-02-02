import * as React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

import { dataWrapperFormatter, type IDataWrapperDataType } from '../other/DataWrapper';

const VARIANT_COLORS = {
    default: { bg: 'bg-blue-dark', text: 'text-white', lightBg: 'bg-blue-light', lightText: 'text-blue-dark' },
    secondary: { bg: 'bg-blue-light', text: 'text-blue-dark', lightBg: 'bg-blue-light', lightText: 'text-blue-dark' },
    neutral: { bg: 'bg-muted', text: 'text-neutral-dark', lightBg: 'bg-blue-light', lightText: 'text-neutral-dark' },
    success: { bg: 'bg-status-success', text: 'text-white', lightBg: 'bg-status-success-light', lightText: 'text-status-success' },
    successLight: { bg: 'bg-status-success-light', text: 'text-status-success', lightBg: 'bg-status-success-light', lightText: 'text-status-success' },
    error: { bg: 'bg-status-error', text: 'text-white', lightBg: 'bg-status-error-light', lightText: 'text-status-error' },
    errorLight: { bg: 'bg-status-error-light', text: 'text-status-error', lightBg: 'bg-status-error-light', lightText: 'text-status-error' },
    pending: { bg: 'bg-status-amber', text: 'text-white', lightBg: 'bg-status-amber-light', lightText: 'text-status-amber' },
    pendingLight: { bg: 'bg-status-amber-light', text: 'text-status-amber', lightBg: 'bg-status-amber-light', lightText: 'text-status-amber' },
    outline: { bg: 'bg-muted', text: 'text-foreground', lightBg: 'bg-neutral-dark', lightText: 'text-white' }
};

export const badgeVariants = cva('inline-flex items-center justify-center rounded border text-center tracking-wide', {
    variants: {
        variant: {
            default: `border border-transparent ${VARIANT_COLORS.default.bg} ${VARIANT_COLORS.default.text}`,
            secondary: `border border-transparent ${VARIANT_COLORS.secondary.bg} ${VARIANT_COLORS.secondary.text}`,
            neutral: `border border-transparent ${VARIANT_COLORS.neutral.bg} ${VARIANT_COLORS.neutral.text}`,
            success: `border border-transparent ${VARIANT_COLORS.success.bg} ${VARIANT_COLORS.success.text}`,
            successLight: `border border-transparent ${VARIANT_COLORS.successLight.bg} ${VARIANT_COLORS.successLight.text}`,
            error: `border border-transparent ${VARIANT_COLORS.error.bg} ${VARIANT_COLORS.error.text}`,
            errorLight: `border border-transparent ${VARIANT_COLORS.errorLight.bg} ${VARIANT_COLORS.errorLight.text}`,
            pending: `border border-transparent ${VARIANT_COLORS.pending.bg} ${VARIANT_COLORS.pending.text}`,
            pendingLight: `border border-transparent ${VARIANT_COLORS.pendingLight.bg} ${VARIANT_COLORS.pendingLight.text}`,
            outline: `${VARIANT_COLORS.outline.text}`
        },
        size: {
            xs: 'px-2 py-0.5 text-xs',
            sm: 'px-2.5 py-1 text-xs',
            md: 'px-3 py-1.5 text-sm'
        }
    },
    defaultVariants: {
        variant: 'default',
        size: 'sm'
    }
});

export type IBadgeVariants = VariantProps<typeof badgeVariants>['variant'];
type IBadgeSize = VariantProps<typeof badgeVariants>['size'];

export const BADGE_BUTTON_STYLES: Record<NonNullable<IBadgeVariants>, string> = {
    default: `${VARIANT_COLORS.default.lightBg} ${VARIANT_COLORS.default.lightText} hover:${VARIANT_COLORS.default.bg} hover:${VARIANT_COLORS.default.text}`,
    secondary: `${VARIANT_COLORS.secondary.lightBg} ${VARIANT_COLORS.secondary.lightText} hover:${VARIANT_COLORS.secondary.bg} hover:${VARIANT_COLORS.secondary.text}`,
    neutral: `${VARIANT_COLORS.neutral.bg} ${VARIANT_COLORS.neutral.text} hover:${VARIANT_COLORS.neutral.lightBg} hover:${VARIANT_COLORS.neutral.lightText}`,
    success: `${VARIANT_COLORS.success.lightBg} ${VARIANT_COLORS.success.lightText} hover:${VARIANT_COLORS.success.bg} hover:${VARIANT_COLORS.success.text}`,
    successLight: `${VARIANT_COLORS.successLight.lightBg} ${VARIANT_COLORS.successLight.lightText} hover:${VARIANT_COLORS.successLight.bg} hover:${VARIANT_COLORS.successLight.text}`,
    error: `${VARIANT_COLORS.error.lightBg} ${VARIANT_COLORS.error.lightText} hover:${VARIANT_COLORS.error.bg} hover:${VARIANT_COLORS.error.text}`,
    errorLight: `${VARIANT_COLORS.errorLight.lightBg} ${VARIANT_COLORS.errorLight.lightText} hover:${VARIANT_COLORS.errorLight.bg} hover:${VARIANT_COLORS.errorLight.text}`,
    pending: `${VARIANT_COLORS.pending.lightBg} ${VARIANT_COLORS.pending.lightText} hover:${VARIANT_COLORS.pending.bg} hover:${VARIANT_COLORS.pending.text}`,
    pendingLight: `${VARIANT_COLORS.pendingLight.lightBg} ${VARIANT_COLORS.pendingLight.lightText} hover:${VARIANT_COLORS.pendingLight.bg} hover:${VARIANT_COLORS.pendingLight.text}`,
    outline: `${VARIANT_COLORS.outline.bg} ${VARIANT_COLORS.neutral.text} hover:${VARIANT_COLORS.outline.lightBg} hover:${VARIANT_COLORS.outline.lightText}`
};

interface IBadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
    type?: IDataWrapperDataType;
    size?: IBadgeSize;
}

const Badge = ({ className, variant, size, type, ...props }: IBadgeProps) => {
    const value = props?.children;
    const displayValue = type ? dataWrapperFormatter[type](value as IDataWrapperDataType) : (typeof value === 'string' && value.trim() === '') ? 'N/A' : value ?? 'N/A';

    return <div {...props} className={cn(badgeVariants({ variant, size }), className)}>{displayValue}</div>;
};

export { Badge };
