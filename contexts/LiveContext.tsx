
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { Streamer, KickChannelInfo, KickStreamInfo, StreamerRequest } from '../types';
import { useLocalStorage } from '../hooks';
import { defaultStreamersList } from '../constants';
import { robustFetch } from '../utils/apiWrapper';

interface LiveContextType {
    streamers: Streamer[];
    loading: boolean;
    loadBatch: (startIndex: number, count: number) => Promise<void>; 
    refresh: () => Promise<void>;
    totalStreamersCount: number;
    toggleFavorite: (id: string) => void;
    toggleNotify: (id: string) => Promise<boolean>;
    submitStreamerRequest: (username: string, tags: string, characters: string) => Promise<void>;
    getStreamerRequests: () => Promise<StreamerRequest[]>;
    deleteStreamerRequest: (id: string) => Promise<void>;
    acceptStreamerRequest: (id: string, username: string, tags: string[], characters: string[]) => Promise<void>;
    addLocalStreamer: (streamer: Streamer) => void;
}

const LiveContext = createContext<LiveContextType | null>(null);

// Cache to prevent re-fetching recently fetched streamers (TTL 2 minutes)
const streamerCache = new Map<string, { data: { kickData: KickChannelInfo, streamData: KickStreamInfo }, timestamp: number }>();
const CACHE_TTL = 120000;

const fetchKickData = async (username: string, signal?: AbortSignal): Promise<{ kickData: KickChannelInfo, streamData: KickStreamInfo } | null> => {
    const cached = streamerCache.get(username);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        return cached.data;
    }

    if (signal?.aborted) return null;
    
    // Fast Proxy with high reliability
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(`https://kick.com/api/v2/channels/${username}`)}`;

    try {
        const response = await fetch(proxyUrl, { signal });
        if (!response.ok) return null;
        
        const json = await response.json();
        const root = json.data ? json.data : json; 
        const user = root.user;
        const livestream = root.livestream;
        
        if (!user) return null;

        const result = {
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

        streamerCache.set(username, { data: result, timestamp: Date.now() });
        return result;

    } catch (e) {
        return null;
    }
};

export const LiveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [localPreferences, setLocalPreferences] = useLocalStorage<Record<string, { isFavorite: boolean, notify: boolean }>>('mtnews-streamer-prefs', {});
    const [customStreamers, setCustomStreamers] = useLocalStorage<Streamer[]>('mtnews-custom-streamers', []);
    const [streamers, setStreamers] = useState<Streamer[]>([]);
    const [loading, setLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Prepare Static List
    const getStaticStreamers = useCallback(() => {
        const defaults = defaultStreamersList.map(url => {
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
                addedAt: 0
            } as Streamer;
        });

        const customs = customStreamers.map(s => {
             const pref = localPreferences[s.id] || { isFavorite: s.isFavorite, notify: s.notificationsEnabled };
             return { ...s, isFavorite: pref.isFavorite, notificationsEnabled: pref.notify, isSystem: false };
        });

        const combined = [...defaults, ...customs];
        const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());

        return unique.sort((a, b) => (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1));
    }, [localPreferences, customStreamers]);

    const sortStreamers = (list: Streamer[]) => {
        return [...list].sort((a, b) => {
            const aLoaded = !!a.kickData;
            const bLoaded = !!b.kickData;
            if (aLoaded !== bLoaded) return aLoaded ? -1 : 1;

            if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
            
            const aLive = a.streamData?.is_live || false;
            const bLive = b.streamData?.is_live || false;
            if (aLive !== bLive) return aLive ? -1 : 1;
            
            if (aLive && bLive) {
                return (b.streamData?.viewers || 0) - (a.streamData?.viewers || 0);
            }
            return 0; 
        });
    };

    const loadBatch = useCallback(async (startIndex: number, count: number) => {
        // Only abort if completely refreshing, otherwise let parallel requests fly
        // if (abortControllerRef.current) abortControllerRef.current.abort();
        
        if (!abortControllerRef.current) {
             abortControllerRef.current = new AbortController();
        }
        const signal = abortControllerRef.current.signal;

        setLoading(true);
        const allDefs = getStaticStreamers();
        const batch = allDefs.slice(startIndex, startIndex + count);
        
        // Add Skeletons immediately
        setStreamers(prev => {
            const merged = [...prev];
            batch.forEach(item => {
                if (!merged.find(m => m.id === item.id)) merged.push(item);
            });
            return sortStreamers(merged);
        });

        const processStreamer = async (streamer: Streamer) => {
            if (signal.aborted) return;
            
            const data = await fetchKickData(streamer.kickUsername, signal);
            
            if (data && !signal.aborted) {
                setStreamers(prev => {
                    const updated = prev.map(s => 
                        s.id === streamer.id 
                        ? { ...s, kickData: data.kickData, streamData: data.streamData, lastUpdated: Date.now() } 
                        : s
                    );
                    return sortStreamers(updated);
                });
            }
        };

        // Fire all requests at once for speed (Browser limits parallel requests automatically, no need to throttle artificially for "More" button)
        batch.forEach(processStreamer);
        
        setLoading(false); // Don't wait for promises to resolve to stop "loading" indicator for infinite scroll feel
    }, [getStaticStreamers]); 

    const refresh = async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        streamerCache.clear();
        setStreamers([]);
        await loadBatch(0, 12);
    };

    const toggleFavorite = (id: string) => {
        setLocalPreferences(prev => ({
            ...prev,
            [id]: { ...prev[id], isFavorite: !prev[id]?.isFavorite }
        }));
        setStreamers(prev => sortStreamers(prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s)));
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

    const submitStreamerRequest = async (username: string, tags: string, characters: string) => {
        const tagsArr = tags.split(/[,،]/).map(t => t.trim()).filter(Boolean);
        const charsArr = characters.split(/[,،]/).map(t => t.trim()).filter(Boolean);
        
        await robustFetch('/streamrequest/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, tags: tagsArr, characters: charsArr })
        });
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

    const addLocalStreamer = (streamer: Streamer) => {
        setCustomStreamers(prev => {
            if (prev.some(s => s.id === streamer.id)) return prev;
            return [...prev, streamer];
        });
        setStreamers(prev => sortStreamers([...prev, streamer]));
    };

    const acceptStreamerRequest = async (id: string, username: string, tags: string[], characters: string[]) => {
        const newStreamer: Streamer = {
            id: Math.random().toString(36).substring(7),
            kickUsername: username,
            tags: tags,
            characters: characters,
            isSystem: false,
            isFavorite: false,
            notificationsEnabled: false,
            lastUpdated: Date.now(),
            addedAt: Date.now()
        };
        addLocalStreamer(newStreamer);
        await deleteStreamerRequest(id);
    };

    return (
        <LiveContext.Provider value={{ 
            streamers, loading, refresh, loadBatch, 
            totalStreamersCount: getStaticStreamers().length,
            toggleFavorite, toggleNotify,
            submitStreamerRequest,
            getStreamerRequests,
            deleteStreamerRequest,
            acceptStreamerRequest,
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
