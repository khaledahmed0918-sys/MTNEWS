
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons, translations } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../hooks';
import { Section } from '../types';

export const Header: React.FC<{ activeSection: Section; isAdmin: boolean; onAdminClick: () => void; snowEnabled: boolean; toggleSnow: () => void }> = ({ activeSection, isAdmin, onAdminClick, snowEnabled, toggleSnow }) => {
  const { lang, setLang, t } = useI18n();
  const [theme, toggleTheme] = useTheme();
  const [visitors, setVisitors] = useState<number | null>(null);
  const toggleLanguage = () => setLang(lang === 'en' ? 'ar' : 'en');
  const subTextColor = 'text-gray-600 dark:text-gray-300';
  const buttonBg = 'bg-white/40 dark:bg-white/10 border-gray-300 dark:border-white/20 text-black dark:text-white shadow-sm backdrop-blur-md';

  useEffect(() => {
      if (isAdmin) {
          fetch("https://dolabriform-fascinatedly-lecia.ngrok-free.dev/visitors", { headers: { "ngrok-skip-browser-warning": "true" }})
            .then(r => r.json())
            .then(d => setVisitors(d.visitors))
            .catch(() => {});
      }
  }, [isAdmin]);

  return (
    <header className="w-full p-4 flex justify-between items-start relative z-[100]">
        <div className="flex-1 flex justify-start">
             <AnimatePresence>
                {isAdmin && visitors !== null && (
                    <motion.div 
                        {...({
                            initial: { opacity: 0, x: -20 },
                            animate: { opacity: 1, x: 0 }
                        } as any)}
                        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-lg text-sm font-bold text-white"
                    >
                        <Icons.Users className="w-4 h-4 text-green-400" />
                        <span>{visitors.toLocaleString()} Visitors</span>
                    </motion.div>
                )}
             </AnimatePresence>
        </div>
        <motion.div 
            {...({
                initial: { opacity: 0, y: -20 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.5 }
            } as any)}
            className="flex-1 flex flex-col items-center pt-2"
        >
            <img src="https://i.postimg.cc/x8XYrhtL/XRxu6D1Y3qve-Qu-Mu-G9Mzdb-G1q7NLGbu-JZ3FXya-Y1.png" alt="MTNEWS Logo" className="w-24 h-auto drop-shadow-lg" />
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-red-500 to-orange-400 animate-gradientBG bg-[200%_auto] mt-[-10px]">MTNEWS</h1>
            <p className={`mt-2 text-lg font-semibold ${subTextColor}`}>{t(activeSection as keyof typeof translations.en)}</p>
            <div className="w-full h-px mt-4 bg-gray-300 dark:bg-white/20"></div>
        </motion.div>
        <div className="flex-1 flex justify-end items-start gap-3">
             <motion.button 
                onClick={onAdminClick}
                {...({ whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } } as any)}
                className={`px-4 py-2 rounded-full flex items-center gap-2 border ${buttonBg} font-bold transition-all hover:bg-orange-500 hover:border-orange-600 hover:text-white group`}
             >
                {isAdmin ? <Icons.LogOut className="w-4 h-4 group-hover:rotate-180 transition-transform" /> : <Icons.Lock className="w-4 h-4" />}
                <span className="hidden md:inline">{isAdmin ? t('logout') : t('admin')}</span>
            </motion.button>

            <motion.div 
                {...({
                    initial: { opacity: 0, x: 20 },
                    animate: { opacity: 1, x: 0 },
                    transition: { duration: 0.5, delay: 0.2 }
                } as any)}
                className="flex items-center gap-x-2 md:gap-x-4"
            >
                <motion.button onClick={toggleSnow} {...({ whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 } } as any)} className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${snowEnabled ? 'bg-blue-500/20 text-blue-300 border-blue-500' : buttonBg}`}>
                    <Icons.Snowflake className={`w-5 h-5 ${snowEnabled ? 'animate-spinSlow' : ''}`} />
                </motion.button>

                <motion.button onClick={toggleLanguage} {...({ whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 } } as any)} className={`w-10 h-10 rounded-full flex items-center justify-center border ${buttonBg}`}><Icons.Languages className="w-5 h-5" /></motion.button>
                <motion.button onClick={toggleTheme} {...({ whileHover: { scale: 1.1 }, whileTap: { scale: 0.9 } } as any)} className={`w-10 h-10 rounded-full flex items-center justify-center border ${buttonBg}`}>
                    <AnimatePresence mode="wait"><motion.div key={theme} {...({ initial: { y: -10, opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: 10, opacity: 0 } } as any)}>{theme === 'dark' ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}</motion.div></AnimatePresence>
                </motion.button>
            </motion.div>
        </div>
    </header>
  );
};
