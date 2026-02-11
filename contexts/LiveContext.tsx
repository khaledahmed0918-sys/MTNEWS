import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { Streamer, KickChannelInfo, KickStreamInfo } from '../types';
import { useLocalStorage } from '../hooks';
import { defaultStreamersList } from '../constants';

const API_BASE = "https://dolabriform-fascinatedly-lecia.ngrok-free.dev";

interface LiveContextType {
    streamers: Streamer[];
    loading: boolean;
    refreshStreamers: () => Promise<void>;
    addLocalStreamer: (streamer: Streamer) => void;
    deleteStreamer: (id: string, isSystem: boolean, kickUsername: string) => Promise<void>;
    deleteMultipleStreamers: (items: {id: string, isSystem: boolean, kickUsername: string}[]) => Promise<void>;
    
    // Actions
    toggleFavorite: (id: string) => void;
    toggleNotify: (id: string) => void;
    
    // Admin Actions 
    addGlobalStreamer: (username: string, tags: string, characters: string, links: any) => Promise<void>;
    editGlobalStreamer: (originalUsername: string, newUsername: string, tags: string, characters: string, links: any) => Promise<void>;
    
    // Undo System
    undoAction: () => Promise<void>;
    lastAction: { type: string, description: string } | null;
}

const LiveContext = createContext<LiveContextType | null>(null);

// Utility: Wait function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Utility: Fetch with Infinite Retry & Backoff
const fetchKickDataInfiniteRetry = async (username: string, attempt = 1): Promise<{ kickData: KickChannelInfo, streamData: KickStreamInfo }> => {
    const t = Date.now();
    try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://kick.com/api/v2/channels/${username}?t=${t}`)}`);
        
        if (response.status === 429) throw new Error("Rate Limit");
        if (!response.ok) throw new Error("Network Error");
        
        const json = await response.json();
        const root = json.data ? json.data : json; 
        const user = root.user;
        const livestream = root.livestream;
        
        if (!user) throw new Error("No User Data"); 

        return {
            kickData: {
                id: root.id, slug: root.slug, user_id: user.id, username: user.username, profile_pic: user.profile_pic,
                banner: root.banner_image?.url || root.banner_image || user.banner_image || user.banner || '', 
                followers_count: root.followers_count, created_at: root.created_at, bio: user.bio || ''
            },
            streamData: {
                id: livestream ? livestream.id : 0, is_live: livestream !== null, viewers: livestream ? livestream.viewers_count : 0,
                start_time: livestream ? (livestream.created_at || livestream.start_time) : '', title: livestream ? livestream.session_title : '',
                category_name: livestream?.categories?.[0]?.name || '', category_icon: livestream?.categories?.[0]?.image_url || '', thumbnail: livestream?.thumbnail?.url || ''
            }
        };
    } catch (e) {
        // Backoff: 2s, 4s, 8s, up to max 30s
        const backoff = Math.min(2000 * Math.pow(1.5, attempt), 30000);
        await delay(backoff + (Math.random() * 500));
        return fetchKickDataInfiniteRetry(username, attempt + 1);
    }
};

