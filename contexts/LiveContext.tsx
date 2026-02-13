
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { Streamer, KickChannelInfo, KickStreamInfo, StreamerRequest } from '../types';
import { useLocalStorage } from '../hooks';
import { defaultStreamersList } from '../constants';
import { robustFetch } from '../utils/apiWrapper';

interface LiveContextType {
    streamers: Streamer[];
    loading: boolean;
    refresh: () => Promise<void>;
    totalStreamersCount: number;
    toggleFavorite: (id: string) => void;
    toggleNotify: (id: string) => Promise<boolean>;
    submitStreamerRequest: (username: string, tags: string, characters: string) => Promise<void>;
    getStreamerRequests: () => Promise<StreamerRequest[]>;
    acceptStreamerRequest: (id: string, username: string, tags: string[], characters: string[]) => Promise<void>;
    deleteStreamerRequest: (id: string) => Promise<void>;
    addLocalStreamer: (streamer: Streamer) => void;
}

const LiveContext = createContext<LiveContextType | null>(null);

const fetchKickData = async (username: string): Promise<{ kickData: KickChannelInfo, streamData: KickStreamInfo } | null> => {
    const t = Date.now();
    try {
        // No signal passed here to prevent aborting mid-queue, we handle race conditions in state update
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://kick.com/api/v2/channels/${username}?t=${t}`)}`);
        
        if (response.status === 429) return null; 
        if (!response.ok) return null;
        
        const json = await response.json();
        const root = json.data ? json.data : json; 
        const user = root.user;
        const livestream = root.livestream;
        
        if (!user) return null;

        return {
            kickData: {
                id: root.id, slug: root.slug, user_id: user.id, username: user.username, profile_pic: user.profile_pic,
                banner: root.banner_image?.url || root.banner_image || user.banner_image || user.banner || '', 
                followers_count: root.followers_count, created_at: root.created_at, bio: user.bio || ''
            },
            streamData: {
                id: livestream ? livestream.id : 0, 
                is_live: livestream !== null && livestream !== undefined, 
                viewers: livestream ? (livestream.viewers || livestream.viewer_count || 0) : 0,
                start_time: livestream ? (livestream.created_at || livestream.start_time) : '', 
                title: livestream ? livestream.session_title : '',
                category_name: livestream?.categories?.[0]?.name || '', 
                category_icon: livestream?.categories?.[0]?.image_url || '', 
                thumbnail: livestream?.thumbnail?.url || ''
            }
        };
    } catch (e) {
        return null;
    }
};

