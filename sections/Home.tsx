
import React from 'react';
import { motion } from 'framer-motion';
import { Icons, appConfig } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { Section } from '../types';
import { SpotlightCard } from '../components/ui/SpotlightCard';

interface HomeProps {
    setActiveSection: (s: Section) => void;
}

const sectionConfigs: { id: Section; icon: keyof typeof Icons; titleKey: string; descKey: string; color: string }[] = [
    { id: 'Live', icon: 'Tv', titleKey: 'Live', descKey: 'Watch streamers live', color: 'from-green-500 to-emerald-700' }, 
    { id: 'Votes', icon: 'Vote', titleKey: 'Votes', descKey: 'Vote for your favorites', color: 'from-orange-500 to-red-600' },
    { id: 'Map', icon: 'Map', titleKey: 'Map', descKey: 'Interactive server map', color: 'from-blue-500 to-indigo-700' },
    { id: 'Images', icon: 'Images', titleKey: 'Images', descKey: 'Gallery & Wallpapers', color: 'from-purple-500 to-pink-700' },
    { id: 'Links', icon: 'Links', titleKey: 'Links', descKey: 'Important links', color: 'from-gray-500 to-gray-700' },
    { id: 'Credits', icon: 'Credits', titleKey: 'Credits', descKey: 'Team & Contributors', color: 'from-yellow-500 to-amber-700' }
];

export const HomePage: React.FC<HomeProps> = ({ setActiveSection }) => {
    const { t } = useI18n();

    return (
        <div className="w-full flex flex-col gap-12 pb-20">
            {/* Hero Section */}
            <section className="relative w-full min-h-[50vh] flex flex-col items-start justify-center p-6 md:p-12 rounded-[40px] overflow-hidden border border-white/5 shadow-2xl group bg-[#080808]">
                {/* Abstract Hero Background */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 animate-pulse" style={{ animationDuration: '10s' }} />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3 animate-pulse" style={{ animationDuration: '15s' }} />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
                </div>

                <div className="relative z-10 max-w-2xl flex flex-col gap-6">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-display font-black leading-tight text-white"
                    >
                        THE ULTIMATE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">MTRP NEWS</span>
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-gray-300 font-medium leading-relaxed max-w-lg"
                    >
                        {t('cardInfoDescription')}
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-wrap gap-4"
                    >
                        <button onClick={() => setActiveSection('Live')} className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            <Icons.Play className="w-5 h-5 fill-current" />
                            Start Exploring
                        </button>
                        <a href={appConfig.donateLink} target="_blank" className="px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 border border-white/10 backdrop-blur-md transition-colors flex items-center gap-2">
                            <Icons.Star className="w-5 h-5" />
                            {t('donateButton')}
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: t('followers'), value: '70K+', color: 'text-blue-400' },
                    { label: t('teamWorkers'), value: '3', color: 'text-orange-400' },
                    { label: t('goal'), value: '100K', color: 'text-green-400' },
                    { label: 'Status', value: 'Online', color: 'text-purple-400' }
                ].map((stat, i) => (
                    <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-3xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1 text-center hover:bg-white/10 transition-colors"
                    >
                        <span className={`text-3xl font-display font-black ${stat.color}`}>{stat.value}</span>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Section Cards Grid */}
            <section className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                    <h2 className="text-2xl font-display font-bold text-white uppercase tracking-widest">Explore Sections</h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
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
                            delay={i * 0.1}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};
