'use client';
import React, { type JSX } from 'react';

import Image from 'next/image';
import Link from 'next/link';

import { type ICompensationInfo, type IJobPostLocation } from '@byteswrite-admin/bep-core/interfaces';
import { formatDateTime, formatLocation } from '@byteswrite-admin/bep-core/utils';

import { get } from 'lodash';
import { Building, ChevronRight, EllipsisVertical, GraduationCap, History, Laptop, Mail, MapPin, Star, UserRound, UsersRound, Wallet } from 'lucide-react';

import CustomAvatar from '@/common/components/custom/CustomAvatar';
import { Badge, type IBadgeVariants } from '@/common/components/ui/badge';
import { type IFormData } from '@/common/hooks/useFormOperations';
import { type DotNestedDateKeys, type DotNestedObjectArrayKeys, type DotNestedObjectKeys, type DotNestedScalarArrayKeys, type DotNestedScalarKeys } from '@/common/interfaces/genericInterfaces';

import { JobIcon } from '@/exclusive/assets/icons/JobIcon';
import CompanyDefaultLogo from '@/exclusive/assets/images/companyImg.png';
import { ReadMoreDescription } from '@/exclusive/components/templates/_elements/common/ReadMoreDescription';
import { formatCompensation, formatJobPostLocations } from '@/exclusive/utils/formatters/valueFormatters';

import TableButtonDropdown, { type IDropdownOption } from '../body/TableButtonDropdown';
import { type InfiniteTableMutateData } from '../InfiniteTableWrapper';
import TableOperations, { type ITableOperationsStructure } from '../operations/TableOperations';

export interface IInfiniteTableCard<TInfiniteTableResponse extends IFormData> {
    cardData: TInfiniteTableResponse;
    mutateData: InfiniteTableMutateData<TInfiniteTableResponse>;
    navigationLabel: string;
    link: string;
    queryParams?: Record<string, string>;
    img: DotNestedScalarKeys<TInfiniteTableResponse>;
    titleConfig: Array<IInfiniteTableCardConfig<TInfiniteTableResponse>>;
    subtextConfig: Array<IInfiniteTableCardConfig<TInfiniteTableResponse>>;
    footerConfig: Array<IInfiniteTableCardConfig<TInfiniteTableResponse>>;
    headerConfig?: Array<IInfiniteTableCardConfig<TInfiniteTableResponse>>;
    centerDataConfig: Array<IInfiniteTableCardConfig<TInfiniteTableResponse>> | ((cardData: TInfiniteTableResponse) => Array<IInfiniteTableCardConfig<TInfiniteTableResponse>>);
}

interface IBaseCardConfigStructure { className?: string; hidden?: boolean }
type ITextCardConfigStructure<TInfiniteTableResponse extends IFormData> = IBaseCardConfigStructure & ({ type: 'text'; id: DotNestedScalarKeys<TInfiniteTableResponse>; startIcon?: keyof typeof iconsMap; fallback?: string } | { type: 'text'; value: string; startIcon?: keyof typeof iconsMap })
type ILinkCardConfigStructure<TInfiniteTableResponse extends IFormData> = IBaseCardConfigStructure & ({ type: 'link'; id: DotNestedScalarKeys<TInfiniteTableResponse>; link: string; linkId?: DotNestedScalarKeys<TInfiniteTableResponse> } | { type: 'link'; value: string; link: string; linkId?: DotNestedScalarKeys<TInfiniteTableResponse> })

type IDateCardConfigStructure<TInfiniteTableResponse extends IFormData> = IBaseCardConfigStructure & { type: 'date'; startIcon?: keyof typeof iconsMap; id: DotNestedDateKeys<TInfiniteTableResponse>; isTimeVisible?: boolean }
type IArrayCardConfigStructure<TInfiniteTableResponse extends IFormData> = IBaseCardConfigStructure & { type: 'array'; startIcon?: keyof typeof iconsMap; id: DotNestedScalarArrayKeys<TInfiniteTableResponse> }
type IBadgeCardConfigStructure<TInfiniteTableResponse extends IFormData> = IBaseCardConfigStructure & ({ type: 'badge'; variant: IBadgeVariants | Record<string, IBadgeVariants>; id: DotNestedScalarKeys<TInfiniteTableResponse> | DotNestedDateKeys<TInfiniteTableResponse>; prefix?: string | React.JSX.Element; isDate?: boolean; startIcon?: keyof typeof iconsMap; isTimeVisible?: boolean } | { type: 'badge'; variant: IBadgeVariants; value: string; startIcon?: keyof typeof iconsMap })

