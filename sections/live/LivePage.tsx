
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { Streamer } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { StreamerDetailModal, StreamerCard } from './LiveComponents';
import { useLive } from '../../contexts/LiveContext';

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

export const LivePage: React.FC<{ snowEnabled: boolean, isAdmin: boolean }> = ({ snowEnabled }) => {
    const { t, dir } = useI18n();
    const { streamers, loading, toggleFavorite, toggleNotify, retryStreamer } = useLive();
    
    const [search, setSearch] = useState('');
    const [selectedStreamer, setSelectedStreamer] = useState<Streamer | null>(null);

    const filteredStreamers = streamers.filter(s => 
        !search || (s.kickUsername || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative min-h-[600px] pb-24">
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <GlassCard 
                    className="flex-1 w-full !rounded-full !p-2 flex items-center relative shadow-lg" 
                    isSnowy={snowEnabled}
                    decoration="sitting" // Sitting lantern for search bar
                >
                    <Icons.Search className={`absolute text-gray-400 w-5 h-5 ${dir==='rtl' ? 'right-5' : 'left-5'}`} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchLive')} className={`w-full bg-transparent p-3 outline-none text-white placeholder-gray-500 ${dir==='rtl' ? 'pr-14 pl-4' : 'pl-14 pr-4'}`} />
                </GlassCard>
            </div>

            {/* Content Area */}
            {streamers.length === 0 && loading ? (
                <SkeletonGrid />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStreamers.map(streamer => (
                        <div key={streamer.id} className="h-full">
                            <StreamerCard 
                                streamer={streamer} 
                                onClick={() => setSelectedStreamer(streamer)} 
                                onToggleFavorite={toggleFavorite} 
                                onToggleNotify={toggleNotify} 
                                onRetry={retryStreamer}
                                snowEnabled={snowEnabled} 
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>{selectedStreamer && <StreamerDetailModal streamer={selectedStreamer} onClose={() => setSelectedStreamer(null)} onDelete={() => {}} snowEnabled={snowEnabled} />}</AnimatePresence>
        </div>
    );
};
