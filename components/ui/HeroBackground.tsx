import React from 'react';
import { motion } from 'framer-motion';
import { Section } from '../../types';

export const HeroBackground: React.FC<{ section: Section }> = ({ section }) => {
    // Determine colors based on section
    const getGradient = () => {
        switch(section) {
            case 'Live': return 'from-green-900/20 via-black to-black';
            case 'Votes': return 'from-orange-900/20 via-black to-black';
            case 'Map': return 'from-blue-900/20 via-black to-black';
            case 'Images': return 'from-purple-900/20 via-black to-black';
            default: return 'from-orange-900/10 via-black to-black';
        }
    };

    return (
        <div className="fixed inset-0 -z-0 pointer-events-none">
            {/* Base Background */}
            <div className="absolute inset-0 bg-[#050505]" />
            
            {/* Dynamic Gradient */}
            <motion.div 
                className={`absolute inset-0 bg-gradient-to-b ${getGradient()} opacity-50`}
                animate={{ opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
            />

            {/* Glowing Orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <motion.div 
                    className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-orange-500/5 blur-[100px]"
                    animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div 
                    className="absolute top-[20%] right-[0%] w-[40vw] h-[40vw] rounded-full bg-red-500/5 blur-[120px]"
                    animate={{ x: [0, -50, 0], y: [0, -40, 0] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
            
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        </div>
    );
};