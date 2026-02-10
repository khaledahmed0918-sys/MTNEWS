
import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = React.forwardRef<HTMLDivElement, { children: React.ReactNode, className?: string, onClick?: (e: React.MouseEvent<HTMLDivElement>) => void, noRound?: boolean, isSnowy?: boolean }>(({ children, className = '', onClick, noRound = false, isSnowy = false }, ref) => {
    const bgClass = 'bg-white/20 dark:bg-black/20 border-white/30 dark:border-white/10 text-gray-900 dark:text-white shadow-xl backdrop-blur-2xl';
    const roundClass = noRound ? 'rounded-xl' : 'rounded-glass';
    const hoverClass = onClick || className.includes('hover:border-orange-500') 
        ? 'hover:border-orange-500/50 hover:bg-white/30 dark:hover:bg-black/30 hover:shadow-[0_0_25px_rgba(249,115,22,0.15)]' 
        : '';
    const snowyClass = isSnowy ? 'frosted-effect' : '';

    return (
        <motion.div
            ref={ref}
            onClick={onClick}
            className={`relative overflow-hidden bg-clip-padding border ${roundClass} p-6 ${bgClass} ${hoverClass} ${snowyClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
            whileHover={onClick ? { y: -5, scale: 1.005 } : {}}
            whileTap={onClick ? { scale: 0.98, y: -2 } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            {children}
        </motion.div>
    );
});
