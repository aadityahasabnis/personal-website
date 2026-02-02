'use client';
import React, { type HTMLAttributes, memo, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, type DayPickerProps, useDayPicker } from 'react-day-picker';

import { Button } from '@/common/components/ui/button';
import { CALENDAR_MAX_YEARS_FROM_NOW, CALENDAR_MIN_YEAR } from '@/common/constants/options/time';

import { cn } from '@/lib/utils';

type SelectionMode = 'date' | 'month';
export type CalendarOpeningView = 'days' | 'years' | 'months';

type DayPickerPropsWithOnSelect = DayPickerProps & {
    onSelect?: (date: Date | undefined) => void;
};

type ICalendarProps = DayPickerProps & {
    startYear?: number;
    endYear?: number;
    fromDate?: Date;
    toDate?: Date;
    futureAllowed?: boolean;
    variant?: 'large';
    yearRange?: number;
    openingView?: CalendarOpeningView;
    showYearSwitcher?: boolean;
    selectionMode?: SelectionMode;
};

const YEAR_GRID_SIZE = 16;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

// Memoized helper functions
const getCurrentYear = () => new Date().getFullYear();
const getMonthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const getYearStart = (year: number) => new Date(year, 0, 1);
const getYearEnd = (year: number) => new Date(year, 11, 31);
const getSelectedDate = (selected: Date | { from?: Date; to?: Date } | undefined): Date | undefined => selected instanceof Date ? selected : selected?.from;
const getEffectiveYear = (selectedYearForMonths: number | null, selectedDate: Date | null | undefined) => selectedYearForMonths ?? selectedDate?.getFullYear() ?? getCurrentYear();

// Nav Component - defined outside to avoid recreation
const Nav = ({ className, navView, displayYearsFrom, selectedYearForMonths, effectiveStartYear, effectiveEndYear, effectiveFromDate, effectiveToDate, getMaxDisplayYear, onNextClick, onPrevClick, setDisplayYearsFrom, setSelectedYearForMonths }: HTMLAttributes<HTMLElement> & { navView: CalendarOpeningView; displayYearsFrom: number; selectedYearForMonths: number | null; effectiveStartYear: number; effectiveEndYear: number; effectiveFromDate: Date; effectiveToDate: Date; getMaxDisplayYear: () => number; onNextClick?: (date: Date) => void; onPrevClick?: (date: Date) => void; setDisplayYearsFrom: (fn: (prev: number) => number) => void; setSelectedYearForMonths: (year: number | null) => void }) => {
    const { nextMonth, previousMonth, goToMonth } = useDayPicker();

    const isPreviousDisabled = useMemo(() => {
        if (navView === 'years') return displayYearsFrom <= effectiveStartYear;
        if (navView === 'months') return getEffectiveYear(selectedYearForMonths, null) <= effectiveStartYear;
        if (!previousMonth) return true;
        return getMonthStart(previousMonth) < getMonthStart(effectiveFromDate);
    }, [previousMonth, navView, displayYearsFrom, selectedYearForMonths, effectiveStartYear, effectiveFromDate]);

    const isNextDisabled = useMemo(() => {
        if (navView === 'years') return displayYearsFrom + YEAR_GRID_SIZE - 1 >= getMaxDisplayYear();
        if (navView === 'months') return getEffectiveYear(selectedYearForMonths, null) >= effectiveEndYear;
        if (!nextMonth) return true;
        return getMonthStart(nextMonth) > getMonthStart(effectiveToDate);
    }, [nextMonth, navView, displayYearsFrom, selectedYearForMonths, effectiveEndYear, effectiveToDate, getMaxDisplayYear]);

    const handleNavigation = useCallback((direction: 'prev' | 'next') => {
        if (navView === 'years') return setDisplayYearsFrom(prev => prev + (direction === 'next' ? YEAR_GRID_SIZE : -YEAR_GRID_SIZE));

        if (navView === 'months') {
            const currentYear = getEffectiveYear(selectedYearForMonths, null);
            return setSelectedYearForMonths(direction === 'next' ? currentYear + 1 : currentYear - 1);
        }

        const month = direction === 'next' ? nextMonth : previousMonth;
        if (!month) return;
        goToMonth(month);
        (direction === 'next' ? onNextClick : onPrevClick)?.(month);
    }, [nextMonth, previousMonth, goToMonth, navView, selectedYearForMonths, setDisplayYearsFrom, setSelectedYearForMonths, onNextClick, onPrevClick]);

    return (
        <nav className={cn('flex items-center', className)}>
            <Button buttonType="icon" variant="outline" size='sm' className="absolute left-0 size-7 p-0" disabled={isPreviousDisabled} onClick={() => handleNavigation('prev')}>
                <ChevronLeft className="size-4" />
            </Button>

            <Button buttonType="icon" variant="outline" size='sm' className="absolute right-0 size-7 p-0" disabled={isNextDisabled} onClick={() => handleNavigation('next')}>
                <ChevronRight className="size-4" />
            </Button>
        </nav>
    );
};

