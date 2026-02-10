
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { db, ref, onValue } from '../firebase';
import { ImageData } from '../types';

interface ImageContextType {
    dynamicImages: ImageData[];
    loading: boolean;
}

const ImageContext = createContext<ImageContextType | null>(null);

export const ImageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dynamicImages, setDynamicImages] = useState<ImageData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const imagesRef = ref(db, 'images');
        const unsubscribe = onValue(imagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Process images in a way that feels like they are streaming in if new ones appear
                const loadedImages: ImageData[] = Object.entries(data).map(([key, val]: [string, any]) => ({
                    id: key,
                    url: val.url,
                    tags: val.tags || []
                }));
                setDynamicImages(loadedImages);
            } else {
                setDynamicImages([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <ImageContext.Provider value={{ dynamicImages, loading }}>
            {children}
        </ImageContext.Provider>
    );
};

export const useImages = () => {
    const context = useContext(ImageContext);
    if(!context) throw new Error("useImages must be used within ImageProvider");
    return context;
};
