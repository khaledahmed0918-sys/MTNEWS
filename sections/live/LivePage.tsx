
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { useToast } from '../../contexts/NotificationContext';
import { Streamer, KickChannelInfo, KickStreamInfo } from '../../types';
import { useLocalStorage } from '../../hooks';
import { logAction } from '../../utils/logging';
import { GlassCard } from '../../components/ui/GlassCard';
import { AddStreamerModal, StreamerDetailModal, StreamerCard } from './LiveComponents';

const fetchKickChannel = async (query: string): Promise<{ kickData: KickChannelInfo, streamData: KickStreamInfo } | null> => {
    let username = query.trim();
    const urlMatch = username.match(/kick\.com\/([^\/]+)/);
    if (urlMatch) username = urlMatch[1];
    try {
        const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://kick.com/api/v2/channels/${username}`)}`);
        if (!response.ok) return null;
        const json = await response.json();
        const root = json.data ? json.data : json; 
        const user = root.user;
        const livestream = root.livestream;
        if (!user) return null;
        const kickData: KickChannelInfo = {
            id: root.id, slug: root.slug, user_id: user.id, username: user.username, profile_pic: user.profile_pic,
            banner: root.banner_image?.url || root.banner_image || user.banner_image || user.banner || '', 
            followers_count: root.followers_count, created_at: root.created_at, bio: user.bio || ''
        };
        const streamData: KickStreamInfo = {
            id: livestream ? livestream.id : 0, is_live: livestream !== null, viewers: livestream ? livestream.viewers_count : 0,
            start_time: livestream ? (livestream.created_at || livestream.start_time) : '', title: livestream ? livestream.session_title : '',
            category_name: livestream?.categories?.[0]?.name || '', category_icon: livestream?.categories?.[0]?.image_url || '', thumbnail: livestream?.thumbnail?.url || ''
        };
        return { kickData, streamData };
    } catch (e) { console.error("Kick fetch failed", e); return null; }
};

const useStreamers = () => {
    const [streamers, setStreamers] = useLocalStorage<Streamer[]>('mtnews-streamers-v1', []);
    return [streamers, setStreamers] as const;
};

export const LivePage: React.FC<{ snowEnabled: boolean }> = ({ snowEnabled }) => {
    const { t, dir } = useI18n();
    const { addToast } = useToast();
    const [streamers, setStreamers] = useStreamers();
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null);
    const [deletedStreamer, setDeletedStreamer] = useState<{ data: Streamer, expires: number } | null>(null);

    const filteredStreamers = useMemo(() => {
        let list = [...streamers];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(s => 
                (s.kickUsername || '').toLowerCase().includes(q) || (s.customTitle && s.customTitle.toLowerCase().includes(q)) ||
                (s.tags || []).some(tag => tag.toLowerCase().includes(q)) || (s.streamData?.is_live && (s.streamData.title || '').toLowerCase().includes(q))
            );
        }
        list.sort((a, b) => {
            if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
            if (a.streamData?.is_live !== b.streamData?.is_live) return a.streamData?.is_live ? -1 : 1;
            if (a.streamData?.is_live) return (b.streamData?.viewers || 0) - (a.streamData?.viewers || 0);
            return (b.lastUpdated || 0) - (a.lastUpdated || 0);
        });
        return list;
    }, [streamers, search]);

    const handleAdd = (newStreamer: Streamer) => {
        setStreamers(prev => [...prev, newStreamer]);
        addToast(t('streamerAdded'), 'success');
        logAction('system', 'Streamer Added', newStreamer.kickUsername);
    };

    const handleDelete = (id: string) => {
        const target = streamers.find(s => s.id === id);
        if (!target) return;
        setStreamers(prev => prev.filter(s => s.id !== id));
        setDeletedStreamer({ data: target, expires: Date.now() + 5000 });
    };

    useEffect(() => {
        if (!deletedStreamer) return;
        const timer = setTimeout(() => { setDeletedStreamer(null); }, 5000);
        return () => clearTimeout(timer);
    }, [deletedStreamer]);

    const handleRestore = () => {
        if (deletedStreamer) {
            setStreamers(prev => [...prev, deletedStreamer.data]);
            setDeletedStreamer(null);
            addToast(t('restored'), 'success');
        }
    };

    const toggleFavorite = (id: string) => {
        setStreamers(prev => prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
    };

    const toggleNotify = (id: string) => {
        setStreamers(prev => prev.map(s => s.id === id ? { ...s, notificationsEnabled: !s.notificationsEnabled } : s));
        const s = streamers.find(x => x.id === id);
        if(s) addToast(s.notificationsEnabled ? t('notificationsOff') : t('notificationsOn'), 'info');
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative min-h-[600px]">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <GlassCard className="flex-1 w-full !rounded-full !p-2 flex items-center relative" isSnowy={snowEnabled}>
                    <Icons.Search className={`absolute text-gray-400 w-5 h-5 ${dir==='rtl' ? 'right-5' : 'left-5'}`} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchLive')} className={`w-full bg-transparent p-3 outline-none text-white placeholder-gray-500 ${dir==='rtl' ? 'pr-14 pl-4' : 'pl-14 pr-4'}`} />
                </GlassCard>
                <motion.button onClick={() => setShowAddModal(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-4 bg-green-600 rounded-full text-white font-bold shadow-lg shadow-green-500/20 flex items-center gap-2 shrink-0">
                    <Icons.Plus className="w-5 h-5" /><span>{t('addStreamer')}</span>
                </motion.button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence>
                    {filteredStreamers.map(streamer => (
                        <motion.div key={streamer.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', damping: 25 }}>
                            <StreamerCard streamer={streamer} onClick={() => setSelectedStreamer(streamer)} onToggleFavorite={toggleFavorite} onToggleNotify={toggleNotify} snowEnabled={snowEnabled} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
            {filteredStreamers.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60"><Icons.Tv className="w-20 h-20 mb-4 text-gray-500" /><h3 className="text-xl font-bold text-white">{t('noStreamers')}</h3></div>
            )}
            <AnimatePresence>{showAddModal && <AddStreamerModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} existingStreamers={streamers} fetchKickChannel={fetchKickChannel} />}</AnimatePresence>
            <AnimatePresence>{selectedStreamer && (<StreamerDetailModal streamer={selectedStreamer} onClose={() => setSelectedStreamer(null)} onDelete={() => handleDelete(selectedStreamer.id)} snowEnabled={snowEnabled} />)}</AnimatePresence>
            <AnimatePresence>{deletedStreamer && (<motion.div initial={{ opacity: 0, y: 50, x: 50 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: 50, x: 50 }} className="fixed bottom-4 right-4 z-[10000]"><div className="bg-neutral-900 border border-white/10 rounded-2xl p-1 shadow-2xl flex items-center gap-4 pl-4 pr-1.5 py-1.5 overflow-hidden relative min-w-[300px]"><motion.div className="absolute bottom-0 left-0 h-0.5 bg-orange-500" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 5, ease: "linear" }} /><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden"><img src={deletedStreamer.data.kickData?.profile_pic || ''} className="w-full h-full object-cover" /></div><div className="flex flex-col"><span className="font-bold text-sm text-white">{t('streamerDeleted')}</span><span className="text-[10px] text-gray-400">{deletedStreamer.data.kickUsername}</span></div></div><div className="ml-auto relative z-10"><button onClick={handleRestore} className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors">{t('restore')}</button></div></div></motion.div>)}</AnimatePresence>
        </div>
    );
};
