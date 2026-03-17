'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { cleanUndefined, created, error, handleError, timestamps, updatedNow } from '../../../utils/helper';
import { revalidateSubtopicPaths } from '../shared';
import type { ISubtopicCreateInput } from './types';

// ========================================================
// Create
// ========================================================

export const createSubtopic = async (input: ISubtopicCreateInput): Promise<IApiResponse<string>> => {
    try {
        if (!ObjectId.isValid(input.topicId)) return error('Invalid topic id', 400);

        await connectDB();

        const topic = await Topic.findById(input.topicId).select('_id slug').lean();
        if (!topic) return error('Topic not found', 404);

        const existing = await Subtopic.findOne({ topicId: topic._id, slug: input.slug }).select('_id').lean();
        if (existing) return error('Subtopic with this slug already exists in topic', 409);

        const createdSubtopic = await Subtopic.create(
            cleanUndefined({
                topicId: topic._id,
                slug: input.slug,
                title: input.title,
                description: input.description ?? null,
                order: input.order ?? 0,
                contentCount: 0,
                ...timestamps(),
            })
        );

        await Topic.updateOne(
            { _id: topic._id },
            { $inc: { subTopicCount: 1 }, $set: { ...updatedNow() } }
        );

        revalidateSubtopicPaths(topic.slug);
        return created(createdSubtopic._id.toString(), 'Subtopic created successfully');
    } catch (err) {
        return handleError(err, 'Failed to create subtopic');
    }
};

/*
API Responses:
- 201: Subtopic created successfully.
- 400: Invalid topic id.
- 404: Topic not found.
- 409: Subtopic slug already exists in topic.
- 500: Unexpected server/database error.
*/
