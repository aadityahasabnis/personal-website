'use client';
import { type JSX } from 'react';

import { type IDateRange, type IVerificationInfo } from '@byteswrite-admin/bep-core/interfaces';
import { formatDateTime } from '@byteswrite-admin/bep-core/utils';

import { useAtomValue } from 'jotai';

import NoData from '@/common/components/other/NoData';
import { Badge, type IBadgeVariants } from '@/common/components/ui/badge';
import { TableBody, TableCell, TableRow } from '@/common/components/ui/table';
import Tooltip from '@/common/components/ui/tooltip';
import { verificationStatusIconsMap } from '@/common/constants/media/icons';
import { type IFormData } from '@/common/hooks/useFormOperations';
import { type IManageRequestVerificationDetail, type IVerificationDetail } from '@/common/interfaces/commonInterface';
import { type DotNestedDateRangeKeys, type KeysOfType, type StrongOmit } from '@/common/interfaces/genericInterfaces';
import { tableQueryAtom } from '@/common/jotai/atoms';

import DocumentDropdown, { type IDocumentDropdownProps } from '../body/DocumentDropdown';
import TableButtonDropdown, { type IDropdownOption } from '../body/TableButtonDropdown';
import { type TableMutateData } from '../TableWrapper';

import { getAlignmentClass } from './CustomTable';

export interface IBaseColumnStructureCommon {
    label: string;
    minWidth?: number;
    maxWidth?: number;
    align?: 'right' | 'left' | 'center';
    hidden?: boolean;
}

export interface ITextColumnStructure<TTableResponse extends IFormData> extends IBaseColumnStructureCommon {
    id: KeysOfType<TTableResponse, string | number | undefined>;
    sort?: 1 | -1;
    type: 'text';
    colorCondition?: Record<string, 'success' | 'blue-dark' | 'light'>;
    suffix?: string;
}

export interface IDateColumnStructure<TTableResponse extends IFormData> extends IBaseColumnStructureCommon {
    id: KeysOfType<TTableResponse, Date | undefined>;
    sort?: 1 | -1;
    type: 'date';
}

export interface IDateRangeColumnStructure<TTableResponse extends IFormData> extends IBaseColumnStructureCommon {
    id: DotNestedDateRangeKeys<TTableResponse>;
    type: 'dateRange';
}

export interface IArrayColumnStructure<TTableResponse extends IFormData> extends IBaseColumnStructureCommon {
    id: KeysOfType<TTableResponse, Array<string | number | undefined>>;
    type: 'array';
    highlightFirstKey?: KeysOfType<TTableResponse, Array<string | number | undefined>>;
}

export interface IBooleanColumnStructure<TTableResponse extends IFormData> extends IBaseColumnStructureCommon {
    id: KeysOfType<TTableResponse, boolean | undefined>;
    sort?: 1 | -1;
    type: 'boolean';
    booleanLabels: { true: string; false: string };
}

export interface IBadgeColumnStructure<TTableResponse extends IFormData> extends IBaseColumnStructureCommon {
    id: ITextColumnStructure<TTableResponse>['id'];
    sort?: 1 | -1;
    type: 'badge';
    badgeVariants: Record<string, IBadgeVariants>;
}

export interface IVerificationColumnStructure<TTableResponse extends IFormData> extends IBaseColumnStructureCommon {
    id: KeysOfType<TTableResponse, IVerificationInfo>;
    sort?: 1 | -1;
    type: 'verification';
}

export interface ITableButtonDropdownColumnStructure<TTableResponse extends IFormData> extends IBaseColumnStructureCommon {
    type: 'tableButtonDropdown';
    tableButtonDropdown: Array<IDropdownOption<TTableResponse>>;
}

export interface IDocumentDropdownColumnStructure extends IBaseColumnStructureCommon {
    type: 'documentDropdown';
    documentDropdownStructure: StrongOmit<IDocumentDropdownProps, 'id' | 'documents' | 'mutateData'> & { documentsKey: string };
}

export interface ICustomColumnStructure<TTableResponse extends IFormData> extends IBaseColumnStructureCommon {
    type: 'custom';
    customRender: (row: TTableResponse, mutateData: TableMutateData<TTableResponse>) => JSX.Element | string;
}
export type IDataColumnStructure<TTableResponse extends IFormData> = IVerificationColumnStructure<TTableResponse> | ITextColumnStructure<TTableResponse> | IDateColumnStructure<TTableResponse> | IDateRangeColumnStructure<TTableResponse> | IArrayColumnStructure<TTableResponse> | IBooleanColumnStructure<TTableResponse> | IBadgeColumnStructure<TTableResponse>;
export type IActionColumnStructure<TTableResponse extends IFormData> = ITableButtonDropdownColumnStructure<TTableResponse> | IDocumentDropdownColumnStructure | ICustomColumnStructure<TTableResponse>;
export type IColumnStructure<TTableResponse extends IFormData> = IDataColumnStructure<TTableResponse> | IActionColumnStructure<TTableResponse>;

