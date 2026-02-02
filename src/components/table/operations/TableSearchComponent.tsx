'use client';
import React, { useCallback, useEffect, useState } from 'react';

import { usePathname } from 'next/navigation';

import { useAtom } from 'jotai';
import { SearchIcon, XIcon } from 'lucide-react';

import { tableQueryAtom } from '@/common/jotai/atoms';

const TableSearchComponent = ({ className, searchLabel, resetPagination }: { className?: string; searchLabel?: string; resetPagination?: () => void }) => {
    const pathname = usePathname();
    const [tableQuery, setTableQuery] = useAtom(tableQueryAtom);
    const currentSearch = tableQuery.search?.[pathname] ?? '';
    const [localSearchValue, setLocalSearchValue] = useState(currentSearch);

    // Sync local state when pathname or search value changes
    useEffect(() => {
        setLocalSearchValue(tableQuery.search?.[pathname] ?? '');
    }, [pathname, tableQuery.search]);

    // Most Optimized Approach but lacks readability
    const debouncedSearch = useCallback((() => {
        let timer: NodeJS.Timeout;
        return (value: string, currentPathname: string) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (value || value === '')
                    setTableQuery((prev) => ({ ...prev, search: { ...prev.search, [currentPathname]: value }, offset: 0 }));
            }, 800);
        };
    })(), [setTableQuery]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setLocalSearchValue(value); // Update local state immediately for smooth typing
        resetPagination?.();
        debouncedSearch(value, pathname);
    };

    const handleClear = () => {
        setLocalSearchValue(''); // Clear local state immediately
        resetPagination?.();
        setTableQuery((prev) => ({ ...prev, search: { ...prev.search, [pathname]: '' }, offset: 0 }));
    };

    return (
        <div className={`flex items-center gap-2 bg-muted-background p-2 px-5 rounded w-full ${className} transition-transform duration-200 ease-in-out`}>
            <SearchIcon className='size-4 text-neutral-light transition-transform group-hover:scale-105' />
            <div className="flex items-center w-full">
                <input type="text" inputMode="search" value={localSearchValue} onChange={handleSearch} onFocus={(e) => e.target.style.outline = 'none'}
                    placeholder={`Search on ${searchLabel}`}
                    className='flex w-full items-center justify-center text-neutral-medium bg-transparent placeholder:tracking-wide pr-8 transition-transform text-ellipsis'
                    style={{ outline: 'none', padding: '2px', fontSize: '14px' }}
                />
                {localSearchValue ? <button type='button' onClick={handleClear} className="group transition-transform hover:scale-105">
                    <XIcon className='size-4 text-neutral-medium opacity-50 group-hover:opacity-100 transition-transform group-hover:rotate-90' />
                </button> : null}
            </div>
        </div>
    );
};

export default React.memo(TableSearchComponent);
