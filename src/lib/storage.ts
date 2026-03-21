// =================================================
// Storage — namespaced localStorage wrapper
// Client-side only (rc:: prefix = "reader cache")
// =================================================

// =================================================
// Keys
// =================================================

export const STORAGE_KEYS = {
    USER:    { PROFILE: 'rc::u:profile', PREFERENCES: 'rc::u:prefs'},
    STATS:   { LIKES: 'rc::s:likes', VIEWS: 'rc::s:views', COMMENT_UPVOTES: 'rc::s:upvotes' },
    COMMENT: { AUTHOR: 'rc::c:author' },
} as const;

// =================================================
// Types
// =================================================

export interface IUserProfile   { name: string; email: string; avatar?: string; subscribedAt?: string }
export interface ICommentAuthor { name: string; email: string; avatar: string }
export interface IStatsRecord   { [key: string]: number }

// =================================================
// Storage class
// =================================================

class SiteStorage {
    private get storage(): Storage | null {
        return typeof window !== 'undefined' ? window.localStorage : null;
    }

    private namespacedId(id: string, namespace?: string): string {
        return namespace ? `${namespace}:${id}` : id;
    }

    private get<T>(key: string): T | null {
        try {
            const raw = this.storage?.getItem(key) ?? 'null';
            return JSON.parse(raw) as T;
        } catch {
            return null;
        }
    }

    private set<T>(key: string, val: T): void {
        try {
            this.storage?.setItem(key, JSON.stringify(val));
        } catch {
            // Ignore storage quota/availability failures to avoid breaking UX flows.
        }
    }

    remove(key: string): void {
        this.storage?.removeItem(key);
    }

    // User
    getProfile(): IUserProfile | null {
        return this.get<IUserProfile>(STORAGE_KEYS.USER.PROFILE);
    }

    setProfile(p: IUserProfile): void {
        this.set(STORAGE_KEYS.USER.PROFILE, p);
    }

    updateProfile(p: Partial<IUserProfile>): void {
        this.setProfile({
            ...(this.getProfile() ?? { name: '', email: '' }),
            ...p,
        });
    }

    // Backward-compatible aliases used in legacy components
    getUserProfile(): IUserProfile | null {
        return this.getProfile();
    }

    setUserProfile(profile: IUserProfile): void {
        this.setProfile(profile);
    }

    updateUserProfile(profile: Partial<IUserProfile>): void {
        this.updateProfile(profile);
    }

    // Comment author
    getCommentAuthor(): ICommentAuthor | null {
        return this.get<ICommentAuthor>(STORAGE_KEYS.COMMENT.AUTHOR);
    }

    setCommentAuthor(a: ICommentAuthor): void {
        this.set(STORAGE_KEYS.COMMENT.AUTHOR, a);
    }

    hasCommentAuthor(): boolean {
        return Boolean(this.getCommentAuthor());
    }

    clearCommentAuthor(): void {
        this.remove(STORAGE_KEYS.COMMENT.AUTHOR);
    }

    // Likes
    hasLiked(id: string, namespace?: string): boolean {
        const key = this.namespacedId(id, namespace);
        return key in (this.get<IStatsRecord>(STORAGE_KEYS.STATS.LIKES) ?? {});
    }

    setLiked(id: string, namespace?: string): void {
        const key = this.namespacedId(id, namespace);
        const data = this.get<IStatsRecord>(STORAGE_KEYS.STATS.LIKES) ?? {};
        data[key] = Date.now();
        this.set(STORAGE_KEYS.STATS.LIKES, data);
    }

    removeLiked(id: string, namespace?: string): void {
        const key = this.namespacedId(id, namespace);
        const data = this.get<IStatsRecord>(STORAGE_KEYS.STATS.LIKES) ?? {};
        delete data[key];
        this.set(STORAGE_KEYS.STATS.LIKES, data);
    }

    // Comment upvotes
    hasUpvoted(id: string): boolean {
        return id in (this.get<IStatsRecord>(STORAGE_KEYS.STATS.COMMENT_UPVOTES) ?? {});
    }

