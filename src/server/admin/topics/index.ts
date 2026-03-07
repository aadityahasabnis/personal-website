/**
 * Topics Domain - Barrel Export
 */

// Types
export type { CreateTopicRequest, CreateTopicResponse } from './createTopic';
export type { UpdateTopicRequest, UpdateTopicResponse } from './updateTopic';
export type { DeleteTopicResponse } from './deleteTopic';
export type { ToggleTopicResponse, ReorderTopicsResponse } from './toggleTopic';
export type { UpdateTopicCountResponse } from './updateTopicArticleCount';
export type { SerializedTopic, TopicForEdit } from './getTopics';

// Actions
export { createTopic } from './createTopic';
export { updateTopic } from './updateTopic';
export { deleteTopic } from './deleteTopic';
export { toggleTopicPublished, toggleTopicFeatured, reorderTopics } from './toggleTopic';
export { updateTopicArticleCount } from './updateTopicArticleCount';

// Queries
export { getTopics, getTopicForEdit, getPublishedTopics } from './getTopics';
