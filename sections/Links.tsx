
import React from 'react';
import { motion } from 'framer-motion';
import { Icons, linksData } from '../constants';
import { useI18n } from '../contexts/I18nContext';

export const LinksPage: React.FC = () => {
    const { t } = useI18n();

    const getBrandStyle = (platform: string) => {
        switch(platform) {
            case 'Twitter': return { bg: 'from-[#1DA1F2]/20 to-[#1DA1F2]/5', border: 'hover:border-[#1DA1F2]', icon: 'text-[#1DA1F2]' };
            case 'Discord': return { bg: 'from-[#5865F2]/20 to-[#5865F2]/5', border: 'hover:border-[#5865F2]', icon: 'text-[#5865F2]' };
            case 'YouTube': return { bg: 'from-[#FF0000]/20 to-[#FF0000]/5', border: 'hover:border-[#FF0000]', icon: 'text-[#FF0000]' };
            case 'TikTok': return { bg: 'from-[#000000]/40 to-[#00f2ea]/10 via-[#ff0050]/10', border: 'hover:border-white', icon: 'text-white' };
            case 'Instagram': return { bg: 'from-[#E4405F]/20 to-[#E4405F]/5', border: 'hover:border-[#E4405F]', icon: 'text-[#E4405F]' };
            default: return { bg: 'from-orange-500/20 to-orange-500/5', border: 'hover:border-orange-500', icon: 'text-orange-500' };
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {linksData.map((link, idx) => {
                    const Icon = Icons[link.platform as keyof typeof Icons] || Icons.Link;
                    const style = getBrandStyle(link.platform);

                    return (
                        <motion.a 
                            key={link.id} 
                            href={link.url} 
                            target="_blank" 
                            rel="noreferrer"
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`group relative h-40 rounded-3xl border border-white/10 bg-[#121212] overflow-hidden flex items-center p-8 transition-all duration-300 ${style.border} hover:shadow-2xl hover:bg-white/5`}
                        >
                            {/* Background Blur Blob */}
                            <div className={`absolute -right-10 -bottom-10 w-48 h-48 bg-gradient-to-br ${style.bg} rounded-full blur-[60px] opacity-50 group-hover:opacity-80 transition-opacity duration-500`}></div>
                            
                            {/* Content */}
                            <div className="relative z-10 flex items-center gap-6 w-full">
                                <div className={`w-20 h-20 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 backdrop-blur-md`}>
                                    {/* @ts-ignore */}
                                    <Icon className={`w-10 h-10 ${style.icon}`} />
                                </div>
                                
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black text-white tracking-tight group-hover:translate-x-2 transition-transform duration-300">{t(link.platform)}</span>
                                    <span className="text-gray-500 font-bold group-hover:text-gray-300 transition-colors flex items-center gap-2">
                                        {t('linkButton')} 
                                        <Icons.ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </span>
                                </div>

                                <div className="ml-auto">
                                    <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-300">
                                        <Icons.ArrowRight className="w-6 h-6 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                                    </div>
                                </div>
                            </div>
                        </motion.a>
                    )
                })}
            </div>
        </div>
    );
};
