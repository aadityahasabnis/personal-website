'use client';
import React from 'react';

import { TypedObject } from '@byteswrite-admin/bep-core/interfaces';
import { camelCaseToTitleCase } from '@byteswrite-admin/bep-core/utils';

import { ArrowDownToLine, ArrowUpToLine, File, SquareArrowOutUpRight, Trash2 } from 'lucide-react';

import { Button } from '@/common/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/common/components/ui/dropdown-menu';
import Tooltip from '@/common/components/ui/tooltip';
import { useDocumentDrawer } from '@/common/hooks/useDocumentDrawer';
import  { type IFormData } from '@/common/hooks/useFormOperations';
import { downloadPDF } from '@/common/utils/downloadPDF';

import  { type CandidatePoints, type CoordinatorPoints } from '@/exclusive/interfaces/commonInterface';

import  { type TableMutateData } from '../TableWrapper';

export interface IDocumentDropdownProps<TTableResponse extends IFormData = IFormData> {
    id: string;
    entity: CandidatePoints | CoordinatorPoints;
    documents: Record<string, string>;
    mutateData: TableMutateData<TTableResponse>;
    documentsLabel?: string;
    className?: string;
    isCoordinator?: boolean;
}

const DocumentDropdown = <TTableResponse extends IFormData = IFormData>({ id, entity, documents, documentsLabel, className, isCoordinator = false, mutateData }: IDocumentDropdownProps<TTableResponse>) => {
    // const { triggerDialog } = useDialog();
    const { openDocumentDrawer } = useDocumentDrawer();
    const documentEntries = TypedObject.entries(documents);
    const pendingDocumentsCount = documentEntries.filter(([, value]) => value === '').length;
    const totalDocumentsCount = documentEntries.length;
    const submittedDocumentsCount = totalDocumentsCount - pendingDocumentsCount;

    // const onUpload = async (documentName: string) => triggerDialog({
    //     type: 'upload', onSuccessCallback: mutateData, allowedTypes: ['PDF'], uploadActionStructure: { entity, entityId: id, documentName }
    // });

    const onUpload = (_documentName: string) => {
        // TODO: Implement upload logic
    };

    const onDelete = async (documentName: string) => {
        console.info(documentName, mutateData, id, entity);
        // // TODO: const url: ApiUrl = `/api/student/cloud/deleteUploadedObject?entity=${entity}&entity_id=${id}&document=${documentName}`;
        // triggerDialog({
        //     type: 'confirmation', actionType: 'action', onSuccessCallback: mutateData,
        //     title: 'Confirm Deletion', description: 'Are you sure you want to delete this uploaded proof? This action cannot be undone.', icon: 'delete',
        //     serverActionStructure: { method: 'DELETE', url: CANDIDATE_API_ENDPOINTS.personal.getStudent },
        //     snackbarOptions: {
        //         successHeading: 'Deletion Successful',
        //         successDescription: 'The document has been successfully deleted.',
        //         loadingMessage: 'Hold tight! We’re removing the item for you...'
        //     }
        // });
    };

    const renderDocument = ([key, value]: [string, string]) => (
        <div className="flex items-center justify-between w-full gap-5">
            <span className="text-neutral-dark whitespace-nowrap">
                {camelCaseToTitleCase(key)} {documentsLabel ?? null}
            </span>

            {value?.length === 0 ?
                <Tooltip asChild description="Upload">
                    <Button buttonType='icon' disabled={isCoordinator} size="sm" className="bg-muted-background" onClick={() => onUpload(key)} icon={<ArrowUpToLine className="text-blue-dark size-3" />} />
                </Tooltip>
                :
                <div className="flex gap-1">
                    <Button buttonType='icon' size="sm" className="bg-muted-background" icon={<SquareArrowOutUpRight className="text-blue-medium size-3" />} onClick={() => openDocumentDrawer({ type: 'url', title: `${camelCaseToTitleCase(key)} ${documentsLabel && documentsLabel}`, url: value })} />

                    <Tooltip asChild description="Download">
                        <Button buttonType='icon' size="sm" className="bg-muted-background" onClick={async () => downloadPDF(value, `${key}_proof.pdf`)} icon={<ArrowDownToLine className="text-status-success size-3" />} />
                    </Tooltip>

                    {!isCoordinator && <React.Fragment>
                        <Tooltip asChild description="Reupload">
                            <Button buttonType='icon' size="sm" className="bg-muted-background" onClick={() => onUpload(key)} icon={<ArrowUpToLine className="text-blue-dark size-3" />} />
                        </Tooltip>

                        <Tooltip asChild description="Delete">
                            <Button buttonType='icon' size="sm" className="bg-muted-background" onClick={async () => onDelete(key)} icon={<Trash2 className="text-status-error size-3" />} />
                        </Tooltip>
                    </React.Fragment>}

                </div>
            }
        </div>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant='outline' startIcon={<File />} className={`flex border hover:bg-muted-background px-2 py-1 gap-0.5 ${submittedDocumentsCount === totalDocumentsCount ? 'text-status-success' : 'text-status-error'} ${className}`}>
                    <span className="text-neutral-medium">{submittedDocumentsCount}</span>
                    <sub className="text-neutral-light text-[10px] z-0">/ {totalDocumentsCount}</sub>
                </Button>
            </DropdownMenuTrigger>

            {totalDocumentsCount > 0 && (
                <DropdownMenuContent className="min-w-52">
                    {documentEntries.map((entry, index) => (
                        <DropdownMenuItem key={index}>{renderDocument(entry)}</DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            )}
        </DropdownMenu>
    );
};

export default DocumentDropdown;
