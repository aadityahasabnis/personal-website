import { useEffect, useState } from 'react';

import ImageEditor from '@/common/components/other/ImageEditor';

import  { type DotNestedBooleanKeys } from '../interfaces/genericInterfaces';

import  { type IFormData, type IHandleChange } from './useFormOperations';

interface IUseImageCropProps<TBodyData extends IFormData> {
    changeMode?: 'button' | 'overlay';
    handleChange: IHandleChange;
    isFileModifiedKeyName: DotNestedBooleanKeys<TBodyData>;
    defaultAspectRatio?: number;
    defaultViewURL?: string | File;
    label?: string;
    disabled?: boolean;
    isCelebration?: boolean;
    isRequired?: boolean;
}

export const useImageCrop = <TBodyData extends IFormData>({ changeMode, defaultAspectRatio = 1, defaultViewURL, label, handleChange, disabled, isCelebration, isFileModifiedKeyName, isRequired }: IUseImageCropProps<TBodyData>) => {
    const [imageBlob, setImageBlob] = useState<Blob | null>(null);
    const [croppedImageUrl, setCroppedImageUrl] = useState<string | undefined>(defaultViewURL as string);

    useEffect(() => { setCroppedImageUrl(defaultViewURL as string); }, [defaultViewURL]);

    const uploadImage = async (uploadURL: string) => {
        try {
            if (!(imageBlob) || !uploadURL) return;
            const response = await fetch(uploadURL, { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: imageBlob });
            if (!response.ok) throw new Error('Failed to upload image');
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    };

    const ImageEditorElement = <ImageEditor
        aspect={defaultAspectRatio || 1}
        label={label}
        changeMode={changeMode}
        setCroppedImageUrl={(url: string) => setCroppedImageUrl(url)}
        croppedImageUrl={croppedImageUrl ?? defaultViewURL as string}
        setImageBlob={(blob: Blob) => { setImageBlob(blob); handleChange({ target: { name: isFileModifiedKeyName, value: true } }); }}
        disabled={disabled}
        isCelebration={isCelebration}
        isRequired={isRequired}
    />;

    return { ImageEditorElement, uploadImage, isPhotoUpserted: !!imageBlob, croppedImageUrl };
};
