'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import Content from '@/server/models/Content';
import PageStats from '@/server/models/PageStats';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../../utils/helper';
import { revalidateSubtopicPaths } from '../shared';

// ========================================================
// Delete
// ========================================================

export const deleteSubtopic = async (
    topicSlug: string,
    slug: string,
    cascade = false,
): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();

        const topic = await Topic.findOne({ slug: topicSlug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        const subtopic = await Subtopic.findOne({ topicId: topic._id, slug }).select('_id').lean();
        if (!subtopic) return error('Subtopic not found', 404);

        const articleCount = await Content.countDocuments({
            type: 'article',
            topicId: topic._id,
            subtopicId: subtopic._id,
        });

        if (!cascade && articleCount > 0) {
            return error('Subtopic has related articles. Use cascade delete.', 409);
        }

        if (cascade) {
            const contentDocs = await Content.find({
                type: 'article',
                topicId: topic._id,
                subtopicId: subtopic._id,
            }).select('_id').lean();

            const contentIds = contentDocs.map((doc) => doc._id as ObjectId);

            await Promise.all([
                Content.deleteMany({ type: 'article', topicId: topic._id, subtopicId: subtopic._id }),
                contentIds.length ? PageStats.deleteMany({ contentId: { $in: contentIds } }) : Promise.resolve(),
                contentIds.length ? Comment.deleteMany({ contentId: { $in: contentIds } }) : Promise.resolve(),
            ]);
        }

        await Subtopic.deleteOne({ _id: subtopic._id });
        revalidateSubtopicPaths(topicSlug);

        return success(true, 'Subtopic deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete subtopic');
    }
};
