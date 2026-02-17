
import React from 'react';
import { motion } from 'framer-motion';
import { Icons, creditsData } from '../constants';
import { useI18n } from '../contexts/I18nContext';

export const CreditsPage: React.FC = () => {
    const { t } = useI18n();

    // Vibrant gradients for roles
    const getRoleGradient = (role: string) => {
        switch(role) {
            case 'founder': return 'from-orange-500 to-red-600';
            case 'developer': return 'from-blue-500 to-cyan-600';
            default: return 'from-purple-500 to-pink-600';
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 flex flex-col gap-12">
            <div className="text-center mb-4">
                <h2 className="text-4xl font-display font-black text-white mb-2">{t('creditsFor')} <span className="text-orange-500">MTRP</span></h2>
                <p className="text-gray-400">{t('creditsSubtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {creditsData.map((person, idx) => {
                    const gradient = getRoleGradient(person.roleKey);
                    
                    return (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -10 }}
                            className="group relative h-[400px] perspective-1000"
                        >
                            {/* Card Body */}
                            <div className="absolute inset-0 bg-[#121212] border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(0,0,0,0.5)] group-hover:border-white/20">
                                
                                {/* Top Gradient Background */}
                                <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-br ${gradient} opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

                                <div className="relative flex flex-col items-center pt-16 h-full px-6 pb-6">
                                    
                                    {/* Image with Glowing Ring */}
                                    <div className="relative w-32 h-32 mb-6">
                                        <div className={`absolute -inset-1 bg-gradient-to-r ${gradient} rounded-full blur opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-spinSlow`}></div>
                                        <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#121212] bg-[#1a1a1a]">
                                            <img src={person.image} alt={person.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        </div>
                                        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r ${gradient} text-white text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap`}>
                                            {t(person.roleKey)}
                                        </div>
                                    </div>

                                    {/* Text Info */}
                                    <h3 className="text-2xl font-black text-white mb-2 tracking-tight group-hover:scale-105 transition-transform duration-300">{person.name}</h3>
                                    <div className="w-12 h-1 bg-white/10 rounded-full mb-6 group-hover:w-24 group-hover:bg-orange-500 transition-all duration-500"></div>

                                    {/* Socials - Reveal on Hover */}
                                    <div className="mt-auto flex gap-3 translate-y-4 opacity-50 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        {(person.socials || []).map((social, sIdx) => {
                                            const Icon = Icons[social.platform as keyof typeof Icons] || Icons.Link;
                                            return (
                                                <a 
                                                    key={sIdx} 
                                                    href={social.url} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 hover:bg-white hover:text-black hover:scale-110 transition-all duration-300"
                                                >
                                                    {/* @ts-ignore */}
                                                    <Icon className="w-5 h-5" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