type IFormatCompensationCardConfigStructure<TInfiniteTableResponse extends IFormData> = IBaseCardConfigStructure & { type: 'formatCompensation'; id: DotNestedObjectKeys<TInfiniteTableResponse>; startIcon: keyof typeof iconsMap }
type IFormatLocationsCardConfigStructure<TInfiniteTableResponse extends IFormData> = IBaseCardConfigStructure & { type: 'formatJobPostLocations'; id: DotNestedObjectArrayKeys<TInfiniteTableResponse>; startIcon: keyof typeof iconsMap }
type IFormatLocationCardConfigStructure<TInfiniteTableResponse extends IFormData> = IBaseCardConfigStructure & { type: 'formatLocation'; id: DotNestedObjectKeys<TInfiniteTableResponse>; startIcon: keyof typeof iconsMap }

type IOperationsCardConfigStructure<TInfiniteTableResponse extends IFormData, TTableOperationBody extends IFormData | undefined = IFormData, TTableOperationResponse extends IFormData | undefined = IFormData> = IBaseCardConfigStructure & { type: 'operations'; config: Array<ITableOperationsStructure<TTableOperationBody, TTableOperationResponse>> | ((cardData: TInfiniteTableResponse) => Array<ITableOperationsStructure<TTableOperationBody, TTableOperationResponse>>) }
type IDropdownCardConfigStructure<TInfiniteTableResponse extends IFormData, TTableRowOperationBody extends IFormData | undefined = TInfiniteTableResponse, TTableRowOperationResponse extends IFormData | undefined = IFormData> = IBaseCardConfigStructure & { type: 'dropdown'; config: Array<IDropdownOption<TInfiniteTableResponse, TTableRowOperationBody, TTableRowOperationResponse>> | ((cardData: TInfiniteTableResponse) => Array<IDropdownOption<TInfiniteTableResponse, TTableRowOperationBody, TTableRowOperationResponse>>) }
type IRenderCardConfigStructure<TInfiniteTableResponse extends IFormData> = IBaseCardConfigStructure & { type: 'render'; render: (cardData: TInfiniteTableResponse) => IInfiniteTableCardConfig<TInfiniteTableResponse> }
type ICustomCardConfigStructure<TInfiniteTableResponse extends IFormData> = IBaseCardConfigStructure & { type: 'custom'; customRender: (cardData: TInfiniteTableResponse) => React.JSX.Element | string | number }

type IInfiniteTableCardConfig<TInfiniteTableResponse extends IFormData> = ITextCardConfigStructure<TInfiniteTableResponse> | ILinkCardConfigStructure<TInfiniteTableResponse> | IArrayCardConfigStructure<TInfiniteTableResponse> | IDateCardConfigStructure<TInfiniteTableResponse> | IBadgeCardConfigStructure<TInfiniteTableResponse> | IOperationsCardConfigStructure<TInfiniteTableResponse> | IDropdownCardConfigStructure<TInfiniteTableResponse> | IFormatCompensationCardConfigStructure<TInfiniteTableResponse> | IFormatLocationsCardConfigStructure<TInfiniteTableResponse> | IFormatLocationCardConfigStructure<TInfiniteTableResponse> | IRenderCardConfigStructure<TInfiniteTableResponse> | ICustomCardConfigStructure<TInfiniteTableResponse>;

const iconsMap = {
    jobCategory: <JobIcon className='shrink-0 size-4 mt-px text-blue-medium' />,
    compensationInfo: <Wallet className='shrink-0 size-4 mt-px text-blue-medium' />,
    jobSegment: <Star className='shrink-0 size-4 mt-px text-blue-medium' />,
    location: <MapPin className='shrink-0 size-4 mt-px text-blue-medium' />,
    workMode: <Laptop className='shrink-0 size-4 mt-px text-blue-medium' />,
    programs: <GraduationCap className='shrink-0 size-4 mt-px text-blue-medium' />,
    industries: <Building className='shrink-0 size-4 mt-px text-blue-medium' />,
    mail: <Mail className='shrink-0 size-4 mt-px text-blue-medium' />,
    user: <UserRound className='shrink-0 size-4 mt-px text-blue-medium' />,
    users: <UsersRound className='shrink-0 size-4 mt-px text-blue-medium' />,

    clock: <History className="shrink-0 size-4 mt-px" />
} satisfies Record<string, JSX.Element>;

