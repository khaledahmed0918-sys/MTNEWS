
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons, navConfig } from '../../constants';
import { Section } from '../../types';
import { useI18n } from '../../contexts/I18nContext';
import { useLocalStorage } from '../../hooks';

interface SidebarProps {
    activeSection: Section;
    setActiveSection: (s: Section) => void;
    isAdmin: boolean;
    onAdminClick: () => void;
    snowEnabled: boolean;
    toggleSnow: () => void;
    isMobileOpen: boolean;
    toggleMobileMenu: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
};

export const Sidebar: React.FC<SidebarProps> = ({ 
    activeSection, 
    setActiveSection, 
    isAdmin, 
    onAdminClick, 
    snowEnabled, 
    toggleSnow,
    isMobileOpen,
    toggleMobileMenu
}) => {
    const { t, lang, setLang } = useI18n();
    const [isCollapsed, setIsCollapsed] = useLocalStorage('sidebar-collapsed', false);

    const menuItems = navConfig.filter(item => item.enabled || (isAdmin && (item.id === 'Logs')));

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside 
                initial={false}
                animate={{ width: isCollapsed ? 80 : 288 }}
                className={`hidden md:flex flex-col h-full bg-[#080808]/80 backdrop-blur-3xl border-r border-white/5 relative z-50 py-6 px-3 justify-between shadow-2xl transition-all duration-300`}
            >
                <div className="flex flex-col h-full w-full overflow-hidden">
                    {/* Logo Area */}
                    <div className={`flex items-center gap-4 mb-8 px-2 ${isCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-12 h-12 flex items-center justify-center shrink-0 relative overflow-hidden group cursor-pointer" onClick={() => setActiveSection('Home')}>
                            <img src="https://i.postimg.cc/PrqvJ5RX/IMG-7993.png" alt="Logo" className="w-10 h-10 object-contain drop-shadow-md group-hover:scale-110 transition-transform" />
                        </div>
                        
                        {!isCollapsed && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col whitespace-nowrap overflow-hidden">
                                <h1 className="text-xl font-display font-black text-white leading-none tracking-tight">
                                    MTRP <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">News</span>
                                </h1>
                            </motion.div>
                        )}
                    </div>

                    {/* Navigation */}
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="flex flex-col gap-2 w-full flex-1 overflow-y-auto no-scrollbar"
                    >
                        {menuItems.map((item: any) => {
                            const Icon = Icons[item.id as keyof typeof Icons] || Icons.Circle;
                            const isActive = activeSection === item.id;
                            
                            return (
                                <motion.button
                                    variants={itemVariants}
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`relative group flex items-center p-3 rounded-xl transition-all duration-300 ${isCollapsed ? 'justify-center' : ''} ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    title={isCollapsed ? t(item.id) : ''}
                                >
                                    {isActive && (
                                        <motion.div 
                                            layoutId="sidebarActive"
                                            className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full"
                                        />
                                    )}
                                    
                                    {/* @ts-ignore */}
                                    <Icon className={`w-6 h-6 transition-transform duration-300 ${isActive ? 'text-orange-500 scale-110' : 'group-hover:scale-110'}`} />
                                    
                                    {!isCollapsed && (
                                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-4 font-bold text-lg tracking-wide whitespace-nowrap">
                                            {t(item.id)}
                                        </motion.span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </motion.div>

                    {/* Bottom Controls */}
                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/5">
                        <div className={`grid ${isCollapsed ? 'grid-cols-1' : 'grid-cols-3'} gap-2`}>
                            <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors" title="Language">
                                <Icons.Languages className="w-5 h-5" />
                            </button>
                            <button onClick={toggleSnow} className={`p-3 rounded-xl flex items-center justify-center transition-colors ${snowEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-400 hover:text-white'}`} title="Snow">
                                <Icons.Snowflake className="w-5 h-5" />
                            </button>
                            <button onClick={onAdminClick} className={`p-3 rounded-xl flex items-center justify-center transition-colors ${isAdmin ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-gray-400 hover:text-white'}`} title="Admin">
                                {isAdmin ? <Icons.LogOut className="w-5 h-5" /> : <Icons.Lock className="w-5 h-5" />}
                            </button>
                        </div>
                        
                        {/* Desktop Collapse Toggle */}
                        <button 
                            onClick={() => setIsCollapsed(!isCollapsed)} 
                            className="w-full p-2 mt-2 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            {isCollapsed ? <Icons.ArrowRight className="w-5 h-5" /> : <Icons.ArrowLeft className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Sidebar (Slide Up) */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[1000] bg-[#050505]/95 backdrop-blur-3xl flex flex-col md:hidden pt-safe pb-safe"
                    >
                        <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                            {/* Mobile Header */}
                            <div className="flex items-center justify-center gap-4 py-6">
                                <img src="https://i.postimg.cc/PrqvJ5RX/IMG-7993.png" alt="Logo" className="w-12 h-12 object-contain" />
                                <h1 className="text-2xl font-display font-black text-white">MTRP NEWS</h1>
                            </div>

                            {/* Mobile Nav */}
                            <motion.div 
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="flex flex-col gap-3 flex-1"
                            >
                                {menuItems.map((item: any) => {
                                    const Icon = Icons[item.id as keyof typeof Icons] || Icons.Circle;
                                    const isActive = activeSection === item.id;
                                    
                                    return (
                                        <motion.button
                                            variants={itemVariants}
                                            key={item.id}
                                            onClick={() => { setActiveSection(item.id); toggleMobileMenu(); }}
                                            className={`flex items-center p-4 rounded-xl transition-all ${isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            {/* @ts-ignore */}
                                            <Icon className={`w-6 h-6 ${isActive ? 'text-orange-500' : ''}`} />
                                            <span className="ml-4 font-bold text-xl">{t(item.id)}</span>
                                        </motion.button>
                                    );
                                })}
                            </motion.div>

                            {/* Mobile Controls */}
                            <div className="grid grid-cols-3 gap-4 mt-6">
                                <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="p-4 rounded-2xl bg-white/5 flex items-center justify-center text-white"><Icons.Languages className="w-6 h-6" /></button>
                                <button onClick={toggleSnow} className={`p-4 rounded-2xl flex items-center justify-center ${snowEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-white'}`}><Icons.Snowflake className="w-6 h-6" /></button>
                                <button onClick={onAdminClick} className={`p-4 rounded-2xl flex items-center justify-center ${isAdmin ? 'bg-red-500/20 text-red-400' : 'bg-white/5 text-white'}`}>{isAdmin ? <Icons.LogOut className="w-6 h-6" /> : <Icons.Lock className="w-6 h-6" />}</button>
                            </div>
                        </div>
                        
                        {/* Mobile Close Button */}
                        <div className="p-6 border-t border-white/10 flex justify-center bg-black/20">
                            <button onClick={toggleMobileMenu} className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-white active:scale-95 transition-transform border border-white/10 shadow-lg">
                                <Icons.ChevronDown className="w-8 h-8" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
