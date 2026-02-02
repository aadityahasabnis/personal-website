'use client';

import { type FormEvent } from 'react';

import { type IFormData, TypedObject } from '@byteswrite-admin/bep-core/interfaces';

import { useAtom, useAtomValue } from 'jotai';
import { cloneDeep, get, set } from 'lodash';
import { FilterX, SlidersHorizontal } from 'lucide-react';

import { type IHandleChange } from '@/common/hooks/useFormOperations';
import usePageFilterFormData from '@/common/hooks/usePageFilterFormData';
import { filterDrawerStateAtom, tableQueryAtom } from '@/common/jotai/atoms';
import { type ITableQuery } from '@/common/server/actions/common';

import PingWrapper from '../../animations/PingWrapper';
import { type IInputFieldConfigUnion, renderField } from '../../form/FormWrapper';
import { Button } from '../../ui/button';

export type IFiltersStructure<TTableFilterBody extends IFormData | undefined> = Array<IInputFieldConfigUnion<TTableFilterBody>>;

const TableFilters = <TTableFilterBody extends IFormData | undefined>({ filtersStructure, defaultFilter, enableFiltersWithSearch = false }: { filtersStructure?: IFiltersStructure<TTableFilterBody>; defaultFilter: IFormData | undefined; enableFiltersWithSearch?: boolean }) => {
    const filterState = useAtomValue(filterDrawerStateAtom);
    const [tableQuery, setTableQuery] = useAtom<ITableQuery<IFormData>>(tableQueryAtom);
    const { currentPathname, filterFormData, filterFormDataForPage, updateFilterFormDataForPage, resetFilterFormDataForPage } = usePageFilterFormData<IFormData, TTableFilterBody>();

    // Check if search is active for current page - only disable filters if enableFiltersWithSearch is false
    const isSearchActive = !enableFiltersWithSearch && Boolean(tableQuery.search?.[currentPathname]?.length);

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

    const applyFilters = (e: FormEvent) => {
        e.preventDefault();

        // Prevent apply when search is active
        if (isSearchActive) return;

        const appliedFilters = TypedObject.keys(filterFormDataForPage).reduce<Partial<TTableFilterBody>>((acc, field) => {
            const key = field;
            const value = filterFormDataForPage?.[key as string];
            if (value !== undefined && value !== null) acc[key] = value as TTableFilterBody[keyof TTableFilterBody];
            return acc;
        }, {});

        setTableQuery(prev => ({ ...prev, filter: { ...filterFormData, [currentPathname]: appliedFilters } }));
    };

    const isFilterApplied = Boolean(TypedObject.keys(filterFormDataForPage).length);
    const isFiltersUpdated = TypedObject.keys(filterFormDataForPage).every(field => filterFormDataForPage?.[field as string] === tableQuery?.filter?.[currentPathname]?.[field as string]);

    return (
        <form onSubmit={applyFilters} className={`max-tab:hidden grid xs:grid-cols-2 tab:grid-cols-6 gap-5 transition-all duration-500 ${filterState ? 'max-h-2499.75 opacity-100 overflow-visible' : 'max-h-0 opacity-10 overflow-hidden'} ${isSearchActive ? 'pointer-events-none opacity-50' : ''}`}>
            {filtersStructure?.map((field, key) => !field.hidden && renderField(filterFormDataForPage, field?.onChange ?? handleFilterChange, { key, ...field, required: field?.required ?? false, disabled: (isSearchActive || field.disabled) ?? false }))}

            <div className='col-span-full flex flex-col xs:flex-row gap-3 xs:gap-5 justify-end'>
                <Button size='lg' type='reset' startIcon={<FilterX />} variant='ghost' onClick={resetFilters} disabled={!isFilterApplied || isSearchActive}>{defaultFilter ? 'Reset' : 'Clear'} Filters</Button>
                <Button size='lg' type='submit' startIcon={<SlidersHorizontal />} variant='secondary' disabled={isFiltersUpdated || isSearchActive} className='relative'>
                    {!isFiltersUpdated && !isSearchActive && <div className='absolute -top-3.5 right-0.5'><PingWrapper className='bg-blue-medium' variant='md' /></div>}Apply Filters
                </Button>
            </div>
        </form>
    );
};

export default TableFilters;
