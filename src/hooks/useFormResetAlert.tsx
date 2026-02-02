// import { useCallback, useEffect, useState } from 'react';

// import { useDialog } from './useDialog';

// interface IUseFormProtectionProps {
//     formIsDirty: boolean;
//     message?: string;
// }

// const useFormProtection = ({ formIsDirty, message = 'You have unsaved changes. Are you sure you want to leave?' }: IUseFormProtectionProps) => {
//     const { triggerDialog } = useDialog();
//     const [actionType, setActionType] = useState<'reload' | 'back'>('back');
//     const [isNavigating, setIsNavigating] = useState(false);

//     const onSuccessCallback = useCallback((actionType: 'reload' | 'back') => {
//         if (actionType === 'reload') window.location.reload();
//         else if (actionType === 'back') window.history.back();
//     }, []);

//     const handleNavigation = useCallback(async () => {
//         if (!formIsDirty) return true;
//         if (isNavigating) return false;
//         setIsNavigating(true);

//         const maybePromise = triggerDialog<undefined>({
//             type: 'confirmation', actionType: 'action', title: 'Unsaved Changes', description: message, icon: 'edit', serverActionStructure: {
//                 customAction: async () => {
//                     setIsNavigating(false);
//                     onSuccessCallback(actionType);
//                     return Promise.resolve(undefined);
//                 }
//             }
//         });

//         await Promise.resolve(maybePromise).finally(() => setIsNavigating(false));

//         return false;
//     }, [formIsDirty, isNavigating, message, actionType, onSuccessCallback, triggerDialog]);

//     useEffect(() => {
//         if (!formIsDirty) return undefined;
//         const handleBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
//         window.addEventListener('beforeunload', handleBeforeUnload);
//         return () => window.removeEventListener('beforeunload', handleBeforeUnload);
//     }, [formIsDirty]);

//     return { formIsDirty, message, setActionType, handleNavigation };
// };

// export default useFormProtection;
