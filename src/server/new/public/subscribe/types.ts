// ========================================================
// Public Subscribe Types
// ========================================================

export interface ISubscribeInput {
    email: string;
}

export interface IUnsubscribeInput {
    email: string;
}

export type SubscriptionState = 'created' | 'active' | 'resubscribed' | 'unsubscribed';

export interface ISubscriptionResult {
    email: string;
    confirmed: boolean;
    state: SubscriptionState;
}