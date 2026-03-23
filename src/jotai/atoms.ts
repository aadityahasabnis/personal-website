// Jotai Atoms — Global State Management

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export type TableViewMode = 'grid' | 'list';
export type TableSortOrder = 'asc' | 'desc';

export interface ITableSortState {
	sortBy: string;
	sortOrder: TableSortOrder;
}

type TableSearchStore = Record<string, string>;
type TableFiltersStore = Record<string, Record<string, string>>;
type TableSortStore = Record<string, ITableSortState | null>;
type TableViewStore = Record<string, TableViewMode>;
type TablePageSizeStore = Record<string, number>;
type TableSelectedIdsStore = Record<string, string[]>;

const tableSearchStoreAtom = atomWithStorage<TableSearchStore>('admin:table:search', {});
const tableFiltersStoreAtom = atomWithStorage<TableFiltersStore>('admin:table:filters', {});
const tableSortStoreAtom = atomWithStorage<TableSortStore>('admin:table:sort', {});
const tableViewStoreAtom = atomWithStorage<TableViewStore>('admin:table:view', {});
const tablePageSizeStoreAtom = atomWithStorage<TablePageSizeStore>('admin:table:page-size', {});
const tableSelectedIdsStoreAtom = atom<TableSelectedIdsStore>({});

export const createTableSearchAtom = (tableKey: string) =>
	atom(
		(get) => get(tableSearchStoreAtom)[tableKey] ?? '',
		(get, set, value: string) => {
			const current = get(tableSearchStoreAtom);
			set(tableSearchStoreAtom, { ...current, [tableKey]: value });
		},
	);

export const createTableFiltersAtom = (tableKey: string) =>
	atom(
		(get) => get(tableFiltersStoreAtom)[tableKey] ?? {},
		(get, set, value: Record<string, string>) => {
			const current = get(tableFiltersStoreAtom);
			set(tableFiltersStoreAtom, { ...current, [tableKey]: value });
		},
	);

export const createTableSortAtom = (tableKey: string) =>
	atom(
		(get) => get(tableSortStoreAtom)[tableKey] ?? null,
		(get, set, value: ITableSortState | null) => {
			const current = get(tableSortStoreAtom);
			set(tableSortStoreAtom, { ...current, [tableKey]: value });
		},
	);

export const createTableViewAtom = (tableKey: string) =>
	atom(
		(get) => get(tableViewStoreAtom)[tableKey] ?? 'grid',
		(get, set, value: TableViewMode) => {
			const current = get(tableViewStoreAtom);
			set(tableViewStoreAtom, { ...current, [tableKey]: value });
		},
	);

export const createTablePageSizeAtom = (tableKey: string) =>
	atom(
		(get) => get(tablePageSizeStoreAtom)[tableKey] ?? 15,
		(get, set, value: number) => {
			const current = get(tablePageSizeStoreAtom);
			set(tablePageSizeStoreAtom, { ...current, [tableKey]: value });
		},
	);

export const createTableSelectedIdsAtom = (tableKey: string) =>
	atom(
		(get) => get(tableSelectedIdsStoreAtom)[tableKey] ?? [],
		(get, set, value: string[]) => {
			const current = get(tableSelectedIdsStoreAtom);
			set(tableSelectedIdsStoreAtom, { ...current, [tableKey]: value });
		},
	);
