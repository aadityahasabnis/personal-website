'use server';

import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Comment from '@/server/models/Comment';
import Content from '@/server/models/Content';
import PageStats from '@/server/models/PageStats';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { ObjectId } from 'mongodb';
import { error, handleError, success } from '../../utils/helper';
import { getAdminId, revalidateTopicPaths } from '../shared';

// ========================================================
// Delete
// ========================================================

export const deleteTopic = async (topicId: string, cascade = false): Promise<IApiResponse<boolean>> => {
    try {
        const authResult = await getAdminId();
        if (!authResult.success) return authResult;

        if (!ObjectId.isValid(topicId)) return error('Invalid topic id', 400);

        await connectDB();

        const topic = await Topic.findById(topicId).select('_id slug').lean();
        if (!topic) return error('Topic not found', 404);

        const resolvedTopicId = topic._id as ObjectId;
        if (cascade) {
            const contentIds = await Content.distinct('_id', {
                type: 'article',
                topicId: resolvedTopicId,
            }) as ObjectId[];

            await Promise.all([
                Content.deleteMany({ type: 'article', topicId: resolvedTopicId }),
                Subtopic.deleteMany({ topicId: resolvedTopicId }),
                contentIds.length ? PageStats.deleteMany({ contentId: { $in: contentIds } }) : Promise.resolve(),
                contentIds.length ? Comment.deleteMany({ contentId: { $in: contentIds } }) : Promise.resolve(),
            ]);
        } else {
            const [hasSubtopics, hasArticles] = await Promise.all([
                Subtopic.exists({ topicId: resolvedTopicId }),
                Content.exists({ type: 'article', topicId: resolvedTopicId }),
            ]);

            if (hasSubtopics || hasArticles) {
                return error('Topic has related subtopics/articles. Use cascade delete.', 409);
            }
        }

        await Topic.deleteOne({ _id: resolvedTopicId });
        revalidateTopicPaths(topic.slug);

        return success(true, 'Topic deleted successfully');
    } catch (err) {
        return handleError(err, 'Failed to delete topic');
    }
};

/*
API Responses:
- 200: Topic deleted successfully.
- 400: Invalid topic id.
- 404: Topic not found.
- 409: Topic has related subtopics/articles and cascade=false.
- 500: Unexpected server/database error.
*/
