'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { cleanUndefined, error, handleError, success, updatedNow } from '../../../utils/helper';
import { revalidateSubtopicPaths } from '../shared';
import type { ISubtopicUpdateInput } from './types';

// ========================================================
// Update
// ========================================================

export const updateSubtopic = async (
    topicSlug: string,
    slug: string,
    input: ISubtopicUpdateInput,
): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();

        const [currentTopic, nextTopic] = await Promise.all([
            Topic.findOne({ slug: topicSlug }).select('_id').lean(),
            input.topicSlug && input.topicSlug !== topicSlug
                ? Topic.findOne({ slug: input.topicSlug }).select('_id').lean()
                : Promise.resolve(null),
        ]);

        if (!currentTopic) return error('Topic not found', 404);
        if (input.topicSlug && input.topicSlug !== topicSlug && !nextTopic) return error('Target topic not found', 404);

        const subtopic = await Subtopic.findOne({ topicId: currentTopic._id, slug }).select('_id').lean();
        if (!subtopic) return error('Subtopic not found', 404);

        const targetTopicId = nextTopic?._id ?? currentTopic._id;
        const targetSlug = input.slug ?? slug;

        if (targetTopicId.toString() !== currentTopic._id.toString() || targetSlug !== slug) {
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

        revalidateSubtopicPaths(topicSlug);
        if (input.topicSlug && input.topicSlug !== topicSlug) revalidateSubtopicPaths(input.topicSlug);

        return success(true, 'Subtopic updated successfully');
    } catch (err) {
        return handleError(err, 'Failed to update subtopic');
    }
};
