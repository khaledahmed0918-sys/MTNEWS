
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { Streamer } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { AddStreamerModal, StreamerDetailModal, StreamerCard, AdminLiveToolsModal } from './LiveComponents';
import { LiveProvider, useLive } from '../../contexts/LiveContext';

// --- Skeleton Component for Grid ---
const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
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

const LivePageContent: React.FC<{ snowEnabled: boolean, isAdmin: boolean }> = ({ snowEnabled, isAdmin }) => {
    const { t, dir } = useI18n();
    const { streamers, loading, deleteStreamer, toggleFavorite, toggleNotify, undoAction, lastAction } = useLive();
    
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAdminTools, setShowAdminTools] = useState(false);
    const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null);

    // Optimized filtering: Memoize the result
    const filteredStreamers = useMemo(() => {
        if (!search.trim()) return streamers;
        const q = search.toLowerCase();
        return streamers.filter(s => 
            (s.kickUsername || '').toLowerCase().includes(q) || 
            (s.tags || []).some(tag => tag.toLowerCase().includes(q))
        );
    }, [streamers, search]);

    const handleDeleteLocal = async () => {
        if (selectedStreamer && !selectedStreamer.isSystem) {
            await deleteStreamer(selectedStreamer.id, false, selectedStreamer.kickUsername);
            setSelectedStreamer(null);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative min-h-[600px]">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <GlassCard className="flex-1 w-full !rounded-full !p-2 flex items-center relative shadow-lg" isSnowy={snowEnabled}>
                    <Icons.Search className={`absolute text-gray-400 w-5 h-5 ${dir==='rtl' ? 'right-5' : 'left-5'}`} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchLive')} className={`w-full bg-transparent p-3 outline-none text-white placeholder-gray-500 ${dir==='rtl' ? 'pr-14 pl-4' : 'pl-14 pr-4'}`} />
                </GlassCard>
                
                <div className="flex gap-3">
                    {isAdmin && (
                        <motion.button onClick={() => setShowAdminTools(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-4 bg-purple-600 rounded-full text-white font-bold shadow-lg flex items-center gap-2">
                            <Icons.Settings className="w-5 h-5" /><span>Edit / Tools</span>
                        </motion.button>
                    )}
                    <motion.button onClick={() => setShowAddModal(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-4 bg-green-600 rounded-full text-white font-bold shadow-lg flex items-center gap-2">
                        <Icons.Plus className="w-5 h-5" /><span>{t('addStreamer')}</span>
                    </motion.button>
                </div>
            </div>

            {/* Content Area */}
            {loading && streamers.length === 0 ? (
                <SkeletonGrid />
            ) : filteredStreamers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                    <Icons.Tv className="w-20 h-20 mb-4 text-gray-500" />
                    <h3 className="text-xl font-bold text-white">{t('noStreamers')}</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Note: Removed <AnimatePresence> and layout prop for performance on large lists */}
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
            )}

            {/* Modals */}
            <AnimatePresence>{showAddModal && <AddStreamerModal onClose={() => setShowAddModal(false)} />}</AnimatePresence>
            <AnimatePresence>{showAdminTools && <AdminLiveToolsModal onClose={() => setShowAdminTools(false)} />}</AnimatePresence>
            <AnimatePresence>{selectedStreamer && <StreamerDetailModal streamer={selectedStreamer} onClose={() => setSelectedStreamer(null)} onDelete={handleDeleteLocal} snowEnabled={snowEnabled} />}</AnimatePresence>

            <AnimatePresence>
                {lastAction && (
                    <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-6 right-6 z-[10000]">
                        <div className="bg-neutral-900 border border-white/10 p-4 rounded-xl shadow-2xl flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 font-bold uppercase">Action</span>
                                <span className="text-sm font-bold text-white">{lastAction.description}</span>
                            </div>
                            <button onClick={undoAction} className="px-4 py-2 bg-orange-500 rounded-lg text-white font-bold text-xs flex items-center gap-1 hover:bg-orange-600 transition-colors">
                                <Icons.RotateCcw className="w-3 h-3" /> Undo
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const LivePage: React.FC<{ snowEnabled: boolean, isAdmin: boolean }> = (props) => {
    return (
        <LiveProvider>
            <LivePageContent {...props} />
        </LiveProvider>
    );
};
