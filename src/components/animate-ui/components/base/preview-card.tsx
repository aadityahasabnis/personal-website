'use client';

import {
    PreviewCardBackdrop as PreviewCardBackdropPrimitive,
    PreviewCardPopup as PreviewCardPopupPrimitive,
    PreviewCardPortal as PreviewCardPortalPrimitive,
    PreviewCardPositioner as PreviewCardPositionerPrimitive,
    PreviewCard as PreviewCardPrimitive,
    PreviewCardTrigger as PreviewCardTriggerPrimitive,
    type PreviewCardBackdropProps as PreviewCardBackdropPrimitiveProps,
    type PreviewCardPopupProps as PreviewCardPopupPrimitiveProps,
    type PreviewCardPositionerProps as PreviewCardPositionerPrimitiveProps,
    type PreviewCardProps as PreviewCardPrimitiveProps,
    type PreviewCardTriggerProps as PreviewCardTriggerPrimitiveProps,
} from '@/components/animate-ui/primitives/base/preview-card';
import { cn } from '@/lib/utils';

type PreviewCardProps = PreviewCardPrimitiveProps;

function PreviewCard(props: PreviewCardProps) {
    return <PreviewCardPrimitive {...props} />;
}

type PreviewCardTriggerProps = PreviewCardTriggerPrimitiveProps;

function PreviewCardTrigger(props: PreviewCardTriggerProps) {
    return <PreviewCardTriggerPrimitive {...props} />;
}

type PreviewCardPanelProps = PreviewCardPositionerPrimitiveProps & Omit<PreviewCardPopupPrimitiveProps, 'style'> & { style?: PreviewCardPopupPrimitiveProps['style'] };

function PreviewCardPanel({ className, align = 'center', sideOffset = 4, style, children, ...props }: PreviewCardPanelProps) {
    const popupStyleProps = style !== undefined ? { style } : {};
    const portalContainer = typeof document !== 'undefined' ? document.querySelector('main') : null;

    return (
        <PreviewCardPortalPrimitive container={portalContainer}>
            <PreviewCardPositionerPrimitive align={align} sideOffset={sideOffset} className='z-50' {...props}>
                <PreviewCardPopupPrimitive
                    className={cn('bg-popover text-popover-foreground w-64 origin-(--transform-origin) rounded-md border p-4 shadow-md outline-hidden', className)}
                    {...popupStyleProps}
                >
                    {children}
                </PreviewCardPopupPrimitive>
            </PreviewCardPositionerPrimitive>
        </PreviewCardPortalPrimitive>
    );
}

type PreviewCardBackdropProps = PreviewCardBackdropPrimitiveProps;

function PreviewCardBackdrop(props: PreviewCardBackdropProps) {
    return <PreviewCardBackdropPrimitive {...props} />;
}

export { PreviewCard, PreviewCardBackdrop, PreviewCardPanel, PreviewCardTrigger, type PreviewCardBackdropProps, type PreviewCardPanelProps, type PreviewCardProps, type PreviewCardTriggerProps };
