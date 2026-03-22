'use server';

import {
    deleteMedia as deleteMediaAction,
    getMedia,
    getMediaStats,
    updateMedia as updateMediaAction,
    uploadMedia as uploadMediaAction,
} from '@/server/new/admin/media';
import { error } from '@/server/new/utils/helper';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { isValidFolder, type MediaFolder } from '@/constants/mediaConstants';

export { getMedia, getMediaStats };

export const uploadMedia = async (formData: FormData) => {
    const file = formData.get('file');
    if (!(file instanceof File)) {
        return error('Missing file', 400);
    }

    const folderRaw = formData.get('folder');
    const descriptionRaw = formData.get('description');
    const altRaw = formData.get('altText') ?? formData.get('alt');
    const tagsRaw = formData.get('tags');

    const input = {
        file,
        ...(typeof folderRaw === 'string' && isValidFolder(folderRaw) ? { folder: folderRaw as MediaFolder } : {}),
        ...(typeof descriptionRaw === 'string' && descriptionRaw.trim() ? { description: descriptionRaw.trim() } : {}),
        ...(typeof altRaw === 'string' ? { altText: altRaw.trim() } : {}),
        ...(typeof tagsRaw === 'string' && tagsRaw.trim()
            ? { tags: tagsRaw.split(',').map((tag) => tag.trim()).filter(Boolean) }
            : {}),
    };

    return uploadMediaAction(input);
};

export const updateMedia = async (input: { id: string; alt?: string; altText?: string; description?: string | null; tags?: string[] }) => {
    return updateMediaAction({
        id: input.id,
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.altText !== undefined ? { altText: input.altText } : {}),
        ...(input.alt !== undefined ? { altText: input.alt } : {}),
        ...(input.tags !== undefined ? { tags: input.tags } : {}),
    });
};

export const deleteMedia = async (id: string) => deleteMediaAction(id);

export const bulkDeleteMedia = async (ids: string[]): Promise<IApiResponse<{ deleted: number }>> => {
    if (!Array.isArray(ids) || ids.length === 0) {
        return error('At least one media id is required', 400);
    }

    let deleted = 0;
    for (const id of ids) {
        const result = await deleteMediaAction(id);
        if (result.success) deleted += 1;
    }

    return {
        success: true,
        status: 200,
        data: { deleted },
        message: deleted === ids.length
            ? 'All media deleted successfully'
            : `${deleted} of ${ids.length} media files deleted`,
    };
};
