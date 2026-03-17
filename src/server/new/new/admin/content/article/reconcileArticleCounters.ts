'use server';

import { PUBLISH_STATUS } from '@/constants/schemaConstants';
import type { IApiResponse } from '@/interfaces/actionHelper';
import { connectDB } from '@/lib/db/connectDB';
import Content from '@/server/models/Content';
import Subtopic from '@/server/models/Subtopic';
import Topic from '@/server/models/Topic';
import { handleError, success, updatedNow } from '../../../../utils/helper';

interface IReconcileCountersResult {
    topicsUpdated: number;
    subtopicsUpdated: number;
}

// ========================================================
// Maintenance
// ========================================================

export const reconcileArticleCounters = async (): Promise<IApiResponse<IReconcileCountersResult>> => {
    try {
        await connectDB();

        const [topicCounts, subtopicCounts, allTopics, allSubtopics] = await Promise.all([
            Content.aggregate<{ _id: unknown; count: number }>([
                {
                    $match: {
                        type: 'article',
                        topicId: { $ne: null },
                        publishStatus: PUBLISH_STATUS.PUBLISHED,
                    },
                },
                { $group: { _id: '$topicId', count: { $sum: 1 } } },
            ]),
            Content.aggregate<{ _id: unknown; count: number }>([
                {
                    $match: {
                        type: 'article',
                        subtopicId: { $ne: null },
                        publishStatus: PUBLISH_STATUS.PUBLISHED,
                    },
                },
                { $group: { _id: '$subtopicId', count: { $sum: 1 } } },
            ]),
            Topic.find({}).select('_id').lean(),
            Subtopic.find({}).select('_id').lean(),
        ]);

        const topicCountMap = new Map(topicCounts.map((row) => [String(row._id), row.count]));
        const subtopicCountMap = new Map(subtopicCounts.map((row) => [String(row._id), row.count]));

        const now = updatedNow();

        const [topicBulk, subtopicBulk] = await Promise.all([
            Topic.bulkWrite(
                allTopics.map((topic) => ({
                    updateOne: {
                        filter: { _id: topic._id },
                        update: { $set: { contentCount: topicCountMap.get(String(topic._id)) ?? 0, ...now } },
                    },
                }))
            ),
            Subtopic.bulkWrite(
                allSubtopics.map((subtopic) => ({
                    updateOne: {
                        filter: { _id: subtopic._id },
                        update: { $set: { contentCount: subtopicCountMap.get(String(subtopic._id)) ?? 0, ...now } },
                    },
                }))
            ),
        ]);

        return success(
            {
                topicsUpdated: topicBulk.modifiedCount ?? 0,
                subtopicsUpdated: subtopicBulk.modifiedCount ?? 0,
            },
            'Article counters reconciled successfully'
        );
    } catch (err) {
        return handleError(err, 'Failed to reconcile article counters');
    }
};

/*
API Responses:
- 200: Topic/subtopic content counters reconciled successfully.
- 500: Unexpected server/database error.
*/
