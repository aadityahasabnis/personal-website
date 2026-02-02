import { useSetAtom } from 'jotai';

import { type IDialogStructure, type IDialogWrapperStructure, type MaxWidthDialogType } from '../components/dialogs/DialogWrapper';
import { dialogAtom } from '../jotai/atoms';

import { type IFormData } from './useFormOperations';

const useDialog = () => {
    const setDialogState = useSetAtom(dialogAtom);
    const closeDialog = () => void setDialogState((prevState?: IDialogWrapperStructure<IFormData, IFormData, IFormData>) => prevState ? { ...prevState, open: false } : undefined);

    const triggerDialog = <TDialogBody extends IFormData | undefined = IFormData, TDialogResponse extends IFormData | undefined = IFormData, TDialogDefaultValue extends IFormData | undefined = IFormData>(dialogStructure: IDialogStructure<TDialogBody, TDialogResponse, TDialogDefaultValue>, disableOutsideClick?: boolean): void => {
        const defaultMaxWidth: MaxWidthDialogType = dialogStructure.type === 'form' ? '2xl' : dialogStructure.type === 'announcement' ? '3xl' : 'lg';
        return void setDialogState({ open: true, onClose: closeDialog, disableOutsideClick, maxWidth: 'maxWidth' in dialogStructure ? dialogStructure.maxWidth : defaultMaxWidth, dialogStructure: { ...dialogStructure, id: 'id' in dialogStructure ? dialogStructure.id : undefined } as unknown as IDialogStructure<IFormData, IFormData, IFormData> });
    };

    return { triggerDialog };
};
export { useDialog };