const formatters = {
    text: <TTableResponse extends IFormData>(value: string, column: ITextColumnStructure<TTableResponse>) => <span className={`text-${column?.colorCondition?.[value]}`}>{value || 'N/A'} {column?.suffix ?? null}</span>,
    date: (value: string) => formatDateTime(value),
    dateRange: (value: IDateRange) => value?.startingDate && value?.endingDate ? `${formatDateTime(value.startingDate)} - ${formatDateTime(value.endingDate)}` : 'N/A',
    array: (value: Array<string>, highlightFirst: boolean) => highlightFirst ? <span><span>{value[0]}</span>{value.length > 1 && `, ${value.slice(1)?.join(', ')}`}</span> : value?.join(', '),
    boolean: <TTableResponse extends IFormData>(value: 'true' | 'false', column: IBooleanColumnStructure<TTableResponse>) => column?.booleanLabels?.[value] ?? column?.booleanLabels?.['false'],
    verification: (value: IVerificationDetail | IManageRequestVerificationDetail) => {
        const isRejected = value?.status === 'Rejected' || value?.status === 'Partially Approved';
        const isVerified = value?.status === 'Verified' || value?.status === 'Approved';
        const Icon = verificationStatusIconsMap?.[value?.status];

        return <Tooltip description={isRejected ? value?.statusMessage : ''}>
            <div className={`flex flex-col items-center text-center justify-center gap-2 min-w-20 ${isRejected && 'cursor-pointer'}`}>
                {Icon ? <Icon /> : null}
                {(isRejected || isVerified) ? <p className='flex flex-col'>
                    {value?.statusAuthorityName ? <span className='text-xs text-neutral-medium'>{value?.statusAuthorityName}</span> : <span />}
                    {value?.statusTimestamp ? <span className='text-xs text-neutral-light'>{formatDateTime(value?.statusTimestamp)}</span> : <span />}
                </p> : null}
            </div>
        </Tooltip>;
    },
    badge: <TTableResponse extends IFormData>(value: string, column: IBadgeColumnStructure<TTableResponse>) => column?.badgeVariants ? <Badge variant={column.badgeVariants[value]}>{value}</Badge> : value,
    tableButtonDropdown: <TTableResponse extends IFormData>(row: TTableResponse, column: ITableButtonDropdownColumnStructure<TTableResponse>, mutateData: TableMutateData<TTableResponse>) => column?.tableButtonDropdown ? <TableButtonDropdown row={row} options={column.tableButtonDropdown} mutateData={mutateData} /> : null,
    documentDropdown: <TTableResponse extends IFormData>(row: TTableResponse, column: IDocumentDropdownColumnStructure, mutateData: TableMutateData<TTableResponse>) => column?.documentDropdownStructure?.entity ? <DocumentDropdown id={row._id} documents={row?.[column.documentDropdownStructure.documentsKey]} entity={column.documentDropdownStructure.entity} documentsLabel={column.documentDropdownStructure.documentsLabel} isCoordinator={column.documentDropdownStructure.isCoordinator} mutateData={mutateData} /> : null,
    custom: <TTableResponse extends IFormData>(row: TTableResponse, column: ICustomColumnStructure<TTableResponse>, mutateData: TableMutateData<TTableResponse>) => column?.customRender?.(row, mutateData) ?? 'N/A'
};

const renderCellContent = <TTableResponse extends IFormData>(column: IColumnStructure<TTableResponse>, row: TTableResponse, mutateData: TableMutateData<TTableResponse>) => {
    const value = 'id' in column ? row[column.id] : undefined;

    let content;
    if (column.type === 'text' && value !== undefined) content = formatters.text(value, column);
    else if (column.type === 'array' && value !== undefined) content = formatters.array(value, !!('highlightFirstKey' in column && column.highlightFirstKey && row[column.highlightFirstKey]));
    else if (column.type === 'date' && value !== undefined) content = formatters.date(value);
    else if (column.type === 'dateRange' && value !== undefined) content = formatters.dateRange(value);
    else if (column.type === 'boolean' && value !== undefined) content = formatters.boolean(value, column);
    else if (column.type === 'verification' && value !== undefined) content = formatters.verification(value);
    else if (column.type === 'badge' && value !== undefined) content = formatters.badge(value, column);
    else if (column.type === 'tableButtonDropdown') content = formatters.tableButtonDropdown(row, column, mutateData);
    else if (column.type === 'documentDropdown') content = formatters.documentDropdown(row, column, mutateData);
    else if (column.type === 'custom') content = formatters.custom(row, column, mutateData);

    return (
        <div className={`flex ${getAlignmentClass(column.align)} items-center`}>
            {content}
        </div>
    );
};

const TableBodyWrapper = <TTableResponse extends IFormData>({ columnsStructure, rows, count = 0, showIndexColumn, mutateData, error }: { columnsStructure: Array<IColumnStructure<TTableResponse>>; rows: Array<TTableResponse> | undefined; count: number | undefined; showIndexColumn: boolean; mutateData: TableMutateData<TTableResponse>; error: boolean }) => {
    const tableQuery = useAtomValue(tableQueryAtom);
    const { offset } = tableQuery;

    if (count && count > 0) return (
        <TableBody>
            {rows?.map((row: TTableResponse, index: number) => (
                <TableRow key={index}>
                    {showIndexColumn ? <TableCell className="text-center"> {Number(offset) + Number(index) + 1} </TableCell> : null}
                    {columnsStructure.map((column, index) => column?.hidden ? undefined : (
                        <TableCell key={index} className={getAlignmentClass(column.align)}>
                            {renderCellContent<TTableResponse>(column, row, mutateData)}
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </TableBody>
    );

    return (
        <TableBody>
            <TableRow>
                <TableCell colSpan={columnsStructure?.length + Number(showIndexColumn)}>
                    {error ? <NoData mode='error' title='Oops, an error occurred!' description="We're experiencing a temporary hiccup. Please try again after some time." className='size-full' />
                        : <NoData title='You’re All Caught Up' description='There are no records to display at this time' className='size-full' />}
                </TableCell>
            </TableRow>
        </TableBody>
    );
};

export default TableBodyWrapper;
