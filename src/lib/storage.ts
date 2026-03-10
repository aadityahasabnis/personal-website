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
    private s: Storage | null = typeof window !== 'undefined' ? window.localStorage : null;

    private get<T>(key: string): T | null {
        try { return this.s ? JSON.parse(this.s.getItem(key) ?? 'null') : null; } catch { return null; }
    }
    private set<T>(key: string, val: T): void {
        try { this.s?.setItem(key, JSON.stringify(val)); } catch { /* quota exceeded */ }
    }
    remove(key: string) { this.s?.removeItem(key); }

    // User
    getProfile()                    { return this.get<IUserProfile>(STORAGE_KEYS.USER.PROFILE); }
    setProfile(p: IUserProfile)     { this.set(STORAGE_KEYS.USER.PROFILE, p); }
    updateProfile(p: Partial<IUserProfile>) { this.setProfile({ ...(this.getProfile() ?? { name: '', email: '' }), ...p }); }

    // Comment author
    getCommentAuthor()              { return this.get<ICommentAuthor>(STORAGE_KEYS.COMMENT.AUTHOR); }
    setCommentAuthor(a: ICommentAuthor) { this.set(STORAGE_KEYS.COMMENT.AUTHOR, a); }

    // Likes
    hasLiked(slug: string)          { return slug in (this.get<IStatsRecord>(STORAGE_KEYS.STATS.LIKES) ?? {}); }
    setLiked(slug: string)          { const d = this.get<IStatsRecord>(STORAGE_KEYS.STATS.LIKES) ?? {}; d[slug] = Date.now(); this.set(STORAGE_KEYS.STATS.LIKES, d); }
    removeLiked(slug: string)       { const d = this.get<IStatsRecord>(STORAGE_KEYS.STATS.LIKES) ?? {}; delete d[slug]; this.set(STORAGE_KEYS.STATS.LIKES, d); }

    // Comment upvotes
    hasUpvoted(id: string)          { return id in (this.get<IStatsRecord>(STORAGE_KEYS.STATS.COMMENT_UPVOTES) ?? {}); }
    setUpvoted(id: string)          { const d = this.get<IStatsRecord>(STORAGE_KEYS.STATS.COMMENT_UPVOTES) ?? {}; d[id] = Date.now(); this.set(STORAGE_KEYS.STATS.COMMENT_UPVOTES, d); }
    removeUpvote(id: string)        { const d = this.get<IStatsRecord>(STORAGE_KEYS.STATS.COMMENT_UPVOTES) ?? {}; delete d[id]; this.set(STORAGE_KEYS.STATS.COMMENT_UPVOTES, d); }

    // Views (with TTL dedup)
    hasViewedRecently(slug: string, hours = 1) {
        const ts = (this.get<IStatsRecord>(STORAGE_KEYS.STATS.VIEWS) ?? {})[slug];
        return ts ? Date.now() - ts < hours * 3600000 : false;
    }
    setViewed(slug: string) {
        const d = this.get<IStatsRecord>(STORAGE_KEYS.STATS.VIEWS) ?? {};
        d[slug] = Date.now();
        // Prune entries older than 7 days
        const cutoff = Date.now() - 7 * 86400000;
        this.set(STORAGE_KEYS.STATS.VIEWS, Object.fromEntries(Object.entries(d).filter(([, t]) => t > cutoff)));
    }

    clearAll() {
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
