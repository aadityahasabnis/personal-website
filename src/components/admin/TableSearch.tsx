'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

// ===== TYPES =====

export interface ITableFilter {
    id: string;
    label: string;
    type: 'select' | 'multiselect' | 'date' | 'daterange';
    options?: Array<{ label: string; value: string }>;
    value?: any;
}

export interface ITableSearchProps {
    placeholder?: string;
    onSearch?: (query: string) => void;
    filters?: ITableFilter[];
    onFilterChange?: (filters: Record<string, any>) => void;
    activeFiltersCount?: number;
    className?: string;
}

// ===== TABLE SEARCH COMPONENT (MINIMAL INLINE DESIGN) =====

export function TableSearch({
    placeholder = 'Search...',
    onSearch,
    filters = [],
    onFilterChange,
    activeFiltersCount = 0,
    className,
}: ITableSearchProps): React.ReactElement {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterValues, setFilterValues] = useState<Record<string, any>>({});
    const [debouncedQuery, setDebouncedQuery] = useState('');

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Trigger search when debounced query changes
    useEffect(() => {
        if (onSearch) {
            onSearch(debouncedQuery);
        }
    }, [debouncedQuery, onSearch]);

    // Handle search input change
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    }, []);

    // Clear search
    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
        setDebouncedQuery('');
        if (onSearch) {
            onSearch('');
        }
    }, [onSearch]);

    // Handle filter value change
    const handleFilterValueChange = useCallback((filterId: string, value: any) => {
        const newFilters = {
            ...filterValues,
            [filterId]: value,
        };
        setFilterValues(newFilters);
        
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    }, [filterValues, onFilterChange]);

    return (
        <div className={cn('flex items-center gap-3', className)}>
            {/* Search Input - Takes remaining space */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="pl-10 pr-10"
                />
                {searchQuery && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Inline Filter Dropdowns - Using Radix Select for proper theming */}
            {filters.length > 0 && (
                <>
                    {filters.map((filter) => (
                        <div key={filter.id} className="min-w-[160px]">
                            {filter.type === 'select' && filter.options && (
                                <Select
                                    value={filterValues[filter.id] || filter.options[0]?.value || ''}
                                    onValueChange={(value) =>
                                        handleFilterValueChange(filter.id, value)
                                    }
                                >
                                    <SelectTrigger className="h-9 w-full">
                                        <SelectValue placeholder={filter.label} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filter.options.map((option) => (
                                            <SelectItem key={option.value} value={option.value || '_all'}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    ))}
                </>
            )}
        </div>
    );
}
