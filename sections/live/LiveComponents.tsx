
import React, { useMemo } from 'react';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { Streamer } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { RobustImage } from '../../components/ui/RobustImage';
import { motion } from 'framer-motion';

// --- SKELETON CARD ---
const StreamerCardSkeleton: React.FC = () => (
    <GlassCard className="flex flex-col !p-0 overflow-hidden h-full border border-white/5">
        <div className="h-28 w-full bg-white/5 animate-pulse" />
        <div className="px-4 pb-4 flex-1 flex flex-col">
            <div className="flex justify-between items-end -mt-8 mb-2">
                <div className="w-16 h-16 rounded-full bg-neutral-800 animate-pulse border-4 border-[#1a1a1a]" />
                <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse mb-1" />
            </div>
            <div className="space-y-2 mb-4">
                <div className="h-5 w-3/4 bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="flex gap-1 mb-4">
                <div className="h-4 w-12 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
            </div>
            <div className="mt-auto h-8 w-full bg-white/5 rounded animate-pulse" />
        </div>
    </GlassCard>
);

// --- STREAMER CARD ---
export const StreamerCard: React.FC<{ 
    streamer: Streamer, 
    onClick: () => void, 
    onToggleFavorite: (id: string) => void,
    onToggleNotify: (id: string) => Promise<boolean>,
    onRetry?: (id: string) => void,
    snowEnabled: boolean 
}> = ({ streamer, onClick, onToggleFavorite, onToggleNotify, onRetry, snowEnabled }) => {
    const { t } = useI18n();
    
    // Deterministic random decoration based on ID (prevents re-render flickering)
    const decorationType = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < streamer.id.length; i++) hash = streamer.id.charCodeAt(i) + ((hash << 5) - hash);
        // ~30% chance for a hanging lantern
        return (Math.abs(hash) % 10 < 3) ? 'hanging' as const : undefined;
    }, [streamer.id]);

    if (!streamer.kickData && !streamer.hasError) return <StreamerCardSkeleton />;

    const isLive = streamer.streamData?.is_live;
    const banner = streamer.kickData?.banner || ''; // No default image on error
    const avatar = streamer.kickData?.profile_pic || ''; // No default image on error
    const viewers = streamer.streamData?.viewers || 0;
    
    const handleNotifyClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await onToggleNotify(streamer.id);
    };

    const socials = streamer.links || {};

    return (
        <GlassCard 
            onClick={streamer.hasError ? undefined : onClick} 
            className={`flex flex-col !p-0 overflow-hidden group h-full transition-all duration-300 ${streamer.hasError ? '' : 'hover:border-orange-500/50'}`}
            isSnowy={snowEnabled}
            decoration={decorationType} // Randomly hanging lantern
        >
            {/* Error Overlay */}
            {streamer.hasError && (
                <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-md">
                    <button 
                        onClick={(e) => { e.stopPropagation(); if(onRetry) onRetry(streamer.id); }}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
                    >
                        <Icons.RefreshCcw className="w-4 h-4" />
                        {t('reload')}
                    </button>
                </div>
            )}

            {/* Content Container - Blurred if Error */}
            <div className={`flex flex-col h-full ${streamer.hasError ? 'blur-sm pointer-events-none opacity-50' : ''}`}>
                <div className="h-28 w-full relative bg-neutral-900">
                    {banner ? (
                        <RobustImage src={banner} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                        <div className="w-full h-full bg-neutral-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                        <button onClick={handleNotifyClick} className={`p-1.5 rounded-full backdrop-blur-md ${streamer.notificationsEnabled ? 'bg-orange-500 text-white' : 'bg-black/40 text-gray-400 hover:text-white'}`}>
                            {streamer.notificationsEnabled ? <Icons.Bell className="w-3.5 h-3.5" /> : <Icons.BellOff className="w-3.5 h-3.5" />}
                        </button>
                        <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase backdrop-blur-md flex items-center gap-1 ${isLive ? 'bg-green-600 text-white animate-pulse' : 'bg-black/60 text-gray-400'}`}>
                            {isLive ? <><div className="w-1.5 h-1.5 rounded-full bg-white" /> {t('live')}</> : t('offline')}
                        </div>
                    </div>
                </div>
                <div className="px-4 pb-4 relative flex-1 flex flex-col">
                    <div className="flex justify-between items-end -mt-8 mb-2">
                        <div className={`w-16 h-16 rounded-full overflow-hidden bg-black transition-shadow duration-300 ${isLive ? 'shadow-[0_0_20px_rgba(34,197,94,0.6)]' : ''} border-4 border-[#1a1a1a] z-10`}>
                            {avatar ? (
                                <RobustImage src={avatar} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-xs text-gray-600">N/A</div>
                            )}
                        </div>
                        <div className="flex gap-2 mb-1 z-10">
                            {/* Social Icons */}
                            {socials.twitter && <a href={socials.twitter} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-gray-500 hover:text-[#1DA1F2]"><Icons.Twitter className="w-4 h-4" /></a>}
                            {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-gray-500 hover:text-[#E4405F]"><Icons.Instagram className="w-4 h-4" /></a>}
                            {socials.youtube && <a href={socials.youtube} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-gray-500 hover:text-[#FF0000]"><Icons.YouTube className="w-4 h-4" /></a>}
                            {socials.discord && <a href={socials.discord} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} className="text-gray-500 hover:text-[#5865F2]"><Icons.Discord className="w-4 h-4" /></a>}
                            
                            <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(streamer.id); }} className={`${streamer.isFavorite ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`}>
                                <Icons.Star className={`w-5 h-5 ${streamer.isFavorite ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    </div>
                    <div className="mb-3 relative z-10">
                        <h3 className="font-bold text-white text-lg leading-tight line-clamp-1">{streamer.kickUsername}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                            {isLive && <span className="text-green-500 font-bold">{viewers.toLocaleString()} {t('viewers')}</span>}
                            {streamer.customTitle && <span>• {streamer.customTitle}</span>}
                        </div>
                    </div>
                    
                    {isLive ? (
                        <div className="mb-3 min-h-[2.5em] p-2 rounded bg-white/5 border border-white/10 relative z-10">
                            <p className="text-xs font-bold text-white line-clamp-2">{streamer.streamData?.title || t('streamTitle')}</p>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400 line-clamp-2 mb-3 min-h-[2.5em] relative z-10">{streamer.kickData?.bio || t('noBio')}</p>
                    )}

                    <div className="flex flex-wrap gap-1 mb-4 relative z-10">
                        {streamer.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-gray-400 uppercase tracking-wide">{tag}</span>
                        ))}
                    </div>
                    <div className="mt-auto pt-3 border-t border-white/5 relative z-10">
                        <a href={`https://kick.com/${streamer.kickUsername}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center justify-center gap-2 w-full py-2 bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white rounded-lg font-bold text-sm transition-colors border border-green-600/50">
                            <Icons.Video className="w-4 h-4" /> {t('watchChannel')}
                        </a>
                    </div>
                </div>
            </div>
        </GlassCard>
    );
};

// --- STREAMER DETAIL MODAL ---
export const StreamerDetailModal: React.FC<{ streamer: Streamer, onClose: () => void, onDelete: () => void, snowEnabled: boolean }> = ({ streamer, onClose, onDelete, snowEnabled }) => {
    const { t } = useI18n();
    const isLive = streamer.streamData?.is_live;
    const banner = streamer.kickData?.banner || 'https://via.placeholder.com/800x200';
    const profilePic = streamer.kickData?.profile_pic || 'https://via.placeholder.com/150';
    const username = streamer.kickUsername || 'Unknown';
    const streamTitle = streamer.streamData?.title || t('streamTitle');
    const viewers = streamer.streamData?.viewers || 0;
    const followers = streamer.kickData?.followers_count || 0;
    const bio = streamer.kickData?.bio || '';
    const characters = streamer.characters || [];
    const links = streamer.links || {};

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10000] flex items-center justify-center p-4" onClick={onClose}>
            <motion.div 
                {...({
                    initial: { x: -100, opacity: 0 },
                    animate: { x: 0, opacity: 1 },
                    exit: { x: -100, opacity: 0 },
                    transition: { type: "spring", damping: 25, stiffness: 200 }
                } as any)}
                className={`w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-[30px] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] ${snowEnabled ? 'frosted-effect' : ''}`} 
                onClick={e => e.stopPropagation()}
            >
                <div className="h-64 w-full relative shrink-0">
                    <RobustImage src={banner} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent"></div>
                    {/* Fixed Z-Index for Close Button to ensure it's clickable above the banner */}
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-white/10 p-2 rounded-full transition-colors z-50 cursor-pointer"><Icons.X className="w-6 h-6 text-white" /></button>
                    
                    <div className="absolute -bottom-10 left-8 flex items-end gap-6">
                        <div className="w-32 h-32 rounded-3xl border-4 border-neutral-900 shadow-2xl bg-black overflow-hidden">
                            <RobustImage src={profilePic} className="w-full h-full object-cover" />
                        </div>
                        <div className="mb-12">
                            <h2 className="text-4xl font-black text-white drop-shadow-lg">{username}</h2>
                            <div className="flex items-center gap-3">
                                {isLive && <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">{t('live')}</span>}
                                <span className="text-gray-300 font-bold text-sm bg-black/40 px-2 py-1 rounded">{followers.toLocaleString()} {t('followers')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 flex flex-col gap-6">
                            {isLive && (
                                <div className="p-4 rounded-2xl bg-green-900/10 border border-green-500/20">
                                    <h3 className="text-green-500 font-bold mb-1 flex items-center gap-2"><Icons.Wifi className="w-4 h-4" /> {t('liveNow')}</h3>
                                    <p className="text-xl font-bold text-white mb-2">{streamTitle}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1"><Icons.Eye className="w-4 h-4" /> {viewers.toLocaleString()} {t('viewers')}</span>
                                        <span>{streamer.streamData?.category_name}</span>
                                    </div>
                                    <a href={`https://kick.com/${username}`} target="_blank" className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors">
                                        <Icons.Play className="w-5 h-5 fill-current" /> {t('watchStream')}
                                    </a>
                                </div>
                            )}

                            <div>
                                <h4 className="text-lg font-bold text-white mb-2">{t('about')}</h4>
                                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{bio || t('noBio')}</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {streamer.tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 font-medium">{tag}</span>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            {characters.length > 0 && (
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Icons.Users className="w-4 h-4" /> {t('characters')}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {characters.map((c, i) => <span key={i} className="px-2 py-1 bg-white/10 rounded text-sm text-white">{c}</span>)}
                                    </div>
                                </div>
                            )}

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Icons.Link className="w-4 h-4" /> {t('socials')}</h4>
                                <div className="flex flex-col gap-3">
                                    <a href={`https://kick.com/${username}`} target="_blank" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-white">
                                        <div className="p-2 bg-[#53FC18] text-black rounded-full"><Icons.Kick className="w-4 h-4" /></div>
                                        <span className="font-bold">Kick Channel</span>
                                    </a>
                                    {links.discord && (
                                        <a href={links.discord} target="_blank" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-white">
                                            <div className="p-2 bg-[#5865F2] text-white rounded-full"><Icons.Discord className="w-4 h-4" /></div>
                                            <span className="font-bold">Discord</span>
                                        </a>
                                    )}
                                    {links.twitter && (
                                        <a href={links.twitter} target="_blank" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-white">
                                            <div className="p-2 bg-[#1DA1F2] text-white rounded-full"><Icons.Twitter className="w-4 h-4" /></div>
                                            <span className="font-bold">Twitter</span>
                                        </a>
                                    )}
                                    {links.instagram && (
                                        <a href={links.instagram} target="_blank" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-white">
                                            <div className="p-2 bg-[#E4405F] text-white rounded-full"><Icons.Instagram className="w-4 h-4" /></div>
                                            <span className="font-bold">Instagram</span>
                                        </a>
                                    )}
                                    {links.youtube && (
                                        <a href={links.youtube} target="_blank" className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-white">
                                            <div className="p-2 bg-[#FF0000] text-white rounded-full"><Icons.YouTube className="w-4 h-4" /></div>
                                            <span className="font-bold">YouTube</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
