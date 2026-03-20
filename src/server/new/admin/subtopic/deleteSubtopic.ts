'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import Content from '@/server/models/Content';
import PageStats from '@/server/models/PageStats';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, success, updatedNow } from '../../utils/helper';
import { revalidateSubtopicPaths } from '../shared';

// ========================================================
// Delete
// ========================================================

export const deleteSubtopic = async (
    subtopicId: string,
    cascade = false,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(subtopicId)) return error('Invalid subtopic id', 400);

        await connectDB();

        const subtopic = await Subtopic.findById(subtopicId).select('_id topicId contentCount').lean();
        if (!subtopic) return error('Subtopic not found', 404);

        const topic = await Topic.findById(subtopic.topicId).select('_id slug').lean();
        if (!topic) return error('Topic not found', 404);

        if (cascade) {
            const contentIds = await Content.distinct('_id', {
                type: 'article',
                topicId: topic._id,
                subtopicId: subtopic._id,
            }) as ObjectId[];

            await Promise.all([
                Content.deleteMany({ type: 'article', topicId: topic._id, subtopicId: subtopic._id }),
                contentIds.length ? PageStats.deleteMany({ contentId: { $in: contentIds } }) : Promise.resolve(),
                contentIds.length ? Comment.deleteMany({ contentId: { $in: contentIds } }) : Promise.resolve(),
            ]);
        } else {
            const hasArticles = await Content.exists({
                type: 'article',
                topicId: topic._id,
                subtopicId: subtopic._id,
            });

            if (hasArticles) {
                return error('Subtopic has related articles. Use cascade delete.', 409);
            }
        }

        const contentDelta = cascade ? Math.max(0, subtopic.contentCount ?? 0) : 0;
        await Promise.all([
            Subtopic.deleteOne({ _id: subtopic._id }),
            Topic.updateOne(
                { _id: topic._id },
                [
                    {
                        $set: {
                            subTopicCount: {
                                $max: [
                                    0,
                                    { $subtract: [{ $ifNull: ['$subTopicCount', 0] }, 1] },
                                ],
                            },
                            contentCount: {
                                $max: [
                                    0,
                                    { $subtract: [{ $ifNull: ['$contentCount', 0] }, contentDelta] },
                                ],
                            },
                            ...updatedNow(),
                        },
                    },
                ]
            ),
        ]);
        revalidateSubtopicPaths(topic.slug);

        return success(true, 'Subtopic deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete subtopic');
    }
};

/*
API Responses:
- 200: Subtopic deleted successfully.
- 400: Invalid subtopic id.
- 404: Subtopic or parent topic not found.
- 409: Subtopic has related articles and cascade=false.
- 500: Unexpected server/database error.
*/
