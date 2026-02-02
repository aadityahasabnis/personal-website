'use client';

import React, { type ChangeEvent, type ClipboardEvent, memo, useEffect, useMemo, useRef, useState } from 'react';

import { format, isValid, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { Calendar, type CalendarOpeningView } from '@/common/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/common/components/ui/popover';
import { fieldVariants, type IFieldVariants } from '@/common/constants/maps/maps';
import { CALENDAR_MAX_YEARS_FROM_NOW, CALENDAR_MIN_YEAR, timeOptions } from '@/common/constants/options/time';
import { type IFormData, type IHandleChange } from '@/common/hooks/useFormOperations';
import { type DotNestedDateKeys, type StrongOmit } from '@/common/interfaces/genericInterfaces';

import { cn } from '@/lib/utils';

import { FieldLabel, HiddenInput } from '../custom/_elements/FieldComponents';

import { ScrollArea } from './scroll-area';

type DefaultTime = `${0 | 1}${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}:${0 | 3}0` | `2${0 | 1 | 2 | 3}:${0 | 3}0`
type SelectionMode = 'date' | 'month';

export interface ICustomDatePickerProps<TFormBody> extends StrongOmit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
    name: DotNestedDateKeys<TFormBody>;
    value: Date | string | undefined;
    onChange: IHandleChange;
    placeholder?: string;
    className?: string;
    required?: boolean;
    label?: string;
    disabled?: boolean;
    maxDate?: Date;
    minDate?: Date;
    futureAllowed?: boolean;
    enableTime?: boolean;
    defaultTime?: DefaultTime;
    variant?: IFieldVariants;
    openingView?: CalendarOpeningView;
    selectionMode?: SelectionMode;
    minTime?: DefaultTime;
    maxTime?: DefaultTime;
}

// Date format patterns for parsing user input
const FORMAT_PATTERNS = [
    'dd/MM/yyyy', 'MM/dd/yyyy', 'yyyy/MM/dd', 'dd-MM-yyyy', 'MM-dd-yyyy', 'yyyy-MM-dd',
    'MMMM d, yyyy', 'd MMMM, yyyy', 'd MMMM yyyy', 'MMMM d yyyy', 'd MMM yyyy', 'MMM d yyyy', 'yyyy MMM d',
    "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
];

// Helper: Parse time string "HH:MM" to minutes
const parseTimeToMinutes = (timeStr: string): number => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h ?? 0) * 60 + (m ?? 0);
};

// Helper: Normalize date to midnight
const toMidnight = (d?: Date | string): Date | undefined => {
    if (!d) return undefined;
    const dt = d instanceof Date ? d : new Date(d);
    return isValid(dt) ? new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()) : undefined;
};

// Helper: Get date boundaries based on constraints
const getDateBoundaries = (minDate?: Date | string, maxDate?: Date | string, futureAllowed?: boolean): { effectiveMinDate: Date; effectiveMaxDate: Date } => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    const absoluteMin = new Date(CALENDAR_MIN_YEAR, 0, 1);
    const absoluteMax = new Date(currentYear + CALENDAR_MAX_YEARS_FROM_NOW, 11, 31);

    const min = toMidnight(minDate);
    const max = toMidnight(maxDate);

    return {
        effectiveMinDate: min ? new Date(Math.max(min.getTime(), absoluteMin.getTime())) : absoluteMin,
        effectiveMaxDate: max ? new Date(Math.min(max.getTime(), absoluteMax.getTime())) : (futureAllowed ? absoluteMax : today)
    };
};

// Helper: Check if date is disabled
const isDateDisabled = (d: Date, minDate: Date | undefined, maxDate: Date | undefined, futureAllowed: boolean): boolean => {
    const { effectiveMinDate, effectiveMaxDate } = getDateBoundaries(minDate, maxDate, futureAllowed);
    const candidate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return candidate < effectiveMinDate || candidate > effectiveMaxDate;
};

// Helper: Parse user input date string
const parseDate = (dateStr: string, existingDate?: Date, enableTime = false): { parsedDate: Date | undefined; isDateValid: boolean } => {
    if (!dateStr?.trim()) return { parsedDate: undefined, isDateValid: false };

    const normalized = dateStr.trim().replace(/\s+/g, ' ');
    const timeMatch = normalized.match(/\((\d{1,2}):(\d{2})\)/);

    const hours = timeMatch ? parseInt(timeMatch[1] ?? '0', 10) : (existingDate && enableTime ? existingDate.getHours() : 0);
    const minutes = timeMatch ? parseInt(timeMatch[2] ?? '0', 10) : (existingDate && enableTime ? existingDate.getMinutes() : 1);
    const dateOnly = normalized.replace(/\s*\(\d{1,2}:\d{2}\)/, '').trim();

    const createResult = (d: Date) => ({ parsedDate: new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, minutes), isDateValid: true });

    // Try format patterns - find first valid match
    const matchedPattern = FORMAT_PATTERNS.find(pattern => isValid(parse(dateOnly, pattern, new Date())));
    if (matchedPattern) return createResult(parse(dateOnly, matchedPattern, new Date()));

    // Fallback: native Date parsing
    const native = new Date(dateOnly);
    if (isValid(native) && native.getFullYear() > 1000) return createResult(native);

    return { parsedDate: undefined, isDateValid: false };
};

