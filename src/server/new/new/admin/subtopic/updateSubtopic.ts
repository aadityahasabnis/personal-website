'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { cleanUndefined, error, handleError, success, updatedNow } from '../../../utils/helper';
import { revalidateSubtopicPaths } from '../shared';
import type { ISubtopicUpdateInput } from './types';

// ========================================================
// Update
// ========================================================

export const updateSubtopic = async (
    subtopicId: string,
    input: ISubtopicUpdateInput,
): Promise<IApiResponse<boolean>> => {
    try {
        if (!ObjectId.isValid(subtopicId)) return error('Invalid subtopic id', 400);
        if (input.topicId && !ObjectId.isValid(input.topicId)) return error('Invalid topic id', 400);

        await connectDB();

        const subtopic = await Subtopic.findById(subtopicId).select('_id topicId slug contentCount').lean();
        if (!subtopic) return error('Subtopic not found', 404);

        const [currentTopic, nextTopic] = await Promise.all([
            Topic.findById(subtopic.topicId).select('_id slug').lean(),
            input.topicId && ObjectId.isValid(input.topicId) && input.topicId !== subtopic.topicId.toString()
                ? Topic.findById(input.topicId).select('_id slug').lean()
                : Promise.resolve(null),
        ]);

        if (!currentTopic) return error('Topic not found', 404);
        if (input.topicId && input.topicId !== subtopic.topicId.toString() && !nextTopic) return error('Target topic not found', 404);

        const targetTopicId = nextTopic?._id ?? currentTopic._id;
        const targetSlug = input.slug ?? subtopic.slug;
        const topicChanged = targetTopicId.toString() !== currentTopic._id.toString();

        if (targetTopicId.toString() !== currentTopic._id.toString() || targetSlug !== subtopic.slug) {
            const conflict = await Subtopic.findOne({ topicId: targetTopicId, slug: targetSlug }).select('_id').lean();
            if (conflict && conflict._id.toString() !== subtopic._id.toString()) {
                return error('Subtopic with this slug already exists in topic', 409);
            }
        }

        await Subtopic.updateOne(
            { _id: subtopic._id },
            {
                $set: cleanUndefined({
                    topicId: targetTopicId,
                    slug: input.slug,
                    title: input.title,
                    description: input.description,
                    order: input.order,
                    published: input.published,
                    ...updatedNow(),
                }),
            }
        );

        if (topicChanged) {
            await Content.updateMany(
                {
                    type: 'article',
                    topicId: currentTopic._id,
                    subtopicId: subtopic._id,
                },
                {
                    $set: {
                        topicId: targetTopicId,
                        ...updatedNow(),
                    },
                }
            );

            const publishedCount = Math.max(0, subtopic.contentCount ?? 0);
            await Promise.all([
                Topic.updateOne(
                    { _id: currentTopic._id },
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
                                        { $subtract: [{ $ifNull: ['$contentCount', 0] }, publishedCount] },
                                    ],
                                },
                                ...updatedNow(),
                            },
                        },
                    ]
                ),
                Topic.updateOne(
                    { _id: targetTopicId },
                    {
                        $inc: {
                            subTopicCount: 1,
                            contentCount: publishedCount,
                        },
                        $set: { ...updatedNow() },
                    }
                ),
            ]);
        }

        revalidateSubtopicPaths(currentTopic.slug);
        if (nextTopic && nextTopic.slug !== currentTopic.slug) revalidateSubtopicPaths(nextTopic.slug);

        return success(true, 'Subtopic updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update subtopic');
    }
};

/*
API Responses:
- 200: Subtopic updated successfully.
- 400: Invalid subtopic id/topic id.
- 404: Subtopic, current topic, or target topic not found.
- 409: Subtopic slug conflict in target topic.
- 500: Unexpected server/database error.
*/