export const LiveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [localStreamers, setLocalStreamers] = useLocalStorage<Streamer[]>('mtnews-streamers-v1', []);
    const [streamers, setStreamers] = useState<Streamer[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastAction, setLastAction] = useState<{ type: string, description: string, payload: any } | null>(null);
    const isRefreshing = useRef(false);

    // Browser Notification Request
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    // Helper: Sort Streamers
    // Logic: Favorites -> Live -> Viewers -> Loaded (Offline) -> Loading (Skeleton)
    const sortStreamers = useCallback((list: Streamer[]) => {
        return list.sort((a, b) => {
            // 1. Favorites
            if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
            
            // 2. Live Status
            const aLive = a.streamData?.is_live || false;
            const bLive = b.streamData?.is_live || false;
            if (aLive !== bLive) return aLive ? -1 : 1;
            
            // 3. Viewers (if both live)
            if (aLive && bLive) return (b.streamData?.viewers || 0) - (a.streamData?.viewers || 0);

            // 4. Data Loaded Status (Loaded > Loading)
            const aLoaded = !!a.kickData;
            const bLoaded = !!b.kickData;
            if (aLoaded !== bLoaded) return aLoaded ? -1 : 1;

            // 5. Default
            return 0;
        });
    }, []);

    // --- MAIN REFRESH LOGIC ---
    const refreshStreamers = useCallback(async () => {
        if (isRefreshing.current) return;
        isRefreshing.current = true;
        
        // Only show main loader on VERY first load if empty
        if (streamers.length === 0) setLoading(true);

        // 1. Build Definition Map (Source of Truth)
        const definitionMap = new Map<string, Partial<Streamer>>();

        // A. Local (Priority)
        localStreamers.forEach(l => {
            definitionMap.set(l.kickUsername.toLowerCase(), { ...l, isSystem: false });
        });

        // B. Defaults
        defaultStreamersList.forEach(userUrl => {
            const username = userUrl.split('/').pop()!;
            const key = username.toLowerCase();
            if (!definitionMap.has(key)) {
                definitionMap.set(key, {
                    id: `sys-${username}`,
                    kickUsername: username,
                    tags: ['MT'],
                    isSystem: true,
                    isFavorite: false,
                    notificationsEnabled: false,
                    lastUpdated: 0,
                    addedAt: Date.now(),
                    customTitle: '',
                    characters: [],
                    links: {}
                });
            }
        });

        // C. Admin Global (Optional)
        try {
            const res = await fetch(`${API_BASE}/streamers?t=${Date.now()}`, { headers: { "ngrok-skip-browser-warning": "true" } });
            if (res.ok) {
                const globals = await res.json();
                globals.forEach((g: any) => {
                    const key = g.username.toLowerCase();
                    if (!definitionMap.has(key)) {
                        definitionMap.set(key, {
                            id: `global-${g.username}`,
                            kickUsername: g.username,
                            tags: g.tags || [],
                            characters: g.characters || [],
                            links: g.links || {},
                            isSystem: true,
                            isFavorite: false,
                            notificationsEnabled: false,
                            lastUpdated: 0,
                            addedAt: new Date(g.createdAt).getTime(),
                            customTitle: g.characters?.[0] || g.username
                        });
                    }
                });
            }
        } catch (e) { /* silent fail */ }

        // 2. Merge with Current State (Preserve loaded data!)
        let queue: Streamer[] = [];
        
        setStreamers(prev => {
            const mergedList = Array.from(definitionMap.values()).map(def => {
                const existing = prev.find(p => p.kickUsername.toLowerCase() === def.kickUsername!.toLowerCase());
                if (existing) {
                    // Preserve fetched data, only update config
                    return { ...existing, ...def, kickData: existing.kickData, streamData: existing.streamData } as Streamer;
                }
                // New item (Skeleton)
                return def as Streamer;
            });
            
            queue = [...mergedList]; // Process all
            return sortStreamers(mergedList);
        });

        setLoading(false); // UI shows list (maybe skeletons mixed in)

        // 3. Queue Processing (Faster Concurrency)
        const CONCURRENCY_LIMIT = 8; // Increased speed
        let activeRequests = 0;

        const processItem = async (streamer: Streamer) => {
            // Fetch Data
            const newData = await fetchKickDataInfiniteRetry(streamer.kickUsername);
            
            // Notification Logic
            const wasLive = streamer.streamData?.is_live || false;
            const isLive = newData.streamData.is_live;
            
            if (streamer.notificationsEnabled && !wasLive && isLive) {
                if (Notification.permission === "granted") {
                    new Notification(`${streamer.kickUsername} is Live!`, {
                        body: newData.streamData.title,
                        icon: newData.kickData.profile_pic
                    });
                }
            }

            // Update State & Re-sort immediately
            setStreamers(prev => {
                const updated = prev.map(s => {
                    if (s.kickUsername.toLowerCase() === streamer.kickUsername.toLowerCase()) {
                        return { 
                            ...s, 
                            kickData: newData.kickData, 
                            streamData: newData.streamData, 
                            lastUpdated: Date.now() 
                        };
                    }
                    return s;
                });
                return sortStreamers(updated);
            });
        };

        const next = () => {
            if (queue.length === 0 && activeRequests === 0) {
                isRefreshing.current = false;
                return;
            }
            while (activeRequests < CONCURRENCY_LIMIT && queue.length > 0) {
                const item = queue.shift();
                if (item) {
                    activeRequests++;
                    processItem(item).finally(() => {
                        activeRequests--;
                        next();
                    });
                }
            }
        };

        next();

    }, [localStreamers, sortStreamers]);

    useEffect(() => {
        refreshStreamers();
        // Update every 3 minutes (180000ms) as requested
        const interval = setInterval(() => {
            isRefreshing.current = false; 
            refreshStreamers();
        }, 180000);
        return () => clearInterval(interval);
    }, [refreshStreamers]);

    // --- ACTIONS ---

    const toggleFavorite = (id: string) => {
        setLocalStreamers(prev => {
            const exists = prev.find(s => s.id === id);
            if (exists) {
                return prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s);
            }
            // If it's a system streamer, add copy to local to persist favorite
            const sys = streamers.find(s => s.id === id);
            if (sys) {
                return [...prev, { ...sys, isFavorite: !sys.isFavorite, isSystem: false }];
            }
            return prev;
        });
        
        // Optimistic Update & Resort
        setStreamers(prev => {
            const updated = prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s);
            return sortStreamers(updated);
        });
    };

    const toggleNotify = (id: string) => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
        setLocalStreamers(prev => {
            const exists = prev.find(s => s.id === id);
            if (exists) {
                return prev.map(s => s.id === id ? { ...s, notificationsEnabled: !s.notificationsEnabled } : s);
            }
            const sys = streamers.find(s => s.id === id);
            if (sys) {
                return [...prev, { ...sys, notificationsEnabled: !sys.notificationsEnabled, isSystem: false }];
            }
            return prev;
        });
        setStreamers(prev => prev.map(s => s.id === id ? { ...s, notificationsEnabled: !s.notificationsEnabled } : s));
    };

    const addLocalStreamer = (s: Streamer) => {
        setLocalStreamers(prev => {
            if(prev.some(p => p.kickUsername.toLowerCase() === s.kickUsername.toLowerCase())) return prev;
            return [s, ...prev];
        });
        setTimeout(() => { isRefreshing.current = false; refreshStreamers(); }, 100);
    };

    const deleteStreamer = async (id: string, isSystem: boolean, kickUsername: string) => {
        if (!isSystem) {
            setLocalStreamers(prev => prev.filter(s => s.id !== id));
            setLastAction({ type: 'delete', description: `Deleted ${kickUsername}`, payload: localStreamers.find(s => s.id === id) });
        }
    };

    const deleteMultipleStreamers = async (items: any[]) => { /* ... */ };
    const addGlobalStreamer = async (u: string, t: string, c: string, l: any) => { /* ... */ };
    const editGlobalStreamer = async (o: string, n: string, t: string, c: string, l: any) => { /* ... */ };
    const undoAction = async () => { 
        if (lastAction?.type === 'delete' && lastAction.payload) {
            setLocalStreamers(prev => [...prev, lastAction.payload]);
            setLastAction(null);
        }
    };

    return (
        <LiveContext.Provider value={{ 
            streamers, loading, refreshStreamers, 
            addLocalStreamer, deleteStreamer, deleteMultipleStreamers,
            toggleFavorite, toggleNotify,
            addGlobalStreamer, editGlobalStreamer, undoAction, lastAction
        }}>
            {children}
        </LiveContext.Provider>
    );
};

export const useLive = () => {
    const context = useContext(LiveContext);
    if (!context) throw new Error("useLive must be used within LiveProvider");
    return context;
};