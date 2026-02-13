
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Streamer, KickChannelInfo, KickStreamInfo } from '../types';
import { useLocalStorage } from '../hooks';
import { defaultStreamersList } from '../constants';

interface LiveContextType {
    streamers: Streamer[];
    loading: boolean;
    refresh: () => Promise<void>;
    totalStreamersCount: number;
    toggleFavorite: (id: string) => void;
    toggleNotify: (id: string) => Promise<boolean>;
    loadBatch: (start: number, count: number) => Promise<void>;
}

const LiveContext = createContext<LiveContextType | null>(null);

const fetchKickData = async (username: string, signal?: AbortSignal): Promise<{ kickData: KickChannelInfo, streamData: KickStreamInfo } | null> => {
    const t = Date.now();
    try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://kick.com/api/v2/channels/${username}?t=${t}`)}`, { signal });
        
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
    const [loading, setLoading] = useState(true);
    const [initialized, setInitialized] = useState(false);

    // Sorting Logic: Loaded > Favorites > Live > Viewers > Others
    // Optimized for performance
    const sortStreamers = useCallback((list: Streamer[]) => {
        return [...list].sort((a, b) => {
            // 1. Data Loaded Status (Bubbles loaded cards to top)
            const aLoaded = !!a.kickData;
            const bLoaded = !!b.kickData;
            if (aLoaded !== bLoaded) return aLoaded ? -1 : 1;

            // 2. Favorites
            if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
            
            // 3. Live Status
            const aLive = a.streamData?.is_live || false;
            const bLive = b.streamData?.is_live || false;
            if (aLive !== bLive) return aLive ? -1 : 1;
            
            // 4. Viewers
            if (aLive && bLive) {
                return (b.streamData?.viewers || 0) - (a.streamData?.viewers || 0);
            }
            
            return 0; 
        });
    }, []);

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
                kickData: undefined // Loading state
            } as Streamer;
        });
    }, [localPreferences]);

    // Batch Processor - Fires concurrent requests but updates state independently and immediately
    const runBatchFetching = async (allStreamers: Streamer[]) => {
        const BATCH_SIZE = 10;
        const DELAY_MS = 200;

        for (let i = 0; i < allStreamers.length; i += BATCH_SIZE) {
            const batch = allStreamers.slice(i, i + BATCH_SIZE);
            
            // Process concurrently but without blocking the loop for long
            batch.forEach(async (streamer) => {
                // AbortController to kill requests that hang too long (preventing browser queue clog)
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 1000); // 10s max per request

                try {
                    const data = await fetchKickData(streamer.kickUsername, controller.signal);
                    clearTimeout(timeoutId);
                    
                    if (data) {
                        setStreamers(prev => {
                            // Find the index to update efficiently
                            const index = prev.findIndex(s => s.id === streamer.id);
                            if (index === -1) return prev;

                            const newStreamer = { 
                                ...prev[index], 
                                kickData: data.kickData, 
                                streamData: data.streamData, 
                                lastUpdated: Date.now() 
                            };

                            const updatedList = [...prev];
                            updatedList[index] = newStreamer;
                            
                            // Re-sort to bubble this item up immediately
                            return sortStreamers(updatedList);
                        });
                    }
                } catch (e) { 
                    // Ignore errors to keep UI flow
                } finally {
                    clearTimeout(timeoutId);
                }
            });

            // Wait 1 second before firing the next batch of 10
            if (i + BATCH_SIZE < allStreamers.length) {
                await new Promise(resolve => setTimeout(resolve, DELAY_MS));
            }
        }
    };

    useEffect(() => {
        if (initialized) return;

        const initLoad = async () => {
            setLoading(true);
            const initialList = getStaticStreamers();
            
            // Initial sort (Favorites first among skeletons)
            const sortedInitial = initialList.sort((a, b) => (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1));
            setStreamers(sortedInitial);

            // Start batch fetching
            runBatchFetching(sortedInitial);

            setLoading(false);
            setInitialized(true);
        };

        initLoad();
    }, [initialized, getStaticStreamers, sortStreamers]);

    // Background Refresh (Every 3 minutes)
    useEffect(() => {
        if (!initialized) return;
        const intervalId = setInterval(() => {
            // Re-run fetching on the existing list to update live stats
            runBatchFetching(streamers);
        }, 180000); 
        return () => clearInterval(intervalId);
    }, [initialized, streamers]);

    const refresh = async () => {
        setLoading(true);
        // Manual refresh re-fetches data for current streamers
        await runBatchFetching(streamers);
        setLoading(false);
    };

    const toggleFavorite = (id: string) => {
        setLocalPreferences(prev => ({
            ...prev,
            [id]: { ...prev[id], isFavorite: !prev[id]?.isFavorite }
        }));
        setStreamers(prev => {
            const updated = prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s);
            return sortStreamers(updated);
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

    const loadBatch = async (start: number, count: number) => {};

    return (
        <LiveContext.Provider value={{ 
            streamers, loading, refresh, loadBatch,
            totalStreamersCount: defaultStreamersList.length,
            toggleFavorite, toggleNotify
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
