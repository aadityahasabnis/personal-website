'use client';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

import { createWorksheet ,type  LookUpMap,type  LookUpMapArray } from '../utils/formatters/excelFormatter';

import  { type IFormData } from './useFormOperations';

export interface IDownloadExcelOptions {
    data: Array<IFormData> | Array<Array<IFormData>> | undefined;
    lookUpMap: LookUpMap | LookUpMapArray;
    sheetName?: string | Array<string | null>;
    headerName?: string | Array<string | null>;
    fileName: string;
    emptyPlaceholder?: string;
    brandingText?: string;
    allowDefaults?: boolean;
}

// TODO: Move in frontend common package
const useExcelDownloader = () => {
    const handleSingleSheetDownload = ({ workbook, data, lookUpMap, sheetName, headerName, emptyPlaceholder, brandingText, allowDefaults }: { workbook: ExcelJS.Workbook; data: Array<IFormData>; lookUpMap: LookUpMap; sheetName?: IDownloadExcelOptions['sheetName']; headerName?: IDownloadExcelOptions['headerName']; emptyPlaceholder?: string; brandingText?: string; allowDefaults?: boolean }) => createWorksheet({ workbook, sheetData: data, lookupMap: lookUpMap, sheetName: sheetName as string ?? 'Sheet1', headerName: headerName as string ?? undefined, emptyPlaceholder, brandingText, allowDefaults });

    const handleMultipleSheetsDownload = ({ workbook, sheets, lookUpMap, sheetNames, headerNames, emptyPlaceholder, brandingText, allowDefaults }: { workbook: ExcelJS.Workbook; sheets: Array<Array<IFormData>>; lookUpMap: LookUpMapArray; sheetNames?: IDownloadExcelOptions['sheetName']; headerNames?: IDownloadExcelOptions['headerName']; emptyPlaceholder?: string; brandingText?: string; allowDefaults?: boolean }) => sheets.forEach((sheet, i) => createWorksheet({ workbook, sheetData: sheet, lookupMap: lookUpMap[i] as LookUpMap, sheetName: sheetNames?.[i] ?? `Sheet${i + 1}`, headerName: headerNames?.[i] ?? undefined, emptyPlaceholder, brandingText, allowDefaults }));

    const downloadExcel = async ({ data, lookUpMap, fileName, sheetName, headerName, emptyPlaceholder = '-', brandingText, allowDefaults = false }: IDownloadExcelOptions) => {
        const workbook = new ExcelJS.Workbook();
        const isMultiple = Array.isArray(lookUpMap);
        if (!Array.isArray(data) || !data.length) return;

        if (isMultiple) handleMultipleSheetsDownload({ workbook, sheets: data as Array<Array<IFormData>>, lookUpMap, sheetNames: sheetName, headerNames: headerName, emptyPlaceholder, brandingText, allowDefaults });
        else handleSingleSheetDownload({ workbook, data: data as Array<IFormData>, lookUpMap, sheetName, headerName, emptyPlaceholder, brandingText, allowDefaults });

        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${fileName}.xlsx`);
    };

    return { downloadExcel };
};

export default useExcelDownloader;