export const LiveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [localPreferences, setLocalPreferences] = useLocalStorage<Record<string, { isFavorite: boolean, notify: boolean }>>('mtnews-streamer-prefs', {});
    const [streamers, setStreamers] = useState<Streamer[]>([]);
    const [loading, setLoading] = useState(true); // Initial load is true
    const [initialized, setInitialized] = useState(false);

    // Prepare Static List - Run once
    const getStaticStreamers = useCallback(() => {
        return defaultStreamersList.map(url => {
            const username = url.split('/').pop()!;
            const pref = localPreferences[username] || { isFavorite: false, notify: false };
            return {
                id: username,
                kickUsername: username,
                tags: [],
                isSystem: true,
                isFavorite: pref.isFavorite,
                notificationsEnabled: pref.notify,
                lastUpdated: 0,
                addedAt: 0,
                kickData: undefined // Undefined means loading/skeleton
            } as Streamer;
        }).sort((a, b) => (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1));
    }, [localPreferences]);

    // Fast Queue Processor
    const processQueue = async (items: Streamer[]) => {
        const CONCURRENCY_LIMIT = 6; // Fetch 6 at a time for speed
        const queue = [...items];
        
        const fetchWorker = async () => {
            while (queue.length > 0) {
                const streamer = queue.shift();
                if (!streamer) break;

                try {
                    const data = await fetchKickData(streamer.kickUsername);
                    if (data) {
                        setStreamers(prev => {
                            // Instant update in place
                            return prev.map(s => 
                                s.id === streamer.id 
                                ? { ...s, kickData: data.kickData, streamData: data.streamData, lastUpdated: Date.now() } 
                                : s
                            ).sort((a, b) => {
                                // Re-sort: Favorites -> Live -> Viewers
                                if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
                                const aLive = a.streamData?.is_live || false;
                                const bLive = b.streamData?.is_live || false;
                                if (aLive !== bLive) return aLive ? -1 : 1;
                                if (aLive && bLive) return (b.streamData?.viewers || 0) - (a.streamData?.viewers || 0);
                                return 0;
                            });
                        });
                    }
                } catch (err) {
                    // Ignore errors, keep skeleton or old data
                }
            }
        };

        const workers = Array(CONCURRENCY_LIMIT).fill(null).map(() => fetchWorker());
        await Promise.all(workers);
    };

    // Initial Load Logic
    useEffect(() => {
        if (initialized) return; // Don't reload if already running

        const initLoad = async () => {
            setLoading(true);
            const initialList = getStaticStreamers();
            setStreamers(initialList); // Show skeletons immediately
            
            // Start fetching immediately
            await processQueue(initialList);
            setLoading(false);
            setInitialized(true);
        };

        initLoad();
    }, [initialized, getStaticStreamers]);

    // Background Refresh Interval (Every 3 minutes)
    useEffect(() => {
        if (!initialized) return;

        const intervalId = setInterval(() => {
            // Refresh using current streamers list to preserve any added locals
            // We pass the current list to the processor
            processQueue(streamers); 
        }, 180000); // 3 minutes

        return () => clearInterval(intervalId);
    }, [initialized, streamers]);

    const refresh = async () => {
        // Manual refresh
        setLoading(true);
        const list = streamers.length > 0 ? streamers : getStaticStreamers();
        await processQueue(list);
        setLoading(false);
    };

    const toggleFavorite = (id: string) => {
        setLocalPreferences(prev => ({
            ...prev,
            [id]: { ...prev[id], isFavorite: !prev[id]?.isFavorite }
        }));
        setStreamers(prev => {
            const updated = prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s);
            return updated.sort((a, b) => {
                if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
                const aLive = a.streamData?.is_live || false;
                const bLive = b.streamData?.is_live || false;
                if (aLive !== bLive) return aLive ? -1 : 1;
                if (aLive && bLive) return (b.streamData?.viewers || 0) - (a.streamData?.viewers || 0);
                return 0;
            });
        });
    };

    const toggleNotify = async (id: string): Promise<boolean> => {
        if (!("Notification" in window)) return false;
        if (Notification.permission !== "granted") {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") return false;
        }
        setLocalPreferences(prev => ({
            ...prev,
            [id]: { ...prev[id], notify: !prev[id]?.notify }
        }));
        setStreamers(prev => prev.map(s => s.id === id ? { ...s, notificationsEnabled: !s.notificationsEnabled } : s));
        return true;
    };

    // API Functions
    const submitStreamerRequest = async (username: string, tags: string, characters: string) => {
        const res = await robustFetch('/streamrequest/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, tags, characters })
        });
        if (!res.ok) throw new Error("Failed to submit request");
    };

    const getStreamerRequests = async () => {
        const res = await robustFetch('/streamerrequests');
        if (res.ok) return await res.json();
        return [];
    };

    const deleteStreamerRequest = async (id: string) => {
        await robustFetch('/streamrequest/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
    };

    const acceptStreamerRequest = async (id: string, username: string, tags: string[], characters: string[]) => {
        const newStreamer: Streamer = {
            id: username,
            kickUsername: username,
            tags: tags,
            characters: characters,
            isSystem: false,
            isFavorite: false,
            notificationsEnabled: false,
            lastUpdated: 0,
            addedAt: Date.now()
        };
        // Add to state and fetch data immediately
        setStreamers(prev => [newStreamer, ...prev]);
        processQueue([newStreamer]); // Fetch this specific one now
        await deleteStreamerRequest(id);
    };

    const addLocalStreamer = (streamer: Streamer) => {
        setStreamers(prev => [streamer, ...prev]);
    };

    // Dummy loadBatch to satisfy interface, no longer needed logic-wise
    const loadBatch = async (start: number, count: number) => {};

    return (
        <LiveContext.Provider value={{ 
            streamers, loading, refresh, loadBatch, 
            totalStreamersCount: defaultStreamersList.length,
            toggleFavorite, toggleNotify,
            submitStreamerRequest,
            getStreamerRequests,
            acceptStreamerRequest,
            deleteStreamerRequest,
            addLocalStreamer
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