const formatters = {
    text: (value: string | undefined, config: ITextCardConfigStructure<IFormData>) => <React.Fragment>{config?.startIcon ? iconsMap[config?.startIcon] : null} <span className={`line-clamp-2 ${config?.className}`}>{value ?? 'N/A'}</span></React.Fragment>,
    date: (value: string, config: IDateCardConfigStructure<IFormData>) => <React.Fragment>{config?.startIcon ? iconsMap[config?.startIcon] : null} <span className="line-clamp-2">{formatDateTime(value, { isTimeVisible: config?.isTimeVisible }) ?? 'N/A'}</span></React.Fragment>,
    array: (value: Array<string>, config: IArrayCardConfigStructure<IFormData>, _id: string) => <React.Fragment>{config?.startIcon ? iconsMap[config?.startIcon] : null} <ReadMoreDescription id={_id} description={value?.join(', ') || 'N/A'} /></React.Fragment>,
    link: (value: string | undefined, config: ILinkCardConfigStructure<IFormData>, _id: string) => <Link prefetch={false} href={`${config?.link}/${_id}`} className="line-clamp-2 hover:underline">{value}</Link>,

    formatCompensation: (value: ICompensationInfo, config: IFormatCompensationCardConfigStructure<IFormData>) => <React.Fragment>{config?.startIcon ? iconsMap[config?.startIcon] : null} {formatCompensation(value)}</React.Fragment>,
    formatJobPostLocations: (value: Array<IJobPostLocation>, config: IFormatLocationsCardConfigStructure<IFormData>) => <React.Fragment>{config?.startIcon ? iconsMap[config?.startIcon] : null} {formatJobPostLocations(value)}</React.Fragment>,
    formatLocation: (value: Parameters<typeof formatLocation>[0], config: IFormatLocationCardConfigStructure<IFormData>) => <React.Fragment>{config?.startIcon ? iconsMap[config?.startIcon] : null} {formatLocation(value)}</React.Fragment>,

    badge: (value: string | undefined, config: IBadgeCardConfigStructure<IFormData>) => <Badge variant={typeof config?.variant === 'string' ? config?.variant : config?.variant?.[value!]} className={`flex gap-1 text-start ${config?.className}`}>{config?.startIcon ? React.cloneElement(iconsMap[config?.startIcon], { className: 'size-3' }) : null} {'prefix' in config && config?.prefix} {('isDate' in config && config?.isDate) ? formatDateTime(value, { isTimeVisible: config?.isTimeVisible }) : value ?? 'N/A'}</Badge>,
    operations: <TInfiniteTableResponse extends IFormData, TTableOperationBody extends IFormData | undefined, TTableOperationResponse extends IFormData | undefined>(cardData: TInfiniteTableResponse, config: IOperationsCardConfigStructure<TInfiniteTableResponse, TTableOperationBody, TTableOperationResponse>, mutateData: InfiniteTableMutateData<TInfiniteTableResponse>) => <TableOperations variant='outline' mutateData={mutateData as InfiniteTableMutateData<IFormData>} tableOperationsStructure={typeof config?.config === 'function' ? config.config(cardData) : config?.config} />,
    dropdown: <TInfiniteTableResponse extends IFormData, TTableRowOperationBody extends IFormData | undefined, TTableRowOperationResponse extends IFormData | undefined>(cardData: TInfiniteTableResponse, config: IDropdownCardConfigStructure<TInfiniteTableResponse, TTableRowOperationBody, TTableRowOperationResponse>, mutateData: InfiniteTableMutateData<TInfiniteTableResponse>) => <TableButtonDropdown row={cardData} options={(typeof config?.config === 'function' ? config.config(cardData) : config?.config)} mutateData={mutateData}>
        <div className="px-0.5 py-1.5 hover:bg-muted rounded">
            <EllipsisVertical className="text-neutral-medium size-4" />
        </div>
    </TableButtonDropdown>,
    render: <TInfiniteTableResponse extends IFormData>(cardData: TInfiniteTableResponse, config: IRenderCardConfigStructure<TInfiniteTableResponse>, mutateData: InfiniteTableMutateData<TInfiniteTableResponse>) => renderContent(config?.render(cardData), cardData, mutateData),
    custom: <TInfiniteTableResponse extends IFormData>(cardData: TInfiniteTableResponse, config: ICustomCardConfigStructure<TInfiniteTableResponse>) => config?.customRender?.(cardData)
};

