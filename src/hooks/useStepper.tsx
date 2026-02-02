'use client';

import { type ReactNode , useState } from 'react';

import { usePathname, useRouter } from 'next/navigation';

import HorizontalStepper, { type IHorizontalStep } from '@/common/components/steppers/HorizontalStepper';
import VerticalStepper, { type IVerticalStep } from '@/common/components/steppers/VerticalStepper';

export type IStep = IHorizontalStep | IVerticalStep

interface IStepperProps {
    onChange?: () => void;
    orientation: 'horizontal' | 'vertical';
    method: 'state' | 'navigate';
    steps: Array<IStep>;
}

interface IUseStepperReturn {
    Stepper: ({ clickable, className }: { clickable: boolean; className?: string }) => ReactNode;
    stepIndex: number;
    handleForward: () => void;
    handleBackward: () => void;
    handleSetStep: (index: number) => void;
}

const useStepper = ({ orientation, method, steps, onChange }: IStepperProps): IUseStepperReturn => {
    const pathname = usePathname();
    const router = useRouter();

    const indexFromPath = steps.findIndex(step => (step as IHorizontalStep)?.path === pathname);
    const [internalIndex, setInternalIndex] = useState(0);

    const stepIndex = method === 'navigate'
        ? (indexFromPath === -1 ? 0 : indexFromPath)
        : internalIndex;

    const updateStep = (index: number) => {
        if (index < 0 || index >= steps.length) return;
        onChange?.();
        if (method === 'navigate') router.replace((steps[index] as IHorizontalStep)?.path);
        else setInternalIndex(index);
    };

    const handleForward = () => updateStep(stepIndex + 1);
    const handleBackward = () => updateStep(stepIndex - 1);
    const handleSetStep = (index: number) => updateStep(index);

    const Stepper = ({ clickable, className }: Parameters<IUseStepperReturn['Stepper']>[0]) => {
        const pointerClass = clickable ? 'cursor-pointer' : '';
        return orientation === 'horizontal'
            ? <HorizontalStepper clickable={clickable} steps={steps as Array<IHorizontalStep>} handleSetStep={handleSetStep} className={`${className ?? ''} ${pointerClass}`} />
            : <VerticalStepper currentStepIndex={stepIndex} clickable={clickable} steps={steps} handleSetStep={handleSetStep} className={`${className ?? ''} ${pointerClass}`} />;
    };
    return {
        Stepper,
        stepIndex,
        handleForward,
        handleBackward,
        handleSetStep
    };
};

export default useStepper;
