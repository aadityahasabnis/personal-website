/**
 * Professional Storage Utility
 * 
 * Implements a centralized, structured approach to browser storage.
 * Uses namespaced keys (rc:: pattern) similar to major websites.
 * 
 * Storage Strategy:
 * - localStorage: Persistent user preferences (likes, avatar, theme)
 * - sessionStorage: Temporary session data (viewed pages this session)
 * - Cookies: Auth tokens only (handled by NextAuth)
 * 
 * Key Naming Convention:
 * - rc::u - User data (profile, preferences)
 * - rc::s - Stats tracking (likes, views dedup)
 * - rc::c - Comment/subscriber data
 */

// ===== STORAGE KEYS =====

export const STORAGE_KEYS = {
    // User data namespace (rc::u)
    USER: {
        PROFILE: 'rc::u:profile',          // { name, email, avatar }
        PREFERENCES: 'rc::u:preferences',  // { theme, etc. }
    },
    // Stats namespace (rc::s)
    STATS: {
        LIKES: 'rc::s:likes',              // Record<slug, timestamp>
        VIEWS: 'rc::s:views',              // Record<slug, timestamp>
        COMMENT_UPVOTES: 'rc::s:comment-upvotes',  // Record<commentId, timestamp>
    },
    // Comment namespace (rc::c)  
    COMMENT: {
        AUTHOR: 'rc::c:author',            // { name, email, avatar }
    },
} as const;

// ===== TYPE DEFINITIONS =====

export interface IUserProfile {
    name: string;
    email: string;
    avatar?: string;            // Avatar identifier (e.g., "avatar-1", "avatar-5")
    subscribedAt?: string;      // ISO date string
}

export interface IUserPreferences {
    theme?: 'light' | 'dark' | 'system';
}

export interface IStatsRecord {
    [slug: string]: number;     // timestamp of action
}

export interface ICommentAuthor {
    name: string;
    email: string;
    avatar: string;
}

// ===== STORAGE CLASS =====

