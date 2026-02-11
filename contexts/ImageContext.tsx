
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { ImageData, ImageCategory, ImageRequest } from '../types';
import { useLocalStorage } from '../hooks';

interface ImageContextType {
    dynamicImages: ImageData[];
    categories: ImageCategory[];
    requests: ImageRequest[]; 
    myRequestIds: string[]; 
    loading: boolean;
    refreshImages: () => void;
    refreshRequests: () => void;
    uploadImageFile: (file: File, tags: string, signal?: AbortSignal) => Promise<void>;
    uploadImageUrl: (url: string, tags: string, signal?: AbortSignal) => Promise<void>;
    updateImageTags: (id: string, tags: string, signal?: AbortSignal) => Promise<void>;
    deleteImage: (id: string, signal?: AbortSignal) => Promise<void>;
    addCategory: (name: string, tags: string[], signal?: AbortSignal) => Promise<void>;
    removeCategory: (id: string, signal?: AbortSignal) => Promise<void>;
    updateCategoryTags: (id: string, tags: string[], signal?: AbortSignal) => Promise<void>;
    submitImageRequest: (files: File[], urls: string[], tags: string, signal?: AbortSignal) => Promise<void>;
    deleteImageRequest: (requestId: string, signal?: AbortSignal) => Promise<void>;
}

const ImageContext = createContext<ImageContextType | null>(null);

