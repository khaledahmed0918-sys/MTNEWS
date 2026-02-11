
import React from 'react';
import { Icons, linksData } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { GlassCard } from '../components/ui/GlassCard';

export const LinksPage: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            {linksData.map(link => {
                const Icon = Icons[link.platform as keyof typeof Icons] || Icons.Link;
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