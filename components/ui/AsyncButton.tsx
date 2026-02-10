import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';

interface AsyncButtonProps {
    onClick: (signal: AbortSignal) => Promise<void>;
    onCancel?: () => void;
    label: string;
    loadingLabel?: string;
    variant?: 'primary' | 'danger' | 'success';
    className?: string;
    disabled?: boolean;
    progressSpeed?: 'fast' | 'normal' | 'slow';
    children?: React.ReactNode;
}

export const AsyncButton: React.FC<AsyncButtonProps> = ({ onClick, onCancel, label, loadingLabel, variant = 'primary', className = '', disabled = false, progressSpeed = 'normal', children }) => {
    const { t } = useI18n();
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'cancelling'>('idle');
    const [progress, setProgress] = useState(0);
    const abortController = useRef<AbortController | null>(null);

    const bgColors = {
        primary: 'bg-orange-500 hover:bg-orange-600',
        danger: 'bg-red-600 hover:bg-red-700',
        success: 'bg-green-500 hover:bg-green-600'
    };
    
    const handleClick = async () => {
        if (status === 'loading') {
            setStatus('cancelling');
            if (abortController.current) {
                abortController.current.abort();
            }
            if (onCancel) onCancel();
            
            setTimeout(() => {
                setStatus('idle');
                setProgress(0);
            }, 500);
            return;
        }

        setStatus('loading');
        setProgress(0);
        abortController.current = new AbortController();

        const speedMap = { fast: 30, normal: 80, slow: 150 };
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) return 95;
                return prev + (Math.random() * 5);
            });
        }, speedMap[progressSpeed]);

        try {
            await onClick(abortController.current.signal);
            clearInterval(interval);
            if (abortController.current.signal.aborted) {
                setStatus('idle');
                setProgress(0);
                return;
            }
            setProgress(100);
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                setProgress(0);
            }, 1500);
        } catch (e: any) {
            clearInterval(interval);
            // Check for both name and optional signal state
            if (e.name === 'AbortError' || (abortController.current && abortController.current.signal.aborted)) {
                setStatus('idle');
            } else {
                setStatus('idle');
            }
            setProgress(0);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`relative overflow-hidden rounded-xl py-3 px-6 font-bold text-white transition-all duration-300 ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-500' : bgColors[variant]} ${className}`}
        >
            <div className="relative z-10 flex items-center justify-center gap-2">
                {status === 'loading' ? (
                    <>
                        <span className="w-3 h-3 rounded-full bg-green-400 animate-pulseGreen shadow-[0_0_10px_rgba(74,222,128,0.8)]"></span>
                        <span>{t('cancel')}</span>
                    </>
                ) : status === 'cancelling' ? (
                    <span>{t('cancelling')}</span>
                ) : status === 'success' ? (
                    <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                        <Icons.Check className="w-5 h-5" />
                        <span>{t('success')}</span>
                    </motion.div>
                ) : (
                    children || label
                )}
            </div>
            
            <motion.div 
                className={`absolute inset-0 z-0 bg-green-500`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: "linear" }}
            />
        </button>
    );
};