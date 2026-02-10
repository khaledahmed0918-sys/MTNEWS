
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ImageData } from '../types';

interface ImageContextType {
    dynamicImages: ImageData[];
    loading: boolean;
    refreshImages: () => void;
    uploadImageFile: (file: File, tags: string, signal?: AbortSignal) => Promise<void>;
    uploadImageUrl: (url: string, tags: string, signal?: AbortSignal) => Promise<void>;
    updateImageTags: (id: string, tags: string, signal?: AbortSignal) => Promise<void>;
    deleteImage: (id: string, signal?: AbortSignal) => Promise<void>;
}

const ImageContext = createContext<ImageContextType | null>(null);

const API_BASE = "https://dolabriform-fascinatedly-lecia.ngrok-free.dev";

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dynamicImages, setDynamicImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/images`, {
                headers: {
                    "ngrok-skip-browser-warning": "true"
                }
            });

            if (!res.ok) throw new Error(`Failed to load images`);
            
            const data = await res.json();
            
            const mapped: ImageData[] = data.map((item: any) => {
                let finalUrl = item.url;
                if (item.type === 'file' && item.path) {
                    // Ensure path is handled correctly relative to API_BASE
                    const cleanPath = item.path.startsWith('uploads/') ? item.path : `uploads/${item.path}`;
                    finalUrl = `${API_BASE}/${cleanPath}`;
                }

                return {
                    id: item.id,
                    url: finalUrl,
                    tags: item.tags || [],
                    apiType: item.type
                };
            });
            
            setDynamicImages(mapped);
        } catch (e) {
            setDynamicImages([]);
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
            headers: {
                "ngrok-skip-browser-warning": "true"
            },
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

        if (!res.ok) {
            throw new Error(`Delete failed`);
        }
        
        await fetchImages();
    };

    return (
        <ImageContext.Provider value={{ 
            dynamicImages, 
            loading, 
            refreshImages,
            uploadImageFile,
            uploadImageUrl,
            updateImageTags,
            deleteImage
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
