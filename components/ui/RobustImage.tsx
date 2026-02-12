
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

    // If prop src changes, reset everything
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
        
        // Exponential backoff for retries: 1s, 2s, 4s... capped at 10s
        const delay = Math.min(1000 * Math.pow(2, retryCount.current), 10000);
        
        timeoutRef.current = setTimeout(() => {
            retryCount.current++;
            setStatus('loading');
            // Append timestamp to force browser to re-request and bypass cache
            const separator = src.includes('?') ? '&' : '?';
            setImgSrc(`${src}${separator}retry=${Date.now()}`);
        }, delay);
    };

    const handleLoad = () => {
        setStatus('loaded');
        retryCount.current = 0;
    };

    return (
        <div className={`relative overflow-hidden ${className} bg-black/20`}>
            <img
                {...props}
                src={imgSrc}
                alt={alt}
                className={`w-full h-full object-cover transition-opacity duration-500 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                onLoad={handleLoad}
                onError={handleError}
                loading="lazy"
            />
            {status !== 'loaded' && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse">
                    {fallbackIcon || <Icons.Loader2 className="w-1/3 h-1/3 text-gray-500 animate-spin" />}
                </div>
            )}
        </div>
    );
};
