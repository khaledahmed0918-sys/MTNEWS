
import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useEffect } from 'react';
import { Clip, ClipRequest } from '../types';
import { robustFetch } from '../utils/apiWrapper';
import { API_BASE } from '../constants';
import { logAction } from '../utils/logging';

interface ClipContextType {
    clips: Clip[];
    requests: ClipRequest[];
    loading: boolean;
    fetchClips: () => Promise<void>;
    fetchRequests: () => Promise<void>;
    addClip: (content: string, file: File | null, url: string) => Promise<void>;
    deleteClip: (id: string, content: string) => Promise<void>;
    editClip: (id: string, content: string) => Promise<void>;
    submitRequest: (content: string, file: File | null, url: string) => Promise<void>;
    deleteRequest: (id: string) => Promise<void>;
    acceptRequest: (req: ClipRequest, newContent?: string) => Promise<void>;
}

const ClipContext = createContext<ClipContextType | null>(null);

export const ClipProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [clips, setClips] = useState<Clip[]>([]);
    const [requests, setRequests] = useState<ClipRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchClips = useCallback(async () => {
        setLoading(true);
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        
        try {
            const res = await robustFetch('/clips', {
                signal: abortControllerRef.current.signal,
                skipErrorLog: true
            });
            if (res.ok) {
                const data = await res.json();
                setClips(data.reverse());
            }
        } catch (e: any) {
            // Silent error for polling
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRequests = useCallback(async () => {
        try {
            const res = await robustFetch('/cliprequests', { skipErrorLog: true });
            if (res.ok) {
                const data = await res.json();
                setRequests(data.reverse());
            }
        } catch (e) {
            // Silent error
        }
    }, []);

    // Polling for Clips
    useEffect(() => {
        fetchClips();
        const interval = setInterval(fetchClips, 15000);
        return () => clearInterval(interval);
    }, [fetchClips]);

    const addClip = async (content: string, file: File | null, url: string) => {
        const fd = new FormData();
        fd.append('content', content);
        if (file) fd.append('clip', file);
        if (url) fd.append('url', url);

        // FormData headers are handled automatically by robustFetch logic now
        const res = await robustFetch('/clip/add', {
            method: 'POST',
            body: fd
        });

        if (!res.ok) throw new Error("Failed to add clip");
        await fetchClips();
    };

    const deleteClip = async (id: string, content: string) => {
        const res = await robustFetch('/clip/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        if (!res.ok) throw new Error("Failed to delete clip");
        
        setClips(prev => prev.filter(c => c.id !== id));
        logAction('admin', 'Deleted Clip', `Content: ${content}`);
    };

    const editClip = async (id: string, content: string) => {
        const res = await robustFetch('/clip/edit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, content })
        });

        if (!res.ok) throw new Error("Failed to edit clip");
        await fetchClips();
    };

    const submitRequest = async (content: string, file: File | null, url: string) => {
        const fd = new FormData();
        fd.append('content', content);
        if (file) fd.append('clip', file);
        if (url) fd.append('url', url);

        const res = await robustFetch('/cliprequest/add', {
            method: 'POST',
            body: fd
        });

        if (!res.ok) throw new Error("Failed to submit request");
    };

    const deleteRequest = async (id: string) => {
        const res = await robustFetch('/cliprequest/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });

        if (!res.ok) throw new Error("Failed to delete request");
        setRequests(prev => prev.filter(r => r.id !== id));
    };

    const acceptRequest = async (req: ClipRequest, newContent?: string) => {
        const finalContent = newContent || req.content;
        const finalUrl = req.type === 'file' && req.path ? `${API_BASE}/${req.path.replace(/^uploads\//, '')}` : req.url;
        
        const fd = new FormData();
        fd.append('content', finalContent);
        fd.append('url', finalUrl); 

        const res = await robustFetch('/clip/add', {
            method: 'POST',
            body: fd
        });

        if(!res.ok) throw new Error("Failed to accept request");

        await deleteRequest(req.id);
        logAction('admin', 'Accepted Clip Request', `Content: ${finalContent}`);
        
        await fetchClips();
    };

    return (
        <ClipContext.Provider value={{
            clips,
            requests,
            loading,
            fetchClips,
            fetchRequests,
            addClip,
            deleteClip,
            editClip,
            submitRequest,
            deleteRequest,
            acceptRequest
        }}>
            {children}
        </ClipContext.Provider>
    );
};

export const useClips = () => {
    const context = useContext(ClipContext);
    if (!context) throw new Error("useClips must be used within ClipProvider");
    return context;
};
