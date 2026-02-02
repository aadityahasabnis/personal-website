'use client';

import { useState, useCallback, useEffect } from 'react';
import { Search, X, Filter, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

// ===== TABLE SEARCH COMPONENT =====

export function TableSearch({
    placeholder = 'Search...',
    onSearch,
    filters = [],
    onFilterChange,
    activeFiltersCount = 0,
    className,
}: ITableSearchProps): React.ReactElement {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
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
        setFilterValues((prev) => ({
            ...prev,
            [filterId]: value,
        }));
    }, []);

    // Apply filters
    const handleApplyFilters = useCallback(() => {
        if (onFilterChange) {
            onFilterChange(filterValues);
        }
        setShowFilters(false);
    }, [filterValues, onFilterChange]);

    // Clear all filters
    const handleClearFilters = useCallback(() => {
        setFilterValues({});
        if (onFilterChange) {
            onFilterChange({});
        }
    }, [onFilterChange]);

    return (
        <div className={cn('space-y-4', className)}>
            {/* Search Bar */}
            <div className="flex items-center gap-3">
                {/* Search Input */}
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
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Filter Toggle Button */}
                {filters.length > 0 && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(
                            'relative',
                            activeFiltersCount > 0 && 'border-primary text-primary'
                        )}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        {activeFiltersCount > 0 && (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                                {activeFiltersCount}
                            </span>
                        )}
                    </Button>
                )}
            </div>

            {/* Filters Panel */}
            {showFilters && filters.length > 0 && (
                <div className="rounded-lg border bg-card p-4 space-y-4 animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearFilters}
                            disabled={activeFiltersCount === 0}
                        >
                            Clear all
                        </Button>
                    </div>

                    {/* Filter Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filters.map((filter) => (
                            <div key={filter.id} className="space-y-2">
                                <label className="text-sm font-medium">{filter.label}</label>
                                {filter.type === 'select' && (
                                    <select
                                        value={filterValues[filter.id] || ''}
                                        onChange={(e) =>
                                            handleFilterValueChange(filter.id, e.target.value)
                                        }
                                        className={cn(
                                            'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm',
                                            'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary'
                                        )}
                                    >
                                        <option value="">All</option>
                                        {filter.options?.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Apply Filters Button */}
                    <div className="flex justify-end pt-2">
                        <Button onClick={handleApplyFilters} size="sm">
                            Apply Filters
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
