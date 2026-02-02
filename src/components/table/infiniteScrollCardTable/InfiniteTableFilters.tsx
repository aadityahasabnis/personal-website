import React, { type FormEvent, useCallback, useMemo, useState } from 'react';

import { TypedObject } from '@byteswrite-admin/bep-core/interfaces';
import { isInvalidAndEmptyObject } from '@byteswrite-admin/bep-core/utils';

import { useAtom } from 'jotai';
import { cloneDeep, get, set } from 'lodash';
import { CircleX, SlidersHorizontal } from 'lucide-react';

import PingWrapper from '@/common/components/animations/PingWrapper';
import { renderField } from '@/common/components/form/FormWrapper';
import { Button } from '@/common/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/common/components/ui/sheet';
import { type IFormData, type IHandleChange } from '@/common/hooks/useFormOperations';
import usePageFilterFormData from '@/common/hooks/usePageFilterFormData';
import { tableQueryAtom } from '@/common/jotai/atoms';
import { type ITableQuery } from '@/common/server/actions/common';

import { type IFiltersStructure } from '../table/TableFilters';

export interface IInfiniteTableFiltersProps<TInfiniteTableFilterBody extends IFormData | undefined> {
    filtersStructure: IFiltersStructure<TInfiniteTableFilterBody>;
    resetPagination: () => void;
    defaultFilter?: TInfiniteTableFilterBody;
    className?: string;
}