// MonthGrid Component - defined outside to avoid recreation
const MonthGrid = ({ className, children, navView, displayYearsFrom, selectedYearForMonths, effectiveStartYear, effectiveEndYear, effectiveFromDate, effectiveToDate, disabled, startMonth, endMonth, selectionMode, onSelectRef, setNavView, setSelectedYearForMonths, ...props }: HTMLAttributes<HTMLElement> & { children?: ReactNode; navView: CalendarOpeningView; displayYearsFrom: number; selectedYearForMonths: number | null; effectiveStartYear: number; effectiveEndYear: number; effectiveFromDate: Date; effectiveToDate: Date; disabled?: ((date: Date) => boolean) | ReadonlyArray<Date>; startMonth?: Date; endMonth?: Date; selectionMode: SelectionMode; onSelectRef: React.MutableRefObject<DayPickerPropsWithOnSelect['onSelect']>; setNavView: (view: CalendarOpeningView) => void; setSelectedYearForMonths: (year: number | null) => void }) => {
    const { selected, goToMonth } = useDayPicker();
    const selectedDate = getSelectedDate(selected);
    const yearsArray = useMemo(() => Array.from({ length: YEAR_GRID_SIZE }, (_, i) => displayYearsFrom + i), [displayYearsFrom]);
    const currentYear = useMemo(() => getEffectiveYear(selectedYearForMonths, selectedDate), [selectedYearForMonths, selectedDate]);

    if (navView === 'years')
        return (
            <div className={cn('grid grid-cols-4', className)} {...props}>
                {yearsArray.map(year => {
                    const yearStart = getYearStart(year);
                    const yearEnd = getYearEnd(year);
                    const actualStart = effectiveFromDate > yearStart ? effectiveFromDate : yearStart;
                    const actualEnd = effectiveToDate < yearEnd ? effectiveToDate : yearEnd;

                    const isOutOfRange = year < effectiveStartYear || year > effectiveEndYear || effectiveFromDate.getFullYear() > year || effectiveToDate.getFullYear() < year;
                    const hasInvalidRange = actualStart > actualEnd || ((startMonth && actualEnd < startMonth) ?? (endMonth && actualStart > endMonth));

                    const hasEnabledDay = typeof disabled === 'function' ? Array.from({ length: actualEnd.getMonth() - actualStart.getMonth() + 1 }, (_, i) => actualStart.getMonth() + i)
                        .some(month => {
                            const monthStart = month === actualStart.getMonth() ? actualStart.getDate() : 1;
                            const monthEnd = month === actualEnd.getMonth() ? actualEnd.getDate() : new Date(year, month + 1, 0).getDate();
                            return [monthStart, Math.ceil((monthStart + monthEnd) / 2), monthEnd].some(day => !disabled(new Date(year, month, day)));
                        }) : true;

                    const isYearDisabled = isOutOfRange || (hasInvalidRange ?? !hasEnabledDay);
                    const isSelectedYear = selectedDate?.getFullYear() === year;

                    return <Button key={year} variant="ghost" disabled={isYearDisabled} size="sm"
                        className={cn('hover:bg-blue-light hover:text-neutral-dark', isYearDisabled && 'text-skeleton opacity-50', isSelectedYear && 'bg-blue-dark text-white')}
                        onClick={() => {
                            const currentMonth = selectedDate?.getMonth() ?? 0;
                            if (selectionMode === 'month') {
                                setNavView('months');
                                setSelectedYearForMonths(year);
                                goToMonth(new Date(year, 0));
                            } else {
                                setNavView('days');
                                goToMonth(new Date(year, currentMonth));
                            }
                        }}
                    > {year} </Button>;
                })}
            </div>
        );

    if (navView === 'months')
        return (
            <div className={cn('grid grid-cols-3', className)}>
                {MONTHS.map((monthName, monthIndex) => {
                    const monthDate = new Date(currentYear, monthIndex, 1);
                    const monthStart = getMonthStart(monthDate);
                    const monthEnd = new Date(currentYear, monthIndex + 1, 0);

                    const isMonthDisabled = monthEnd < effectiveFromDate || monthStart > effectiveToDate || (typeof disabled === 'function' && disabled(monthDate));
                    const isSelectedMonth = selectedDate?.getFullYear() === currentYear && selectedDate.getMonth() === monthIndex;

                    return (
                        <Button key={monthIndex} variant="ghost" disabled={isMonthDisabled} size="sm"
                            className={cn('hover:bg-blue-light hover:text-neutral-dark', isMonthDisabled && 'text-skeleton opacity-50', isSelectedMonth && 'bg-blue-dark text-white')} onClick={() => onSelectRef.current?.(new Date(currentYear, monthIndex, 1))}>
                            {monthName}
                        </Button>
                    );
                })}
            </div>
        );

    return <table className={className} {...props}>{children}</table>;
};