// Helper: Format date for display
const formatDisplayDate = (date: Date | undefined, showTime: boolean, selectionMode: SelectionMode): string => {
    if (!date) return '';
    if (selectionMode === 'month') return format(date, 'MMMM yyyy');
    return showTime ? `${format(date, 'dd-MM-yyyy')} (${format(date, 'HH:mm')})` : format(date, 'dd-MM-yyyy');
};

// Helper: Get next valid time after minDate
const getNextValidTime = (minDate: Date): string => {
    const minMins = minDate.getHours() * 60 + minDate.getMinutes();
    return timeOptions.find(t => parseTimeToMinutes(t) > minMins) ?? '23:30';
};

// Helper: Get time options with disabled states
const getTimeOptionsWithDisabled = (selectedDate: Date | undefined, minDate: Date | string | undefined, minTime?: string, maxTime?: string): Array<{ label: string; value: string; disabled?: boolean }> => {
    if (!selectedDate) return timeOptions.map(t => ({ label: t, value: t }));

    const minMins = minTime ? parseTimeToMinutes(minTime) : 0;
    const maxMins = maxTime ? parseTimeToMinutes(maxTime) : 24 * 60;

    const minDt = toMidnight(minDate);
    const selectedMidnight = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    const isSameAsMinDate = minDt?.getTime() === selectedMidnight.getTime();
    const minDateMins = isSameAsMinDate && minDate ? (minDate instanceof Date ? minDate : new Date(minDate)).getHours() * 60 + (minDate instanceof Date ? minDate : new Date(minDate)).getMinutes() : -1;

    return timeOptions.map(t => {
        const mins = parseTimeToMinutes(t);
        return { label: t, value: t, disabled: mins < minMins || mins > maxMins || (isSameAsMinDate && mins <= minDateMins) };
    });
};

