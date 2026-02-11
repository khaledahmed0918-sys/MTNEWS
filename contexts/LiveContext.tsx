
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Streamer, KickChannelInfo, KickStreamInfo } from '../types';
import { useLocalStorage } from '../hooks';
import { logAction } from '../utils/logging';

const API_BASE = "https://dolabriform-fascinatedly-lecia.ngrok-free.dev";

interface LiveContextType {
    streamers: Streamer[];
    loading: boolean;
    refreshStreamers: () => Promise<void>;
    addLocalStreamer: (streamer: Streamer) => void;
    deleteStreamer: (id: string, isSystem: boolean, kickUsername: string) => Promise<void>;
    deleteMultipleStreamers: (items: {id: string, isSystem: boolean, kickUsername: string}[]) => Promise<void>;
    
    // Admin Actions
    addGlobalStreamer: (username: string, tags: string, characters: string, links: any) => Promise<void>;
    editGlobalStreamer: (originalUsername: string, newUsername: string, tags: string, characters: string, links: any) => Promise<void>;
    
    // Undo System
    undoAction: () => Promise<void>;
    lastAction: { type: string, description: string } | null;
}

const LiveContext = createContext<LiveContextType | null>(null);

// Helper to fetch Kick Data
const fetchKickData = async (username: string): Promise<{ kickData: KickChannelInfo, streamData: KickStreamInfo } | null> => {
    try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://kick.com/api/v2/channels/${username}`)}`);
        if(!response.ok) return null;
        
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
                id: livestream ? livestream.id : 0, is_live: livestream !== null, viewers: livestream ? livestream.viewers_count : 0,
                start_time: livestream ? (livestream.created_at || livestream.start_time) : '', title: livestream ? livestream.session_title : '',
                category_name: livestream?.categories?.[0]?.name || '', category_icon: livestream?.categories?.[0]?.image_url || '', thumbnail: livestream?.thumbnail?.url || ''
            }
        };
    } catch (e) { 
        return null; 
    }
};

