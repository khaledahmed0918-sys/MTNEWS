import React from 'react';
import { motion } from 'framer-motion';
import { Icons, navConfig } from '../../constants';
import { Section } from '../../types';

interface HotbarProps {
    activeSection: Section;
    setActiveSection: (s: Section) => void;
    isAdmin: boolean;
    onToggleSidebar: () => void;
}

export const Hotbar: React.FC<HotbarProps> = ({ activeSection, setActiveSection, isAdmin, onToggleSidebar }) => {
    // Show only most important items on mobile
    const items = navConfig.filter(i => ['Home', 'Live', 'Votes', 'Map', 'Images'].includes(i.id));

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 md:hidden pointer-events-none">
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="pointer-events-auto bg-black/40 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-2xl p-2 flex items-center justify-between gap-1"
            >
                {items.map(item => {
                     const Icon = Icons[item.id as keyof typeof Icons] || Icons.Circle;
                     const isActive = activeSection === item.id;

                     return (
                         <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className="relative group p-3 rounded-xl transition-all duration-300 flex-1 flex flex-col items-center justify-center gap-1"
                         >
                            {isActive && (
                                <motion.div 
                                    layoutId="hotbarActive"
                                    className="absolute inset-0 bg-white/10 rounded-xl"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            {/* @ts-ignore */}
                            <Icon className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-orange-500 -translate-y-1' : 'text-gray-400 group-hover:text-white'}`} />
                            {isActive && (
                                <motion.div layoutId="dot" className="w-1 h-1 bg-orange-500 rounded-full absolute bottom-1.5" />
                            )}
                         </button>
                     )
                })}
                
                {/* Mobile Menu Toggle Button */}
                <button 
                    onClick={onToggleSidebar}
                    className="relative group p-3 rounded-xl transition-all duration-300 flex-1 flex flex-col items-center justify-center gap-1 hover:bg-white/5"
                >
                    <Icons.ArrowUp className="w-6 h-6 text-gray-400 group-hover:text-white" />
                </button>
            </motion.div>
        </div>
    );
};