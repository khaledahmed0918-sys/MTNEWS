
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { Streamer } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { AddStreamerModal, StreamerDetailModal, StreamerCard, AdminLiveToolsModal } from './LiveComponents';
import { LiveProvider, useLive } from '../../contexts/LiveContext';

const LivePageContent: React.FC<{ snowEnabled: boolean, isAdmin: boolean }> = ({ snowEnabled, isAdmin }) => {
    const { t, dir } = useI18n();
    const { streamers, loading, deleteStreamer, undoAction, lastAction } = useLive();
    
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showAdminTools, setShowAdminTools] = useState(false);
    const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null);

    const filteredStreamers = useMemo(() => {
        let list = [...streamers];
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(s => 
                (s.kickUsername || '').toLowerCase().includes(q) || 
                (s.tags || []).some(tag => tag.toLowerCase().includes(q))
            );
        }
        // Sort: Live first, then by viewers
        list.sort((a, b) => {
            const aLive = a.streamData?.is_live || false;
            const bLive = b.streamData?.is_live || false;
            if (aLive !== bLive) return aLive ? -1 : 1;
            if (aLive) return (b.streamData?.viewers || 0) - (a.streamData?.viewers || 0);
            return 0;
        });
        return list;
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

            {/* Grid */}
            {loading ? (
                <div className="flex justify-center py-20"><Icons.Loader2 className="w-12 h-12 animate-spin text-orange-500" /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {filteredStreamers.map(streamer => (
                            <motion.div key={streamer.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', damping: 25 }}>
                                <StreamerCard 
                                    streamer={streamer} 
                                    onClick={() => setSelectedStreamer(streamer)} 
                                    onToggleFavorite={() => {}} 
                                    onToggleNotify={() => {}} 
                                    snowEnabled={snowEnabled} 
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
            
            {filteredStreamers.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-60"><Icons.Tv className="w-20 h-20 mb-4 text-gray-500" /><h3 className="text-xl font-bold text-white">{t('noStreamers')}</h3></div>
            )}

            {/* Modals */}
            <AnimatePresence>{showAddModal && <AddStreamerModal onClose={() => setShowAddModal(false)} />}</AnimatePresence>
            <AnimatePresence>{showAdminTools && <AdminLiveToolsModal onClose={() => setShowAdminTools(false)} />}</AnimatePresence>
            <AnimatePresence>{selectedStreamer && <StreamerDetailModal streamer={selectedStreamer} onClose={() => setSelectedStreamer(null)} onDelete={handleDeleteLocal} snowEnabled={snowEnabled} />}</AnimatePresence>

            {/* Global Undo Notification */}
            <AnimatePresence>
                {lastAction && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }} 
                        animate={{ y: 0, opacity: 1 }} 
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 right-6 z-[10000]"
                    >
                        <div className="bg-neutral-900 border border-white/10 p-4 rounded-xl shadow-2xl flex items-center gap-4">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-400 font-bold uppercase">Action</span>
                                <span className="text-sm font-bold text-white">{lastAction.description}</span>
                            </div>
                            <button onClick={undoAction} className="px-4 py-2 bg-orange-500 rounded-lg text-white font-bold text-xs flex items-center gap-1 hover:bg-orange-600 transition-colors">
                                <Icons.RotateCcw className="w-3 h-3" /> Restore / Undo
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