const API_BASE = "https://dolabriform-fascinatedly-lecia.ngrok-free.dev";

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dynamicImages, setDynamicImages] = useState<ImageData[]>([]);
    const [categories, setCategories] = useState<ImageCategory[]>([]);
    const [requests, setRequests] = useState<ImageRequest[]>([]);
    const [myRequestIds, setMyRequestIds] = useLocalStorage<string[]>('mtnews-my-requests', []);
    const [loading, setLoading] = useState(true);

    // Keep track of the abort controller for the main fetch
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchImages = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        try {
            // Fetch Images
            const resImages = await fetch(`${API_BASE}/images`, {
                headers: { "ngrok-skip-browser-warning": "true" },
                signal
            });
            if (resImages.ok) {
                const data = await resImages.json();
                const mapped: ImageData[] = data.map((item: any) => {
                    let finalUrl = item.url;
                    if (item.type === 'file' && item.path) {
                        const cleanPath = item.path.startsWith('uploads/') ? item.path : `uploads/${item.path}`;
                        finalUrl = `${API_BASE}/${cleanPath}`;
                    }
                    return { id: item.id, url: finalUrl, tags: item.tags || [], apiType: item.type };
                });
                setDynamicImages(mapped);
            }

            // Fetch Categories
            const resCats = await fetch(`${API_BASE}/icategorys`, {
                headers: { "ngrok-skip-browser-warning": "true" },
                signal
            });
            if(resCats.ok) {
                setCategories(await resCats.json());
            }

        } catch (e: any) {
            if (e.name !== 'AbortError') {
                console.error("Image fetch failed", e);
            }
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, []);

    const fetchRequests = useCallback(async (signal?: AbortSignal) => {
        try {
            const res = await fetch(`${API_BASE}/images/request`, {
                headers: { "ngrok-skip-browser-warning": "true" },
                signal
            });
            if (res.ok) {
                const data = await res.json();
                const mapped: ImageRequest[] = data.map((req: any) => {
                    let finalUrl = req.url;
                    if (req.type === 'file' && req.path) {
                         const cleanPath = req.path.startsWith('uploads/') ? req.path : `uploads/${req.path}`;
                         finalUrl = `${API_BASE}/${cleanPath}`;
                    }
                    return { ...req, url: finalUrl };
                });
                setRequests(mapped);
            }
        } catch (e: any) {
            if (e.name !== 'AbortError') {
                // Silent fail
            }
        }
    }, []);

    // Initial load and cleanup on unmount
    useEffect(() => {
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        fetchImages(signal);
        fetchRequests(signal);

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchImages, fetchRequests]);

    const refreshImages = () => {
        // Cancel previous if pending? Maybe not necessary for refresh, 
        // but good practice if user spams refresh.
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        fetchImages(abortControllerRef.current.signal);
    };

    const refreshRequests = () => {
        if (abortControllerRef.current) {
             fetchRequests(abortControllerRef.current.signal);
        } else {
             // Fallback if controller missing (shouldn't happen if mounted)
             fetchRequests();
        }
    };

    const uploadImageUrl = async (url: string, tags: string, signal?: AbortSignal) => {
        const res = await fetch(`${API_BASE}/upload/url`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify({ url, tags }),
            signal
        });
        if (!res.ok) throw new Error("Upload failed");
        await fetchImages(signal);
    };

    const uploadImageFile = async (file: File, tags: string, signal?: AbortSignal) => {
        const fd = new FormData();
        fd.append("image", file);
        fd.append("tags", tags);
        const res = await fetch(`${API_BASE}/upload/image`, {
            method: "POST",
            headers: { "ngrok-skip-browser-warning": "true" },
            body: fd,
            signal
        });
        if (!res.ok) throw new Error("Upload failed");
        await fetchImages(signal);
    };

    const updateImageTags = async (id: string, tags: string, signal?: AbortSignal) => {
        const res = await fetch(`${API_BASE}/image/${id}/tags`, {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify({ tags }),
            signal
        });
        if (!res.ok) throw new Error("Update failed");
        await fetchImages(signal);
    };

    const deleteImage = async (id: string, signal?: AbortSignal) => {
        const res = await fetch(`${API_BASE}/image/${id}`, {
            method: "DELETE",
            headers: { "ngrok-skip-browser-warning": "true" },
            signal
        });
        if (!res.ok) throw new Error(`Delete failed`);
        await fetchImages(signal);
    };

    // --- CATEGORY METHODS ---

    const addCategory = async (name: string, tags: string[], signal?: AbortSignal) => {
        const res = await fetch(`${API_BASE}/icategory/add`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ name, tags }),
            signal
        });
        if(!res.ok) throw new Error("Failed to add category");
        await fetchImages(signal); 
    };

    const removeCategory = async (id: string, signal?: AbortSignal) => {
        const res = await fetch(`${API_BASE}/icategory/remove`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ id }),
            signal
        });
        if(!res.ok) throw new Error("Failed to remove category");
        await fetchImages(signal);
    };

    const updateCategoryTags = async (id: string, tags: string[], signal?: AbortSignal) => {
        const res = await fetch(`${API_BASE}/icategory/${id}/tags`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ tags }),
            signal
        });
        if(!res.ok) throw new Error("Failed to update category tags");
        await fetchImages(signal);
    };

    // --- REQUEST METHODS ---

    const submitImageRequest = async (files: File[], urls: string[], tags: string, signal?: AbortSignal) => {
        const fd = new FormData();
        const requestData: any[] = [];

        files.forEach(f => {
            fd.append('files', f);
            requestData.push({ type: 'file', tags });
        });

        urls.forEach(url => {
            requestData.push({ type: 'url', url, tags });
        });

        fd.append('images', JSON.stringify(requestData));

        const res = await fetch(`${API_BASE}/images/request`, {
            method: 'POST',
            headers: { "ngrok-skip-browser-warning": "true" },
            body: fd,
            signal
        });

        if (res.ok) {
            const data = await res.json();
            if (data.requests) {
                const newIds = data.requests.map((r: any) => r.id);
                setMyRequestIds(prev => [...prev, ...newIds]);
            }
            try { await fetchRequests(signal); } catch (e) {}
        } else {
            throw new Error("Request Submission Failed");
        }
    };

    const deleteImageRequest = async (requestId: string, signal?: AbortSignal) => {
        const res = await fetch(`${API_BASE}/images/request/remove`, {
            method: 'POST',
            headers: { 
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true" 
            },
            body: JSON.stringify({ requestID: requestId }),
            signal
        });

        if (res.ok) {
            setMyRequestIds(prev => prev.filter(id => id !== requestId));
            try { await fetchRequests(signal); } catch (e) {}
        } else {
            throw new Error("Failed to remove request");
        }
    };

    return (
        <ImageContext.Provider value={{ 
            dynamicImages, 
            categories,
            requests,
            myRequestIds,
            loading, 
            refreshImages,
            refreshRequests,
            uploadImageFile,
            uploadImageUrl,
            updateImageTags,
            deleteImage,
            addCategory,
            removeCategory,
            updateCategoryTags,
            submitImageRequest,
            deleteImageRequest
        }}>
            {children}
        </ImageContext.Provider>
    );
};

export const useImages = () => {
    const context = useContext(ImageContext);
    if(!context) throw new Error("useImages must be used within ImageProvider");
    return context;
};
