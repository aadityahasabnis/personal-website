import { useSetAtom } from 'jotai';

import { type IDocumentDrawerProps, type IDocumentDrawerWrapperStructure } from '../components/other/DocumentDrawerWrapper';
import { documentDrawerAtom } from '../jotai/atoms';

const useDocumentDrawer = () => {
    const setDrawerState = useSetAtom(documentDrawerAtom);

    const closeDocumentDrawer = () => void setDrawerState((prevState?: IDocumentDrawerWrapperStructure) => prevState ? { ...prevState, open: false } : undefined);
    const openDocumentDrawer = (documentDrawerProps: IDocumentDrawerProps): void => setDrawerState({ open: true, onClose: closeDocumentDrawer, documentDrawerProps });

    const updateDocumentDrawer = (updates: Partial<IDocumentDrawerProps>): void => {
        return void setDrawerState((prevState?: IDocumentDrawerWrapperStructure) => {
            if (!prevState) return undefined;
            const currentProps = prevState.documentDrawerProps;
            const updatedProps: IDocumentDrawerProps = currentProps.type === 'url'
                ? { ...currentProps, ...updates, type: 'url' }
                : { ...currentProps, ...updates, type: 'custom' };

            return { ...prevState, documentDrawerProps: updatedProps };
        });
    };

    return { openDocumentDrawer, closeDocumentDrawer, updateDocumentDrawer };
};

export { useDocumentDrawer };
