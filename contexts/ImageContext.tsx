
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ImageData, ImageCategory, ImageRequest } from '../types';
import { useLocalStorage } from '../hooks';

interface ImageContextType {
    dynamicImages: ImageData[];
    categories: ImageCategory[];
    requests: ImageRequest[]; // All pending requests (fetched)
    myRequestIds: string[]; // Local storage IDs for the current user
    loading: boolean;
    refreshImages: () => void;
    refreshRequests: () => void;
    uploadImageFile: (file: File, tags: string, signal?: AbortSignal) => Promise<void>;
    uploadImageUrl: (url: string, tags: string, signal?: AbortSignal) => Promise<void>;
    updateImageTags: (id: string, tags: string, signal?: AbortSignal) => Promise<void>;
    deleteImage: (id: string, signal?: AbortSignal) => Promise<void>;
    // Category methods
    addCategory: (name: string, tags: string[], signal?: AbortSignal) => Promise<void>;
    removeCategory: (id: string, signal?: AbortSignal) => Promise<void>;
    updateCategoryTags: (id: string, tags: string[], signal?: AbortSignal) => Promise<void>;
    // Request methods
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

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Images
            const resImages = await fetch(`${API_BASE}/images`, {
                headers: { "ngrok-skip-browser-warning": "true" }
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
                headers: { "ngrok-skip-browser-warning": "true" }
            });
            if(resCats.ok) {
                setCategories(await resCats.json());
            }

        } catch (e) {
            // Silent fail for network issues
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRequests = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/images/request`, {
                headers: { "ngrok-skip-browser-warning": "true" }
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
        } catch (e) {
            // Silent fail to avoid console spam on polling
        }
    }, []);

    useEffect(() => {
        fetchImages();
        fetchRequests();
    }, [fetchImages, fetchRequests]);

    const refreshImages = () => {
        fetchImages();
    };

    const refreshRequests = () => {
        fetchRequests();
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
        await fetchImages();
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
        await fetchImages();
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
        await fetchImages();
    };

    const deleteImage = async (id: string, signal?: AbortSignal) => {
        const res = await fetch(`${API_BASE}/image/${id}`, {
            method: "DELETE",
            headers: { "ngrok-skip-browser-warning": "true" },
            signal
        });
        if (!res.ok) throw new Error(`Delete failed`);
        await fetchImages();
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
        await fetchImages(); // Refresh to get new cat list
    };

    const removeCategory = async (id: string, signal?: AbortSignal) => {
        const res = await fetch(`${API_BASE}/icategory/remove`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ id }),
            signal
        });
        if(!res.ok) throw new Error("Failed to remove category");
        await fetchImages();
    };

    const updateCategoryTags = async (id: string, tags: string[], signal?: AbortSignal) => {
        const res = await fetch(`${API_BASE}/icategory/${id}/tags`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ tags }),
            signal
        });
        if(!res.ok) throw new Error("Failed to update category tags");
        await fetchImages();
    };

    // --- REQUEST METHODS ---

    const submitImageRequest = async (files: File[], urls: string[], tags: string, signal?: AbortSignal) => {
        const fd = new FormData();
        const requestData: any[] = [];

        // Prepare File Metadata
        files.forEach(f => {
            fd.append('files', f);
            requestData.push({ type: 'file', tags });
        });

        // Prepare URL Metadata
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
                // Save new request IDs to local storage
                const newIds = data.requests.map((r: any) => r.id);
                setMyRequestIds(prev => [...prev, ...newIds]);
            }
            try { await fetchRequests(); } catch (e) {}
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
            // Remove from local tracking if exists
            setMyRequestIds(prev => prev.filter(id => id !== requestId));
            try { await fetchRequests(); } catch (e) {}
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
