
import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Icons, appConfig } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { Section } from '../types';
import { SpotlightCard } from '../components/ui/SpotlightCard';

interface HomeProps {
    setActiveSection: (s: Section) => void;
}

// Static configuration for UI cards with Vibrant Colors
const sectionConfigs: { id: Section; icon: keyof typeof Icons; titleKey: string; descKey: string; color: string; gradient: string }[] = [
    { id: 'Live', icon: 'Tv', titleKey: 'Live', descKey: 'Watch streamers live', color: 'from-green-400 to-emerald-600', gradient: 'bg-gradient-to-br from-green-500/20 to-emerald-900/20' }, 
    { id: 'Votes', icon: 'Vote', titleKey: 'Votes', descKey: 'Vote for your favorites', color: 'from-orange-400 to-red-600', gradient: 'bg-gradient-to-br from-orange-500/20 to-red-900/20' },
    { id: 'Map', icon: 'Map', titleKey: 'Map', descKey: 'Interactive server map', color: 'from-blue-400 to-indigo-600', gradient: 'bg-gradient-to-br from-blue-500/20 to-indigo-900/20' },
    { id: 'Images', icon: 'Images', titleKey: 'Images', descKey: 'Gallery & Wallpapers', color: 'from-purple-400 to-pink-600', gradient: 'bg-gradient-to-br from-purple-500/20 to-pink-900/20' },
    { id: 'Links', icon: 'Links', titleKey: 'Links', descKey: 'Important links', color: 'from-cyan-400 to-blue-600', gradient: 'bg-gradient-to-br from-cyan-500/20 to-blue-900/20' },
    { id: 'Credits', icon: 'Credits', titleKey: 'Credits', descKey: 'Team & Contributors', color: 'from-yellow-400 to-amber-600', gradient: 'bg-gradient-to-br from-yellow-500/20 to-amber-900/20' }
];

export const HomePage: React.FC<HomeProps> = ({ setActiveSection }) => {
    const { t } = useI18n();

    // Standard animation variants for smooth entry without scroll-trigger lag
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 15 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="w-full flex flex-col gap-10 pb-20"
        >
            {/* Hero Section - Optimized: Static Gradients, Vibrant, Lighter Feel */}
            <motion.section 
                variants={itemVariants}
                className="relative w-full min-h-[40vh] flex flex-col items-start justify-center p-8 md:p-16 rounded-[40px] overflow-hidden border border-white/10 shadow-2xl bg-[#080808] group"
            >
                {/* Static Vivid Background */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[60%] h-[100%] bg-gradient-to-bl from-orange-600/20 via-red-900/10 to-transparent opacity-80" />
                    <div className="absolute bottom-0 left-0 w-[60%] h-[100%] bg-gradient-to-tr from-blue-600/10 via-purple-900/10 to-transparent opacity-80" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
                </div>

                <div className="relative z-10 max-w-3xl flex flex-col gap-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 w-fit backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-wider">System Online</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-display font-black leading-[0.9] text-white drop-shadow-xl tracking-tight">
                        THE ULTIMATE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-purple-600 animate-gradientBG bg-[200%_auto]">MTRP NEWS</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed max-w-xl opacity-90">
                        {t('cardInfoDescription')}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                        <button 
                            onClick={() => setActiveSection('Live')} 
                            className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        >
                            <Icons.Play className="w-5 h-5 fill-current" />
                            <span>Start Exploring</span>
                        </button>
                        <a 
                            href={appConfig.donateLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl hover:bg-white/10 border border-white/10 hover:border-orange-500/50 transition-all flex items-center gap-2 backdrop-blur-md"
                        >
                            <Icons.Star className="w-5 h-5 text-orange-400" />
                            <span>{t('donateButton')}</span>
                        </a>
                    </div>
                </div>
            </motion.section>

            {/* Quick Stats Grid - Colorful & Clean */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: t('followers'), value: '70K+', color: 'text-blue-400', bg: 'bg-blue-500/5 border-blue-500/20' },
                    { label: t('teamWorkers'), value: '3', color: 'text-orange-400', bg: 'bg-orange-500/5 border-orange-500/20' },
                    { label: t('goal'), value: '100K', color: 'text-green-400', bg: 'bg-green-500/5 border-green-500/20' },
                    { label: 'Status', value: 'Online', color: 'text-purple-400', bg: 'bg-purple-500/5 border-purple-500/20' }
                ].map((stat, i) => (
                    <motion.div 
                        key={i} 
                        variants={itemVariants}
                        className={`p-6 rounded-3xl ${stat.bg} border flex flex-col items-center justify-center gap-1 text-center hover:scale-105 transition-transform duration-300`}
                    >
                        <span className={`text-4xl font-display font-black ${stat.color} drop-shadow-sm`}>{stat.value}</span>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Section Cards Grid */}
            <motion.section variants={itemVariants} className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                    <h2 className="text-2xl font-display font-black text-white uppercase tracking-widest opacity-90">Explore Sections</h2>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sectionConfigs.map((card, i) => (
                        <SpotlightCard 
                            key={card.id}
                            title={t(card.titleKey)}
                            description={card.descKey}
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
