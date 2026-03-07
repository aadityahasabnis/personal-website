/**
 * Notes Domain - Barrel Export
 */

// Types
export type {
    CreateNoteRequest,
    UpdateNoteRequest,
    CreateNoteResponse,
    UpdateNoteResponse,
    DeleteNoteResponse,
    ToggleNoteResponse,
} from './actions';

export type { SerializedNote, NoteForEdit } from './queries';

// Actions
export { createNote, updateNote, deleteNote, toggleNotePublished, toggleNoteFeatured } from './actions';

// Queries
export { getNotes, getNoteForEdit } from './queries';