class SiteStorage {
    private storage: Storage | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.storage = window.localStorage;
        }
    }

    // ===== GENERIC METHODS =====

    private get<T>(key: string): T | null {
        if (!this.storage) return null;
        try {
            const item = this.storage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    }

    private set<T>(key: string, value: T): void {
        if (!this.storage) return;
        try {
            this.storage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Storage quota exceeded or unavailable:', error);
        }
    }

    private remove(key: string): void {
        if (!this.storage) return;
        this.storage.removeItem(key);
    }

    // ===== USER PROFILE =====

    getUserProfile(): IUserProfile | null {
        return this.get<IUserProfile>(STORAGE_KEYS.USER.PROFILE);
    }

    setUserProfile(profile: IUserProfile): void {
        this.set(STORAGE_KEYS.USER.PROFILE, profile);
    }

    updateUserProfile(partial: Partial<IUserProfile>): void {
        const current = this.getUserProfile() || { name: '', email: '', avatar: '' };
        this.setUserProfile({ ...current, ...partial });
    }

    // ===== COMMENT AUTHOR =====

    getCommentAuthor(): ICommentAuthor | null {
        return this.get<ICommentAuthor>(STORAGE_KEYS.COMMENT.AUTHOR);
    }

    setCommentAuthor(author: ICommentAuthor): void {
        this.set(STORAGE_KEYS.COMMENT.AUTHOR, author);
    }

    hasCommentAuthor(): boolean {
        return this.getCommentAuthor() !== null;
    }

    // ===== LIKES TRACKING =====

    getLikes(): IStatsRecord {
        return this.get<IStatsRecord>(STORAGE_KEYS.STATS.LIKES) || {};
    }

    hasLiked(slug: string): boolean {
        const likes = this.getLikes();
        return slug in likes;
    }

    setLiked(slug: string): void {
        const likes = this.getLikes();
        likes[slug] = Date.now();
        this.set(STORAGE_KEYS.STATS.LIKES, likes);
    }

    removeLiked(slug: string): void {
        const likes = this.getLikes();
        delete likes[slug];
        this.set(STORAGE_KEYS.STATS.LIKES, likes);
    }

    // ===== COMMENT UPVOTES TRACKING =====

    getCommentUpvotes(): IStatsRecord {
        return this.get<IStatsRecord>(STORAGE_KEYS.STATS.COMMENT_UPVOTES) || {};
    }

    hasUpvotedComment(commentId: string): boolean {
        const upvotes = this.getCommentUpvotes();
        return commentId in upvotes;
    }

    setCommentUpvoted(commentId: string): void {
        const upvotes = this.getCommentUpvotes();
        upvotes[commentId] = Date.now();
        this.set(STORAGE_KEYS.STATS.COMMENT_UPVOTES, upvotes);
    }

    removeCommentUpvote(commentId: string): void {
        const upvotes = this.getCommentUpvotes();
        delete upvotes[commentId];
        this.set(STORAGE_KEYS.STATS.COMMENT_UPVOTES, upvotes);
    }

    // ===== VIEWS TRACKING (Session-based deduplication) =====

    getViews(): IStatsRecord {
        return this.get<IStatsRecord>(STORAGE_KEYS.STATS.VIEWS) || {};
    }

    hasViewedRecently(slug: string, hours: number = 1): boolean {
        const views = this.getViews();
        const lastViewed = views[slug];
        if (!lastViewed) return false;

        const hourInMs = hours * 60 * 60 * 1000;
        return Date.now() - lastViewed < hourInMs;
    }

    setViewed(slug: string): void {
        const views = this.getViews();
        views[slug] = Date.now();
        this.set(STORAGE_KEYS.STATS.VIEWS, views);

        // Cleanup old entries (older than 7 days)
        this.cleanupOldViews();
    }

    private cleanupOldViews(): void {
        const views = this.getViews();
        const weekInMs = 7 * 24 * 60 * 60 * 1000;
        const now = Date.now();

        const cleaned: IStatsRecord = {};
        for (const [slug, timestamp] of Object.entries(views)) {
            if (now - timestamp < weekInMs) {
                cleaned[slug] = timestamp;
            }
        }

        this.set(STORAGE_KEYS.STATS.VIEWS, cleaned);
    }

    // ===== PREFERENCES =====

    getPreferences(): IUserPreferences {
        return this.get<IUserPreferences>(STORAGE_KEYS.USER.PREFERENCES) || {};
    }

    setPreferences(prefs: Partial<IUserPreferences>): void {
        const current = this.getPreferences();
        this.set(STORAGE_KEYS.USER.PREFERENCES, { ...current, ...prefs });
    }

    // ===== UTILITY =====

    /**
     * Clear all site storage (for debugging/logout)
     */
    clearAll(): void {
        Object.values(STORAGE_KEYS.USER).forEach(key => this.remove(key));
        Object.values(STORAGE_KEYS.STATS).forEach(key => this.remove(key));
        Object.values(STORAGE_KEYS.COMMENT).forEach(key => this.remove(key));
    }

    /**
     * Check if storage is available
     */
    isAvailable(): boolean {
        return this.storage !== null;
    }
}

// ===== SINGLETON EXPORT =====

export const siteStorage = new SiteStorage();

// ===== AVATAR OPTIONS =====

export const AVATAR_OPTIONS = [
    { id: 'avatar-1', image: '/avatars/avatar-2.png', label: 'Working Man' },
    { id: 'avatar-2', image: '/avatars/avatar-1.png', label: 'Working Women' },
    { id: 'avatar-3', image: '/avatars/avatar-3.png', label: 'Man with Beard' },
    { id: 'avatar-4', image: '/avatars/avatar-4.png', label: 'Funcky Boy' },
    { id: 'avatar-5', image: '/avatars/avatar-5.png', label: 'British Women' },
    { id: 'avatar-6', image: '/avatars/avatar-6.png', label: 'Middle Aged Man' },
    { id: 'avatar-7', image: '/avatars/avatar-7.png', label: 'Women in Saree' },
    { id: 'avatar-8', image: '/avatars/avatar-8.png', label: 'Old Man' },
    { id: 'avatar-9', image: '/avatars/avatar-9.png', label: 'Exciting Girl' },
    { id: 'avatar-10', image: '/avatars/avatar-10.png', label: 'Magical Girl' },
    { id: 'avatar-11', image: '/avatars/avatar-11.png', label: 'Astronaut' },
    { id: 'avatar-12', image: '/avatars/avatar-12.png', label: 'Girl With Stick' },
    { id: 'avatar-13', image: '/avatars/avatar-13.png', label: 'Long Hair Man' },
] as const;

export type AvatarId = typeof AVATAR_OPTIONS[number]['id'];

export const getAvatarById = (id: string): typeof AVATAR_OPTIONS[number] | undefined => {
    return AVATAR_OPTIONS.find(a => a.id === id);
};

export const getRandomAvatar = (): typeof AVATAR_OPTIONS[number] => {
    return AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
};
