
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { quranVerses } from '../../constants/quran';
import { Section } from '../../types';

export const QuranCard: React.FC<{ section: Section }> = ({ section }) => {
    const [verse, setVerse] = useState(quranVerses[0]);

    useEffect(() => {
        // Pick a random verse whenever the section changes or component mounts
        const randomIndex = Math.floor(Math.random() * quranVerses.length);
        setVerse(quranVerses[randomIndex]);
    }, [section]);

    return (
        <div className="w-full mb-8 relative z-20">
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-slate-900/40 backdrop-blur-xl border border-blue-500/20 shadow-[0_0_40px_rgba(59,130,246,0.15)] group"
            >
                {/* Ambient Blue Glow Effects */}
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-1000" />
                <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-1000" />
                
                {/* Subtle Grain Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center gap-5">
                    {/* Surah Label */}
                    <div className="flex items-center gap-2 mb-1">
                        <div className="h-px w-8 bg-gradient-to-r from-transparent to-blue-500/50"></div>
                        <h3 className="text-xs md:text-sm font-bold text-blue-300 tracking-widest uppercase font-sans">{verse.surah}</h3>
                        <div className="h-px w-8 bg-gradient-to-l from-transparent to-blue-500/50"></div>
                    </div>

                    {/* Quran Text */}
                    <p className="text-2xl md:text-4xl font-display font-black text-white leading-relaxed drop-shadow-lg" dir="rtl" style={{ fontFamily: 'Amiri, serif' }}>
                        ﴿{verse.text}﴾
                    </p>

                    {/* Decorative Divider */}
                    <div className="w-12 h-1 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent rounded-full my-1" />

                    {/* Tafsir */}
                    <div className="bg-black/20 rounded-xl p-4 border border-white/5 backdrop-blur-sm max-w-4xl">
                        <p className="text-gray-300 text-sm md:text-base leading-loose" dir="rtl">
                            <span className="text-blue-400 font-bold ml-2">التفسير:</span>
                            {verse.tafsir}
                        </p>
                    </div>
                </div>
            </motion.div>
            
            {/* Section Separator Line */}
            <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-8" 
            />
        </div>
    );
};
