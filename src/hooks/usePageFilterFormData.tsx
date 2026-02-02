import { usePathname } from 'next/navigation';

import { useAtom } from 'jotai';

import  { type ICustomTableProps } from '../components/table/table/CustomTable';
import { filterFormDataAtom } from '../jotai/atoms';
import  { type ITableQuery } from '../server/actions/common';

import  { type IFormData } from './useFormOperations';

type IFormDataUpdater<TTableResponse extends IFormData, TTableFilterBody extends IFormData | undefined> = ICustomTableProps<TTableResponse, TTableFilterBody>['defaultFilter'] | ((prev: ICustomTableProps<TTableResponse, TTableFilterBody>['defaultFilter']) => ICustomTableProps<TTableResponse, TTableFilterBody>['defaultFilter'])

const usePageFilterFormData = <TTableResponse extends IFormData, TTableFilterBody extends IFormData | undefined>() => {
    const [filterFormData, setFilterFormData] = useAtom<ITableQuery<IFormData>['filter']>(filterFormDataAtom);
    const pathname = usePathname();
    const filterFormDataForPage: TTableFilterBody = filterFormData?.[pathname] as TTableFilterBody;

    const updateFilterFormDataForPage = (updater: IFormDataUpdater<TTableResponse, TTableFilterBody>) => {
        setFilterFormData(prevFormData => ({ ...prevFormData, [pathname]: { ...prevFormData?.[pathname], ...(typeof updater === 'function' ? updater(prevFormData?.[pathname] ?? {}) : updater) } }));
    };

    const resetFilterFormDataForPage = (resetFilter: TTableFilterBody) => {
        setFilterFormData(prevFormData => ({ ...prevFormData, [pathname]: resetFilter as IFormData }));
    };

    return { currentPathname: pathname, filterFormData, filterFormDataForPage, updateFilterFormDataForPage, resetFilterFormDataForPage };
};

export default usePageFilterFormData;
