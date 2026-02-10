
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ImageData, ImageCategory } from '../types';

interface ImageContextType {
    dynamicImages: ImageData[];
    categories: ImageCategory[];
    loading: boolean;
    refreshImages: () => void;
    uploadImageFile: (file: File, tags: string, signal?: AbortSignal) => Promise<void>;
    uploadImageUrl: (url: string, tags: string, signal?: AbortSignal) => Promise<void>;
    updateImageTags: (id: string, tags: string, signal?: AbortSignal) => Promise<void>;
    deleteImage: (id: string, signal?: AbortSignal) => Promise<void>;
    // Category methods
    addCategory: (name: string, tags: string[], signal?: AbortSignal) => Promise<void>;
    removeCategory: (id: string, signal?: AbortSignal) => Promise<void>;
    updateCategoryTags: (id: string, tags: string[], signal?: AbortSignal) => Promise<void>;
}

const ImageContext = createContext<ImageContextType | null>(null);

const API_BASE = "https://dolabriform-fascinatedly-lecia.ngrok-free.dev";

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dynamicImages, setDynamicImages] = useState<ImageData[]>([]);
    const [categories, setCategories] = useState<ImageCategory[]>([]);
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
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const refreshImages = () => {
        fetchImages();
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

    return (
        <ImageContext.Provider value={{ 
            dynamicImages, 
            categories,
            loading, 
            refreshImages,
            uploadImageFile,
            uploadImageUrl,
            updateImageTags,
            deleteImage,
            addCategory,
            removeCategory,
            updateCategoryTags
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
