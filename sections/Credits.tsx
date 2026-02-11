
import React from 'react';
import { Icons, creditsData } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { GlassCard } from '../components/ui/GlassCard';

export const CreditsPage: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {creditsData.map((person, idx) => (
                    <div key={idx} className="group relative">
                        <GlassCard className="flex flex-col items-center gap-5 pt-8 pb-8 transition-all duration-500 hover:bg-white/10 dark:hover:bg-white/5 border border-white/10">
                            {/* Role Badge */}
                            <div className="absolute top-4 right-4">
                                <span className="px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-500 text-xs font-bold uppercase tracking-widest">
                                    {t(person.roleKey)}
                                </span>
                            </div>

                            {/* Image Container */}
                            <div className="relative w-32 h-32 rounded-full p-1 border-2 border-white/10 group-hover:border-orange-500/50 transition-colors duration-500">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md"></div>
                                <img 
                                    src={person.image} 
                                    alt={person.name} 
                                    className="w-full h-full rounded-full object-cover relative z-10 bg-neutral-900" 
                                />
                            </div>

                            {/* Content */}
                            <div className="flex flex-col items-center gap-1 text-center">
                                <h3 className="text-2xl font-bold text-white tracking-tight">{person.name}</h3>
                                <div className="w-8 h-1 bg-orange-500/50 rounded-full mt-2 mb-2 group-hover:w-16 transition-all duration-500"></div>
                            </div>

                            {/* Socials */}
                            <div className="flex items-center gap-3 mt-2">
                                {(person.socials || []).map((social, sIdx) => {
                                    const Icon = Icons[social.platform as keyof typeof Icons] || Icons.Link;
                                    return (
                                        <a 
                                            key={sIdx} 
                                            href={social.url} 
                                            target="_blank" 
                                            rel="noreferrer" 
                                            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-orange-500 hover:text-white transition-all duration-300 border border-white/5 hover:border-orange-500 shadow-sm"
                                        >
                                            {/* @ts-ignore */}
                                            <Icon className="w-5 h-5" />
                                        </a>
                                    );
                                })}
                            </div>
                        </GlassCard>
                    </div>
                ))}
            </div>
        </div>
    );
};