
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { Streamer, KickChannelInfo, KickStreamInfo } from '../types';
import { useLocalStorage } from '../hooks';
import { defaultStreamersList } from '../constants';

const API_BASE = "https://dolabriform-fascinatedly-lecia.ngrok-free.dev";

interface LiveContextType {
    streamers: Streamer[];
    loading: boolean;
    // New: Load specific range
    loadBatch: (startIndex: number, count: number) => Promise<void>; 
    totalStreamersCount: number;
    
    addLocalStreamer: (streamer: Streamer) => void;
    deleteStreamer: (id: string, isSystem: boolean, kickUsername: string) => Promise<void>;
    deleteMultipleStreamers: (items: any[]) => Promise<void>;
    toggleFavorite: (id: string) => void;
    toggleNotify: (id: string) => void;
    
    addGlobalStreamer: (username: string, tags: string, characters: string, links: any) => Promise<void>;
    editGlobalStreamer: (originalUsername: string, newUsername: string, tags: string, characters: string, links: any) => Promise<void>;
    undoAction: () => Promise<void>;
    lastAction: { type: string, description: string } | null;
}

const LiveContext = createContext<LiveContextType | null>(null);

// Utility: Wait function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchKickData = async (username: string, signal?: AbortSignal): Promise<{ kickData: KickChannelInfo, streamData: KickStreamInfo }> => {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const t = Date.now();
    try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://kick.com/api/v2/channels/${username}?t=${t}`)}`, { signal });
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
        throw e;
    }
};

export const LiveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [localStreamers, setLocalStreamers] = useLocalStorage<Streamer[]>('mtnews-streamers-v1', []);
    const [streamers, setStreamers] = useState<Streamer[]>([]);
    const [loading, setLoading] = useState(false);
    const [lastAction, setLastAction] = useState<{ type: string, description: string, payload: any } | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // 1. Prepare the full list of definitions (Local + Default)
    // We do NOT fetch data yet, just prepare the objects
    const getAllDefinitions = useCallback(() => {
        const defs: Streamer[] = [];
        
        // Local first
        localStreamers.forEach(l => defs.push({ ...l, isSystem: false }));
        
        // Defaults
        defaultStreamersList.forEach(userUrl => {
            const username = userUrl.split('/').pop()!;
            if (!defs.some(d => d.kickUsername.toLowerCase() === username.toLowerCase())) {
                defs.push({
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
        
        // Sort favorites to top initially
        return defs.sort((a, b) => (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1));
    }, [localStreamers]);

    // 2. Load Batch Function
    const loadBatch = useCallback(async (startIndex: number, count: number) => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setLoading(true);
        const allDefs = getAllDefinitions();
        const batch = allDefs.slice(startIndex, startIndex + count);

        // Populate initial placeholders if not present
        setStreamers(prev => {
            const next = [...prev];
            batch.forEach(item => {
                if (!next.find(s => s.id === item.id)) {
                    next.push(item);
                }
            });
            return next;
        });

        // Fetch sequentially with delay to prevent freeze
        for (const streamer of batch) {
            if (signal.aborted) break;
            
            // Skip if already loaded recently (cache 2 mins)
            const existing = streamers.find(s => s.id === streamer.id);
            if (existing?.kickData && (Date.now() - existing.lastUpdated < 120000)) continue;

            try {
                const data = await fetchKickData(streamer.kickUsername, signal);
                
                setStreamers(prev => prev.map(s => 
                    s.id === streamer.id 
                    ? { ...s, kickData: data.kickData, streamData: data.streamData, lastUpdated: Date.now() } 
                    : s
                ));

                // Anti-Freeze Delay: Wait 300ms between requests
                await delay(300); 

            } catch (e) {
                // Ignore errors for individual streamers
            }
        }
        
        setLoading(false);
    }, [getAllDefinitions, streamers]);

    // Actions
    const toggleFavorite = (id: string) => {
        setLocalStreamers(prev => {
            const s = prev.find(x => x.id === id);
            if (s) return prev.map(x => x.id === id ? { ...x, isFavorite: !x.isFavorite } : x);
            // If system, promote to local
            const sys = streamers.find(x => x.id === id);
            if (sys) return [...prev, { ...sys, isFavorite: true, isSystem: false }];
            return prev;
        });
        setStreamers(prev => prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
    };

    const toggleNotify = (id: string) => {
        setLocalStreamers(prev => {
            const s = prev.find(x => x.id === id);
            if (s) return prev.map(x => x.id === id ? { ...x, notificationsEnabled: !x.notificationsEnabled } : x);
            const sys = streamers.find(x => x.id === id);
            if (sys) return [...prev, { ...sys, notificationsEnabled: true, isSystem: false }];
            return prev;
        });
        setStreamers(prev => prev.map(s => s.id === id ? { ...s, notificationsEnabled: !s.notificationsEnabled } : s));
    };

    const addLocalStreamer = (s: Streamer) => {
        setLocalStreamers(prev => [s, ...prev]);
        setStreamers(prev => [s, ...prev]);
    };

    const deleteStreamer = async (id: string, isSystem: boolean, kickUsername: string) => {
        if (!isSystem) {
            setLocalStreamers(prev => prev.filter(s => s.id !== id));
            setStreamers(prev => prev.filter(s => s.id !== id));
            setLastAction({ type: 'delete', description: `Deleted ${kickUsername}`, payload: localStreamers.find(s => s.id === id) });
        }
    };

    const deleteMultipleStreamers = async (items: any[]) => {};
    const addGlobalStreamer = async (u: string, t: string, c: string, l: any) => {};
    const editGlobalStreamer = async (o: string, n: string, t: string, c: string, l: any) => {};
    const undoAction = async () => {
        if (lastAction?.type === 'delete' && lastAction.payload) {
            setLocalStreamers(prev => [...prev, lastAction.payload]);
            setStreamers(prev => [...prev, lastAction.payload]);
            setLastAction(null);
        }
    };

    return (
        <LiveContext.Provider value={{ 
            streamers, 
            loading, 
            loadBatch,
            totalStreamersCount: getAllDefinitions().length,
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
