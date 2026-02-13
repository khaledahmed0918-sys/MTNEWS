
import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = React.forwardRef<HTMLDivElement, { children: React.ReactNode, className?: string, onClick?: (e: React.MouseEvent<HTMLDivElement>) => void, noRound?: boolean, isSnowy?: boolean }>(({ children, className = '', onClick, noRound = false, isSnowy = false }, ref) => {
    // New Ultra-Premium Glass Style
    const bgClass = 'bg-[#121212]/60 border border-white/5 shadow-2xl backdrop-blur-2xl';
    const roundClass = noRound ? 'rounded-xl' : 'rounded-glass';
    const hoverClass = onClick || className.includes('hover:border-orange-500') 
        ? 'hover:bg-white/5 hover:border-orange-500/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]' 
        : '';

    return (
        <motion.div
            ref={ref}
            onClick={onClick}
            className={`relative overflow-hidden ${roundClass} p-6 md:p-8 ${bgClass} ${hoverClass} ${className} ${onClick ? 'cursor-pointer' : ''}`}
            {...({
                whileHover: onClick ? { y: -4 } : {},
                whileTap: onClick ? { scale: 0.99 } : {}
            } as any)}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
            {/* Subtle Gradient shine */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />
            
            {children}
        </motion.div>
    );
});
