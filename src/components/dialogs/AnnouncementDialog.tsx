'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { type UserType } from '@byteswrite-admin/bep-core/constants';
import { type IOrganizationAcademicOptions, TypedObject } from '@byteswrite-admin/bep-core/interfaces';
import { type IGetMailLogsResponse } from '@byteswrite-admin/contracts-uplift';

import { Pencil, ScanEye } from 'lucide-react';

import { type ISelectOption } from '@/common/components/custom/CustomSelect';
import { type MaxWidthDialogType } from '@/common/components/dialogs/DialogWrapper';
import { type IFieldConfig, renderField } from '@/common/components/form/FormWrapper';
import ProductMailTemplate from '@/common/components/templates/ProductMailTemplate';
import { Button } from '@/common/components/ui/button';
import { DialogTitle } from '@/common/components/ui/dialog';
import { Skeleton } from '@/common/components/ui/skeleton';
import dialogConstants from '@/common/constants/dialogConstants';
import useAPIAction from '@/common/hooks/useAPIAction';
import { useAPIQuery } from '@/common/hooks/useAPIQuery';
import useFormOperations from '@/common/hooks/useFormOperations';
import { type DotNestedDateKeys, type DotNestedObjectKeys, type DotNestedScalarArrayKeys, type DotNestedScalarKeys } from '@/common/interfaces/genericInterfaces';
import { getCandidatesList, getCoordinatorsList, getProgramsByPassingYear, getRecruitersList } from '@/common/server/actions/redis';
import { getIndividualsOptions, getRecruitersOptions } from '@/common/utils/formatters/formatter';

import COORDINATOR_API_ENDPOINTS from '@/exclusive/constants/routes/coordinatorRoutes';
import { getProgramsByPassingYearOptions, handleDependentFieldChange } from '@/exclusive/helpers/formHelpers';
import { type ICommunicationMailBodyUnion } from '@/exclusive/interfaces/extendedInterfaces';

import { ScrollArea } from '../ui/scroll-area';

export interface IAnnouncementDialogStructure {
    type: 'announcement';
    recipientEntity?: UserType;
    isEditable?: boolean;
    onClose: () => void;
    id?: string;
    maxWidth?: MaxWidthDialogType;
    defaultValues?: Partial<IGetMailLogsResponse>;
    disableKeys?: Array<DotNestedScalarKeys<ICommunicationMailBodyUnion> | DotNestedScalarArrayKeys<ICommunicationMailBodyUnion> | DotNestedDateKeys<ICommunicationMailBodyUnion> | DotNestedObjectKeys<ICommunicationMailBodyUnion>>;
    onSuccessCallback?: () => void;
    onCloseCallback?: () => void;
}

const ENTITY_LEVEL_MAP: Record<UserType, Array<ISelectOption>> = {
    students: [{ label: 'Program', value: 'program' }, { label: 'Individual', value: 'individual' }],
    employees: [],
    recruiters: []
};

const ENTITY_TYPE_OPTIONS: Array<{ label: string; value: UserType }> = [
    { label: 'Candidates', value: 'students' },
    { label: 'Coordinators', value: 'employees' },
    { label: 'Recruiters', value: 'recruiters' }
];

