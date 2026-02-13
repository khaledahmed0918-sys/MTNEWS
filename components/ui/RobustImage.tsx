
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../../constants';

interface RobustImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    fallbackIcon?: React.ReactNode;
}

export const RobustImage: React.FC<RobustImageProps> = ({ src, className, alt, fallbackIcon, ...props }) => {
    const [imgSrc, setImgSrc] = useState(src);
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    const retryCount = useRef(0);
    const timeoutRef = useRef<any>(null);

    useEffect(() => {
        setImgSrc(src);
        setStatus('loading');
        retryCount.current = 0;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }, [src]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleError = () => {
        setStatus('error');
        // Exponential backoff for retries
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 8000);
        
        timeoutRef.current = setTimeout(() => {
            retryCount.current++;
            setStatus('loading');
            const separator = src.includes('?') ? '&' : '?';
            setImgSrc(`${src}${separator}retry=${Date.now()}`);
        }, delay);
    };

    const handleLoad = () => {
        setStatus('loaded');
        retryCount.current = 0;
    };

    return (
        <div className={`relative overflow-hidden ${className} bg-[#1a1a1a]`}>
            {/* Image Layer - Shown immediately when loaded */}
            <img
                {...props}
                src={imgSrc}
                alt={alt}
                className={`w-full h-full object-cover block ${status === 'loaded' ? 'visible' : 'invisible absolute top-0 left-0'}`}
                onLoad={handleLoad}
                onError={handleError}
                loading="lazy"
            />
            
            {/* Skeleton Layer - Removed immediately when loaded */}
            {status !== 'loaded' && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse z-10">
                    {status === 'error' ? (
                        <div className="flex flex-col items-center">
                            <Icons.AlertTriangle className="w-6 h-6 text-orange-500 mb-1" />
                            <span className="text-[10px] text-orange-500 font-bold">Retrying...</span>
                        </div>
                    ) : (
                        fallbackIcon || <Icons.Loader2 className="w-1/3 h-1/3 text-gray-600 animate-spin" />
                    )}
                </div>
            )}
        </div>
    );
};
