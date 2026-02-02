import * as React from 'react';

import { type IFormData } from '@byteswrite-admin/bep-core/interfaces';

import { type IHandleChange } from '@/common/hooks/useFormOperations';
import { type DotNestedScalarKeys, type StrongOmit } from '@/common/interfaces/genericInterfaces';

import { FieldLabel } from '../custom/_elements/FieldComponents';

export interface ICustomTextAreaProps<TFormBody = IFormData> extends StrongOmit<React.InputHTMLAttributes<HTMLTextAreaElement>, 'onChange' | 'name'> {
    name: DotNestedScalarKeys<TFormBody>;
    onChange: IHandleChange;
    className?: string;
    textAreaClassName?: string;
    label?: string;
    rows?: number;
}

const TextArea = <TFormBody = IFormData>({ label, name, onChange, className, textAreaClassName, rows = 4, ...inputProps }: ICustomTextAreaProps<TFormBody>) => {
    const handleChangeEvent = (e: React.ChangeEvent<HTMLTextAreaElement>) => onChange({ ...e, target: { ...e.target, name, value: e.target.value === '' ? undefined : e.target.value } });
    const { value, defaultValue, ...restInputProps } = inputProps;
    const normalizedValue = React.useMemo(() => (value ?? defaultValue) ? String(value ?? defaultValue).replace(/<br\s*\/?>/gi, '\n') : '', [value, defaultValue]);

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            <FieldLabel label={label} required={inputProps?.required} />
            <textarea rows={rows} onChange={handleChangeEvent} name={name} placeholder={inputProps?.placeholder ? `${inputProps?.placeholder} ${inputProps?.required && !label ? '*' : ''}` : undefined}
                className={`flex rounded outline-none border focus:border-2 focus:border-neutral-light w-full text-regular text-neutral-medium placeholder-skeleton disabled:cursor-not-allowed disabled:opacity-50 p-3 no-scrollbar bg-white ${textAreaClassName}`}
                {...restInputProps}
                value={normalizedValue}
            />
        </div>
    );
};

TextArea.displayName = 'TextArea';
export default TextArea;
