
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { Streamer, KickChannelInfo, KickStreamInfo, StreamerRequest } from '../types';
import { useLocalStorage } from '../hooks';
import { defaultStreamersList } from '../constants';
import { logAction } from '../utils/logging';
import { robustFetch } from '../utils/apiWrapper';

interface LiveContextType {
    streamers: Streamer[];
    loading: boolean;
    error: boolean;
    loadBatch: (startIndex: number, count: number) => Promise<void>; 
    refresh: () => Promise<void>;
    totalStreamersCount: number;
    addLocalStreamer: (streamer: Streamer) => void;
    deleteStreamer: (id: string, isSystem: boolean, kickUsername: string) => Promise<void>;
    toggleFavorite: (id: string) => void;
    toggleNotify: (id: string) => Promise<boolean>;
    submitStreamerRequest: (username: string, tags: string, characters: string) => Promise<void>;
    getStreamerRequests: () => Promise<StreamerRequest[]>;
    deleteStreamerRequest: (id: string) => Promise<void>;
    acceptStreamerRequest: (id: string, username: string, tags: string[], characters: string[]) => Promise<void>;
}

const LiveContext = createContext<LiveContextType | null>(null);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchKickData = async (username: string, signal?: AbortSignal): Promise<{ kickData: KickChannelInfo, streamData: KickStreamInfo } | null> => {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const t = Date.now();
    try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://kick.com/api/v2/channels/${username}?t=${t}`)}`, { signal });
        
        if (response.status === 429) {
            console.warn(`Rate limit hit for ${username}. Retrying later.`);
            return null; 
        }
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
    const [localStreamers, setLocalStreamers] = useLocalStorage<Streamer[]>('mtnews-streamers-v1', []);
    const [systemStreamers, setSystemStreamers] = useState<Streamer[]>([]);
    const [streamers, setStreamers] = useState<Streamer[]>([]);
    const [apiRequests, setApiRequests] = useState<StreamerRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchRequests = useCallback(async () => {
        try {
            const res = await robustFetch('/streamerrequests', { skipErrorLog: true });
            if (res.ok) {
                const data = await res.json();
                setApiRequests(data);
            }
        } catch (e) {
            // Silent fail
        }
    }, []);

    const fetchSystemStreamers = useCallback(async () => {
        try {
            const res = await robustFetch('/streamers', { skipErrorLog: true });
            if (res.ok) {
                const data = await res.json();
                const mapped: Streamer[] = data.map((s: any) => ({
                    id: s.id || `sys-${s.username}`,
                    kickUsername: s.username,
                    tags: s.tags || [],
                    characters: s.characters || [],
                    links: s.links || {},
                    isSystem: true,
                    isFavorite: false,
                    notificationsEnabled: false,
                    lastUpdated: 0,
                    addedAt: s.createdAt ? new Date(s.createdAt).getTime() : Date.now(),
                }));
                setSystemStreamers(mapped);
                return true;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }, []);

    const getAllDefinitions = useCallback(() => {
        const defs: Streamer[] = [];
        const seenUsernames = new Set<string>();

        localStreamers.forEach(l => {
            const u = l.kickUsername.toLowerCase();
            if (!seenUsernames.has(u)) {
                defs.push({ ...l, isSystem: false });
                seenUsernames.add(u);
            }
        });

        systemStreamers.forEach(sys => {
            const u = sys.kickUsername.toLowerCase();
            if (!seenUsernames.has(u)) {
                defs.push(sys);
                seenUsernames.add(u);
            }
        });

        if (systemStreamers.length === 0) {
            defaultStreamersList.forEach(userUrl => {
                const username = userUrl.split('/').pop()!;
                const u = username.toLowerCase();
                if (!seenUsernames.has(u)) {
                    defs.push({
                        id: `def-${username}`,
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
                    seenUsernames.add(u);
                }
            });
        }
        return defs.sort((a, b) => (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1));
    }, [localStreamers, systemStreamers]);

    const sortStreamers = (list: Streamer[]) => {
        return [...list].sort((a, b) => {
            const aLoaded = !!a.kickData;
            const bLoaded = !!b.kickData;
            if (aLoaded && !bLoaded) return -1;
            if (!aLoaded && bLoaded) return 1;

            const aLive = a.streamData?.is_live || false;
            const bLive = b.streamData?.is_live || false;
            
            if (aLive && !bLive) return -1;
            if (!aLive && bLive) return 1;
            
            if (aLive && bLive) {
                return (b.streamData?.viewers || 0) - (a.streamData?.viewers || 0);
            }
            
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;

            return 0; 
        });
    };

    const loadBatch = useCallback(async (startIndex: number, count: number) => {
        setError(false);
        if (startIndex === 0) {
             const [_, success] = await Promise.all([fetchRequests(), fetchSystemStreamers()]);
             if (success === false) {
                 // Even if system fetch fails, we might still have local streamers, so don't hard block unless critical
             }
        }

        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setLoading(true);
        const allDefs = getAllDefinitions();
        
        // If we have definitions but API failed, we can still show them without data?
        // But the user requested error state if fetch fails. 
        // We'll treat system fetch failure as minor error unless default list also empty?
        
        const batch = allDefs.slice(startIndex, startIndex + count);
        
        setStreamers(prev => {
            const merged = batch.map(def => {
                const existing = prev.find(p => p.kickUsername.toLowerCase() === def.kickUsername.toLowerCase());
                if (existing && existing.kickData) {
                    return { ...def, kickData: existing.kickData, streamData: existing.streamData, lastUpdated: existing.lastUpdated };
                }
                return def;
            });
            const newMap = new Map<string, Streamer>(prev.map(i => [i.id, i]));
            merged.forEach(i => newMap.set(i.id, i));
            return sortStreamers(Array.from(newMap.values()));
        });

        const CONCURRENCY_LIMIT = 4;
        let fetchErrors = 0;

        const processStreamer = async (streamer: Streamer) => {
            if (signal.aborted) return;
            const existing = streamers.find(s => s.id === streamer.id);
            if (existing?.kickData && (Date.now() - existing.lastUpdated < 120000)) return;

            const data = await fetchKickData(streamer.kickUsername, signal);
            
            if (data) {
                setStreamers(prev => {
                    const updated = prev.map(s => 
                        s.id === streamer.id 
                        ? { ...s, kickData: data.kickData, streamData: data.streamData, lastUpdated: Date.now() } 
                        : s
                    );
                    return sortStreamers(updated);
                });
            } else {
                fetchErrors++;
            }
        };

        const itemsToFetch = batch.filter(s => {
             const existing = streamers.find(ex => ex.id === s.id);
             return !existing?.kickData || (Date.now() - existing.lastUpdated >= 120000);
        });

        for (let i = 0; i < itemsToFetch.length; i += CONCURRENCY_LIMIT) {
            if (signal.aborted) break;
            const chunk = itemsToFetch.slice(i, i + CONCURRENCY_LIMIT);
            await Promise.allSettled(chunk.map(processStreamer));
            await delay(200); 
        }
        
        if (fetchErrors === itemsToFetch.length && itemsToFetch.length > 0) {
            // Only set error if ALL fetches in batch failed (likely network issue)
            setError(true);
        }
        
        setLoading(false);
    }, [getAllDefinitions, streamers, fetchRequests, fetchSystemStreamers]);

    const refresh = async () => {
        setStreamers([]);
        await loadBatch(0, 12);
    };

    const toggleFavorite = (id: string) => {
        setLocalStreamers(prev => {
            const exists = prev.find(x => x.id === id);
            if (exists) return prev.map(x => x.id === id ? { ...x, isFavorite: !x.isFavorite } : x);
            const fromCurrent = streamers.find(x => x.id === id);
            if (fromCurrent) return [...prev, { ...fromCurrent, isFavorite: true, isSystem: false }];
            return prev;
        });
        setStreamers(prev => sortStreamers(prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s)));
    };

    const toggleNotify = async (id: string): Promise<boolean> => {
        if (!("Notification" in window)) return false;
        if (Notification.permission !== "granted") {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") return false;
        }
        setLocalStreamers(prev => {
            const exists = prev.find(x => x.id === id);
            if (exists) return prev.map(x => x.id === id ? { ...x, notificationsEnabled: !x.notificationsEnabled } : x);
             const fromCurrent = streamers.find(x => x.id === id);
            if (fromCurrent) return [...prev, { ...fromCurrent, notificationsEnabled: true, isSystem: false }];
            return prev;
        });
        setStreamers(prev => prev.map(s => s.id === id ? { ...s, notificationsEnabled: !s.notificationsEnabled } : s));
        return true;
    };

    const addLocalStreamer = (s: Streamer) => {
        setLocalStreamers(prev => [s, ...prev]);
        setStreamers(prev => sortStreamers([s, ...prev]));
    };

    const deleteStreamer = async (id: string, isSystem: boolean, kickUsername: string) => {
        if (isSystem) {
            try {
                await robustFetch('/streamers/remove', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: kickUsername })
                });
                await fetchSystemStreamers();
                setStreamers(prev => prev.filter(s => s.id !== id));
            } catch (e) {
                console.error("Failed to delete system streamer", e);
            }
        } else {
            setLocalStreamers(prev => prev.filter(s => s.id !== id));
            setStreamers(prev => prev.filter(s => s.id !== id));
        }
    };

    const submitStreamerRequest = async (username: string, tags: string, characters: string) => {
        await robustFetch('/streamrequest/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, tags, characters })
        });
        await fetchRequests();
    };

    const getStreamerRequests = async () => {
        await fetchRequests();
        return apiRequests;
    };

    const deleteStreamerRequest = async (id: string) => {
        await robustFetch('/streamrequest/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        await fetchRequests();
    };
    
    const acceptStreamerRequest = async (id: string, username: string, tags: string[], characters: string[]) => {
        await deleteStreamerRequest(id);
        try {
            await robustFetch('/streamers/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, tags, characters, links: {} })
            });
            logAction('admin', 'Accepted Streamer Request', `${username}`);
        } catch (e) {
            // Silent error
        }
        await fetchSystemStreamers();
        setStreamers(prev => sortStreamers([...prev])); 
    };

    return (
        <LiveContext.Provider value={{ 
            streamers, loading, error, refresh, loadBatch, totalStreamersCount: getAllDefinitions().length,
            addLocalStreamer, deleteStreamer, toggleFavorite, toggleNotify,
            submitStreamerRequest, getStreamerRequests, deleteStreamerRequest, acceptStreamerRequest
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
