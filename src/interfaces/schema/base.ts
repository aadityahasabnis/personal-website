import { type ObjectId } from 'mongodb';

// ============================================================
// Base Interfaces
// ============================================================

export interface IDocument {
    _id?: ObjectId;
}

export interface ITimestamps {
    createdAt: Date;
    updatedAt: Date;
}

export interface IAudit {
    createdBy: ObjectId; // References Admin._id
    updatedBy: ObjectId; // References Admin._id
}
