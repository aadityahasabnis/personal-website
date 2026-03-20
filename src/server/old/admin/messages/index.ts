/**
 * Messages Domain - Barrel Export
 */

// Actions
export {
    markMessageRead,
    markMessageUnread,
    archiveMessage,
    unarchiveMessage,
    deleteMessage,
    bulkMarkMessagesRead,
    bulkArchiveMessages,
    bulkDeleteMessages,
} from './actions';

// Action Types
export type {
    ContactMessage,
    MarkMessageReadRequest,
    MarkMessageUnreadRequest,
    ArchiveMessageRequest,
    UnarchiveMessageRequest,
    DeleteMessageRequest,
    BulkMessageRequest,
} from './actions';

// Queries
export {
    getMessages,
    getAllMessages,
    getMessageStats,
    getMessageById,
    getUnreadCount,
} from './queries';

// Query Types
export type {
    AdminMessage,
    GetMessagesRequest,
    MessageStats,
} from './queries';
