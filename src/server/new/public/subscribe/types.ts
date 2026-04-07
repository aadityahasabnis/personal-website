// ========================================================
// Public Subscribe Types
// ========================================================

export interface ISubscribeInput {
    email: string;
    name?: string | null;
}

export interface IUnsubscribeInput {
    email: string;
}

export type SubscriptionState = 'created' | 'pending' | 'active' | 'resubscribed' | 'unsubscribed';

export interface ISubscriptionResult {
    email: string;
    confirmed: boolean;
    state: SubscriptionState;
}