'use client';

import { AnimatePresence, motion, useMotionValue, useSpring, type HTMLMotionProps, type MotionStyle, type MotionValue, type SpringOptions } from 'motion/react';
import { HoverCard as HoverCardPrimitive } from 'radix-ui';
import * as React from 'react';

import { useControlledState } from '@/hooks/form/use-controlled-state';
import { getStrictContext } from '@/lib/get-strict-context';

type HoverCardContextType = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    x: MotionValue<number>;
    y: MotionValue<number>;
    followCursor?: boolean | 'x' | 'y';
    followCursorSpringOptions?: SpringOptions;
};

const [HoverCardProvider, useHoverCard] = getStrictContext<HoverCardContextType>('HoverCardContext');

type HoverCardProps = React.ComponentProps<typeof HoverCardPrimitive.Root> & {
    followCursor?: boolean | 'x' | 'y';
    followCursorSpringOptions?: SpringOptions;
};

function omitUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
    return Object.fromEntries(Object.entries(value).filter(([, current]) => current !== undefined)) as Partial<T>;
}

function HoverCard({ followCursor = false, followCursorSpringOptions = { stiffness: 200, damping: 17 }, ...props }: HoverCardProps) {
    const [isOpen, setIsOpen] = useControlledState({
        ...omitUndefined({
            value: props.open,
            defaultValue: props.defaultOpen,
            onChange: props.onOpenChange,
        }),
    });
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    return (
        <HoverCardProvider
            value={{
                isOpen,
                setIsOpen,
                x,
                y,
                followCursor,
                followCursorSpringOptions,
            }}
        >
            <HoverCardPrimitive.Root data-slot='hover-card' {...props} onOpenChange={setIsOpen} />
        </HoverCardProvider>
    );
}

type HoverCardTriggerProps = React.ComponentProps<typeof HoverCardPrimitive.Trigger>;

function HoverCardTrigger({ onMouseMove, ...props }: HoverCardTriggerProps) {
    const { x, y, followCursor } = useHoverCard();

    const handleMouseMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
        onMouseMove?.(event);

        const target = event.currentTarget.getBoundingClientRect();

        if (followCursor === 'x' || followCursor === true) {
            const eventOffsetX = event.clientX - target.left;
            const offsetXFromCenter = (eventOffsetX - target.width / 2) / 2;
            x.set(offsetXFromCenter);
        }

        if (followCursor === 'y' || followCursor === true) {
            const eventOffsetY = event.clientY - target.top;
            const offsetYFromCenter = (eventOffsetY - target.height / 2) / 2;
            y.set(offsetYFromCenter);
        }
    };

    return <HoverCardPrimitive.Trigger data-slot='hover-card-trigger' onMouseMove={handleMouseMove} {...props} />;
}

type HoverCardPortalProps = Omit<React.ComponentProps<typeof HoverCardPrimitive.Portal>, 'forceMount'>;

function HoverCardPortal(props: HoverCardPortalProps) {
    const { isOpen } = useHoverCard();

    return <AnimatePresence>{isOpen && <HoverCardPrimitive.Portal forceMount data-slot='hover-card-portal' {...props} />}</AnimatePresence>;
}

type HoverCardContentProps = React.ComponentProps<typeof HoverCardPrimitive.Content> & HTMLMotionProps<'div'>;

function HoverCardContent({
    align,
    alignOffset,
    side,
    sideOffset,
    avoidCollisions,
    collisionBoundary,
    collisionPadding,
    arrowPadding,
    sticky,
    hideWhenDetached,
    style,
    transition = { type: 'spring', stiffness: 300, damping: 25 },
    ...props
}: HoverCardContentProps) {
    const { x, y, followCursor, followCursorSpringOptions } = useHoverCard();
    const translateX = useSpring(x, followCursorSpringOptions);
    const translateY = useSpring(y, followCursorSpringOptions);

    const primitiveContentProps = omitUndefined({
        align,
        alignOffset,
        side,
        sideOffset,
        avoidCollisions,
        collisionBoundary,
        collisionPadding,
        arrowPadding,
        sticky,
        hideWhenDetached,
    });

    const contentStyle = {
        ...(followCursor === 'x' || followCursor === true ? { x: translateX } : {}),
        ...(followCursor === 'y' || followCursor === true ? { y: translateY } : {}),
        ...(style ?? {}),
    } as MotionStyle;

    return (
        <HoverCardPrimitive.Content asChild forceMount {...primitiveContentProps}>
            <motion.div
                key='hover-card-content'
                data-slot='hover-card-content'
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={transition}
                style={contentStyle}
                {...props}
            />
        </HoverCardPrimitive.Content>
    );
}

type HoverCardArrowProps = React.ComponentProps<typeof HoverCardPrimitive.Arrow>;

function HoverCardArrow(props: HoverCardArrowProps) {
    return <HoverCardPrimitive.Arrow data-slot='hover-card-arrow' {...props} />;
}

export {
    HoverCard,
    HoverCardArrow,
    HoverCardContent,
    HoverCardPortal,
    HoverCardTrigger,
    useHoverCard,
    type HoverCardArrowProps,
    type HoverCardContentProps,
    type HoverCardContextType,
    type HoverCardPortalProps,
    type HoverCardProps,
    type HoverCardTriggerProps,
};