const AnnouncementDialog = ({ id, recipientEntity: passedEntityType, isEditable = false, defaultValues, onClose, onSuccessCallback, onCloseCallback, disableKeys }: IAnnouncementDialogStructure) => {
    const [preview, setPreview] = useState(false);
    const { handleAction, pending } = useAPIAction();
    const formRef = useRef<HTMLFormElement>(null);

    // Target entity: prop takes precedence, then defaultValues for edit mode
    const targetEntity = passedEntityType ?? defaultValues?.recipientEntity;
    const needsCandidates = isEditable && targetEntity === 'students' && defaultValues?.recipientType === 'program' && !!defaultValues?.recipientType_ids?.length;

    // Single fetch per entity type - fetch based on target (covers both initial and dynamic needs)
    // Always fetch coordinators for CC/BCC suggestions
    const { data: { records: coordinatorsList } = {}, isLoading: coordinatorsLoading } = useAPIQuery({ url: 'getCoordinatorsList', fetcher: async () => getCoordinatorsList(['_id', 'oEId', 'name']) });
    const { data: recruitersList, isLoading: recruitersLoading } = useAPIQuery({ url: 'getRecruitersList', fetcher: getRecruitersList, enabled: targetEntity === 'recruiters' });
    const { data: programsOPY, isLoading: programsLoading } = useAPIQuery({ url: 'getProgramsByPassingYear', fetcher: getProgramsByPassingYear, enabled: targetEntity === 'students' });

    // Fetch candidates for edit mode using defaultValues (before formData is available)
    const { data: initialCandidatesList, isLoading: initialCandidatesLoading } = useAPIQuery({
        url: `getCandidatesList?filter={currentProgram_ids:${defaultValues?.recipientType_ids}}`,
        fetcher: async () => (await getCandidatesList({ filter: { currentProgram_ids: defaultValues?.recipientType_ids, isTrueOrganizationAlumni: false }, limit: 9999 }))?.records,
        enabled: needsCandidates
    });

    // Derive passingYear from recipientType_ids for edit mode
    const derivedPassingYear = useMemo(() => {
        if (!isEditable || !defaultValues?.recipientType_ids?.length || !programsOPY) return undefined;
        const yearStr = TypedObject.entries(programsOPY as IOrganizationAcademicOptions['programOPY']).find(([, programs]) => programs.some(p => defaultValues.recipientType_ids?.includes(p.program_id)))?.[0];
        return yearStr ? Number(yearStr) : undefined;
    }, [isEditable, defaultValues?.recipientType_ids, programsOPY]);

    // Check if initial data is still loading (for edit mode skeleton)
    const isDataLoading = isEditable && (
        (targetEntity === 'students' && (programsLoading || (defaultValues?.recipientType_ids?.length && !derivedPassingYear) || (needsCandidates && initialCandidatesLoading))) ||
        (targetEntity === 'employees' && coordinatorsLoading) ||
        (targetEntity === 'recruiters' && recruitersLoading)
    );

    // Initialize form
    const initialFormData = useMemo<Partial<IGetMailLogsResponse>>(
        () => isEditable
            ? { ...defaultValues, passingYear: derivedPassingYear }
            : { recipientEntity: passedEntityType, ...(id ? { recipients: { to: [id] } } : {}), ...defaultValues }
        , [isEditable, defaultValues, derivedPassingYear, passedEntityType, id]
    );

    const { handleChange, formData } = useFormOperations<ICommunicationMailBodyUnion, undefined, IGetMailLogsResponse>(initialFormData);

    // Sync derivedPassingYear to formData when it becomes available (for edit mode)
    useEffect(() => {
        if (isEditable && derivedPassingYear && formData?.passingYear !== derivedPassingYear) handleChange({ target: { name: 'passingYear', value: derivedPassingYear } });
    }, [isEditable, derivedPassingYear, formData?.passingYear, handleChange]);

    // Current selection tracking (for add mode entity switching)
    const currentEntity = passedEntityType ?? formData?.recipientEntity;
    const currentRecipientType = formData?.recipientType;

    // Fetch additional data when user switches entity in add mode
    const { data: dynamicRecruiters, isLoading: dynamicRecruitersLoading } = useAPIQuery({ url: 'getRecruitersList', fetcher: getRecruitersList, enabled: currentEntity === 'recruiters' && targetEntity !== 'recruiters' });
    const { data: dynamicProgramsOPY, isLoading: dynamicProgramsLoading } = useAPIQuery({ url: 'getProgramsByPassingYear', fetcher: getProgramsByPassingYear, enabled: currentEntity === 'students' && targetEntity !== 'students' });

    // Dynamic candidates fetch (for add mode or when programs change)
    const { data: dynamicCandidatesList, isLoading: dynamicCandidatesLoading } = useAPIQuery({
        url: `getCandidatesList?filter={currentProgram_ids:${formData?.recipientType_ids}}`,
        fetcher: async () => (await getCandidatesList({ filter: { currentProgram_ids: formData?.recipientType_ids, isTrueOrganizationAlumni: false }, limit: 9999 }))?.records,
        enabled: !!(currentEntity === 'students' && currentRecipientType === 'program' && formData?.recipientType_ids?.length && !needsCandidates)
    });

    // Active data (combine initial + dynamic)
    const activeCoordinators = coordinatorsList;
    const activeRecruiters = recruitersList ?? dynamicRecruiters;
    const activePrograms = programsOPY ?? dynamicProgramsOPY;
    const candidatesList = initialCandidatesList ?? dynamicCandidatesList;
    const isCoordinatorsLoading = coordinatorsLoading;
    const isRecruitersLoading = recruitersLoading || dynamicRecruitersLoading;
    const isProgramsLoading = programsLoading || dynamicProgramsLoading;
    const candidatesLoading = initialCandidatesLoading || dynamicCandidatesLoading;

    // Memoized options
    const coordinatorsOptions = useMemo(() => getIndividualsOptions({ list: activeCoordinators, valueKey: '_id' }), [activeCoordinators]);
    const recruitersOptions = useMemo(() => getRecruitersOptions({ list: activeRecruiters }), [activeRecruiters]);
    const candidatesOptions = useMemo(() => getIndividualsOptions({ list: candidatesList, valueKey: 'oEId' }), [candidatesList]);
    const programOptions = useMemo(() => getProgramsByPassingYearOptions({ programs: activePrograms, passingYear: formData?.passingYear }), [activePrograms, formData?.passingYear]);
    const yearOptions = useMemo(() => activePrograms ? TypedObject.keys(activePrograms).map(k => ({ label: String(k), value: String(k) })) : [], [activePrograms]);

    // Recipient options based on entity
    const recipientOptions = currentEntity === 'recruiters' ? recruitersOptions : currentEntity === 'employees' ? coordinatorsOptions : formData?.recipientType_ids?.length ? candidatesOptions : undefined;
    const recipientLabel = ENTITY_TYPE_OPTIONS.find(e => e.value === currentEntity)?.label ?? 'Recipients';

    // Recipient validation
    const hasTo = !!formData?.recipients?.to?.length;
    const hasCc = !!formData?.recipients?.cc?.length;
    const hasBcc = !!formData?.recipients?.bcc?.length;
    const hasAnyRecipient = hasTo || hasCc || hasBcc;

    // Helper: check if field is disabled by disableKeys
    const isFieldDisabled = (name: string): boolean => disableKeys?.some(k => k === name || name.startsWith(`${k}.`) || k.startsWith(`${name}.`)) ?? false;

    // Transform IDs to email IDs for submission
    const transformToEmailIds = (ids?: Array<string>, entity = currentEntity): Array<string> | undefined => {
        if (!ids?.length) return ids;
        if (entity === 'employees') return ids.map(id => activeCoordinators?.find(c => c._id === id)?.oEId).filter(Boolean) as Array<string>;
        if (entity === 'recruiters') return ids.map(id => activeRecruiters?.find(r => r._id === id)?.pEId).filter(Boolean) as Array<string>;
        return ids;
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const snackbarOptions = isEditable ? dialogConstants.mailLogs.updateMail.snackbarOptions : formData?.scheduleAt ? dialogConstants.mailLogs.sendCommunicateMail.snackbarOptions.schedule : dialogConstants.mailLogs.sendCommunicateMail.snackbarOptions.all;

        const body: ICommunicationMailBodyUnion = {
            ...formData,
            recipients: {
                to: transformToEmailIds(formData?.recipients?.to),
                cc: transformToEmailIds(formData?.recipients?.cc, 'employees'),
                bcc: transformToEmailIds(formData?.recipients?.bcc, 'employees')
            }
        };

        const { success } = await handleAction({
            actionConfig: {
                method: isEditable ? 'PUT' : 'POST',
                url: isEditable ? COORDINATOR_API_ENDPOINTS.mailLogs.updateMail(defaultValues?._id ?? formData._id) : COORDINATOR_API_ENDPOINTS.mailLogs.sendCommunicateMail,
                body
            }, snackbarOptions
        });
        if (success) { onClose(); onSuccessCallback?.(); }
    };

    const handleClose = () => { onClose(); onCloseCallback?.(); };

    const formConfig: Array<IFieldConfig<ICommunicationMailBodyUnion>> = [
        { fieldtype: 'select', name: 'recipientEntity', label: 'Recipient Type', placeholder: 'Select recipient type', options: ENTITY_TYPE_OPTIONS, onChange: e => handleDependentFieldChange(e, handleChange, ['recipientType', 'passingYear', 'recipientType_ids', 'recipients.to']), hidden: !!passedEntityType, colsize: 'full' },
        { fieldtype: 'select', name: 'recipientType', label: 'Recipient level', placeholder: 'Select recipient level', options: currentEntity ? ENTITY_LEVEL_MAP[currentEntity] : undefined, onChange: e => handleDependentFieldChange(e, handleChange, ['passingYear', 'recipientType_ids', 'recipients.to']), hidden: currentEntity !== 'students', dependencyNotClearedMessage: 'Select Recipient Type First', disabled: isEditable, colsize: 'full' },

        { fieldtype: 'select', name: 'passingYear', label: 'Passing Year', placeholder: 'Select passing year', onChange: e => handleDependentFieldChange(e, handleChange, ['recipientType_ids', 'recipients.to']), options: yearOptions, isLoading: isProgramsLoading, hidden: currentRecipientType !== 'program', disabled: isEditable },
        { fieldtype: 'multiSelect', name: 'recipientType_ids', label: 'Programs', onChange: e => handleDependentFieldChange(e, handleChange, ['recipients.to']), options: programOptions, storedKeys: 'value', displayKey: 'label', enableSelectAll: true, isLoading: isProgramsLoading, dependencyNotClearedMessage: 'Select Passing Year First', noOptionsFoundMessage: 'No Programs available for the selected passing year', colsize: 4, hidden: currentRecipientType !== 'program', disabled: isEditable },

        { fieldtype: 'multiSelect', name: 'recipients.to', label: recipientLabel, options: recipientOptions, storedKeys: 'value', displayKey: 'label', enableSelectAll: true, isLoading: isRecruitersLoading || isCoordinatorsLoading || candidatesLoading, dependencyNotClearedMessage: currentEntity === 'students' ? (currentRecipientType === 'program' ? 'Please Select Program first' : 'Please Select Recipient Level First') : 'Please Select Recipient Type First', noOptionsFoundMessage: currentRecipientType === 'program' ? 'No students are available for the selected programs' : undefined, colsize: 'full', hidden: currentEntity === 'students' && currentRecipientType === 'individual', required: !hasCc && !hasBcc },
        { fieldtype: 'fetchMultiSelect', name: 'recipients.to', label: 'Recipients', placeholder: 'Select candidates', fetcher: currentRecipientType ? async ({ search, filter_ids }) => (await getCandidatesList({ search, filter: { _ids: filter_ids, currentProgram_ids: formData?.recipientType_ids, isTrueOrganizationAlumni: false } }))?.records : undefined, storedKeys: 'oEId', descriptionKey: 'oEId', displayKey: 'name', enableSelectAll: true, dependencyNotClearedMessage: 'Please Select Recipient Level First', hidden: !(currentEntity === 'students' && currentRecipientType === 'individual'), colsize: 'full', required: !hasCc && !hasBcc },

        { fieldtype: 'multiSelect', name: 'recipients.cc', label: 'CC Email ID', inputType: 'email', options: currentEntity === 'employees' ? coordinatorsOptions : [], storedKeys: 'value', displayKey: 'label', descriptionKey: 'description', freeSolo: currentEntity !== 'employees', enableSelectAll: currentEntity === 'employees', noOptionsFoundMessage: 'Enter the Email ID for sending announcement', colsize: 'full', required: !hasTo && !hasBcc, isLoading: isCoordinatorsLoading },
        { fieldtype: 'multiSelect', name: 'recipients.bcc', label: 'BCC Email ID', inputType: 'email', options: currentEntity === 'employees' ? coordinatorsOptions : [], storedKeys: 'value', displayKey: 'label', descriptionKey: 'description', freeSolo: currentEntity !== 'employees', enableSelectAll: currentEntity === 'employees', noOptionsFoundMessage: 'Enter the Email ID for sending announcement', colsize: 'full', required: !hasTo && !hasCc, isLoading: isCoordinatorsLoading },

        { fieldtype: 'date', name: 'scheduleAt', label: 'Schedule Mail', placeholder: 'Choose date & time', minDate: new Date(), colsize: 'full', required: isEditable, enableTime: true, futureAllowed: true, openingView: 'days' },
        { fieldtype: 'input', name: 'subject', label: 'Email Subject', placeholder: 'Enter email subject', colsize: 'full' },
        { fieldtype: 'textArea', name: 'body', label: 'Email Body', placeholder: 'Enter your announcement message here...', colsize: 'full' },
        { fieldtype: 'textArea', name: 'notes', label: 'Email Notes', placeholder: 'Enter any internal notes or reminders here...', colsize: 'full', required: false }
    ];

    const dialogTitle = isEditable ? dialogConstants.mailLogs.updateMail.title : dialogConstants.mailLogs.sendCommunicateMail.title;
    const dialogDesc = isEditable ? dialogConstants.mailLogs.updateMail.description : dialogConstants.mailLogs.sendCommunicateMail.description;
    const isPreviewAllowed = !!formData?.subject && !!formData?.body && hasAnyRecipient;
    const firstRecipient = currentEntity === 'employees' ? 'Coordinator' : currentEntity === 'recruiters' ? 'Recruiter' : 'Candidate';

    return (
        <form ref={formRef} onSubmit={onSubmit} className='flex flex-col w-full'>
            <div className="flex flex-col gap-1 p-5">
                <DialogTitle>{dialogTitle}</DialogTitle>
                <span className="text-regular text-neutral-light">{dialogDesc}</span>
            </div>

            <ScrollArea>
                <div className='grid sm:grid-cols-2 tab:grid-cols-6 gap-3 pb-5 px-5'>
                    {isDataLoading
                        ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className='h-11 col-span-full' />)
                        : preview
                            ? <ProductMailTemplate className='col-span-full' emailHeading='An Important Notice' receiverName={firstRecipient} messageBox={formData?.notes ? { text: formData.notes, infoIcon: false } : undefined} paragraphs={[{ text: formData?.body ?? '' }]} />
                            : formConfig.map((field, i) => {
                                if (field.hidden) return null;
                                const key = 'name' in field ? field.name : `field-${i}`;
                                if ('name' in field && field.name) {
                                    const fieldDisabled = 'disabled' in field ? field.disabled : false;
                                    const disabled = fieldDisabled ?? isFieldDisabled(field.name);
                                    return renderField(formData, handleChange, { ...field, key, ...(field && 'disabled' in field ? { disabled } : {}) });
                                }
                                return renderField(formData, handleChange, { ...field, key });
                            })}
                </div>
            </ScrollArea>

            <div className="flex flex-col-reverse xs:flex-row justify-between p-5 gap-3 xs:gap-5 bg-muted-background border-t border-muted-foreground">
                <Button disabled={pending || isDataLoading} variant='error' type='reset' onClick={handleClose} className='max-xs:hidden xs:w-48'>Cancel</Button>
                <div className='flex gap-3 xs:gap-5'>
                    <Button disabled={pending || !isPreviewAllowed || isDataLoading} buttonType='icon' className='shrink-0' tooltipProps={{ description: isPreviewAllowed ? (preview ? 'Edit Mail' : 'Preview Mail') : 'Complete Recipients, Email Subject and Body Fields to Preview' }} variant='outline' onClick={() => setPreview(!preview)} icon={preview ? <Pencil className='size-5' /> : <ScanEye className='size-5' />} />
                    <Button disabled={isDataLoading} pending={pending} variant='success' type='submit' className="max-xs:w-full xs:w-48">{isEditable ? 'Update' : 'Send'}</Button>
                    <Button disabled={pending || isDataLoading} variant='error' type='reset' onClick={handleClose} className='xs:hidden max-xs:w-full xs:w-48'>Cancel</Button>
                </div>
            </div>
        </form>
    );
};

export default AnnouncementDialog;
