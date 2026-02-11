import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    const [isLoading, setIsLoading] = useState(true);
    const [retryCount, setRetryCount] = useState(0); 
    const imgRef = useRef<HTMLImageElement>(null);

    // Auto-retry logic
    useEffect(() => {
        if (hasError) {
            const timeout = setTimeout(() => {
                setHasError(false);
                setIsLoading(true);
                setRetryCount(prev => prev + 1);
            }, 3000 + (retryCount * 1000)); // Backoff slightly but keep trying
            return () => clearTimeout(timeout);
        }
    }, [hasError, retryCount]);

    useEffect(() => {
        if (retryKey > 0) {
            setHasError(false);
            setIsLoading(true);
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
            whileHover={{ y: -5 }}
            layout
        >
            {inView ? (
                <>
                    {/* Image Layer */}
                    <img 
                        ref={imgRef}
                        src={src} 
                        alt={img.tags.join(', ')} 
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 ${isLoading || hasError ? 'opacity-0' : 'opacity-100'}`}
                        onLoad={() => { setIsLoading(false); setHasError(false); onErrorChange(img.id, false); }}
                        onError={() => { setHasError(true); setIsLoading(false); onErrorChange(img.id, true); }}
                    />
                    
                    {/* Loading/Error Layer (Self Healing) */}
                    {(isLoading || hasError) && (
                         <div className="absolute inset-0 bg-white/5 flex flex-col items-center justify-center gap-2">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-orange-500 rounded-full animate-spin"></div>
                            {hasError && <span className="text-[10px] text-orange-500 font-bold animate-pulse">Retrying...</span>}
                         </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                        <p className="text-white font-bold line-clamp-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 drop-shadow-md">{img.tags.join(', ')}</p>
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