export const LiveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [localStreamers, setLocalStreamers] = useLocalStorage<Streamer[]>('mtnews-streamers-v1', []);
    const [streamers, setStreamers] = useState<Streamer[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastAction, setLastAction] = useState<{ type: string, description: string, payload: any } | null>(null);

    // 1. Fetch Global Streamers & Merge with Local
    const refreshStreamers = useCallback(async () => {
        setLoading(true);
        let globals: any[] = [];
        try {
            const res = await fetch(`${API_BASE}/streamers`, { headers: { "ngrok-skip-browser-warning": "true" } });
            if (res.ok) globals = await res.json();
        } catch (e) { console.error("Failed to fetch global streamers"); }

        // Merge Logic: Global overrides Local
        const combined = new Map<string, Streamer>();

        // Process Globals First
        globals.forEach(g => {
            const s: Streamer = {
                id: `global-${g.username}`,
                kickUsername: g.username,
                tags: g.tags || [],
                characters: g.characters || [],
                links: g.links || {},
                isSystem: true,
                isFavorite: false, // Default, will overwrite if local exists
                notificationsEnabled: false,
                lastUpdated: 0,
                addedAt: new Date(g.createdAt).getTime(),
                customTitle: g.characters?.[0] || g.username
            };
            combined.set(g.username.toLowerCase(), s);
        });

        // Process Locals (Merge or Add)
        localStreamers.forEach(l => {
            const key = l.kickUsername.toLowerCase();
            if (combined.has(key)) {
                // If exists globally, just update local preferences (favorite/notify)
                const existing = combined.get(key)!;
                combined.set(key, { ...existing, isFavorite: l.isFavorite, notificationsEnabled: l.notificationsEnabled });
            } else {
                combined.set(key, { ...l, isSystem: false });
            }
        });

        // Fetch Live Data for All
        const finalStreamers = Array.from(combined.values());
        
        // Parallel Fetching in chunks of 5 to avoid rate limits
        const updatedStreamers: Streamer[] = [];
        for (let i = 0; i < finalStreamers.length; i += 5) {
            const chunk = finalStreamers.slice(i, i + 5);
            const promises = chunk.map(async (s) => {
                const liveInfo = await fetchKickData(s.kickUsername);
                if (liveInfo) {
                    return { ...s, kickData: liveInfo.kickData, streamData: liveInfo.streamData, lastUpdated: Date.now() };
                }
                return s;
            });
            const results = await Promise.all(promises);
            updatedStreamers.push(...results);
        }

        setStreamers(updatedStreamers);
        setLoading(false);
    }, [localStreamers]);

    // Initial Load & Polling
    useEffect(() => {
        refreshStreamers();
        const interval = setInterval(refreshStreamers, 180000); // 3 Minutes
        return () => clearInterval(interval);
    }, [refreshStreamers]);

    const addLocalStreamer = (s: Streamer) => {
        setLocalStreamers(prev => [...prev, s]);
    };

    const addGlobalStreamer = async (username: string, tags: string, characters: string, links: any) => {
        const res = await fetch(`${API_BASE}/streamers/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ username, tags, characters, links })
        });
        if (!res.ok) throw new Error("Failed to add streamer");
        
        setLastAction({
            type: 'ADD',
            description: `Added ${username}`,
            payload: { username } // To undo: remove
        });
        
        await refreshStreamers();
    };

    const deleteStreamer = async (id: string, isSystem: boolean, kickUsername: string) => {
        if (isSystem) {
            const res = await fetch(`${API_BASE}/streamers/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
                body: JSON.stringify({ username: kickUsername })
            });
            if (res.ok) {
                 // Save state for undo
                 const deletedData = streamers.find(s => s.kickUsername === kickUsername);
                 setLastAction({ type: 'DELETE', description: `Deleted ${kickUsername}`, payload: deletedData });
                 await refreshStreamers();
            }
        } else {
            const target = localStreamers.find(s => s.id === id);
            if(target) {
                setLocalStreamers(prev => prev.filter(s => s.id !== id));
                setLastAction({ type: 'DELETE_LOCAL', description: `Deleted ${target.kickUsername}`, payload: target });
            }
        }
    };

    const deleteMultipleStreamers = async (items: {id: string, isSystem: boolean, kickUsername: string}[]) => {
        const systemItems = items.filter(i => i.isSystem);
        const localItems = items.filter(i => !i.isSystem);
        const originalDataMap: any[] = [];

        // Delete Globals
        for (const item of systemItems) {
            const original = streamers.find(s => s.kickUsername === item.kickUsername);
            if(original) originalDataMap.push({ isSystem: true, data: original });
            
            await fetch(`${API_BASE}/streamers/remove`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
                body: JSON.stringify({ username: item.kickUsername })
            });
        }

        // Delete Locals
        if (localItems.length > 0) {
            setLocalStreamers(prev => {
                const idsToRemove = localItems.map(i => i.id);
                const kept = prev.filter(s => !idsToRemove.includes(s.id));
                const removed = prev.filter(s => idsToRemove.includes(s.id));
                removed.forEach(r => originalDataMap.push({ isSystem: false, data: r }));
                return kept;
            });
        }

        setLastAction({
            type: 'DELETE_MULTI',
            description: `Deleted ${items.length} streamers`,
            payload: originalDataMap
        });

        await refreshStreamers();
    };

    const editGlobalStreamer = async (originalUsername: string, newUsername: string, tags: string, characters: string, links: any) => {
        const originalData = streamers.find(s => s.kickUsername === originalUsername);
        
        const res = await fetch(`${API_BASE}/streamers/edit`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
             body: JSON.stringify({ username: originalUsername, newUsername, tags, characters, links })
        });

        if (res.ok && originalData) {
            setLastAction({
                type: 'EDIT',
                description: `Edited ${newUsername}`,
                payload: { originalData, newUsername } // Store original to revert
            });
            await refreshStreamers();
        }
    };

    const undoAction = async () => {
        if (!lastAction) return;
        const { type, payload } = lastAction;

        try {
            if (type === 'ADD') {
                await fetch(`${API_BASE}/streamers/remove`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
                    body: JSON.stringify({ username: payload.username })
                });
            } 
            else if (type === 'DELETE') {
                 // Re-add global
                 const s = payload as Streamer;
                 await addGlobalStreamer(s.kickUsername, s.tags.join(','), s.characters?.join(',') || '', s.links);
            }
            else if (type === 'DELETE_LOCAL') {
                 addLocalStreamer(payload as Streamer);
            }
            else if (type === 'DELETE_MULTI') {
                 // Revert multiple
                 for(const item of payload) {
                     if (item.isSystem) {
                         const s = item.data;
                         await addGlobalStreamer(s.kickUsername, s.tags.join(','), s.characters?.join(',') || '', s.links);
                     } else {
                         addLocalStreamer(item.data);
                     }
                 }
            }
            else if (type === 'EDIT') {
                 // Revert edit
                 const s = payload.originalData as Streamer;
                 await fetch(`${API_BASE}/streamers/edit`, {
                     method: 'POST',
                     headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
                     body: JSON.stringify({ 
                         username: payload.newUsername, 
                         newUsername: s.kickUsername, 
                         tags: s.tags.join(','), 
                         characters: s.characters?.join(',') || '',
                         links: s.links 
                     })
                });
            }
            
            setLastAction(null);
            await refreshStreamers();
            
        } catch(e) {
            console.error("Undo failed", e);
        }
    };

    return (
        <LiveContext.Provider value={{ 
            streamers, loading, refreshStreamers, 
            addLocalStreamer, deleteStreamer, deleteMultipleStreamers,
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
