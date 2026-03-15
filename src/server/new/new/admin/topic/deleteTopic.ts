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
import { revalidateTopicPaths } from '../shared';

// ========================================================
// Delete
// ========================================================

export const deleteTopic = async (slug: string, cascade = false): Promise<IApiResponse<boolean>> => {
    try {
        await connectDB();

        const topic = await Topic.findOne({ slug }).select('_id').lean();
        if (!topic) return error('Topic not found', 404);

        const topicId = topic._id as ObjectId;
        const [subtopicCount, articleCount] = await Promise.all([
            Subtopic.countDocuments({ topicId }),
            Content.countDocuments({ type: 'article', topicId }),
        ]);

        if (!cascade && (subtopicCount > 0 || articleCount > 0)) {
            return error('Topic has related subtopics/articles. Use cascade delete.', 409);
        }

        if (cascade) {
            const contentDocs = await Content.find({ type: 'article', topicId }).select('_id').lean();
            const contentIds = contentDocs.map((doc) => doc._id as ObjectId);

            await Promise.all([
                Content.deleteMany({ type: 'article', topicId }),
                Subtopic.deleteMany({ topicId }),
                contentIds.length ? PageStats.deleteMany({ contentId: { $in: contentIds } }) : Promise.resolve(),
                contentIds.length ? Comment.deleteMany({ contentId: { $in: contentIds } }) : Promise.resolve(),
            ]);
        }

        await Topic.deleteOne({ _id: topicId });
        revalidateTopicPaths(slug);

        return success(true, 'Topic deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete topic');
    }
};
