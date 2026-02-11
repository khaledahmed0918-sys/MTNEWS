
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
    
    // Performance: Mutable Ref to hold data before batching to state
    const streamersBuffer = useRef<Map<string, Streamer>>(new Map());
    const needsUpdate = useRef(false);

    // Browser Notification Request
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    // Helper: Sort Streamers
    const sortStreamers = useCallback((list: Streamer[]) => {
        return list.sort((a, b) => {
            if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
            const aLive = a.streamData?.is_live || false;
            const bLive = b.streamData?.is_live || false;
            if (aLive !== bLive) return aLive ? -1 : 1;
            if (aLive && bLive) return (b.streamData?.viewers || 0) - (a.streamData?.viewers || 0);
            const aLoaded = !!a.kickData;
            const bLoaded = !!b.kickData;
            if (aLoaded !== bLoaded) return aLoaded ? -1 : 1;
            return 0;
        });
    }, []);

    // --- BATCH UPDATER ---
    // This effect runs periodically to flush the buffer to React state
    // preventing 100s of re-renders per minute
    useEffect(() => {
        const interval = setInterval(() => {
            if (needsUpdate.current) {
                setStreamers(prev => {
                    const currentList = Array.from(streamersBuffer.current.values());
                    return sortStreamers(currentList);
                });
                needsUpdate.current = false;
            }
        }, 1000); // Update UI max once every second
        return () => clearInterval(interval);
    }, [sortStreamers]);

    // --- MAIN REFRESH LOGIC ---
    const refreshStreamers = useCallback(async () => {
        if (isRefreshing.current) return;
        isRefreshing.current = true;
        
        if (streamersBuffer.current.size === 0) setLoading(true);

        // 1. Build Definition Map (Source of Truth)
        // We update the Buffer, not the State directly yet
        
        // A. Local (Priority)
        localStreamers.forEach(l => {
            const key = l.kickUsername.toLowerCase();
            const existing = streamersBuffer.current.get(key);
            // Preserve loaded data if exists
            streamersBuffer.current.set(key, { ...l, isSystem: false, kickData: existing?.kickData, streamData: existing?.streamData });
        });

        // B. Defaults
        defaultStreamersList.forEach(userUrl => {
            const username = userUrl.split('/').pop()!;
            const key = username.toLowerCase();
            if (!streamersBuffer.current.has(key)) {
                streamersBuffer.current.set(key, {
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
                    if (!streamersBuffer.current.has(key)) {
                        streamersBuffer.current.set(key, {
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

        // Initial Flush to ensure skeletons are visible
        needsUpdate.current = true;
        setLoading(false);

        // 2. Queue Processing
        const CONCURRENCY_LIMIT = 5; 
        const queue = Array.from(streamersBuffer.current.values());
        let activeRequests = 0;

        const processItem = async (streamer: Streamer) => {
            const newData = await fetchKickDataInfiniteRetry(streamer.kickUsername);
            
            // Notification Logic
            const inBuffer = streamersBuffer.current.get(streamer.kickUsername.toLowerCase());
            const wasLive = inBuffer?.streamData?.is_live || false;
            const isLive = newData.streamData.is_live;
            
            if (streamer.notificationsEnabled && !wasLive && isLive) {
                if (Notification.permission === "granted") {
                    new Notification(`${streamer.kickUsername} is Live!`, {
                        body: newData.streamData.title,
                        icon: newData.kickData.profile_pic
                    });
                }
            }

            // Update Buffer
            const currentItem = streamersBuffer.current.get(streamer.kickUsername.toLowerCase());
            if (currentItem) {
                streamersBuffer.current.set(streamer.kickUsername.toLowerCase(), {
                    ...currentItem,
                    kickData: newData.kickData,
                    streamData: newData.streamData,
                    lastUpdated: Date.now()
                });
                needsUpdate.current = true; // Signal for next flush
            }
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

    }, [localStreamers]);

    useEffect(() => {
        refreshStreamers();
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
            // We need to find it from current state/buffer
            const sys = Array.from(streamersBuffer.current.values()).find(s => s.id === id);
            if (sys) {
                return [...prev, { ...sys, isFavorite: !sys.isFavorite, isSystem: false }];
            }
            return prev;
        });
        
        // Optimistic Update in Buffer
        const s = Array.from(streamersBuffer.current.values()).find(s => s.id === id);
        if (s) {
            s.isFavorite = !s.isFavorite;
            streamersBuffer.current.set(s.kickUsername.toLowerCase(), s);
            needsUpdate.current = true;
        }
    };

    const toggleNotify = (id: string) => {
        if (Notification.permission !== "granted") Notification.requestPermission();
        
        setLocalStreamers(prev => {
            const exists = prev.find(s => s.id === id);
            if (exists) return prev.map(s => s.id === id ? { ...s, notificationsEnabled: !s.notificationsEnabled } : s);
            const sys = Array.from(streamersBuffer.current.values()).find(s => s.id === id);
            if (sys) return [...prev, { ...sys, notificationsEnabled: !sys.notificationsEnabled, isSystem: false }];
            return prev;
        });

        const s = Array.from(streamersBuffer.current.values()).find(s => s.id === id);
        if (s) {
            s.notificationsEnabled = !s.notificationsEnabled;
            streamersBuffer.current.set(s.kickUsername.toLowerCase(), s);
            needsUpdate.current = true;
        }
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
            // Remove from buffer if it was local only
            if (!defaultStreamersList.some(u => u.toLowerCase().includes(kickUsername.toLowerCase()))) {
                streamersBuffer.current.delete(kickUsername.toLowerCase());
                needsUpdate.current = true;
            }
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
