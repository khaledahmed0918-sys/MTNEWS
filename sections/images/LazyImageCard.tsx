
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../constants';
import { ImageData } from '../../types';
import { useIntersectionObserver } from '../../hooks';
import { FavoriteButton } from '../../components/ui/SharedInputs';

export const LazyImageCard: React.FC<{ 
    img: ImageData, 
    onClick: () => void, 
    onErrorChange: (id: string, hasError: boolean) => void,
    retryKey: number,
    onDelete?: (e: React.MouseEvent) => void,
    onLoad?: () => void,
    shouldLoad?: boolean
}> = ({ img, onClick, onErrorChange, retryKey, onDelete, onLoad, shouldLoad = true }) => {
    // Increased threshold for earlier loading, effectively eager for close items
    const [ref, inView] = useIntersectionObserver({ threshold: 0.01, rootMargin: '200px' });
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [retryCount, setRetryCount] = useState(0); 
    const imgRef = useRef<HTMLImageElement>(null);

    // Immediate Reset on retry key change
    useEffect(() => {
        if (retryKey > 0) {
            setHasError(false);
            setIsLoaded(false);
            setRetryCount(prev => prev + 1);
        }
    }, [retryKey]);

    const isDataUrl = img.url.startsWith('data:');
    const src = isDataUrl 
        ? img.url 
        : (retryCount > 0 ? `${img.url}${img.url.includes('?') ? '&' : '?'}retry=${retryCount}&t=${Date.now()}` : img.url);

    // Only render image tag if it is allowed to load (sequential logic) AND in view
    const showImage = shouldLoad && inView;

    return (
        <motion.div 
            layout
            ref={ref}
            onClick={onClick} 
            className="aspect-[3/4] rounded-2xl overflow-hidden relative group cursor-pointer border border-white/10 bg-[#121212]" 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            whileHover={{ y: -5 }}
        >
            {showImage ? (
                <>
                    <img 
                        ref={imgRef}
                        src={src} 
                        alt={img.tags.join(', ')} 
                        loading="eager" // Managed manually
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => { 
                            setIsLoaded(true); 
                            setHasError(false); 
                            onErrorChange(img.id, false);
                            if(onLoad) onLoad();
                        }}
                        onError={() => { 
                            // Immediate retry logic without long timeout
                            if (retryCount < 2) {
                                setRetryCount(prev => prev + 1);
                            } else {
                                setHasError(true); 
                                setIsLoaded(false); 
                                onErrorChange(img.id, true);
                                // Also trigger next load on error so queue doesn't stick
                                if(onLoad) onLoad();
                            }
                        }}
                    />
                    
                    {/* Skeleton Loader */}
                    {!isLoaded && !hasError && (
                         <div className="absolute inset-0 bg-[#1a1a1a] flex flex-col items-center justify-center gap-2 z-10 animate-pulse">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-orange-500 rounded-full animate-spin"></div>
                         </div>
                    )}

                    {hasError && (
                        <div className="absolute inset-0 bg-[#121212] flex flex-col items-center justify-center gap-2 z-10">
                            <Icons.AlertTriangle className="w-8 h-8 text-red-500/50" />
                            <button 
                                onClick={(e) => { e.stopPropagation(); setRetryCount(p => p + 1); setHasError(false); }}
                                className="text-xs text-orange-500 font-bold hover:underline"
                            >
                                Reload
                            </button>
                        </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-4 pointer-events-none z-20">
                        <p className="text-white font-bold line-clamp-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-200 drop-shadow-md">{img.tags.join(', ')}</p>
                        <div className="absolute top-2 right-2 pointer-events-auto flex gap-2">
                            <FavoriteButton id={img.id} category="images" />
                            {onDelete && (
                                <button onClick={onDelete} className="p-2 rounded-full bg-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition-colors backdrop-blur-sm">
                                    <Icons.Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                // Initial Skeleton before load permission
                <div className="absolute inset-0 bg-[#1a1a1a] animate-pulse" />
            )}
        </motion.div>
    );
};
