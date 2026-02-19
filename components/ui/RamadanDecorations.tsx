
import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { appConfig } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';

// --- RAMADAN INTRO OVERLAY ---
export const RamadanIntro: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!appConfig.ramadanMode) return;
        const hasShown = sessionStorage.getItem('mtnews-ramadan-shown');
        if (!hasShown) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                setIsVisible(false);
                sessionStorage.setItem('mtnews-ramadan-shown', 'true');
            }, 3800);
            return () => clearTimeout(timer);
        }
    }, []);

    if (!appConfig.ramadanMode) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-gradient-to-b from-[#020514] via-[#0a1229] to-[#150f2e] overflow-hidden"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    <div className="absolute inset-0 w-full h-full">
                        {/* Reduced particle count for performance */}
                        {Array.from({ length: 15 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute bg-white rounded-full"
                                style={{
                                    width: Math.random() * 3 + 1 + 'px',
                                    height: Math.random() * 3 + 1 + 'px',
                                    top: Math.random() * 100 + '%',
                                    left: Math.random() * 100 + '%',
                                }}
                                animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                                transition={{ duration: Math.random() * 3 + 2, repeat: Infinity }}
                            />
                        ))}
                    </div>
                    <motion.div
                        initial={{ scale: 0, rotate: -20, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ duration: 1.2, type: "spring" }}
                        className="relative w-48 h-48 mb-8 drop-shadow-[0_0_40px_rgba(255,215,0,0.4)]"
                    >
                        <MoonIcon />
                    </motion.div>
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-center z-10"
                    >
                        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FCD34D] to-[#B45309] drop-shadow-2xl mb-4 font-display">
                            Ramadan Kareem
                        </h1>
                        <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg" style={{ fontFamily: 'Amiri, serif' }}>
                            رمضان كريم
                        </h2>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

// --- BACKGROUND MOON (Adjusted Size & Position) ---
export const BackgroundCrescent: React.FC = () => {
    const { dir } = useI18n();
    if (!appConfig.ramadanMode) return null;

    // Use specific classes for LTR/RTL to avoid being stuck in corner
    const positionClass = dir === 'rtl' ? 'left-4 top-4 md:left-10 md:top-10' : 'right-4 top-4 md:right-10 md:top-10';

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
            <motion.div
                className={`absolute opacity-30 w-[200px] h-[200px] md:w-[300px] md:h-[300px] ${positionClass}`}
                animate={{
                    y: [0, -10, 0],
                    rotate: [0, 3, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <div className="absolute inset-0 bg-[#FFFBEB] opacity-30 rounded-full blur-[80px] animate-pulse" />
                <MoonIcon className="w-full h-full drop-shadow-[0_0_60px_rgba(255,251,235,0.6)]" />
            </motion.div>
        </div>
    );
};

const MoonIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path
            d="M140 100C140 144.183 104.183 180 60 180C45.26 180 31.45 176 19.55 169.05C45.45 163.55 65 140.55 65 112.55C65 79.55 38 52.05 4.55 49.55C17.55 37.05 35.05 29.55 54.55 29.55C98.73 29.55 134.55 65.37 134.55 109.55"
            fill="url(#moonGradient)"
            stroke="#FCD34D"
            strokeWidth="2"
        />
        <path d="M85 90 Q 95 95, 105 90" stroke="#854D0E" strokeWidth="3" strokeLinecap="round" />
        <circle cx="110" cy="105" r="5" fill="#FCA5A5" opacity="0.6" />
        <path d="M90 120 Q 100 130, 110 120" stroke="#854D0E" strokeWidth="3" strokeLinecap="round" />
        <line x1="130" y1="45" x2="130" y2="70" stroke="#FCD34D" strokeWidth="1" />
        <path d="M130 70 L132 75 L137 76 L133 79 L134 84 L130 81 L126 84 L127 79 L123 76 L128 75 Z" fill="#FCD34D" />
        <defs>
            <linearGradient id="moonGradient" x1="20" y1="30" x2="140" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEF08A" />
                <stop offset="1" stopColor="#F59E0B" />
            </linearGradient>
        </defs>
    </svg>
);

// --- REALISTIC LANTERN (Card Decoration) ---
export const CardLantern: React.FC<{ type?: 'hanging' | 'sitting' }> = ({ type = 'hanging' }) => {
    if (!appConfig.ramadanMode) return null;

    const properties = useMemo(() => {
        return {
            leftPos: 10 + Math.random() * 80,
            stringLength: 30 + Math.random() * 50,
            swingDuration: 3 + Math.random() * 2,
            delay: Math.random() * 2
        };
    }, []);

    if (type === 'sitting') {
        return (
            <div className="absolute right-0 bottom-0 z-[50] pointer-events-none opacity-90 pr-2 pb-2" aria-hidden="true">
                <motion.div
                    initial={{ rotate: 45, y: 10 }}
                    animate={{ y: [10, 5, 10], rotate: [45, 42, 45] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative w-24 h-24 filter drop-shadow-2xl flex items-center justify-center"
                >
                    {/* Light Candle Glow centered perfectly behind lantern - INSIDE swing group */}
                    <div className="absolute bg-[#F59E0B] opacity-30 blur-[30px] rounded-full animate-pulse w-24 h-24" style={{ zIndex: -1 }} />
                    <LanternSvg sitting />
                </motion.div>
            </div>
        );
    }

    return (
        <div 
            className="absolute top-0 pointer-events-none z-[60]"
            style={{ left: `${properties.leftPos}%` }}
            aria-hidden="true"
        >
            <motion.div
                initial={{ rotate: 3 }}
                animate={{ rotate: -3 }}
                transition={{
                    duration: properties.swingDuration,
                    repeat: Infinity,
                    repeatType: "mirror",
                    ease: "easeInOut",
                    delay: properties.delay
                }}
                style={{ originY: 0, originX: 0.5 }}
                className="flex flex-col items-center relative"
            >
                {/* Realistic String */}
                <div 
                    className="w-[2px] bg-gradient-to-b from-gray-400 via-yellow-600 to-amber-700 shadow-sm"
                    style={{ height: `${properties.stringLength}px` }} 
                />

                {/* Lantern Body & Glow inside swing container */}
                <div className="relative transform -translate-y-1 flex items-center justify-center">
                    {/* Light Candle Glow centered BEHIND lantern body */}
                    <motion.div 
                        className="absolute w-32 h-32 bg-[#F59E0B] blur-[40px] rounded-full mix-blend-screen z-[-1]"
                        animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <LanternSvg />
                </div>
            </motion.div>
        </div>
    );
};

const LanternSvg = ({ sitting }: { sitting?: boolean }) => (
    <svg width="60" height="90" viewBox="0 0 60 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]">
        {/* Ring */}
        <path d="M25 5 C25 2, 35 2, 35 5" stroke="#D97706" strokeWidth="2" fill="none" />
        
        {/* Top Dome */}
        <path d="M20 15 L30 5 L40 15 H20 Z" fill="url(#metalGradient)" stroke="#B45309" strokeWidth="0.5" />
        <path d="M15 25 L20 15 H40 L45 25 H15 Z" fill="url(#metalGradient)" stroke="#B45309" strokeWidth="0.5" />
        
        {/* Main Body (Glass) */}
        <path d="M15 25 L10 65 L15 75 H45 L50 65 L45 25 H15 Z" fill="url(#glassGradient)" stroke="#D97706" strokeWidth="1" />
        
        {/* Patterns on Glass */}
        <path d="M15 25 L20 65 M45 25 L40 65" stroke="#F59E0B" strokeWidth="0.5" opacity="0.5" />
        <path d="M12 45 H48" stroke="#F59E0B" strokeWidth="0.5" opacity="0.3" />

        {/* Candle Flame - Animated & Bright */}
        <motion.g
            animate={{ opacity: [0.8, 1, 0.8], scale: [0.95, 1.15, 0.95] }}
            transition={{ duration: 0.15, repeat: Infinity, repeatType: "mirror" }}
        >
            <path d="M28 55 Q 30 45, 32 55 Q 30 60, 28 55" fill="#FFFBEB" filter="url(#glow)" />
            <path d="M29 55 Q 30 48, 31 55" fill="#FBBF24" />
        </motion.g>
        <rect x="27" y="58" width="6" height="10" fill="#DDD" rx="1" />

        {/* Bottom Base */}
        <path d="M15 75 L18 80 H42 L45 75 Z" fill="url(#metalGradient)" stroke="#B45309" strokeWidth="0.5" />
        
        {/* Tassel */}
        {!sitting && (
            <g>
                <line x1="30" y1="80" x2="30" y2="85" stroke="#B45309" strokeWidth="1" />
                <circle cx="30" cy="87" r="2" fill="#D97706" />
            </g>
        )}

        <defs>
            <linearGradient id="metalGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FCD34D" />
                <stop offset="50%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <linearGradient id="glassGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,237,213,0.1)" />
                <stop offset="50%" stopColor="rgba(255,215,0,0.2)" />
                <stop offset="100%" stopColor="rgba(255,165,0,0.3)" />
            </linearGradient>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
    </svg>
);
