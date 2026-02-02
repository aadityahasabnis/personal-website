'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface IFilterOption {
    label: string;
    value: string;
    checked: boolean;
}

export interface IFilterGroup {
    id: string;
    label: string;
    options: IFilterOption[];
}

interface ISearchFilterProps {
    placeholder?: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    filterGroups?: IFilterGroup[];
    onFilterChange?: (groupId: string, value: string, checked: boolean) => void;
    className?: string;
}

/**
 * SearchFilter Component
 * 
 * Combines search bar and advanced filtering options
 * Used in list pages to filter and search content
 * 
 * @example
 * <SearchFilter
 *   placeholder="Search articles..."
 *   searchValue={searchQuery}
 *   onSearchChange={setSearchQuery}
 *   filterGroups={[
 *     {
 *       id: 'status',
 *       label: 'Status',
 *       options: [
 *         { label: 'Published', value: 'published', checked: true },
 *         { label: 'Draft', value: 'draft', checked: false },
 *       ]
 *     }
 *   ]}
 *   onFilterChange={handleFilterChange}
 * />
 */
export const SearchFilter = ({
    placeholder = 'Search...',
    searchValue,
    onSearchChange,
    filterGroups = [],
    onFilterChange,
    className,
}: ISearchFilterProps): React.ReactElement => {
    const activeFiltersCount = useMemo(() => {
        return filterGroups.reduce((count, group) => {
            return count + group.options.filter((opt) => opt.checked).length;
        }, 0);
    }, [filterGroups]);

    const handleClearSearch = (): void => {
        onSearchChange('');
    };

    const hasFilters = filterGroups.length > 0;

    return (
        <div className={cn('flex items-center gap-2', className)}>
            {/* Search Bar */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    placeholder={placeholder}
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 pr-9"
                />
                {searchValue && (
                    <button
                        onClick={handleClearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Filter Button */}
            {hasFilters && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="relative">
                            <Filter className="h-4 w-4" />
                            Filters
                            {activeFiltersCount > 0 && (
                                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {filterGroups.map((group, groupIndex) => (
                            <div key={group.id}>
                                {groupIndex > 0 && <DropdownMenuSeparator />}
                                <DropdownMenuLabel className="text-xs text-muted-foreground">
                                    {group.label}
                                </DropdownMenuLabel>
                                {group.options.map((option) => (
                                    <DropdownMenuCheckboxItem
                                        key={option.value}
                                        checked={option.checked}
                                        onCheckedChange={(checked) =>
                                            onFilterChange?.(group.id, option.value, checked)
                                        }
                                    >
                                        {option.label}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </div>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    );
};