    setUpvoted(id: string): void {
        const data = this.get<IStatsRecord>(STORAGE_KEYS.STATS.COMMENT_UPVOTES) ?? {};
        data[id] = Date.now();
        this.set(STORAGE_KEYS.STATS.COMMENT_UPVOTES, data);
    }

    removeUpvote(id: string): void {
        const data = this.get<IStatsRecord>(STORAGE_KEYS.STATS.COMMENT_UPVOTES) ?? {};
        delete data[id];
        this.set(STORAGE_KEYS.STATS.COMMENT_UPVOTES, data);
    }

    // Backward-compatible aliases used in current comment components
    hasUpvotedComment(id: string): boolean {
        return this.hasUpvoted(id);
    }

    setCommentUpvoted(id: string): void {
        this.setUpvoted(id);
    }

    removeCommentUpvote(id: string): void {
        this.removeUpvote(id);
    }

    // Views (with TTL dedup)
    hasViewedRecently(id: string, hours = 1, namespace?: string): boolean {
        const key = this.namespacedId(id, namespace);
        const ts = (this.get<IStatsRecord>(STORAGE_KEYS.STATS.VIEWS) ?? {})[key];
        return ts ? Date.now() - ts < hours * 3600000 : false;
    }

    setViewed(id: string, namespace?: string): void {
        const key = this.namespacedId(id, namespace);
        const data = this.get<IStatsRecord>(STORAGE_KEYS.STATS.VIEWS) ?? {};
        data[key] = Date.now();

        // Prune entries older than 7 days
        const cutoff = Date.now() - 7 * 86400000;
        this.set(
            STORAGE_KEYS.STATS.VIEWS,
            Object.fromEntries(Object.entries(data).filter(([, timestamp]) => timestamp > cutoff))
        );
    }

    clearAll(): void {
        [STORAGE_KEYS.USER.PROFILE, STORAGE_KEYS.USER.PREFERENCES,
         STORAGE_KEYS.STATS.LIKES, STORAGE_KEYS.STATS.VIEWS, STORAGE_KEYS.STATS.COMMENT_UPVOTES,
         STORAGE_KEYS.COMMENT.AUTHOR].forEach(k => this.remove(k));
    }
}

export const siteStorage = new SiteStorage();

// =================================================
// Avatar options
// =================================================
// TODO: use the cdn for the images 
export const AVATAR_OPTIONS = [
    { id: 'avatar-1',  image: '/avatars/avatar-2.png',  label: 'Working Man'    },
    { id: 'avatar-2',  image: '/avatars/avatar-1.png',  label: 'Working Women'  },
    { id: 'avatar-3',  image: '/avatars/avatar-3.png',  label: 'Man with Beard' },
    { id: 'avatar-4',  image: '/avatars/avatar-4.png',  label: 'Funky Boy'      },
    { id: 'avatar-5',  image: '/avatars/avatar-5.png',  label: 'British Women'  },
    { id: 'avatar-6',  image: '/avatars/avatar-6.png',  label: 'Middle Aged Man'},
    { id: 'avatar-7',  image: '/avatars/avatar-7.png',  label: 'Women in Saree' },
    { id: 'avatar-8',  image: '/avatars/avatar-8.png',  label: 'Old Man'        },
    { id: 'avatar-9',  image: '/avatars/avatar-9.png',  label: 'Exciting Girl'  },
    { id: 'avatar-10', image: '/avatars/avatar-10.png', label: 'Magical Girl'   },
    { id: 'avatar-11', image: '/avatars/avatar-11.png', label: 'Astronaut'      },
    { id: 'avatar-12', image: '/avatars/avatar-12.png', label: 'Girl With Stick'},
    { id: 'avatar-13', image: '/avatars/avatar-13.png', label: 'Long Hair Man'  },
] as const;

export type AvatarId = typeof AVATAR_OPTIONS[number]['id'];

export const getAvatarById = (id: string) => AVATAR_OPTIONS.find(a => a.id === id);
export const getRandomAvatar = () => AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];
