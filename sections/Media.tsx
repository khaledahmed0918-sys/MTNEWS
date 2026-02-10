
import React from 'react';
import { Icons, threadsData, linksData, creditsData } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { GlassCard } from '../components/ui/GlassCard';

export const ThreadsPage: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-6">
            {threadsData.map((thread) => (
                <GlassCard key={thread.id} className="flex flex-col gap-4">
                    <div className="relative h-48 w-full rounded-xl overflow-hidden">
                        <img src={thread.image} alt={thread.title} className="w-full h-full object-cover" />
                        <div className="absolute bottom-0 left-0 p-4 bg-gradient-to-t from-black/80 to-transparent w-full">
                            <h3 className="text-2xl font-bold text-white">{thread.title}</h3>
                            <div className="flex items-center gap-2 text-gray-300 text-sm">
                                <Icons.Calendar className="w-4 h-4" />
                                <span>{thread.date}</span>
                                <span className="mx-1">•</span>
                                <span>{thread.owner}</span>
                            </div>
                        </div>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{thread.description}</p>
                    {thread.sections.map((section, idx) => (
                        <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <p className="text-gray-200">{section.content}</p>
                        </div>
                    ))}
                    {thread.socials && (
                        <div className="flex gap-2 mt-2">
                             {Object.entries(thread.socials).map(([platform, url]) => {
                                 const Icon = Icons[platform.charAt(0).toUpperCase() + platform.slice(1) as keyof typeof Icons] || Icons.Link;
                                 return (
                                     <a key={platform} href={url} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-orange-500 hover:text-white transition-colors">
                                         {/* @ts-ignore */}
                                         <Icon className="w-5 h-5" />
                                     </a>
                                 )
                             })}
                        </div>
                    )}
                </GlassCard>
            ))}
        </div>
    );
};

export const LinksPage: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {linksData.map(link => {
                const Icon = Icons[link.platform] || Icons.Link;
                const colors: Record<string, string> = {
                    Twitter: 'hover:bg-[#1DA1F2] hover:border-[#1DA1F2]',
                    Discord: 'hover:bg-[#5865F2] hover:border-[#5865F2]',
                    YouTube: 'hover:bg-[#FF0000] hover:border-[#FF0000]',
                    TikTok: 'hover:bg-[#000000] hover:border-[#000000]',
                    Instagram: 'hover:bg-[#E4405F] hover:border-[#E4405F]',
                };
                return (
                    <a key={link.id} href={link.url} target="_blank" rel="noreferrer">
                        <GlassCard className={`flex items-center gap-4 transition-all group ${colors[link.platform] || 'hover:bg-orange-500'}`}>
                            <div className="p-3 bg-white/10 rounded-full group-hover:bg-white/20 transition-colors">
                                {/* @ts-ignore */}
                                <Icon className="w-8 h-8 group-hover:scale-110 transition-transform" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-lg group-hover:text-white">{link.platform}</span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-white/80">{t('linkButton')}</span>
                            </div>
                            <Icons.ExternalLink className="ml-auto w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-white" />
                        </GlassCard>
                    </a>
                )
            })}
        </div>
    );
};

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
