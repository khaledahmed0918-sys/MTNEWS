
import React from 'react';
import { motion } from 'framer-motion';
import { Icons, appConfig } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { BorderGlowWrapper } from '../components/ui/SharedInputs';

export const HomePage: React.FC = () => {
    const { t, dir } = useI18n();
    const subTextColor = 'text-gray-600 dark:text-gray-300';
    const titleColor = 'text-gray-900 dark:text-white';
    
    const stats = [
        { value: '70,000', label: t('followers'), color: 'bg-gray-400' },
        { value: '3', label: t('teamWorkers'), color: 'bg-orange-500' },
        { value: '100K', label: t('goal'), color: 'bg-red-500' }
    ];
    
    const gradientClass = dir === 'rtl' ? 'bg-gradient-to-l' : 'bg-gradient-to-r';

    return (
        <div className="w-full max-w-7xl mx-auto p-4 -mt-10">
            <BorderGlowWrapper className="resize-y overflow-hidden min-h-[300px]" rect>
                <div className="bg-transparent flex flex-col w-full relative h-full">
                    <div className="py-3 px-6 flex items-center justify-between border-b border-gray-200 dark:border-white/10 shrink-0 bg-white/5">
                        <h2 className={`text-xl font-bold ${titleColor} tracking-wide`}>{t('mtnewsCardTitle')}</h2>
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        </div>
                    </div>

                    <div className="p-8 flex flex-col gap-8 h-full">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 w-full">
                            <div className="flex-shrink-0">
                                <motion.div whileHover={{ scale: 1.05, rotate: 5 }} className="p-1 rounded-full border-2 border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.3)] bg-black">
                                    <img src="https://i.postimg.cc/PrqvJ5RX/IMG-7993.png" alt="MTNEWS Icon" className="w-40 h-40 rounded-full object-cover" />
                                </motion.div>
                            </div>
                            
                            <div className="flex flex-col gap-6 flex-1 w-full text-center md:text-start">
                                <div className="space-y-2">
                                    <h3 className={`text-4xl font-extrabold ${titleColor}`}>{t('cardInfoTitle')}</h3>
                                    <div className={`h-1.5 w-24 ${gradientClass} from-orange-500 to-transparent mx-auto md:mx-0 rounded-full`}></div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                                    {stats.map((stat) => (
                                        <motion.div key={stat.label} whileHover={{ y: -2 }} className="flex flex-col items-center md:items-start p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors shadow-sm">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className={`w-2.5 h-2.5 rounded-full ${stat.color}`}></div>
                                                <span className={`${subTextColor} text-xs font-bold uppercase tracking-wider`}>{stat.label}</span>
                                            </div>
                                            <span className={`${titleColor} text-3xl font-black tracking-tight`}>{stat.value}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="w-full bg-white/5 p-6 rounded-2xl border border-white/5 shadow-inner">
                            <p className={`${subTextColor} text-lg leading-relaxed font-medium text-center md:text-start`}>{t('cardInfoDescription')}</p>
                        </div>
                        
                        <div className="mt-auto pt-4">
                            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-600/20 via-orange-900/10 to-red-600/20 border border-orange-500/30 p-6 flex flex-col md:flex-row items-center justify-between gap-6 group">
                                <div className="absolute inset-0 bg-orange-500/5 group-hover:bg-orange-500/10 transition-colors duration-500"></div>
                                <div className="relative z-10 flex flex-col items-center md:items-start gap-1">
                                    <h4 className="text-orange-500 font-bold text-xl flex items-center gap-2">
                                        <Icons.Star className="w-5 h-5 fill-current" />
                                        {t('donateButton')}
                                    </h4>
                                    <p className={`${subTextColor} text-sm font-medium opacity-90`}>{t('donatePrompt')}</p>
                                </div>
                                <motion.a 
                                    href={appConfig.donateLink} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="relative z-10 bg-gradient-to-r from-orange-600 to-red-600 text-white font-bold py-3 px-12 rounded-xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] flex items-center gap-2 border border-white/20" 
                                    whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(249, 115, 22, 0.6)' }} 
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <span>{t('donateButton')}</span>
                                    <Icons.ExternalLink className="w-4 h-4" />
                                </motion.a>
                            </div>
                        </div>
                    </div>
                </div>
            </BorderGlowWrapper>
        </div>
    );
};
