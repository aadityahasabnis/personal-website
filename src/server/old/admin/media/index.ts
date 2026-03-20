/**
 * Media Domain - Barrel Export
 */

// Actions
export {
    uploadMedia,
    updateMedia,
    deleteMedia,
    bulkDeleteMedia,
} from './actions';

// Action Types
export type {
    UploadMediaRequest,
    UpdateMediaRequest,
    DeleteMediaRequest,
    BulkDeleteMediaRequest,
} from './actions';

// Queries
export {
    getMedia,
    getAllMedia,
    getMediaById,
    getMediaStats,
    getImages,
    searchMedia,
} from './queries';

// Query Types
export type {
    AdminMedia,
    GetMediaRequest,
    MediaStats,
} from './queries';
