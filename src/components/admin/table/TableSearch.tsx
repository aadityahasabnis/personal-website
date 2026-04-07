'use client';

// =============================================================
// TableSearch - Search Input with Filter Dropdowns
// Server-Side Ready with TanStack Query Integration
// =============================================================

import { useCallback, useRef, useState } from 'react';
import { Search, X, Filter } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useDebouncedCallback } from '@/hooks/table/useDebounce';

import type { IFilterConfig, ITableSearchProps } from './types';

// =============================================================
// TableSearch Component
// =============================================================

export function TableSearch({
    value,
    onChange,
    placeholder = 'Search...',
    filters = [],
    filterValues = {},
    onFilterChange,
    activeFiltersCount = 0,
    onClearFilters,
    className,
}: ITableSearchProps): React.ReactElement {
    // Use uncontrolled input for performance - only sync on blur/enter/clear
    const inputRef = useRef<HTMLInputElement>(null);
    const [localValue, setLocalValue] = useState(value);

    // Debounced search callback for server-side
    const debouncedSearch = useDebouncedCallback((query: string) => {
        onChange(query);
    }, 350);

    // =============================================================
    // Handlers
    // =============================================================

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        debouncedSearch(newValue);
    }, [debouncedSearch]);

    const handleClearSearch = useCallback(() => {
        setLocalValue('');
        onChange('');
        if (inputRef.current) {
            inputRef.current.value = '';
            inputRef.current.focus();
        }
    }, [onChange]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            handleClearSearch();
        }
    }, [handleClearSearch]);

    const handleFilterChange = useCallback((filterId: string, newValue: string) => {
        // Convert '_all' back to empty string for server
        onFilterChange?.(filterId, newValue === '_all' ? undefined : newValue);
    }, [onFilterChange]);

    // =============================================================
    // Render Filter
    // =============================================================

    const renderFilter = (filter: IFilterConfig) => {
        const currentValue = filterValues[filter.id] as string | undefined;

        if (filter.type === 'select' && filter.options) {
            return (
                <Select
                    key={filter.id}
                    value={currentValue || '_all'}
                    onValueChange={(val) => handleFilterChange(filter.id, val)}
                >
                    <SelectTrigger className="h-9 min-w-32 border-border bg-card">
                        <SelectValue placeholder={filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_all">
                            <span className="text-muted-foreground">All {filter.label}</span>
                        </SelectItem>
                        {filter.options.map((option) => (
                            <SelectItem
                                key={option.value || '_all'}
                                value={option.value || '_all'}
                            >
                                <div className="flex items-center gap-2">
                                    {option.icon && <option.icon className="h-3.5 w-3.5" />}
                                    <span>{option.label}</span>
                                    {option.count !== undefined && (
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {option.count}
                                        </span>
                                    )}
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        if (filter.type === 'boolean') {
            return (
                <Select
                    key={filter.id}
                    value={currentValue || '_all'}
                    onValueChange={(val) => handleFilterChange(filter.id, val)}
                >
                    <SelectTrigger className="h-9 min-w-28 border-border bg-card">
                        <SelectValue placeholder={filter.label} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="_all">
                            <span className="text-muted-foreground">All</span>
                        </SelectItem>
                        <SelectItem value="true">Yes</SelectItem>
                        <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                </Select>
            );
        }

        return null;
    };

    // =============================================================
    // Render
    // =============================================================

    return (
        <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center', className)}>
            {/* Search Input */}
            <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={localValue}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    className="h-9 pl-10 pr-10 border-border bg-card transition-base focus:ring-1 focus:ring-primary/20"
                />
                {localValue && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        onClick={handleClearSearch}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label="Clear search"
                    >
                        <X className="h-3.5 w-3.5" />
                    </Button>
                )}
            </div>

            {/* Filters */}
            {filters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    {filters.map(renderFilter)}

                    {/* Clear Filters Button */}
                    {activeFiltersCount > 0 && onClearFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearFilters}
                            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                            <Filter className="h-3.5 w-3.5" />
                            Clear
                            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                                {activeFiltersCount}
                            </Badge>
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export default TableSearch;
