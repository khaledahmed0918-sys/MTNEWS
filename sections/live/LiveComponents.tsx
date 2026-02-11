
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { Streamer, KickChannelInfo, KickStreamInfo } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { AsyncButton } from '../../components/ui/AsyncButton';
import { useLive } from '../../contexts/LiveContext';
import { useToast } from '../../contexts/NotificationContext';

// --- SKELETON CARD ---
const StreamerCardSkeleton: React.FC = () => (
    <GlassCard className="flex flex-col !p-0 overflow-hidden h-full border border-white/5">
        <div className="h-28 w-full bg-white/5 animate-pulse" />
        <div className="px-4 pb-4 flex-1 flex flex-col">
            <div className="flex justify-between items-end -mt-8 mb-2">
                <div className="w-16 h-16 rounded-xl bg-neutral-800 animate-pulse border-4 border-[#1a1a1a]" />
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

// --- ADD STREAMER MODAL ---
export const AddStreamerModal: React.FC<{ onClose: () => void, isAdminMode?: boolean }> = ({ onClose, isAdminMode = false }) => {
    // ... (Keep existing implementation logic, just re-exporting to be safe with file replace)
    const { t } = useI18n();
    const { addLocalStreamer, addGlobalStreamer } = useLive();
    const { addToast } = useToast();
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<'idle' | 'searching' | 'verified' | 'failed'>('idle');
    const [foundData, setFoundData] = useState<{ kickData: KickChannelInfo, streamData: KickStreamInfo } | null>(null);
    const [customName, setCustomName] = useState('');
    const [tags, setTags] = useState('');
    const [notes, setNotes] = useState('');
    const [characters, setCharacters] = useState('');
    const [links, setLinks] = useState({ discord: '', kick: '', instagram: '', youtube: '', twitter: '' });

    const handleSearch = async () => {
        if(!query || query.length < 3) return;
        setStatus('searching');
        setFoundData(null);
        let username = query.trim();
        const urlMatch = username.match(/kick\.com\/([^\/]+)/);
        if (urlMatch) username = urlMatch[1];
        
        try {
            const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://kick.com/api/v2/channels/${username}`)}`);
            if (!response.ok) throw new Error("Not Found");
            const json = await response.json();
            const root = json.data ? json.data : json; 
            if (!root.user) throw new Error("No user");

            setFoundData({
                kickData: {
                    id: root.id, slug: root.slug, user_id: root.user.id, username: root.user.username, profile_pic: root.user.profile_pic,
                    banner: root.banner_image?.url || root.banner_image || '', followers_count: root.followers_count, created_at: root.created_at, bio: root.user.bio || ''
                },
                streamData: { id: 0, is_live: false, viewers: 0, start_time: '', title: '', category_name: '', category_icon: '', thumbnail: '' }
            });
            setStatus('verified');
        } catch (e) {
            setStatus('failed');
        }
    };

    const handleConfirm = async () => {
        if (!foundData) return;
        if (isAdminMode) {
            await addGlobalStreamer(foundData.kickData.slug, tags, characters, links);
            addToast("Streamer Added Globally", 'success');
        } else {
            addLocalStreamer({
                id: Math.random().toString(36).substring(7),
                kickUsername: foundData.kickData.slug,
                kickData: foundData.kickData,
                streamData: foundData.streamData,
                customTitle: customName,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                notes: notes,
                isFavorite: false,
                notificationsEnabled: false,
                lastUpdated: Date.now(),
                addedAt: Date.now(),
                isSystem: false
            });
            addToast(t('streamerAdded'), 'success');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[10000] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" noRound>
                 <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-xl font-bold text-white">{isAdminMode ? "Add Global Streamer" : t('addStreamer')}</h3>
                    <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1 flex flex-col gap-4">
                    <div className="relative">
                        <input value={query} onChange={e => { setQuery(e.target.value); setStatus('idle'); }} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder={t('kickUrlOrUser')} className="w-full p-4 pr-12 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500" />
                        <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white">
                            {status === 'searching' ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.Search className="w-4 h-4" />}
                        </button>
                    </div>
                    {status === 'failed' && <p className="text-red-500 text-sm font-bold">{t('streamerNotFound')}</p>}
                    <AnimatePresence>
                        {foundData && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl overflow-hidden">
                                <img src={foundData.kickData.profile_pic} className="w-12 h-12 rounded-full border border-white/20" />
                                <div><h4 className="font-bold text-white">{foundData.kickData.username}</h4><span className="text-xs text-green-400 font-bold">{t('verified')}</span></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className={`flex flex-col gap-3 transition-opacity ${!foundData ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                         {!isAdminMode && (<div className="space-y-1"><label className="text-xs text-gray-400 uppercase font-bold">{t('customName')}</label><input value={customName} onChange={e => setCustomName(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white" /></div>)}
                         <div className="space-y-1"><label className="text-xs text-gray-400 uppercase font-bold">{t('streamerTags')}</label><input value={tags} onChange={e => setTags(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white" placeholder="Roleplay, Gangs" /></div>
                         {isAdminMode && (<><div className="space-y-1"><label className="text-xs text-gray-400 uppercase font-bold">Characters</label><input value={characters} onChange={e => setCharacters(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white" /></div><div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-2"><label className="text-xs text-orange-500 uppercase font-bold">Social Links</label><input value={links.discord} onChange={e => setLinks({...links, discord: e.target.value})} placeholder="Discord" className="w-full p-2 rounded-lg bg-white/5 text-sm text-white" /><input value={links.twitter} onChange={e => setLinks({...links, twitter: e.target.value})} placeholder="Twitter" className="w-full p-2 rounded-lg bg-white/5 text-sm text-white" /><input value={links.instagram} onChange={e => setLinks({...links, instagram: e.target.value})} placeholder="Instagram" className="w-full p-2 rounded-lg bg-white/5 text-sm text-white" /><input value={links.youtube} onChange={e => setLinks({...links, youtube: e.target.value})} placeholder="YouTube" className="w-full p-2 rounded-lg bg-white/5 text-sm text-white" /></div></>)}
                         {!isAdminMode && (<div className="space-y-1"><label className="text-xs text-gray-400 uppercase font-bold">{t('streamerNotes')}</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white min-h-[80px]" /></div>)}
                    </div>
                    <AsyncButton onClick={handleConfirm} disabled={!foundData} label={t('add')} variant="success" className="w-full py-4 mt-2" />
                </div>
            </GlassCard>
        </div>
    );
};

// --- STREAMER CARD ---
export const StreamerCard: React.FC<{ 
    streamer: Streamer, 
    onClick: () => void, 
    onToggleFavorite: (id: string) => void,
    onToggleNotify: (id: string) => void,
    snowEnabled: boolean 
}> = ({ streamer, onClick, onToggleFavorite, onToggleNotify, snowEnabled }) => {
    
    // If we don't have basic fetch data yet, show skeleton
    if (!streamer.kickData) return <StreamerCardSkeleton />;

    const { t } = useI18n();
    const isLive = streamer.streamData?.is_live;
    const banner = streamer.kickData.banner || 'https://via.placeholder.com/800x200';
    const avatar = streamer.kickData.profile_pic || 'https://via.placeholder.com/150';
    const viewers = streamer.streamData?.viewers || 0;
    
    return (
        <GlassCard onClick={onClick} className="flex flex-col !p-0 overflow-hidden group h-full hover:border-orange-500/50 transition-all duration-300" isSnowy={snowEnabled}>
            <div className="h-28 w-full relative bg-neutral-900">
                <img src={banner} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onToggleNotify(streamer.id); }} className={`p-1.5 rounded-full backdrop-blur-md ${streamer.notificationsEnabled ? 'bg-orange-500 text-white' : 'bg-black/40 text-gray-400 hover:text-white'}`}>
                        {streamer.notificationsEnabled ? <Icons.Bell className="w-3.5 h-3.5" /> : <Icons.BellOff className="w-3.5 h-3.5" />}
                    </button>
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase backdrop-blur-md flex items-center gap-1 ${isLive ? 'bg-green-600 text-white animate-pulse' : 'bg-black/60 text-gray-400'}`}>
                        {isLive ? <><div className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE</> : 'OFFLINE'}
                    </div>
                </div>
            </div>
            <div className="px-4 pb-4 relative flex-1 flex flex-col">
                <div className="flex justify-between items-end -mt-8 mb-2">
                    <div className={`w-16 h-16 rounded-xl border-4 border-[#1a1a1a] overflow-hidden bg-black ${isLive ? 'ring-2 ring-green-500 shadow-[0_0_15px_#22c55e]' : ''}`}>
                        <img src={avatar} className="w-full h-full object-cover" />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(streamer.id); }} className={`mb-1 ${streamer.isFavorite ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`}>
                        <Icons.Star className={`w-5 h-5 ${streamer.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>
                <div className="mb-3">
                    <h3 className="font-bold text-white text-lg leading-tight line-clamp-1">{streamer.kickUsername}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        {isLive && <span className="text-green-500 font-bold">{viewers.toLocaleString()} viewers</span>}
                        {streamer.customTitle && <span>• {streamer.customTitle}</span>}
                    </div>
                </div>
                {isLive && streamer.streamData?.thumbnail ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3 border border-white/10 group-hover:border-white/30 transition-colors">
                        <img src={streamer.streamData.thumbnail} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icons.Play className="w-8 h-8 text-white" />
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3 min-h-[2.5em]">{streamer.kickData?.bio || "No bio available."}</p>
                )}
                <div className="flex flex-wrap gap-1 mb-4">
                    {streamer.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-gray-400 uppercase tracking-wide">{tag}</span>
                    ))}
                </div>
                <div className="mt-auto pt-3 border-t border-white/5">
                    <a href={`https://kick.com/${streamer.kickUsername}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="flex items-center justify-center gap-2 w-full py-2 bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white rounded-lg font-bold text-sm transition-colors border border-green-600/50">
                        <Icons.Video className="w-4 h-4" /> Watch Channel
                    </a>
                </div>
            </div>
        </GlassCard>
    );
};

// --- STREAMER DETAIL MODAL (Enhanced) ---
export const StreamerDetailModal: React.FC<{ streamer: Streamer, onClose: () => void, onDelete: () => void, snowEnabled: boolean }> = ({ streamer, onClose, onDelete, snowEnabled }) => {
    const isLive = streamer.streamData?.is_live;
    const banner = streamer.kickData?.banner || 'https://via.placeholder.com/800x200';
    const profilePic = streamer.kickData?.profile_pic || 'https://via.placeholder.com/150';
    const username = streamer.kickUsername || 'Unknown';
    const streamTitle = streamer.streamData?.title || 'No Stream Title';
    const viewers = streamer.streamData?.viewers || 0;
    const followers = streamer.kickData?.followers_count || 0;
    const bio = streamer.kickData?.bio || '';
    const characters = streamer.characters || [];
    const links = streamer.links || {};

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[10000] flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-4xl bg-neutral-900 border border-white/10 rounded-[30px] overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh] ${snowEnabled ? 'frosted-effect' : ''}`} onClick={e => e.stopPropagation()}>
                {/* Banner Header */}
                <div className="h-64 w-full relative shrink-0">
                    <img src={banner} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-white/10 p-2 rounded-full transition-colors"><Icons.X className="w-6 h-6 text-white" /></button>
                    
                    <div className="absolute -bottom-10 left-8 flex items-end gap-6">
                        <img src={profilePic} className="w-32 h-32 rounded-3xl border-4 border-neutral-900 shadow-2xl bg-black" />
                        <div className="mb-12">
                            <h2 className="text-4xl font-black text-white drop-shadow-lg">{username}</h2>
                            <div className="flex items-center gap-3">
                                {isLive && <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded animate-pulse">LIVE</span>}
                                <span className="text-gray-300 font-bold text-sm bg-black/40 px-2 py-1 rounded">{followers.toLocaleString()} Followers</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Left Col: Stats & Bio */}
                        <div className="md:col-span-2 flex flex-col gap-6">
                            {isLive && (
                                <div className="p-4 rounded-2xl bg-green-900/10 border border-green-500/20">
                                    <h3 className="text-green-500 font-bold mb-1 flex items-center gap-2"><Icons.Wifi className="w-4 h-4" /> Live Now</h3>
                                    <p className="text-xl font-bold text-white mb-2">{streamTitle}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                        <span className="flex items-center gap-1"><Icons.Eye className="w-4 h-4" /> {viewers.toLocaleString()} Viewers</span>
                                        <span>{streamer.streamData?.category_name}</span>
                                    </div>
                                    <a href={`https://kick.com/${username}`} target="_blank" className="mt-4 inline-flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors">
                                        <Icons.Play className="w-5 h-5 fill-current" /> Watch Stream
                                    </a>
                                </div>
                            )}

                            <div>
                                <h4 className="text-lg font-bold text-white mb-2">About</h4>
                                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">{bio || "No bio available."}</p>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2">
                                {streamer.tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 font-medium">{tag}</span>
                                ))}
                            </div>
                        </div>

                        {/* Right Col: Info & Actions */}
                        <div className="flex flex-col gap-6">
                            {characters.length > 0 && (
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Icons.Users className="w-4 h-4" /> Characters</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {characters.map((c, i) => <span key={i} className="px-2 py-1 bg-white/10 rounded text-sm text-white">{c}</span>)}
                                    </div>
                                </div>
                            )}

                            <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2"><Icons.Link className="w-4 h-4" /> Socials</h4>
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
                                    {/* Add other socials similarly */}
                                </div>
                            </div>

                            {!streamer.isSystem && (
                                <button onClick={onDelete} className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-500 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
                                    <Icons.Trash2 className="w-5 h-5" /> Remove from List
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export const AdminLiveToolsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (null); // Placeholder if needed, logic is in main page
export const AdminEditStreamerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => (null);
