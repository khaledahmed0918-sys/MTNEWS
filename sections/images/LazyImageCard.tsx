
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
    const [ref, inView] = useIntersectionObserver({ threshold: 0.1 });
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [internalRetry, setInternalRetry] = useState(0); 
    const imgRef = useRef<HTMLImageElement>(null);

    const handleRetry = (e: React.MouseEvent) => {
        e.stopPropagation();
        setHasError(false);
        setIsLoading(true);
        setInternalRetry(prev => prev + 1);
        onErrorChange(img.id, false); 
    };
    
    useEffect(() => {
        if (retryKey > 0) {
            setHasError(false);
            setIsLoading(true);
        }
    }, [retryKey]);

    useEffect(() => {
        if (imgRef.current?.complete) {
            setIsLoading(false);
        }
    }, []);

    const isDataUrl = img.url.startsWith('data:');
    const src = isDataUrl 
        ? img.url 
        : `${img.url}${img.url.includes('?') ? '&' : '?'}retry=${internalRetry + retryKey}`;

    return (
        <motion.div 
            ref={ref}
            onClick={onClick} 
            className="aspect-[3/4] rounded-2xl overflow-hidden relative group cursor-pointer border border-white/10 bg-black/20" 
            whileHover={{ y: -5 }}
        >
            {inView ? (
                <>
                    {!hasError && (
                        <img 
                            ref={imgRef}
                            src={src} 
                            alt={img.tags.join(', ')} 
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                            onLoad={() => { setIsLoading(false); onErrorChange(img.id, false); }}
                            onError={() => { setHasError(true); setIsLoading(false); onErrorChange(img.id, true); }}
                        />
                    )}
                    
                    {hasError && (
                        <div className="absolute inset-0 bg-neutral-900/80 backdrop-blur-md flex flex-col items-center justify-center gap-2 p-4 text-center z-10">
                            <Icons.AlertCircle className="w-8 h-8 text-red-500 mb-1 opacity-80" />
                            <motion.button 
                                onClick={handleRetry}
                                whileHover={{ scale: 1.1, rotate: 180 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-white hover:bg-orange-500 hover:border-orange-500 transition-colors"
                            >
                                <Icons.Refresh className="w-5 h-5" />
                            </motion.button>
                        </div>
                    )}
                    
                    {isLoading && !hasError && (
                         <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs text-gray-500 font-bold">Loading...</span>
                            </div>
                         </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                        <p className="text-white font-bold line-clamp-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{img.tags.join(', ')}</p>
                        <div className="absolute top-2 right-2 pointer-events-auto flex gap-2">
                            <FavoriteButton id={img.id} category="images" />
                            {onDelete && (
                                <button onClick={onDelete} className="p-2 rounded-full bg-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition-colors">
                                    <Icons.Trash2 className="w-6 h-6" />
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