// TODO: disable time options are clickable
const DatePicker = <TFormBody extends IFormData>({ name, value, onChange, placeholder, className, label, required, disabled, maxDate, minDate, futureAllowed = false, enableTime = false, defaultTime, variant = 'default', openingView = 'years', selectionMode = 'date', minTime, maxTime }: ICustomDatePickerProps<TFormBody>) => {
    const dateValue = useMemo(() => value ? new Date(value) : undefined, [value]);
    const dateValueRef = useRef<Date | undefined>(dateValue);
    dateValueRef.current = dateValue;

    const [open, setOpen] = useState(false);
    const [inputValue, setInputValue] = useState(() => formatDisplayDate(dateValue, enableTime, selectionMode));
    const [isValidDate, setIsValidDate] = useState(true);

    const inputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const showTime = enableTime && selectionMode === 'date';
    const { effectiveMinDate, effectiveMaxDate } = useMemo(() => getDateBoundaries(minDate, maxDate, futureAllowed), [minDate, maxDate, futureAllowed]);

    useEffect(() => { setInputValue(formatDisplayDate(dateValue, enableTime, selectionMode)); }, [dateValue, enableTime, selectionMode]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        if (!val) {
            setIsValidDate(true);
            return onChange({ target: { name, value: undefined } });
        }

        const { parsedDate, isDateValid } = parseDate(val, dateValue, enableTime);
        if (!isDateValid) return setIsValidDate(false);

        typingTimeoutRef.current = setTimeout(() => {
            onChange({ target: { name, value: parsedDate } });
            setInputValue(formatDisplayDate(parsedDate, enableTime, selectionMode));
            setIsValidDate(true);
        }, 1000);
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const { parsedDate } = parseDate(e.clipboardData.getData('text'), dateValue, enableTime);
        if (!parsedDate) return;
        onChange({ target: { name, value: parsedDate } });
        setInputValue(formatDisplayDate(parsedDate, enableTime, selectionMode));
        setIsValidDate(true);
    };

    const handleDateChange = (updatedDate: Date) => {
        const selectedDate = selectionMode === 'month'
            ? new Date(updatedDate.getFullYear(), updatedDate.getMonth(), 1)
            : new Date(updatedDate.getFullYear(), updatedDate.getMonth(), updatedDate.getDate());

        if (isDateDisabled(selectedDate, minDate, maxDate, futureAllowed)) return;

        const finalDate = new Date(selectedDate);

        if (showTime) {
            const prev = dateValueRef.current;
            const [defH, defM] = (defaultTime ?? '00:00').split(':').map(Number);
            const [h, m] = prev ? [prev.getHours(), prev.getMinutes()] : [defH ?? 0, defM ?? 1];
            finalDate.setHours(h ?? 0, m ?? 1);

            if (minDate) {
                const minDt = new Date(minDate);
                const isSameDay = selectedDate.getFullYear() === minDt.getFullYear() && selectedDate.getMonth() === minDt.getMonth() && selectedDate.getDate() === minDt.getDate();
                if (isSameDay && finalDate.getHours() * 60 + finalDate.getMinutes() <= minDt.getHours() * 60 + minDt.getMinutes()) {
                    const [nh, nm] = getNextValidTime(minDt).split(':').map(Number);
                    finalDate.setHours(nh ?? 0, nm ?? 0);
                }
            }
        }

        setInputValue(formatDisplayDate(finalDate, enableTime, selectionMode));
        onChange({ target: { name, value: finalDate } });
        setIsValidDate(true);
        if (defaultTime || selectionMode === 'month' || !enableTime) setOpen(false);
    };

    const handleTimeChange: IHandleChange = ({ target: { value: timeValue } }) => {
        const [h, m] = (timeValue as string).split(':').map(Number);
        const updatedDate = new Date(dateValueRef.current ?? minDate ?? new Date());
        updatedDate.setHours(h ?? 0, m ?? 0);
        setInputValue(formatDisplayDate(updatedDate, enableTime, selectionMode));
        onChange({ target: { name, value: updatedDate } });
        setOpen(false);
    };

    const handleInputClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (!open) { setOpen(true); requestAnimationFrame(() => inputRef.current?.focus()); }
    };

    const timeValue = useMemo(() => dateValue ? `${dateValue.getHours().toString().padStart(2, '0')}:${dateValue.getMinutes().toString().padStart(2, '0')}` : '', [dateValue]);
    const timeOptionsFiltered = useMemo(() => dateValue ? getTimeOptionsWithDisabled(dateValue, minDate, minTime, maxTime) : undefined, [dateValue, minDate, minTime, maxTime]);

    return (
        <div role='group' className={cn('relative flex flex-col gap-1', className)}>
            <FieldLabel label={label} required={required} />
            <HiddenInput name={name} value={String(value ?? '')} required={required} disabled={disabled} />

            <Popover open={!disabled && open} onOpenChange={setOpen} modal>
                <PopoverTrigger asChild disabled={disabled}>
                    <div className={disabled ? 'cursor-not-allowed' : ''}>
                        <div onClick={() => !disabled && inputRef.current?.focus()} className={cn('flex items-center justify-between gap-2 px-3 overflow-x-auto no-scrollbar w-full rounded border border-muted-skeleton focus-within:border-2 focus-within:border-neutral-light h-11 bg-white', disabled ? 'pointer-events-none opacity-50' : 'cursor-text', fieldVariants[variant])}>
                            <input ref={inputRef} type="text" autoComplete='off' value={inputValue} placeholder={placeholder} disabled={disabled}
                                onClick={handleInputClick} onChange={handleInputChange} onPaste={handlePaste} aria-invalid={!isValidDate}
                                className={cn('flex text-sm text-neutral-medium placeholder-skeleton outline-hidden hover:outline-hidden focus:outline-hidden pr-10 w-full', !isValidDate && 'border-red-500 focus-visible:ring-red-500')} />
                            <CalendarIcon className="size-4 shrink-0 text-skeleton" />
                        </div>
                    </div>
                </PopoverTrigger>

                <PopoverContent className="w-full p-0" align="start">
                    <div className="flex divide-x">
                        <Calendar mode="single" openingView={selectionMode === 'month' ? 'years' : openingView} selectionMode={selectionMode} startYear={effectiveMinDate.getFullYear()} endYear={effectiveMaxDate.getFullYear()} selected={dateValue} onSelect={handleDateChange}
                            defaultMonth={dateValue} disabled={(date: Date) => isDateDisabled(date, minDate, maxDate, futureAllowed)} required fixedWeeks fromDate={effectiveMinDate} toDate={effectiveMaxDate} />

                        {showTime ? <div className="flex flex-col divide-y max-w-24">
                            <span className="px-3 py-2.5 text-regular text-neutral-dark">Time (IST)</span>
                            {dateValue ? <ScrollArea className="h-60">
                                {timeOptionsFiltered?.map(({ label, value: timeVal, disabled: isDisabled }) => (
                                    <button key={timeVal} type="button" disabled={isDisabled} onClick={() => handleTimeChange({ target: { name: 'time', value: timeVal } })}
                                        className={`w-full px-3 py-1.5 text-[13px] text-left transition-colors hover:bg-blue-light hover:text-neutral-dark ${timeValue === timeVal && 'bg-blue-dark text-white'} ${isDisabled && 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-current'}`}>
                                        {label}
                                    </button>
                                ))}
                            </ScrollArea> : <span className='text-xs text-neutral-light p-2'>Please Select Date first</span>}
                        </div> : null}
                    </div>
                </PopoverContent>
            </Popover>

            {!isValidDate ? <span className="text-status-error text-sm">Please enter a valid date in the format DD-MM-YYYY{enableTime ? ' (HH:MM)' : ''}.</span> : null}
        </div>
    );
};

DatePicker.displayName = 'DatePicker';
export default memo(DatePicker) as typeof DatePicker;