const renderContent = <TInfiniteTableResponse extends IFormData>(config: IInfiniteTableCardConfig<TInfiniteTableResponse>, cardData: TInfiniteTableResponse, mutateData: InfiniteTableMutateData<TInfiniteTableResponse>) => {
    let content;
    if (config.type === 'text') content = formatters.text(('id' in config ? (get(cardData, config.id) ?? config.fallback) : 'value' in config ? config.value : undefined), config);
    if (config.type === 'link') content = formatters.link(('id' in config ? (get(cardData, config.id)) : 'value' in config ? config.value : undefined), config, config?.linkId ? get(cardData, config.linkId) : cardData?._id);

    else if (config.type === 'date') content = formatters.date(get(cardData, config?.id), config);
    if (config.type === 'array') content = formatters.array(get(cardData, config?.id), config, cardData?._id);

    else if (config.type === 'formatLocation') content = formatters.formatLocation(get(cardData, config?.id), config);
    else if (config.type === 'formatJobPostLocations') content = formatters.formatJobPostLocations(get(cardData, config?.id), config);

    else if (config.type === 'formatCompensation') content = formatters.formatCompensation(get(cardData, config?.id), config);

    else if (config.type === 'badge') content = formatters.badge(('id' in config ? get(cardData, config.id) : 'value' in config ? config.value : undefined), config);
    else if (config.type === 'operations') content = formatters.operations(cardData, config, mutateData);
    else if (config.type === 'dropdown') content = formatters.dropdown(cardData, config, mutateData);
    else if (config.type === 'render') content = formatters.render(cardData, config, mutateData);
    else if (config.type === 'custom') content = formatters.custom(cardData, config);
    return config?.hidden ? undefined : <span className={`flex gap-1.5 text-regular text-neutral-light break-all h-fit ${config.type === 'custom' ? 'shrink-0' : ''} ${config?.className}`}>{content}</span>;
};

const InfiniteTableCard = <TInfiniteTableResponse extends IFormData>({ img, titleConfig, subtextConfig, cardData, link, queryParams, navigationLabel, centerDataConfig, headerConfig, footerConfig, mutateData }: IInfiniteTableCard<TInfiniteTableResponse>) => (
    <div className="relative flex flex-col justify-between bg-white p-5 border rounded-md gap-5">
        {/* Mobile-only full card link - hidden on xs (500px) and above */}
        <Link href={`${link}/${cardData?._id}`} className="absolute inset-0 hidden max-xs:block" aria-label={navigationLabel} />

        <div className="flex flex-col gap-5">
            <div className='flex flex-col xs:flex-row gap-3'>
                <div className="flex gap-3">
                    <CustomAvatar img={cardData?.[img]} fallbackComponent={<Image src={CompanyDefaultLogo} alt="company Logo" />} className="size-12 rounded border" />

                    <div className="flex flex-col gap-0.5">
                        <span className="flex flex-wrap items-center gap-1">{titleConfig?.map(config => renderContent({ ...config, className: 'text-h6 text-neutral-dark break-all' }, cardData, mutateData))}</span>
                        <span className="flex gap-1">
                            {subtextConfig ? subtextConfig?.map(config => renderContent(config, cardData, mutateData)) : null}
                        </span>
                    </div>
                </div>

                <div className="flex items-start gap-1 ml-auto z-1">
                    {headerConfig?.map(config => renderContent(config, cardData, mutateData))}
                </div>
            </div>

            <div className="grid xs:grid-cols-2 md:grid-cols-4 gap-3 m-1">
                {(typeof centerDataConfig === 'function' ? centerDataConfig(cardData) : centerDataConfig)?.map(config => renderContent(config, cardData, mutateData))}
            </div>
        </div>

        <div className="flex flex-col gap-5">
            <hr />

            <div className="flex flex-col xs:flex-row gap-3">
                <div className="flex flex-wrap items-center gap-1">
                    {footerConfig?.map(config => renderContent(config, cardData, mutateData))}
                </div>

                <Link prefetch={false} href={`${link}/${cardData?._id}${queryParams ? `?${new URLSearchParams(queryParams).toString()}` : ''}`} className="max-xs:hidden group flex items-center text-regular text-blue-medium hover:brightness-90 transition-all ml-auto whitespace-nowrap">
                    {navigationLabel}
                    <ChevronRight className="size-3.5 group-hover:translate-x-0.5 transition-all" />
                </Link>
            </div>
        </div>
    </div>
);

const MemoizedInfiniteTableCard = React.memo(InfiniteTableCard) as typeof InfiniteTableCard;
export { MemoizedInfiniteTableCard as InfiniteTableCard };
export { type IInfiniteTableCardConfig };
