
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef } from 'react';
import { Streamer, KickChannelInfo, KickStreamInfo, StreamerRequest } from '../types';
import { useLocalStorage } from '../hooks';
import { defaultStreamersList, API_BASE } from '../constants';
import { logAction } from '../utils/logging';

interface LiveContextType {
    streamers: Streamer[];
    loading: boolean;
    loadBatch: (startIndex: number, count: number) => Promise<void>; 
    totalStreamersCount: number;
    
    addLocalStreamer: (streamer: Streamer) => void;
    deleteStreamer: (id: string, isSystem: boolean, kickUsername: string) => Promise<void>;
    
    toggleFavorite: (id: string) => void;
    toggleNotify: (id: string) => Promise<boolean>;
    
    // Request System
    submitStreamerRequest: (username: string, tags: string, characters: string) => Promise<void>;
    getStreamerRequests: () => Promise<StreamerRequest[]>;
    deleteStreamerRequest: (id: string) => Promise<void>;
    acceptStreamerRequest: (id: string, username: string, tags: string[], characters: string[]) => Promise<void>;
}

const LiveContext = createContext<LiveContextType | null>(null);

// Utility: Wait function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const fetchKickData = async (username: string, signal?: AbortSignal): Promise<{ kickData: KickChannelInfo, streamData: KickStreamInfo } | null> => {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    const t = Date.now();
    try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://kick.com/api/v2/channels/${username}?t=${t}`)}`, { signal });
        
        if (response.status === 429) {
            console.warn(`Rate limit hit for ${username}. Retrying later.`);
            return null; // Return null to indicate soft failure
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
        // Suppress errors for individual failures to keep the batch running
        return null;
    }
};

