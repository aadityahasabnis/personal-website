'use client';
import React, { useEffect, useState } from 'react';

import { TypedObject } from '@byteswrite-admin/bep-core/interfaces';
import { isInvalidAndEmptyObject } from '@byteswrite-admin/bep-core/utils';

import { useAtom } from 'jotai';
import { cloneDeep, get, set } from 'lodash';
import { ChevronsDown, ChevronsUp, CircleX, SlidersHorizontal } from 'lucide-react';

import { type IFormData, type IHandleChange } from '@/common/hooks/useFormOperations';
import usePageFilterFormData from '@/common/hooks/usePageFilterFormData';
import { filterDrawerStateAtom, tableQueryAtom } from '@/common/jotai/atoms';
import { type ITableQuery } from '@/common/server/actions/common';

import PingWrapper from '../../animations/PingWrapper';
import { renderField } from '../../form/FormWrapper';
import { Button } from '../../ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '../../ui/sheet';
import { type IFiltersStructure } from '../table/TableFilters';

const FilterButton = <TTableFilterBody extends IFormData | undefined>({ filtersStructure, defaultFilter, className, enableFiltersWithSearch = false }: { filtersStructure?: IFiltersStructure<TTableFilterBody>; defaultFilter: IFormData | undefined; className?: string; enableFiltersWithSearch?: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filterState, setFilterState] = useAtom(filterDrawerStateAtom);
    const [tableQuery, setTableQuery] = useAtom<ITableQuery<IFormData>>(tableQueryAtom);
    const { currentPathname, filterFormData, filterFormDataForPage, updateFilterFormDataForPage, resetFilterFormDataForPage } = usePageFilterFormData<IFormData, TTableFilterBody>();

    // Check if search is active for current page - only disable filters if enableFiltersWithSearch is false
    const isSearchActive = !enableFiltersWithSearch && Boolean(tableQuery.search?.[currentPathname]?.length);

    // Auto-close filters when search becomes active (only when enableFiltersWithSearch is false)
    useEffect(() => {
        if (!enableFiltersWithSearch && isSearchActive && filterState) setFilterState(false);
    }, [enableFiltersWithSearch, isSearchActive, filterState, setFilterState]);

    const handleFilterChange: IHandleChange = (e) => {
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
    };

    const resetFilters = () => {
        // Prevent reset when search is active
        if (isSearchActive) return;

        resetFilterFormDataForPage(defaultFilter as TTableFilterBody);
        setTableQuery(prev => ({ ...prev, filter: { ...filterFormData, [currentPathname]: defaultFilter as IFormData } }));
    };

    const applyFilters = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSearchActive) return;

        const appliedFilters = TypedObject.keys(filterFormDataForPage).reduce<Partial<TTableFilterBody>>((acc, field) => {
            const key = field;
            const value = filterFormDataForPage?.[key as string];
            if (value !== undefined && value !== null) acc[key] = value as TTableFilterBody[keyof TTableFilterBody];
            return acc;
        }, {});

        setTableQuery(prev => ({ ...prev, filter: { ...filterFormData, [currentPathname]: appliedFilters } }));
        setIsOpen(false);
    };

    const isFilterApplied = Boolean(TypedObject.keys(filterFormDataForPage).length);
    const isFiltersUpdated = TypedObject.keys(filterFormDataForPage).every(field => filterFormDataForPage?.[field as string] === tableQuery?.filter?.[currentPathname]?.[field as string]);

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

                            {filtersStructure?.map((field, key) => !field.hidden && renderField(filterFormDataForPage, field?.onChange ?? handleFilterChange, { key, ...field, required: field?.required ?? false, disabled: (isSearchActive || field.disabled) ?? false }))}

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

            <Button size='lg' variant="neutral" onClick={() => !isSearchActive && setFilterState(!filterState)} disabled={isSearchActive}
                className="max-tab:hidden bg-muted-background hover:bg-muted transition-all duration-300 px-10" startIcon={filterState
                    ? <ChevronsUp size={16} className="transition-all duration-300" />
                    : <ChevronsDown size={16} className="transition-all duration-300" />
                }> Filters
            </Button>
        </div>
    );
};

export default FilterButton;