const InfiniteTableFilters = <TInfiniteTableFilterBody extends IFormData | undefined>({ filtersStructure, resetPagination, defaultFilter = {}, className }: IInfiniteTableFiltersProps<TInfiniteTableFilterBody>) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tableQuery, setTableQuery] = useAtom<ITableQuery<IFormData>>(tableQueryAtom);
    const { currentPathname, filterFormData, filterFormDataForPage, updateFilterFormDataForPage, resetFilterFormDataForPage } = usePageFilterFormData<IFormData, TInfiniteTableFilterBody>();

    // Check if search is active for current page
    const isSearchActive = Boolean(tableQuery.search?.[currentPathname]?.length);

    // Memoized filter change handler for direct updates (desktop filters)
    const handleDirectFilterChange: IHandleChange = useCallback((e) => {
        // Prevent filter changes when search is active
        if (isSearchActive) return;

        const { name, value } = e.target;

        updateFilterFormDataForPage((prevFormData: IFormData) => {
            const currentValue = get(prevFormData, name);
            if (currentValue === value) return prevFormData;

            const updatedFilters = cloneDeep(prevFormData) ?? {};
            set(updatedFilters, name, value);

            // Reset pagination and update table query immediately for direct changes
            resetPagination();
            setTableQuery(prev => ({ ...prev, filter: { ...filterFormData, [currentPathname]: updatedFilters } }));

            return updatedFilters;
        });
    }, [resetPagination, updateFilterFormDataForPage, filterFormData, currentPathname, setTableQuery, isSearchActive]);

    // Memoized filter change handler for modal updates (no immediate apply)
    const handleFilterChange: IHandleChange = useCallback((e) => {
        // Prevent filter changes when search is active
        if (isSearchActive) return;

        const { name, value } = e.target;

        updateFilterFormDataForPage((prevFormData: IFormData) => {
            const currentValue = get(prevFormData, name);
            if (currentValue === value) return prevFormData;

            const updatedFormData = cloneDeep(prevFormData) ?? {};
            set(updatedFormData, name, value);
            return updatedFormData;
        });
    }, [updateFilterFormDataForPage, isSearchActive]);

    // Memoized reset filters function
    const resetFilters = useCallback(() => {
        // Prevent reset when search is active
        if (isSearchActive) return;

        resetPagination();

        // Use the dedicated reset method for complete field replacement
        resetFilterFormDataForPage(defaultFilter as TInfiniteTableFilterBody);
        setTableQuery(prev => ({ ...prev, filter: { ...filterFormData, [currentPathname]: defaultFilter } }));
    }, [resetPagination, defaultFilter, currentPathname, resetFilterFormDataForPage, setTableQuery, filterFormData, isSearchActive]);

    // Memoized apply filters function
    const applyFilters = useCallback((e: FormEvent) => {
        e.preventDefault();

        // Prevent apply when search is active
        if (isSearchActive) return;

        // Filter out empty/falsy values from form data
        const appliedFilters = TypedObject.keys(filterFormDataForPage).reduce((acc: Partial<TInfiniteTableFilterBody>, field) => {
            const value = filterFormDataForPage?.[field as string];
            if (value !== undefined && value !== null && value !== '') acc[field] = value;
            return acc;
        }, {});

        resetPagination();
        setIsOpen(false);

        setTableQuery(prev => ({ ...prev, filter: { ...filterFormData, [currentPathname]: appliedFilters } }));
    }, [filterFormDataForPage, resetPagination, setTableQuery, filterFormData, currentPathname, isSearchActive]);

    // Memoized computed values for better performance
    const isFilterApplied = useMemo(() => Boolean(TypedObject.keys(filterFormDataForPage).length), [filterFormDataForPage]);

    const isFiltersUpdated = useMemo(() => {
        const formData = filterFormDataForPage ?? {};
        const currentFilter = tableQuery?.filter?.[currentPathname] ?? {};
        return TypedObject.keys(formData).every(field => formData[field] === currentFilter[field]);
    }, [filterFormDataForPage, tableQuery?.filter, currentPathname]);

    // Memoized Filters component to prevent unnecessary re-renders
    const Filters = useMemo(() => ({ directFilterChange = true }: { directFilterChange?: boolean }) => filtersStructure?.map((field, key) => {
        if (field.hidden) return null;
        return renderField(filterFormDataForPage, field?.onChange ?? (directFilterChange ? handleDirectFilterChange : handleFilterChange), { ...field, key, className: field.className, required: field?.required ?? false, disabled: (isSearchActive || field.disabled) ?? false });
    }).filter(Boolean), [filtersStructure, filterFormDataForPage, handleDirectFilterChange, handleFilterChange, isSearchActive]);

    return (
        <div className={`flex ${className}`}>
            <div className='tab:hidden'>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild disabled={false}>
                        <Button buttonType='icon' icon={<SlidersHorizontal className="size-4" />} className='relative h-full' />
                    </SheetTrigger>

                    <SheetContent hideClose className='max-w-lg w-full'>
                        <SheetClose asChild>
                            <button type='button' className="absolute right-5 top-5">
                                <CircleX className="size-4 text-status-error transform transition-transform duration-300 hover:rotate-180" />
                            </button>
                        </SheetClose>

                        <form onSubmit={applyFilters} className='flex flex-col gap-5 size-full'>
                            <div className='flex flex-col gap-1'>
                                <SheetTitle className="flex items-center gap-2 text-neutral-dark"><SlidersHorizontal className="size-4" /> Apply Filters</SheetTitle>
                                <SheetDescription className="text-regular text-neutral-light">Refine your search with detailed filters</SheetDescription>
                                <hr className='mt-2' />
                            </div>

                            <Filters directFilterChange={false} />

                            <div className="flex flex-col gap-3 mt-auto">
                                <hr className='mb-2' />
                                <Button size='lg' type='submit' disabled={isFiltersUpdated || isSearchActive} className='relative'>
                                    {!isFiltersUpdated && !isSearchActive && <div className='absolute -top-3.5 right-0.5'><PingWrapper variant='md' /></div>}Apply Filters
                                </Button>
                                <Button size='lg' onClick={resetFilters} disabled={!isFilterApplied || isSearchActive} variant='neutral'>{!isInvalidAndEmptyObject(defaultFilter) ? 'Reset' : 'Clear'} Filters</Button>
                            </div>
                        </form>
                    </SheetContent>
                </Sheet>
            </div>

            <div className={`max-tab:hidden grid grid-cols-32 gap-3 w-full ${isSearchActive ? 'pointer-events-none opacity-50' : ''}`}>
                <Filters />
                <Button onClick={resetFilters} disabled={!isFilterApplied || isSearchActive} className="size-full col-span-4 col-start-29 relative" variant='outline'>
                    {(isFilterApplied && !isSearchActive) ? <div className='absolute -top-3.25 left-1'><PingWrapper className='bg-blue-medium' variant='md' /></div> : null} {!isInvalidAndEmptyObject(defaultFilter) ? 'Reset' : 'Clear'} Filters
                </Button>
            </div>
        </div>
    );
};

export default React.memo(InfiniteTableFilters) as typeof InfiniteTableFilters;
