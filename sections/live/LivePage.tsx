
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { Streamer } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { AddStreamerModal, StreamerDetailModal, StreamerCard, RequestStreamerModal, AdminStreamerRequestsModal } from './LiveComponents';
import { useLive } from '../../contexts/LiveContext';
import { useGlobalActions } from '../../contexts/GlobalActionsContext';

// --- Skeleton Component for Grid ---
const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
            <GlassCard key={i} className="flex flex-col !p-0 overflow-hidden h-full border border-white/5 opacity-50">
                <div className="h-28 w-full bg-white/5 animate-pulse" />
                <div className="px-4 pb-4 flex-1 flex flex-col gap-3 mt-4">
                    <div className="flex gap-4 items-end -mt-10">
                        <div className="w-16 h-16 rounded-xl bg-white/10 animate-pulse border-4 border-[#1a1a1a]" />
                    </div>
                    <div className="h-4 w-3/4 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
                </div>
            </GlassCard>
        ))}
    </div>
);

export const LivePage: React.FC<{ snowEnabled: boolean, isAdmin: boolean }> = ({ snowEnabled, isAdmin }) => {
    const { t, dir } = useI18n();
    const { streamers, loading, error, refresh, loadBatch, totalStreamersCount, deleteStreamer, addLocalStreamer, toggleFavorite, toggleNotify } = useLive();
    const { requestDelete } = useGlobalActions();
    
    const [search, setSearch] = useState('');
    const [visibleCount, setVisibleCount] = useState(12);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showAdminRequests, setShowAdminRequests] = useState(false);
    const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null);

    // Initial Load (First 12)
    useEffect(() => {
        loadBatch(0, 12);
    }, []);

    const handleLoadMore = () => {
        const nextCount = visibleCount + 12;
        setVisibleCount(nextCount);
        loadBatch(visibleCount, 12); // Fetch next batch
    };

    const handleDeleteLocal = () => {
        if (selectedStreamer && !selectedStreamer.isSystem) {
            const streamerBackup = { ...selectedStreamer };
            
            requestDelete(
                t('deleteConfirm'),
                `${t('streamerDeleted')}: ${streamerBackup.kickUsername}`,
                async () => {
                    await deleteStreamer(streamerBackup.id, false, streamerBackup.kickUsername);
                    setSelectedStreamer(null);
                },
                async () => {
                    addLocalStreamer(streamerBackup);
                },
                'admin',
                `Deleted Streamer: ${streamerBackup.kickUsername}`
            );
        } else if (selectedStreamer && selectedStreamer.isSystem && isAdmin) {
             const streamerBackup = { ...selectedStreamer };
             requestDelete(
                t('deleteConfirm'),
                `${t('streamerDeleted')} (System): ${streamerBackup.kickUsername}`,
                async () => {
                    await deleteStreamer(streamerBackup.id, true, streamerBackup.kickUsername);
                    setSelectedStreamer(null);
                },
                undefined,
                'admin',
                `Deleted System Streamer: ${streamerBackup.kickUsername}`
            );
        }
    };

    if (error && !loading && streamers.length === 0) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 mb-2">
                    <Icons.AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Failed to load data</h3>
                <p className="text-gray-400">Please try again later.</p>
                <button 
                    onClick={refresh} 
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-colors flex items-center gap-2"
                >
                    <Icons.RotateCcw className="w-4 h-4" />
                    Retry
                </button>
            </div>
        );
    }

    const filteredStreamers = streamers.filter(s => 
        !search || (s.kickUsername || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative min-h-[600px] pb-24">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <GlassCard className="flex-1 w-full !rounded-full !p-2 flex items-center relative shadow-lg" isSnowy={snowEnabled}>
                    <Icons.Search className={`absolute text-gray-400 w-5 h-5 ${dir==='rtl' ? 'right-5' : 'left-5'}`} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchLive')} className={`w-full bg-transparent p-3 outline-none text-white placeholder-gray-500 ${dir==='rtl' ? 'pr-14 pl-4' : 'pl-14 pr-4'}`} />
                </GlassCard>
                
                <div className="flex gap-2">
                    {/* Request Streamer (User) */}
                    <motion.button 
                        onClick={() => setShowRequestModal(true)} 
                        {...({ whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } } as any)}
                        className="px-6 py-4 bg-green-600 rounded-full text-white font-bold shadow-lg flex items-center gap-2"
                    >
                        <Icons.Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Request Streamer</span>
                        <span className="sm:hidden">Request</span>
                    </motion.button>

                    {/* Admin Request Manager */}
                    {isAdmin && (
                        <motion.button 
                            onClick={() => setShowAdminRequests(true)} 
                            {...({ whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } } as any)}
                            className="px-4 py-4 bg-purple-600 rounded-full text-white font-bold shadow-lg flex items-center gap-2"
                        >
                            <Icons.List className="w-5 h-5" />
                        </motion.button>
                    )}

                    {/* Add Local Streamer */}
                    <motion.button 
                        onClick={() => setShowAddModal(true)} 
                        {...({ whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } } as any)}
                        className="px-4 py-4 bg-white/5 border border-white/10 rounded-full text-white font-bold shadow-lg flex items-center gap-2 hover:bg-white/10"
                    >
                        <Icons.UserPlus className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStreamers.map(streamer => (
                    <div key={streamer.id} className="h-full">
                        <StreamerCard 
                            streamer={streamer} 
                            onClick={() => setSelectedStreamer(streamer)} 
                            onToggleFavorite={toggleFavorite} 
                            onToggleNotify={toggleNotify} 
                            snowEnabled={snowEnabled} 
                        />
                    </div>
                ))}
            </div>

            {loading && <SkeletonGrid />}

            {/* Load More Button - Glassy & Blurry */}
            {!loading && visibleCount < totalStreamersCount && !search && (
                <div className="flex justify-center mt-8">
                    <motion.button 
                        onClick={handleLoadMore}
                        {...({ whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } } as any)}
                        className="px-10 py-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-white font-bold text-lg shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:border-orange-500/50 transition-all flex items-center gap-2"
                    >
                        <span>More</span>
                        <Icons.ArrowDown className="w-5 h-5" />
                    </motion.button>
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>{showAddModal && <AddStreamerModal onClose={() => setShowAddModal(false)} />}</AnimatePresence>
            <AnimatePresence>{showRequestModal && <RequestStreamerModal onClose={() => setShowRequestModal(false)} />}</AnimatePresence>
            <AnimatePresence>{showAdminRequests && <AdminStreamerRequestsModal onClose={() => setShowAdminRequests(false)} />}</AnimatePresence>
            <AnimatePresence>{selectedStreamer && <StreamerDetailModal streamer={selectedStreamer} onClose={() => setSelectedStreamer(null)} onDelete={handleDeleteLocal} snowEnabled={snowEnabled} />}</AnimatePresence>
        </div>
    );
};
