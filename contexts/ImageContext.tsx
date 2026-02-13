
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { ImageData, ImageCategory, ImageRequest } from '../types';
import { useLocalStorage } from '../hooks';
import { API_BASE } from '../constants';
import { robustFetch } from '../utils/apiWrapper';

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

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dynamicImages, setDynamicImages] = useState<ImageData[]>([]);
    const [categories, setCategories] = useState<ImageCategory[]>([]);
    const [requests, setRequests] = useState<ImageRequest[]>([]);
    const [myRequestIds, setMyRequestIds] = useLocalStorage<string[]>('mtnews-my-requests', []);
    const [loading, setLoading] = useState(true);

    const abortControllerRef = useRef<AbortController | null>(null);

    // Optimized Data Fetching: Parallel Requests
    const fetchData = useCallback(async (signal?: AbortSignal) => {
        try {
            // Fetch Images and Categories in PARALLEL for maximum speed
            const [resImages, resCats] = await Promise.all([
                robustFetch('/images', { signal, skipErrorLog: true, retryForever: true }),
                robustFetch('/icategorys', { signal, skipErrorLog: true, retryForever: true })
            ]);

            if (resImages.ok) {
                const data = await resImages.json();
                const mapped: ImageData[] = data.map((item: any) => {
                    let finalUrl = item.url;
                    if (item.type === 'file' && item.path) {
                        const cleanPath = item.path.replace(/\\/g, '/');
                        finalUrl = `${API_BASE}/${cleanPath}`;
                    }
                    return { id: item.id, url: finalUrl, tags: item.tags || [], apiType: item.type };
                });
                setDynamicImages(mapped);
            }

            if (resCats.ok) {
                setCategories(await resCats.json());
            }

        } catch (e: any) {
            // Retry logic handled inside robustFetch(retryForever: true)
        } finally {
            if (!signal?.aborted) {
                setLoading(false);
            }
        }
    }, []);

    const fetchRequests = useCallback(async (signal?: AbortSignal) => {
        try {
            // FIX: Endpoint corrected to '/images/requests' (plural) based on backend
            const res = await robustFetch('/images/requests', { signal, skipErrorLog: true, retryForever: true });
            if (res.ok) {
                const data = await res.json();
                const mapped: ImageRequest[] = data.map((req: any) => {
                    let finalUrl = req.url;
                    if (req.type === 'file' && req.path) {
                         const cleanPath = req.path.replace(/\\/g, '/');
                         finalUrl = `${API_BASE}/${cleanPath}`;
                    }
                    return { ...req, url: finalUrl };
                });
                setRequests(mapped);
            }
        } catch (e) {
            // Silent fail
        }
    }, []);

    // Robust Polling Mechanism
    useEffect(() => {
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        // Initial Load
        fetchData(signal);
        fetchRequests(signal);

        // Interval Polling
        const intervalId = setInterval(() => {
            if (!document.hidden) { 
                fetchData(signal);
                fetchRequests(signal);
            }
        }, 5000); // Polling every 5 seconds for faster updates

        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            clearInterval(intervalId);
        };
    }, [fetchData, fetchRequests]);

    const refreshImages = () => fetchData();
    const refreshRequests = () => fetchRequests();

    const uploadImageUrl = async (url: string, tags: string, signal?: AbortSignal) => {
        const res = await robustFetch('/upload/url', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, tags }),
            signal
        });
        if (!res.ok) throw new Error("Upload failed");
        await fetchData(signal);
    };

    const uploadImageFile = async (file: File, tags: string, signal?: AbortSignal) => {
        const fd = new FormData();
        fd.append("image", file);
        fd.append("tags", tags);
        const res = await robustFetch('/upload/image', {
            method: "POST",
            body: fd,
            signal
        });
        if (!res.ok) throw new Error("Upload failed");
        await fetchData(signal);
    };

    const updateImageTags = async (id: string, tags: string, signal?: AbortSignal) => {
        const res = await robustFetch(`/image/${id}/tags`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tags: tags.split(/[,،]/).map(t => t.trim()).filter(Boolean) }),
            signal
        });
        if (!res.ok) throw new Error("Update failed");
        await fetchData(signal);
    };

    const deleteImage = async (id: string, signal?: AbortSignal) => {
        const res = await robustFetch(`/image/${id}`, {
            method: "DELETE",
            signal
        });
        if (!res.ok) throw new Error(`Delete failed`);
        setDynamicImages(prev => prev.filter(img => img.id !== id));
        await fetchData(signal);
    };

    const addCategory = async (name: string, tags: string[], signal?: AbortSignal) => {
        const res = await robustFetch('/icategory/add', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, tags }),
            signal
        });
        if(!res.ok) throw new Error("Failed to add category");
        await fetchData(signal); 
    };

    const removeCategory = async (id: string, signal?: AbortSignal) => {
        const res = await robustFetch('/icategory/remove', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
            signal
        });
        if(!res.ok) throw new Error("Failed to remove category");
        await fetchData(signal);
    };

    const updateCategoryTags = async (id: string, tags: string[], signal?: AbortSignal) => {
        const res = await robustFetch(`/icategory/${id}/tags`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tags }),
            signal
        });
        if(!res.ok) throw new Error("Failed to update category tags");
        await fetchData(signal);
    };

    const submitImageRequest = async (files: File[], urls: string[], tags: string, signal?: AbortSignal) => {
        const fd = new FormData();
        files.forEach(f => fd.append('files', f));

        const metadata = [
            ...files.map(() => ({ type: 'file', tags })),
            ...urls.map(url => ({ type: 'url', url, tags }))
        ];
        
        fd.append('images', JSON.stringify(metadata));

        // Note: Endpoint for CREATING request is /images/request (singular) per backend
        const res = await robustFetch('/images/request', {
            method: 'POST',
            body: fd,
            signal
        });

        if (res.ok) {
            const data = await res.json();
            if (data.requests) {
                const newIds = data.requests.map((r: any) => r.id);
                setMyRequestIds(prev => [...prev, ...newIds]);
            }
            await fetchRequests(signal);
        } else {
            throw new Error("Request Submission Failed");
        }
    };

    const deleteImageRequest = async (requestId: string, signal?: AbortSignal) => {
        const res = await robustFetch('/images/request/remove', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ requestID: requestId }),
            signal
        });

        if (res.ok) {
            setMyRequestIds(prev => prev.filter(id => id !== requestId));
            setRequests(prev => prev.filter(r => r.id !== requestId));
            await fetchRequests(signal);
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
