'use client';

import { useCallback, useState, useMemo, useRef } from 'react';
import { cloneDeep, get, set, isEqual } from 'lodash';
import type { IFormData, IHandleChange, IHandleChangeEvent } from '@/types/form';

interface IFormResult<TData extends IFormData> {
    formData: TData;
    isModified: boolean;
    handleChange: IHandleChange;
    setFormData: React.Dispatch<React.SetStateAction<TData>>;
    resetForm: () => void;
    setFieldValue: <K extends keyof TData>(field: K, value: TData[K]) => void;
    submitBtnRef: React.RefObject<HTMLButtonElement | null>;
}

/**
 * Hook for managing form state with change tracking
 * Adapted from refer-2 useFormOperations
 */
export const useFormOperations = <TData extends IFormData>(
    initialData: Partial<TData> = {}
): IFormResult<TData> => {
    // Use lazy initialization to capture initial data once
    const [formData, setFormData] = useState<TData>(() => initialData as TData);
    const [initialSnapshot] = useState<Partial<TData>>(() => initialData);
    const submitBtnRef = useRef<HTMLButtonElement>(null);

    const isModified = useMemo(
        () => !isEqual(formData, initialSnapshot),
        [formData, initialSnapshot]
    );

    const handleChange: IHandleChange = useCallback((e: IHandleChangeEvent) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const currentValue = get(prev, name);
            if (isEqual(currentValue, value)) return prev;
            const updated = cloneDeep(prev);
            set(updated, name, value);
            return updated;
        });
    }, []);

    const setFieldValue = useCallback(<K extends keyof TData>(field: K, value: TData[K]) => {
        setFormData((prev) => {
            if (isEqual(prev[field], value)) return prev;
            return { ...prev, [field]: value };
        });
    }, []);

    const resetForm = useCallback(() => {
        setFormData(initialSnapshot as TData);
    }, [initialSnapshot]);

    return {
        formData,
        isModified,
        handleChange,
        setFormData,
        resetForm,
        setFieldValue,
        submitBtnRef,
    };
};

export default useFormOperations;