export const LiveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [localStreamers, setLocalStreamers] = useLocalStorage<Streamer[]>('mtnews-streamers-v1', []);
    const [systemStreamers, setSystemStreamers] = useState<Streamer[]>([]);
    const [streamers, setStreamers] = useState<Streamer[]>([]);
    const [apiRequests, setApiRequests] = useState<StreamerRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const retryQueue = useRef<Set<string>>(new Set());

    // Fetch streamer requests from API
    const fetchRequests = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/streamerrequests`, { 
                headers: { "ngrok-skip-browser-warning": "true" } 
            });
            if (res.ok) {
                const data = await res.json();
                setApiRequests(data);
            }
        } catch (e) {
            console.warn("Failed to fetch streamer requests (Offline mode active)");
        }
    }, []);

    // Fetch System Streamers from API
    const fetchSystemStreamers = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/streamers`, { 
                headers: { "ngrok-skip-browser-warning": "true" } 
            });
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
            }
        } catch (e) {
            console.warn("Failed to fetch system streamers (Offline mode active)");
        }
    }, []);

    // Helper to generate full list of definitions in order
    const getAllDefinitions = useCallback(() => {
        const defs: Streamer[] = [];
        const seenUsernames = new Set<string>();

        // 1. Local (User added + Favorites)
        localStreamers.forEach(l => {
            const u = l.kickUsername.toLowerCase();
            if (!seenUsernames.has(u)) {
                defs.push({ ...l, isSystem: false });
                seenUsernames.add(u);
            }
        });

        // 2. System Streamers (From API)
        systemStreamers.forEach(sys => {
            const u = sys.kickUsername.toLowerCase();
            if (!seenUsernames.has(u)) {
                defs.push(sys);
                seenUsernames.add(u);
            }
        });

        // 3. Fallback Default List (only if system list is empty to prevent empty state on first load/fail)
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
        
        // Priority Sort: Favorites -> Rest
        return defs.sort((a, b) => (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1));
    }, [localStreamers, systemStreamers]);

    // Sorting Logic: Live (viewers desc) -> Offline
    const sortStreamers = (list: Streamer[]) => {
        return [...list].sort((a, b) => {
            // 1. Loaded vs Unloaded (Skeletons at bottom)
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
            
            // If both offline, prioritize favorites
            if (a.isFavorite && !b.isFavorite) return -1;
            if (!a.isFavorite && b.isFavorite) return 1;

            return 0; 
        });
    };

    // Load Batch with Concurrency Control and Retries
    const loadBatch = useCallback(async (startIndex: number, count: number) => {
        // Initial Fetch of metadata
        if (startIndex === 0 && systemStreamers.length === 0) {
             await Promise.all([fetchRequests(), fetchSystemStreamers()]);
        }

        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setLoading(true);
        const allDefs = getAllDefinitions();
        
        // If we already have live data for the requested range, don't re-fetch immediately (Persistence)
        // Just update state to ensure order is correct based on latest metadata
        const batch = allDefs.slice(startIndex, startIndex + count);
        
        setStreamers(prev => {
            // Merge existing data into new definitions
            const merged = batch.map(def => {
                const existing = prev.find(p => p.kickUsername.toLowerCase() === def.kickUsername.toLowerCase());
                if (existing && existing.kickData) {
                    return { ...def, kickData: existing.kickData, streamData: existing.streamData, lastUpdated: existing.lastUpdated };
                }
                return def;
            });
            
            // Append to previous list, avoiding duplicates
            const newMap = new Map(prev.map(i => [i.id, i]));
            merged.forEach(i => newMap.set(i.id, i));
            
            return sortStreamers(Array.from(newMap.values()));
        });

        // Concurrency Control
        const CONCURRENCY_LIMIT = 4;
        const processStreamer = async (streamer: Streamer) => {
            if (signal.aborted) return;

            // Check cache validity (2 mins)
            // If we have data, use it. If it's old, re-fetch.
            // If it's missing, fetch.
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
                // Failed: Add to retry queue (handled invisibly or next pass)
                retryQueue.current.add(streamer.id);
                // Simple Retry Strategy
                setTimeout(async () => {
                    if (!signal.aborted) {
                        const retryData = await fetchKickData(streamer.kickUsername, signal);
                        if(retryData) {
                             setStreamers(prev => {
                                const updated = prev.map(s => 
                                    s.id === streamer.id 
                                    ? { ...s, kickData: retryData.kickData, streamData: retryData.streamData, lastUpdated: Date.now() } 
                                    : s
                                );
                                return sortStreamers(updated);
                            });
                        }
                    }
                }, 3000); // 3s delay retry
            }
        };

        // Filter batch for items that actually need updating
        const itemsToFetch = batch.filter(s => {
             const existing = streamers.find(ex => ex.id === s.id);
             return !existing?.kickData || (Date.now() - existing.lastUpdated >= 120000);
        });

        // Process in chunks
        for (let i = 0; i < itemsToFetch.length; i += CONCURRENCY_LIMIT) {
            if (signal.aborted) break;
            const chunk = itemsToFetch.slice(i, i + CONCURRENCY_LIMIT);
            await Promise.allSettled(chunk.map(processStreamer));
            await delay(200); 
        }
        
        setLoading(false);
    }, [getAllDefinitions, streamers, fetchRequests, fetchSystemStreamers, systemStreamers.length]);

    const toggleFavorite = (id: string) => {
        setLocalStreamers(prev => {
            const exists = prev.find(x => x.id === id);
            if (exists) return prev.map(x => x.id === id ? { ...x, isFavorite: !x.isFavorite } : x);
            
            // Promote to local
            const fromCurrent = streamers.find(x => x.id === id);
            if (fromCurrent) return [...prev, { ...fromCurrent, isFavorite: true, isSystem: false }];
            
            return prev;
        });
        
        setStreamers(prev => sortStreamers(prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s)));
    };

    const toggleNotify = async (id: string): Promise<boolean> => {
        // Notification Logic
        if (!("Notification" in window)) {
            alert("This browser does not support desktop notifications");
            return false;
        }

        if (Notification.permission !== "granted") {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                return false;
            }
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
            // Delete from System API
            try {
                await fetch(`${API_BASE}/streamers/remove`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
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

    // --- API Request Methods ---

    const submitStreamerRequest = async (username: string, tags: string, characters: string) => {
        await fetch(`${API_BASE}/streamrequest/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ username, tags, characters })
        });
        await fetchRequests();
    };

    const getStreamerRequests = async () => {
        // Return current state or fetch fresh
        await fetchRequests();
        return apiRequests;
    };

    const deleteStreamerRequest = async (id: string) => {
        await fetch(`${API_BASE}/streamrequest/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ id })
        });
        await fetchRequests();
    };
    
    const acceptStreamerRequest = async (id: string, username: string, tags: string[], characters: string[]) => {
        // 1. Remove the Request
        await deleteStreamerRequest(id);

        // 2. Add to Main Streamer List (API)
        try {
            await fetch(`${API_BASE}/streamers/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
                body: JSON.stringify({ 
                    username: username, 
                    tags: tags, 
                    characters: characters,
                    links: {} 
                })
            });
            logAction('admin', 'Accepted Streamer Request', `${username}`);
        } catch (e) {
            console.error("Failed to add streamer to backend", e);
        }

        // 3. Refresh Data
        await fetchSystemStreamers();
        // Force update of streamers list view
        setStreamers(prev => sortStreamers([...prev])); 
    };

    return (
        <LiveContext.Provider value={{ 
            streamers, 
            loading, 
            loadBatch,
            totalStreamersCount: getAllDefinitions().length,
            addLocalStreamer, deleteStreamer,
            toggleFavorite, toggleNotify,
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
