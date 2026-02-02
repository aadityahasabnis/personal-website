'use client';
import React from 'react';

import { useAtomValue } from 'jotai';
import { get } from 'lodash';

import { operationsIconMap } from '@/common/constants/media/icons';
import useAPIAction from '@/common/hooks/useAPIAction';
import { useAPIQuery } from '@/common/hooks/useAPIQuery';
import useExcelDownloader, { type IDownloadExcelOptions } from '@/common/hooks/useExcelDownloader';
import { type IFormData } from '@/common/hooks/useFormOperations';
import usePageFilterFormData from '@/common/hooks/usePageFilterFormData';
import { tableQueryAtom } from '@/common/jotai/atoms';

import { type ApiUrl } from '@/exclusive/interfaces/commonInterface';
import { getOrganizationData } from '@/exclusive/server/actions/auth';

import { Button } from '../ui/button';
import { DialogTitle } from '../ui/dialog';

import { type MaxWidthDialogType } from './DialogWrapper';

export interface IExportDialogStructure {
    type: 'export';
    fileName: string;
    url: ApiUrl;
    onClose: () => void;
    lookUpMap: IDownloadExcelOptions['lookUpMap'];
    sheetName?: IDownloadExcelOptions['sheetName'];
    headerName?: IDownloadExcelOptions['headerName'];
    maxWidth?: MaxWidthDialogType;
    onCloseCallback?: () => void;
    allowDefaults?: boolean;
    responseDataKey?: string;
}

const ExportDialog: React.FC<IExportDialogStructure> = ({ onClose, url, lookUpMap, fileName, sheetName, headerName, onCloseCallback, allowDefaults = false, responseDataKey }) => {

    const Icon = operationsIconMap['download'];
    const { data: organizationData } = useAPIQuery({ url: 'getOrganizationData', fetcher: getOrganizationData, staleTime: Infinity });
    const { downloadExcel } = useExcelDownloader();
    const tableQuery = useAtomValue(tableQueryAtom);
    const { handleAction, pending } = useAPIAction();
    const { filterFormDataForPage } = usePageFilterFormData();

    const onExport = async () => {
        const { sort } = tableQuery;
        const queryParams = new URLSearchParams({
            ...(filterFormDataForPage && { filter: JSON.stringify(filterFormDataForPage) }),
            ...(sort && { sort: JSON.stringify(sort) })
        });

        const { success, data } = await handleAction<IFormData>({
            actionConfig: { method: 'GET', url: `${url}${queryParams.toString() ? `?${queryParams.toString()}` : ''}` }, snackbarOptions: {
                successHeading: 'Data Export Completed', successDescription: 'The file has been safely delivered to your downloads folder. ',
                loadingMessage: 'Exporting data. Your file is on its way...'
            }
        });
        if (!success) return;

        const exportData = (responseDataKey ? get(data, responseDataKey) : data) as Array<IFormData> | Array<Array<IFormData>>;
        if (!Array.isArray(exportData) || !exportData.length) return;

        const isMultiSheet = Array.isArray(exportData[0]);
        const sheets = (isMultiSheet ? exportData : [exportData]) as Array<Array<IFormData>>;
        const normalizedLookUpMap = (isMultiSheet ? (Array.isArray(lookUpMap) ? lookUpMap : sheets.map(() => lookUpMap)) : lookUpMap);

        const normalizeArrayMeta = <T extends string | null>(value: T | Array<T> | undefined, fallback: (index: number) => T): Array<T> | undefined => {
            if (!isMultiSheet) return value as Array<T> | undefined;
            if (Array.isArray(value)) return value;
            return sheets.map((_, index) => fallback(index));
        };

        const resolvedSheetNames = normalizeArrayMeta(sheetName, (index) => (index === 0 ? (typeof sheetName === 'string' ? sheetName : undefined) ?? `Sheet${index + 1}` : `Sheet${index + 1}`));
        const resolvedHeaderNames = normalizeArrayMeta(headerName, (index) => (index === 0 ? (headerName as string | undefined) ?? null : null));

        await downloadExcel({ data: isMultiSheet ? sheets : (exportData as Array<IFormData>), fileName, lookUpMap: normalizedLookUpMap, sheetName: isMultiSheet ? resolvedSheetNames : sheetName, emptyPlaceholder: 'N/A', headerName: isMultiSheet ? resolvedHeaderNames : headerName, brandingText: organizationData?.name, allowDefaults });
        onClose();
    };

    const handleClose = () => { onClose(); if (onCloseCallback) onCloseCallback(); };

    return (
        <div className="flex flex-col p-5 gap-12 w-full">
            <div className="flex gap-3">
                <Icon className="size-8 xs:size-12 shrink-0" />
                <div className="flex flex-col gap-1">
                    <DialogTitle>Data Export Confirmation</DialogTitle>
                    <span className="text-regular text-neutral-light">Make sure you’ve reviewed the filters applied, as they will be included in the current export.</span>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3 xs:gap-5">
                <Button disabled={pending} variant='error' onClick={handleClose} className="w-full">Cancel</Button>
                <Button pending={pending} variant='success' onClick={onExport} className="w-full">Confirm</Button>
            </div>
        </div>
    );
};

export default ExportDialog;
