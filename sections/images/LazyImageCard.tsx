
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
    onDelete?: (e: React.MouseEvent) => void
}> = ({ img, onClick, onErrorChange, retryKey, onDelete }) => {
    const [ref, inView] = useIntersectionObserver({ threshold: 0.05 });
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [retryCount, setRetryCount] = useState(0); 
    const imgRef = useRef<HTMLImageElement>(null);

    // Auto-retry logic
    useEffect(() => {
        if (hasError) {
            const timeout = setTimeout(() => {
                setHasError(false);
                setIsLoaded(false);
                setRetryCount(prev => prev + 1);
            }, 3000 + (retryCount * 1000)); 
            return () => clearTimeout(timeout);
        }
    }, [hasError, retryCount]);

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
        : `${img.url}${img.url.includes('?') ? '&' : '?'}retry=${retryCount + retryKey}&t=${Date.now()}`;

    return (
        <motion.div 
            ref={ref}
            onClick={onClick} 
            className="aspect-[3/4] rounded-2xl overflow-hidden relative group cursor-pointer border border-white/10 bg-[#121212]" 
            {...({ whileHover: { y: -5 }, layout: true } as any)}
        >
            {inView ? (
                <>
                    {/* Image Layer - No Fade, Instant Switch */}
                    <img 
                        ref={imgRef}
                        src={src} 
                        alt={img.tags.join(', ')} 
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoad={() => { setIsLoaded(true); setHasError(false); onErrorChange(img.id, false); }}
                        onError={() => { setHasError(true); setIsLoaded(false); onErrorChange(img.id, true); }}
                    />
                    
                    {/* Loading/Error Layer - Hard Remove on Load */}
                    {!isLoaded && (
                         <div className="absolute inset-0 bg-white/5 flex flex-col items-center justify-center gap-2 animate-pulse z-10">
                            {hasError ? (
                                <span className="text-[10px] text-orange-500 font-bold animate-pulse">Retrying...</span>
                            ) : (
                                <div className="w-8 h-8 border-2 border-white/20 border-t-orange-500 rounded-full animate-spin"></div>
                            )}
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
                <div className="absolute inset-0 bg-white/5 animate-pulse" />
            )}
        </motion.div>
    );
};