const CalendarComponent = ({ className, showOutsideDays = true, showYearSwitcher = true, yearRange = YEAR_GRID_SIZE, numberOfMonths = 1, onNextClick, onPrevClick, startMonth, endMonth, variant, disabled, openingView = 'days', selectionMode = 'date', startYear, endYear, fromDate, toDate, futureAllowed, ...props }: ICalendarProps) => {
    const currentYear = getCurrentYear();
    const effectiveStartYear = startYear ?? CALENDAR_MIN_YEAR;
    const effectiveEndYear = endYear ?? (currentYear + CALENDAR_MAX_YEARS_FROM_NOW);
    const effectiveFromDate = fromDate ?? getYearStart(effectiveStartYear);
    const effectiveToDate = toDate ?? getYearEnd(effectiveEndYear);

    const getMaxDisplayYear = useCallback(() => toDate?.getFullYear() ?? (futureAllowed ? effectiveEndYear : currentYear), [toDate, futureAllowed, effectiveEndYear, currentYear]);

    const [navView, setNavView] = useState<CalendarOpeningView>(openingView);
    const [displayYearsFrom, setDisplayYearsFrom] = useState(() => Math.max(effectiveStartYear, currentYear - (yearRange - 1)));
    const [selectedYearForMonths, setSelectedYearForMonths] = useState<number | null>(null);

    const onSelectRef = useRef<DayPickerPropsWithOnSelect['onSelect']>(undefined);
    useEffect(() => {
        onSelectRef.current = 'onSelect' in props ? props.onSelect as DayPickerPropsWithOnSelect['onSelect'] : undefined;
    }, [props]);

    const lastVisibleYear = useMemo(() => Math.min(displayYearsFrom + YEAR_GRID_SIZE - 1, getMaxDisplayYear()), [displayYearsFrom, getMaxDisplayYear]);

    const enhancedDisabled = useMemo(() => {
        if (typeof disabled !== 'function') return (date: Date) => date < effectiveFromDate || date > effectiveToDate;
        return (date: Date) => date < effectiveFromDate || date > effectiveToDate || disabled(date);
    }, [disabled, effectiveFromDate, effectiveToDate]);

    const dayPickerProps = useMemo(() => {
        const baseProps: DayPickerProps = {
            showOutsideDays,
            className: cn('p-3', className),
            classNames: {
                months: 'relative flex h-full',
                month_caption: 'relative min-w-42 w-auto mx-8 flex h-7 items-center justify-center',
                weekdays: 'flex flex-row',
                weekday: 'min-w-8 w-full text-sm text-neutral-light mb-1',
                month: 'w-full',
                caption: 'relative flex items-center justify-center pt-1',
                caption_label: 'truncate text-xs',
                nav: 'flex items-start',
                month_grid: `w-full ${variant ? 'mt-5' : 'mt-3'}`,
                week: 'flex w-full items-start',
                day: `flex min-w-8 w-full flex-1 items-center justify-center p-0 rounded ${variant ? 'h-11 text-sm' : 'h-8 text-xs'}`,
                day_button: 'h-full min-w-8 w-full rounded-md p-0 transition-none hover:bg-blue-light hover:text-neutral-dark hover:rounded',
                selected: 'bg-blue-dark text-white cursor-pointer',
                outside: 'text-neutral-light opacity-50',
                disabled: 'text-skeleton opacity-50 line-through pointer-events-none',
                range_start: 'bg-blue-dark! text-white rounded-l-md rounded-r-none pointer-events-none',
                range_end: 'bg-blue-dark! text-white rounded-r-md rounded-l-none pointer-events-none',
                range_middle: 'bg-blue-light! text-neutral-dark! pointer-events-auto! rounded-none'
            },
            components: {
                Nav: (navProps) => <Nav {...navProps} navView={navView} displayYearsFrom={displayYearsFrom} selectedYearForMonths={selectedYearForMonths} effectiveStartYear={effectiveStartYear} effectiveEndYear={effectiveEndYear} effectiveFromDate={effectiveFromDate} effectiveToDate={effectiveToDate} getMaxDisplayYear={getMaxDisplayYear} onNextClick={onNextClick} onPrevClick={onPrevClick} setDisplayYearsFrom={setDisplayYearsFrom} setSelectedYearForMonths={setSelectedYearForMonths} />,
                MonthGrid: (monthGridProps) => <MonthGrid {...monthGridProps} navView={navView} displayYearsFrom={displayYearsFrom} selectedYearForMonths={selectedYearForMonths} effectiveStartYear={effectiveStartYear} effectiveEndYear={effectiveEndYear} effectiveFromDate={effectiveFromDate} effectiveToDate={effectiveToDate} disabled={disabled as ((date: Date) => boolean) | ReadonlyArray<Date> | undefined} startMonth={startMonth} endMonth={endMonth} selectionMode={selectionMode} onSelectRef={onSelectRef} setNavView={setNavView} setSelectedYearForMonths={setSelectedYearForMonths} />,
                CaptionLabel: ({ children, ...captionProps }) => {
                    const { selected } = useDayPicker();
                    const selectedDate = getSelectedDate(selected);

                    if (!showYearSwitcher) return <span {...captionProps}>{children}</span>;

                    if (navView === 'months') return <Button className="truncate py-0" variant="ghost" size="sm" onClick={() => setNavView('years')}>
                        {getEffectiveYear(selectedYearForMonths, selectedDate)}
                    </Button>;

                    if (navView === 'years') return <Button className="truncate py-0" variant="ghost" size="sm" onClick={() => {
                        if (selectionMode === 'month') {
                            setNavView('months');
                            setSelectedYearForMonths(getEffectiveYear(null, selectedDate));
                        } else setNavView('days');
                    }}> {`${displayYearsFrom} - ${lastVisibleYear}`} </Button>;

                    return <Button className="truncate py-0" variant="ghost" size="sm" onClick={() => setNavView('years')}>{children}</Button>;
                }
            },
            numberOfMonths: navView === 'years' || navView === 'months' ? 1 : numberOfMonths,
            disabled: enhancedDisabled,
            ...props
        };

        if (startMonth !== undefined) baseProps.startMonth = startMonth;
        if (endMonth !== undefined) baseProps.endMonth = endMonth;

        return baseProps;
    }, [showOutsideDays, className, variant, navView, numberOfMonths, enhancedDisabled, effectiveFromDate, effectiveToDate, startMonth, endMonth, showYearSwitcher, selectedYearForMonths, selectionMode, displayYearsFrom, lastVisibleYear, effectiveStartYear, effectiveEndYear, getMaxDisplayYear, onNextClick, onPrevClick, onSelectRef, disabled, props]);

    return <DayPicker {...dayPickerProps} />;
};

const Calendar = memo(CalendarComponent);
export { Calendar };
