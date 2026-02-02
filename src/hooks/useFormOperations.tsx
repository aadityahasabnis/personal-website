'use client';
import React, { type FormEvent, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { TypedObject } from '@byteswrite-admin/bep-core/interfaces';
import { isInvalidAndEmptyObject } from '@byteswrite-admin/bep-core/utils';

import { cloneDeep, get, isEqual, isPlainObject, set } from 'lodash';

import FormWrapper, { type IFormWrapperProps } from '@/common/components/form/FormWrapper';

import { isDeepInvalidAndEmpty } from '../helpers/dataHelpers';
import { type DotNestedObjectKeys, type DotNestedScalarArrayKeys, type DotNestedScalarKeys, type StrongOmit } from '../interfaces/genericInterfaces';

import { useSnackbar } from './useSnackbar';

type IFormServerAction<TBodyData, TDefaultData extends IFormData | undefined = undefined> = (data: TBodyData & TDefaultData) => Promise<void>;
export interface IHandleChangeEvent { target: { name: string; value: string | Array<string> | unknown; checked?: boolean } }
export type IHandleChange = (e: IHandleChangeEvent) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type IFormData<TDefaultData = Record<string, any>> = TDefaultData;
export type IRenderFormWrapperProps<TDefaultData extends IFormData = IFormData, TResponseData extends IFormData | undefined = undefined, TDefaultValue extends IFormData | undefined = undefined> = StrongOmit<IFormWrapperProps<TDefaultData, TResponseData, TDefaultValue>, 'defaultFormValue' | 'formData' | 'handleChange' | 'submitBtnRef' | 'handleSubmit' | 'isModified' | 'isSubmitting' | 'setFormData'>;

const normalizeFormData = (data: IFormData): IFormData | undefined => {
    if (data === null || data === undefined) return undefined;
    if (typeof data !== 'object') return isInvalidAndEmptyObject(data) ? undefined : data;
    if (Array.isArray(data)) return data.length ? data : undefined;
    if (!isPlainObject(data)) return data;

    const keys = TypedObject.keys(data);
    if (!keys.length) return undefined;

    const result = keys.reduce<{ data: IFormData; hasValues: boolean }>((acc, k) => {
        const normalized = normalizeFormData(data[k]);
        if (normalized !== undefined) {
            acc.data[k] = normalized;
            acc.hasValues = true;
        }
        return acc;
    }, { data: {}, hasValues: false });

    return result.hasValues ? result.data : undefined;
};

/**
 * CRITICAL: All generic type parameters must use IFormData as default value, NOT undefined.
 *
 * Why this matters:
 * 1. TBodyData MUST have default to support calls like useFormOperations() without generics
 * 2. TResponseData = undefined breaks FormDialog's defaultValues typing
 * 3. TDefaultData = undefined causes formData type to collapse to 'never'
 *
 * Type algebra: IMyType & undefined = never ❌
 *
 * All three must default to IFormData for proper type inference across the app.
 * See: _docs/TYPING_BREAKAGE_DIAGNOSIS_AND_FIX.md
 */
const useFormOperations = <TBodyData extends IFormData = IFormData, TResponseData extends IFormData | undefined = IFormData, TDefaultData extends IFormData | undefined = IFormData>(initialFormData: Partial<TDefaultData> = {}, serverAction?: IFormServerAction<TBodyData, TDefaultData>, requiredFields: Array<DotNestedScalarKeys<TBodyData> | DotNestedScalarArrayKeys<TBodyData> | DotNestedObjectKeys<TBodyData>> = []) => {

    const { triggerSnackbar } = useSnackbar();
    const [formData, setFormData] = useState<TBodyData & TDefaultData>(() => initialFormData as TBodyData & TDefaultData);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const submitBtnRef = useRef<HTMLButtonElement>(null);
    const isFirstRender = useRef(true);

    const normalizedInitialData = useMemo(() => normalizeFormData(initialFormData), [initialFormData]);
    const normalizedFormData = useMemo(() => normalizeFormData(formData), [formData]);

    const isModified = useMemo(() => !isEqual(normalizedFormData, normalizedInitialData), [normalizedFormData, normalizedInitialData]);
    const pendingRequiredFields = useMemo(() => requiredFields.filter(field => isDeepInvalidAndEmpty(get(formData, field))), [formData, requiredFields]);

    useLayoutEffect(() => {
        if (!isFirstRender.current) return;

        if (initialFormData && TypedObject.values(initialFormData).some(value => value !== null && value !== undefined && value !== '')) {
            setFormData(initialFormData as TBodyData & TDefaultData);
            isFirstRender.current = false;
        }
    }, [initialFormData]);

    const handleChange: IHandleChange = useCallback((e) => {
        const { name, value } = e.target;

        setFormData((prevFormData) => {
            const currentValue = get(prevFormData, name);

            if (isEqual(currentValue, value)) return prevFormData;

            const updatedFormData = cloneDeep(prevFormData);
            set(updatedFormData, name, value);
            return updatedFormData;
        });
    }, []);

    const resetForm = useCallback(() => setFormData(initialFormData as TBodyData & TDefaultData), [initialFormData]);

    const onSubmit = useCallback(async (e: FormEvent) => {
        e.preventDefault();

        if (!serverAction) return;

        try {
            setIsSubmitting(true);
            return await serverAction(formData);
        } catch (err) {
            const errorResponse = { success: false, error: `An unexpected Error Occurred: ${err}`, status: 500 };
            await triggerSnackbar(Promise.resolve(errorResponse));
            return errorResponse;
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, serverAction, triggerSnackbar]);

    const renderFormWrapper = useMemo(() => (props?: Partial<IRenderFormWrapperProps<TBodyData, TResponseData, TDefaultData>>) => {
        return (
            <FormWrapper<TBodyData, TResponseData, TDefaultData>
                {...props}
                formConfig={props?.formConfig ?? []}
                handleChange={handleChange}
                setFormData={setFormData as React.Dispatch<React.SetStateAction<TBodyData>>}
                handleSubmit={onSubmit}
                handleSecondaryClick={resetForm}
                submitBtnRef={submitBtnRef as React.RefObject<HTMLButtonElement>}
                formData={formData}
                isModified={isModified}
                isSubmitting={isSubmitting}
            />
        );
    }, [handleChange, onSubmit, resetForm, formData, isModified, isSubmitting]);

    return { formData, isModified, submitBtnRef, pendingRequiredFields, handleChange, resetForm, setFormData, renderFormWrapper };
};

export default useFormOperations;
