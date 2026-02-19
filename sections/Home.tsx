
import React, { useMemo } from 'react';
import { motion, Variants } from 'framer-motion';
import { Icons, appConfig, navConfig } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { Section } from '../types';
import { SpotlightCard } from '../components/ui/SpotlightCard';
import { GlassCard } from '../components/ui/GlassCard'; 

interface HomeProps {
    setActiveSection: (s: Section) => void;
}

// Static configuration for UI cards with Vibrant Colors
const sectionConfigs: { id: Section; icon: keyof typeof Icons; titleKey: string; descKey: string; color: string; gradient: string }[] = [
    { id: 'Live', icon: 'Tv', titleKey: 'Live', descKey: 'liveDesc', color: 'from-green-400 to-emerald-600', gradient: 'bg-gradient-to-br from-green-500/10 to-emerald-900/10' }, 
    { id: 'Votes', icon: 'Vote', titleKey: 'Votes', descKey: 'votesDesc', color: 'from-orange-400 to-red-600', gradient: 'bg-gradient-to-br from-orange-500/10 to-red-900/10' },
    { id: 'Map', icon: 'Map', titleKey: 'Map', descKey: 'mapDesc', color: 'from-blue-400 to-indigo-600', gradient: 'bg-gradient-to-br from-blue-500/10 to-indigo-900/10' },
    { id: 'Analyzing', icon: 'Analyzing', titleKey: 'Analyzing', descKey: 'analyzingDesc', color: 'from-teal-400 to-cyan-600', gradient: 'bg-gradient-to-br from-teal-500/10 to-cyan-900/10' },
    { id: 'Clips', icon: 'Clips', titleKey: 'Clips', descKey: 'clipsDesc', color: 'from-red-400 to-rose-600', gradient: 'bg-gradient-to-br from-red-500/10 to-rose-900/10' },
    { id: 'Images', icon: 'Images', titleKey: 'Images', descKey: 'imagesDesc', color: 'from-purple-400 to-pink-600', gradient: 'bg-gradient-to-br from-purple-500/10 to-pink-900/10' },
    { id: 'Links', icon: 'Links', titleKey: 'Links', descKey: 'linksDesc', color: 'from-cyan-400 to-blue-600', gradient: 'bg-gradient-to-br from-cyan-500/10 to-blue-900/10' },
    { id: 'Credits', icon: 'Credits', titleKey: 'Credits', descKey: 'creditsDesc', color: 'from-yellow-400 to-amber-600', gradient: 'bg-gradient-to-br from-yellow-500/10 to-amber-900/10' }
];

export const HomePage: React.FC<HomeProps> = ({ setActiveSection }) => {
    const { t, lang } = useI18n();

    // Filter cards based on enabled status in navConfig
    const visibleSections = useMemo(() => {
        return sectionConfigs.filter(card => {
            const navItem = navConfig.find(n => n.id === card.id);
            return navItem && navItem.enabled;
        });
    }, []);

    // Optimized Animation Variants - Reduced complexity
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { duration: 0.3 } 
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 10 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.25, ease: "easeOut" }
        }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full flex flex-col gap-8 pb-20"
        >
            {/* Hero Section */}
            <motion.section variants={itemVariants}>
                <GlassCard 
                    decoration="hanging" 
                    className="relative w-full min-h-[35vh] flex flex-col items-start justify-center p-6 md:p-12 rounded-[32px] overflow-hidden"
                >
                    {/* Simplified Background Blobs for Performance - Removed Orange Blob */}
                    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" style={{ willChange: 'transform' }}>
                        <div className="absolute -bottom-[20%] -left-[10%] w-[60%] h-[80%] bg-blue-600/10 rounded-full blur-[60px]" />
                    </div>

                    <div className="relative z-10 max-w-3xl flex flex-col gap-5">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 w-fit">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">{t('systemOnline')}</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-display font-black leading-[0.95] text-white tracking-tight">
                            {lang === 'ar' ? 'الحساب' : 'THE ULTIMATE'} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
                                {lang === 'ar' ? 'الإخباري' : 'MT NEWS'}
                            </span>
                        </h1>

                        <p className="text-base md:text-lg text-gray-400 font-medium leading-relaxed max-w-lg">
                            {t('cardInfoDescription')}
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2">
                            <button 
                                onClick={() => setActiveSection('Live')} 
                                className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <Icons.Play className="w-5 h-5 fill-current" />
                                <span>{t('startExploring')}</span>
                            </button>
                            <a 
                                href={appConfig.donateLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2"
                            >
                                <Icons.Star className="w-5 h-5 text-orange-400" />
                                <span>{t('donateButton')}</span>
                            </a>
                        </div>
                    </div>
                </GlassCard>
            </motion.section>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: t('followers'), value: '70K+', color: 'text-blue-400', bg: 'bg-blue-900/10 border-blue-500/10' },
                    { label: t('teamWorkers'), value: '3', color: 'text-orange-400', bg: 'bg-orange-900/10 border-orange-500/10' },
                    { label: t('goal'), value: '100K', color: 'text-green-400', bg: 'bg-green-900/10 border-green-500/10' },
                    { label: t('onlineStatus'), value: 'Online', color: 'text-purple-400', bg: 'bg-purple-900/10 border-purple-500/10' }
                ].map((stat, i) => (
                    <motion.div 
                        key={i} 
                        variants={itemVariants}
                        className={`p-4 rounded-2xl ${stat.bg} border flex flex-col items-center justify-center gap-1 text-center hover:bg-opacity-80 transition-colors backdrop-blur-md`}
                    >
                        <span className={`text-3xl font-display font-black ${stat.color}`}>{stat.value}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Section Cards Grid */}
            <motion.section variants={itemVariants} className="flex flex-col gap-5">
                <div className="flex items-center gap-4 px-2">
                    <div className="h-px flex-1 bg-white/5"></div>
                    <h2 className="text-xl font-display font-black text-white uppercase tracking-widest opacity-80">{t('exploreSections')}</h2>
                    <div className="h-px flex-1 bg-white/5"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleSections.map((card, i) => (
                        <SpotlightCard 
                            key={card.id}
                            title={t(card.titleKey)}
                            description={t(card.descKey)}
                            icon={card.icon}
                            color={card.color}
                            onClick={() => setActiveSection(card.id)}
                        />
                    ))}
                </div>
            </motion.section>
        </motion.div>
    );
};
