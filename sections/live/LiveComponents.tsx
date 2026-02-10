
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { Streamer, KickChannelInfo, KickStreamInfo } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { useLocalStorage } from '../../hooks';

// --- ADD STREAMER MODAL ---
export const AddStreamerModal: React.FC<{ 
    onClose: () => void, 
    onAdd: (s: Streamer) => void, 
    existingStreamers: Streamer[], 
    fetchKickChannel: (q:string) => Promise<any>,
    searchKickChannels: (q:string) => Promise<{username: string, pic: string}[]> 
}> = ({ onClose, onAdd, existingStreamers, fetchKickChannel, searchKickChannels }) => {
    const { t, dir } = useI18n();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [foundData, setFoundData] = useState<{ kickData: KickChannelInfo, streamData: KickStreamInfo } | null>(null);
    const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'failed'>('idle');
    const [customName, setCustomName] = useState('');
    const [tags, setTags] = useState('');
    const [notes, setNotes] = useState('');
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [skipResetConfirm, setSkipResetConfirm] = useLocalStorage('mtnews-skip-reset-confirm', false);
    
    // Search Autocomplete State
    const [searchResults, setSearchResults] = useState<{username: string, pic: string}[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const searchTimeout = useRef<any>(null);

    const performSearch = async (term: string) => {
        if (!term || term.length < 3) return;
        setLoading(true);
        setStatus('verifying');
        setError('');
        
        // Use the new search capability
        const results = await searchKickChannels(term);
        
        setLoading(false);
        
        if (results && results.length > 0) {
            setSearchResults(results);
            setShowDropdown(true);
        } else {
            setSearchResults([]);
            setShowDropdown(false);
            // Don't show error immediately while typing unless it's a direct fetch attempt
        }
    };

    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (query.length > 2 && !foundData) {
            searchTimeout.current = setTimeout(() => {
                performSearch(query);
            }, 600);
        } else {
            setShowDropdown(false);
        }
    }, [query]);

    const handleSelectResult = async (username: string) => {
        setShowDropdown(false);
        setQuery(username);
        setLoading(true);
        setStatus('verifying');
        
        // Final fetch to lock in data
        const result = await fetchKickChannel(username);
        setLoading(false);
        
        if (result) {
            if (existingStreamers.some(s => s.kickUsername.toLowerCase() === result.kickData.username.toLowerCase())) {
                setStatus('failed');
                setError(t('duplicateStreamer'));
                return;
            }
            setFoundData(result);
            setStatus('verified');
        } else {
            setStatus('failed');
            setError(t('streamerNotFound'));
        }
    };

    const handleReset = () => {
        if (skipResetConfirm) {
            performReset();
        } else {
            setShowResetConfirm(true);
        }
    };

    const performReset = () => {
        setQuery('');
        setFoundData(null);
        setStatus('idle');
        setCustomName('');
        setTags('');
        setNotes('');
        setShowResetConfirm(false);
        setError('');
        setShowDropdown(false);
        setSearchResults([]);
    };

    const handleFinalAdd = async () => {
        if (!foundData) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 500));
        const newStreamer: Streamer = {
            id: Math.random().toString(36).substring(7),
            kickUsername: foundData.kickData.slug,
            kickData: foundData.kickData,
            streamData: foundData.streamData,
            customTitle: customName,
            tags: tags.split(/[,،]/).map(t => t.trim()).filter(Boolean),
            notes: notes,
            isFavorite: false,
            notificationsEnabled: false,
            lastUpdated: Date.now(),
            addedAt: Date.now()
        };
        onAdd(newStreamer);
        setLoading(false);
        onClose();
    };

    // Calculate icon position based on dir
    const iconPosClass = dir === 'rtl' ? 'left-4' : 'right-4';

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[10000] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" noRound>
                 <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-xl font-bold text-white">{t('addStreamer')}</h3>
                    <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                    <div className="relative mb-6 group">
                        <div className="relative">
                            <Icons.Search className={`absolute top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 ${dir==='rtl' ? 'right-4' : 'left-4'}`} />
                            <input 
                                value={query} 
                                onChange={e => { 
                                    setQuery(e.target.value); 
                                    if(foundData) setFoundData(null); 
                                    setStatus('idle'); 
                                    setError(''); 
                                }} 
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSelectResult(query);
                                    }
                                }}
                                placeholder={t('kickUrlOrUser')} 
                                className={`w-full p-4 rounded-xl bg-white/5 border transition-all outline-none text-white ${dir==='rtl' ? 'pr-12' : 'pl-12'} ${status === 'verified' ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.2)]' : status === 'failed' ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-white/10 focus:border-orange-500'}`} 
                            />
                             
                             {/* Loading/Status Icons - Perfectly Centered Vertically */}
                             <AnimatePresence>
                                {loading && (
                                    <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        exit={{ opacity: 0 }} 
                                        className={`absolute top-1/2 -translate-y-1/2 ${iconPosClass}`}
                                    >
                                        <Icons.Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                                    </motion.div>
                                )}
                                
                                {!loading && status === 'verified' && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`absolute top-1/2 -translate-y-1/2 ${iconPosClass}`}>
                                        <div className="bg-green-500 rounded-full p-1"><Icons.Check className="w-3 h-3 text-black" /></div>
                                    </motion.div>
                                )}
                                {!loading && status === 'failed' && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`absolute top-1/2 -translate-y-1/2 ${iconPosClass}`}>
                                        <div className="bg-red-500 rounded-full p-1"><Icons.X className="w-3 h-3 text-white" /></div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Search Dropdown */}
                        <AnimatePresence>
                            {showDropdown && searchResults.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-60 overflow-y-auto"
                                >
                                    {searchResults.map((res, i) => (
                                        <button 
                                            key={i}
                                            onClick={() => handleSelectResult(res.username)}
                                            className="w-full p-3 flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
                                        >
                                            <img src={res.pic} alt={res.username} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                                            <span className="font-bold text-white">{res.username}</span>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {error && <p className="text-red-400 text-sm mt-2 ml-1 font-bold">{error}</p>}
                    </div>

                    <AnimatePresence>
                        {foundData && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-6 overflow-hidden">
                                <div className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                                    <img src={foundData.kickData.profile_pic} alt={foundData.kickData.username} className="w-16 h-16 rounded-full border-2 border-white/10 object-cover" />
                                    <div>
                                        <h4 className="font-bold text-lg text-white">{foundData.kickData.username}</h4>
                                        <div className="flex gap-2 text-xs text-green-300">
                                            <span>{t('followers')}: {foundData.kickData.followers_count.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className={`flex flex-col gap-4 transition-all duration-500 ${!foundData ? 'opacity-50 pointer-events-none blur-sm' : ''}`}>
                         <div className="space-y-1"><label className="text-xs text-gray-400 ml-1">{t('customName')}</label><input value={customName} onChange={e => setCustomName(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500/50" /></div>
                         <div className="space-y-1"><label className="text-xs text-gray-400 ml-1">{t('streamerTags')}</label><input value={tags} onChange={e => setTags(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500/50" /></div>
                         <div className="space-y-1"><label className="text-xs text-gray-400 ml-1">{t('streamerNotes')}</label><textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500/50 min-h-[80px]" /></div>
                    </div>
                </div>
                <div className="flex flex-col gap-3 mt-4 shrink-0">
                    <div className="flex gap-3">
                        <button onClick={onClose} className="flex-1 py-3 rounded-[30px] bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-bold backdrop-blur-md transition-colors">{t('cancel')}</button>
                        <button onClick={handleReset} className="flex-1 py-3 rounded-[30px] bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-500 font-bold backdrop-blur-md transition-colors">{t('reset')}</button>
                    </div>
                    <button onClick={handleFinalAdd} disabled={!foundData || loading} className={`w-full py-4 rounded-[30px] font-bold text-white transition-all flex items-center justify-center gap-2 ${!foundData ? 'bg-gray-600 opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]'}`}>
                        {loading ? <Icons.Loader2 className="w-5 h-5 animate-spin" /> : <Icons.Plus className="w-5 h-5" />}
                        <span>{loading ? t('processing') : t('addStreamer')}</span>
                    </button>
                </div>
                <AnimatePresence>{showResetConfirm && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center"><h4 className="text-xl font-bold text-white mb-2">{t('confirmReset')}</h4><p className="text-gray-400 text-sm mb-6">Are you sure you want to clear the form?</p><label className="flex items-center gap-2 mb-6 cursor-pointer group"><div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${skipResetConfirm ? 'bg-orange-500 border-orange-500' : 'border-gray-500'}`}>{skipResetConfirm && <Icons.Check className="w-3 h-3 text-white" />}</div><input type="checkbox" className="hidden" checked={skipResetConfirm} onChange={e => setSkipResetConfirm(e.target.checked)} /><span className="text-sm text-gray-300 group-hover:text-white transition-colors">{t('dontAskAgain')}</span></label><div className="flex gap-4 w-full"><button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold">{t('cancel')}</button><button onClick={performReset} className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold">{t('confirm')}</button></div></motion.div>)}</AnimatePresence>
            </GlassCard>
        </div>
    );
};

// --- STREAMER DETAIL MODAL ---
export const StreamerDetailModal: React.FC<{ streamer: Streamer, onClose: () => void, onDelete: () => void, snowEnabled: boolean }> = ({ streamer, onClose, onDelete, snowEnabled }) => {
    const { t } = useI18n();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const isLive = streamer.streamData?.is_live;
    const banner = streamer.kickData?.banner || 'https://via.placeholder.com/800x200';
    const profilePic = streamer.kickData?.profile_pic || 'https://via.placeholder.com/150';
    const username = streamer.kickUsername || 'Unknown';
    const followers = streamer.kickData?.followers_count || 0;
    const viewers = streamer.streamData?.viewers || 0;
    const title = streamer.streamData?.title || 'No Title';
    const category = streamer.streamData?.category_name || 'Just Chatting';
    const bio = streamer.kickData?.bio || "No bio available.";
    const thumbnail = streamer.streamData?.thumbnail || streamer.streamData?.category_icon || profilePic;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, opacity: 0, rotateX: 10 }} animate={{ scale: 1, opacity: 1, rotateX: 0 }} exit={{ scale: 0.9, opacity: 0, rotateX: -10 }} transition={{ type: 'spring', damping: 20 }} onClick={e => e.stopPropagation()} className={`w-full max-w-2xl bg-neutral-900/90 border border-white/10 rounded-[30px] overflow-hidden shadow-2xl relative ${snowEnabled ? 'frosted-effect' : ''}`}>
                <div className="h-48 w-full relative">
                    <img src={banner} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full backdrop-blur-md transition-colors border border-white/10"><Icons.X className="w-5 h-5" /></button>
                    <div className="absolute -bottom-12 left-6 flex items-end gap-4"><div className={`w-24 h-24 rounded-full border-4 border-neutral-900 relative z-10 overflow-hidden ${isLive ? 'ring-4 ring-green-500' : 'ring-2 ring-gray-600'}`}><img src={profilePic} className="w-full h-full object-cover" /></div></div>
                </div>
                <div className="pt-14 px-8 pb-8 flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-black text-white flex items-center gap-2">{username}{streamer.customTitle && <span className="text-lg font-normal text-gray-400">({streamer.customTitle})</span>}</h2>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400 font-medium"><span className="flex items-center gap-1"><Icons.Users className="w-4 h-4" /> {followers.toLocaleString()} {t('followers')}</span>{isLive && <span className="flex items-center gap-1 text-green-400"><Icons.Eye className="w-4 h-4" /> {viewers.toLocaleString()} {t('viewers')}</span>}</div>
                        </div>
                        <div className="flex gap-2"><button onClick={() => setShowDeleteConfirm(true)} className="p-3 bg-red-500/10 text-red-500 border border-red-500/30 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg"><Icons.Trash2 className="w-5 h-5" /></button></div>
                    </div>
                    {isLive && (<div className="p-4 bg-green-500/10 border border-green-500/30 rounded-2xl flex items-center gap-4"><div className="w-16 h-16 rounded-xl overflow-hidden bg-black shrink-0 relative"><img src={thumbnail} className="w-full h-full object-cover" /><div className="absolute inset-0 bg-black/20"></div><Icons.Play className="absolute inset-0 m-auto text-white/80 w-8 h-8" /></div><div className="flex-1 min-w-0"><h4 className="text-white font-bold truncate">{title}</h4><div className="flex items-center gap-2 mt-1"><span className="text-xs bg-green-500 text-black font-bold px-2 py-0.5 rounded-full">{t('live')}</span><span className="text-xs text-green-300 font-bold">{category}</span></div></div></div>)}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10"><h4 className="font-bold text-gray-400 text-sm uppercase tracking-wider mb-2">{t('bio')}</h4><p className="text-gray-300 text-sm leading-relaxed">{bio}</p></div>
                    {streamer.notes && (<div className="bg-orange-500/5 p-4 rounded-2xl border border-orange-500/20"><h4 className="font-bold text-orange-400 text-sm uppercase tracking-wider mb-2">{t('notes')}</h4><p className="text-orange-200 text-sm">{streamer.notes}</p></div>)}
                    <div className="flex gap-4 mt-2">
                        {isLive && (<a href={`https://kick.com/${username}`} target="_blank" rel="noreferrer" className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all"><Icons.Video className="w-5 h-5" /> {t('liveLink')}</a>)}
                        <a href={`https://kick.com/${username}`} target="_blank" rel="noreferrer" className={`flex-1 py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${!isLive ? 'w-full' : ''}`}><Icons.Link className="w-5 h-5" /> {t('channelLink')}</a>
                    </div>
                </div>
                <AnimatePresence>{showDeleteConfirm && (<div className="absolute inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center"><div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4"><Icons.Trash2 className="w-8 h-8 text-red-500" /></div><h3 className="text-2xl font-bold text-white mb-2">{t('deleteConfirm')}</h3><p className="text-gray-400 mb-8">This action cannot be undone immediately, but you will have 5 seconds to restore.</p><div className="flex gap-4 w-full"><button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 rounded-xl bg-white/10 font-bold text-white hover:bg-white/20">{t('cancel')}</button><button onClick={() => { setShowDeleteConfirm(false); onDelete(); onClose(); }} className="flex-1 py-3 rounded-xl bg-red-600 font-bold text-white hover:bg-red-500 shadow-lg shadow-red-900/30">{t('confirm')}</button></div></div>)}</AnimatePresence>
            </motion.div>
        </div>
    );
};

// --- STREAMER CARD ---
export const StreamerCard: React.FC<{ streamer: Streamer, onToggleFavorite: (id: string) => void, onToggleNotify: (id: string) => void, onClick: () => void, snowEnabled: boolean }> = ({ streamer, onToggleFavorite, onToggleNotify, onClick, snowEnabled }) => {
    const { t } = useI18n();
    const isLive = streamer.streamData?.is_live || false;
    const username = streamer.kickUsername || 'Unknown';
    const profilePic = streamer.kickData?.profile_pic || 'https://via.placeholder.com/150';
    const followers = streamer.kickData?.followers_count || 0;
    const viewers = streamer.streamData?.viewers || 0;
    const categoryName = streamer.streamData?.category_name || 'Just Chatting';
    const streamTitle = streamer.streamData?.title || 'No Title';
    const categoryIcon = streamer.streamData?.category_icon || streamer.streamData?.thumbnail || profilePic;
    const displayTitle = streamer.customTitle || username;
    const titleSize = displayTitle.length > 15 ? 'text-lg' : displayTitle.length > 10 ? 'text-xl' : 'text-2xl';

    const handleNotifyClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if ("Notification" in window) {
            if (Notification.permission === "granted") onToggleNotify(streamer.id);
            else if (Notification.permission !== "denied") Notification.requestPermission().then(permission => { if (permission === "granted") onToggleNotify(streamer.id); });
        }
    };

    return (
        <GlassCard onClick={onClick} className="flex flex-col gap-4 group h-full hover:bg-white/10 transition-colors" isSnowy={snowEnabled}>
            <div className={`absolute top-4 left-4 w-3 h-3 rounded-full ${isLive ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`}></div>
            <div className="absolute top-4 right-4 flex gap-2 z-10">
                 <button onClick={handleNotifyClick} className={`p-2 rounded-full backdrop-blur-md transition-all ${streamer.notificationsEnabled ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.6)]' : 'bg-black/30 text-gray-400 hover:text-white'}`}><motion.div whileTap={{ scale: 0.8 }} animate={streamer.notificationsEnabled ? { rotate: [0, 15, -15, 0] } : {}}>{streamer.notificationsEnabled ? <Icons.Bell className="w-4 h-4" /> : <Icons.BellOff className="w-4 h-4" />}</motion.div></button>
                <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(streamer.id); }} className={`p-2 rounded-full backdrop-blur-md transition-all ${streamer.isFavorite ? 'bg-yellow-500/20 text-yellow-400' : 'bg-black/30 text-gray-400 hover:text-white'}`}><motion.div whileTap={{ scale: 0.8 }}><Icons.Star className={`w-4 h-4 ${streamer.isFavorite ? 'fill-current' : ''}`} /></motion.div></button>
            </div>
            <div className="flex flex-col items-center mt-4"><div className={`w-20 h-20 rounded-full p-1 border-2 ${isLive ? 'border-green-500' : 'border-white/10'}`}><img src={profilePic} alt={username} className="w-full h-full rounded-full object-cover" /></div><h3 className={`font-bold mt-3 text-white text-center ${titleSize} truncate w-full px-2`}>{displayTitle}</h3><span className="text-xs text-gray-400">@{username}</span></div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs mt-2 bg-white/5 rounded-xl p-2 border border-white/5"><div className="flex flex-col"><span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">{t('followers')}</span><span className="text-white font-bold">{followers.toLocaleString()}</span></div><div className="flex flex-col"><span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">{isLive ? t('viewers') : t('lastSeen')}</span><span className={`font-bold ${isLive ? 'text-green-400' : 'text-gray-400'}`}>{isLive ? viewers.toLocaleString() : 'Offline'}</span></div></div>
            {isLive ? (<div className="mt-2 bg-green-900/20 border border-green-500/20 rounded-xl p-2 flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-black overflow-hidden shrink-0"><img src={categoryIcon} className="w-full h-full object-cover" /></div><div className="flex-col overflow-hidden"><span className="block text-[10px] text-green-500 font-bold uppercase">{t('live')} - {categoryName}</span><span className="block text-xs text-white truncate font-medium">{streamTitle}</span></div></div>) : (<div className="mt-2 bg-white/5 border border-white/5 rounded-xl p-2 flex items-center justify-center h-[58px]"><span className="text-gray-500 text-xs italic">{t('offline')}</span></div>)}
            <div className="flex flex-wrap gap-1 justify-center mt-auto">{(streamer.tags || []).slice(0, 3).map((tag, i) => (<span key={i} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-300">{tag}</span>))}</div>
        </GlassCard>
    );
};
