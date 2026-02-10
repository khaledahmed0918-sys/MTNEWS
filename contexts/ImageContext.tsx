
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { ImageData } from '../types';

interface ImageContextType {
    dynamicImages: ImageData[];
    loading: boolean;
    refreshImages: () => void;
    uploadImageFile: (file: File, tags: string) => Promise<void>;
    uploadImageUrl: (url: string, tags: string) => Promise<void>;
    updateImageTags: (id: string, tags: string) => Promise<void>;
    deleteImage: (id: string) => Promise<void>;
}

const ImageContext = createContext<ImageContextType | null>(null);

const API_BASE = "http://62.77.156.58:3000";

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dynamicImages, setDynamicImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            console.log(`[ImageContext] Fetching from: ${API_BASE}/images`);
            
            const res = await fetch(`${API_BASE}/images`);
            console.log(`[ImageContext] Response Status:`, res.status);

            if (!res.ok) throw new Error(`Failed to load images. Status: ${res.status}`);
            
            const data = await res.json();
            console.log("[ImageContext] Raw API Data:", data);

            // Map API response to ImageData structure with robust URL handling
            const mapped: ImageData[] = data.map((item: any) => {
                let finalUrl = item.url;

                // Construct full URL for uploaded files
                if (item.type === 'file' && item.path) {
                    // Ensure path starts with /
                    const cleanPath = item.path.startsWith('/') ? item.path : `/${item.path}`;
                    finalUrl = `${API_BASE}${cleanPath}`;
                }

                return {
                    id: item.id,
                    url: finalUrl,
                    tags: item.tags || [],
                    apiType: item.type
                };
            });
            
            console.log("[ImageContext] Processed Images:", mapped);
            setDynamicImages(mapped);
        } catch (e) {
            console.error("[ImageContext] Fetch Error:", e);
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

    const uploadImageUrl = async (url: string, tags: string) => {
        console.log("[ImageContext] Uploading URL:", url);
        const res = await fetch(`${API_BASE}/upload/url`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, tags })
        });

        if (!res.ok) throw new Error("Upload failed");
        await fetchImages();
    };

    const uploadImageFile = async (file: File, tags: string) => {
        console.log("[ImageContext] Uploading File:", file.name);
        const fd = new FormData();
        fd.append("image", file);
        fd.append("tags", tags);

        const res = await fetch(`${API_BASE}/upload/image`, {
            method: "POST",
            body: fd
        });

        if (!res.ok) throw new Error("Upload failed");
        await fetchImages();
    };

    const updateImageTags = async (id: string, tags: string) => {
        const res = await fetch(`${API_BASE}/image/${id}/tags`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tags })
        });

        if (!res.ok) throw new Error("Update failed");
        await fetchImages();
    };

    const deleteImage = async (id: string) => {
        const res = await fetch(`${API_BASE}/image/${id}`, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error("Delete failed");
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
