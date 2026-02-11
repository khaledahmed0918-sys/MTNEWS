
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { VoteGroup, VoteCharacter, SocialLink } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { logAction } from '../../utils/logging';
import { Vote3DCard, AdminToolsModal, VoteGroupToolsModal, DiscordInfoModal } from './VoteComponents';

const API_BASE = "https://dolabriform-fascinatedly-lecia.ngrok-free.dev";

export const VotesPage: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
    const { t, dir } = useI18n();
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [groups, setGroups] = useState<VoteGroup[]>([]);
    const [showTools, setShowTools] = useState(false);
    const [showGroupTools, setShowGroupTools] = useState(false);
    const [showDiscordModal, setShowDiscordModal] = useState<SocialLink | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async (signal?: AbortSignal) => {
        try {
            const res = await fetch(`${API_BASE}/categories`, {
                headers: { "ngrok-skip-browser-warning": "true" },
                signal
            });
            if (res.ok) {
                const data = await res.json();
                const processed = data.map((g: any) => ({
                    ...g,
                    people: g.people.map((p: any) => ({
                        ...p,
                        image: p.image ? (p.image.startsWith('http') ? p.image : `${API_BASE}/${p.image.replace(/^uploads\//, '')}`) : ''
                    }))
                }));
                if (!signal?.aborted) {
                    setGroups(processed);
                }
            }
        } catch (e: any) {
            if (e.name !== 'AbortError') console.error(e);
        } finally {
            if (!signal?.aborted) setLoading(false);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        
        fetchData(controller.signal);
        
        const interval = setInterval(() => {
            fetchData(controller.signal);
        }, 5000); 
        
        return () => {
            controller.abort(); // Cancel request immediately on unmount
            clearInterval(interval);
        };
    }, []);

    const activeGroup = useMemo(() => groups.find(g => g.id === activeGroupId), [groups, activeGroupId]);

    const handleSocialClick = (social: SocialLink) => {
        if (social.platform === 'Discord') setShowDiscordModal(social);
        else window.open(social.url, '_blank', 'noopener,noreferrer');
    };

    const handleVote = async (id: string, name: string, img: string) => {
        if (!activeGroupId) return;
        try {
            await fetch(`${API_BASE}/categories/${activeGroupId}/vote/${id}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({ increment: 1 })
            });
            logAction('vote', `Voted for ${name}`, `Group: ${activeGroup?.name}`);
            fetchData(); 
        } catch (e) {}
    };

    // --- GROUP SELECTION VIEW ---
    if (!activeGroupId) {
        return (
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 relative min-h-[600px] p-2">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                     <div>
                         <h2 className="text-3xl font-display font-black text-white">{t('voteCategories')}</h2>
                         <p className="text-gray-400 text-sm">Select a category to start voting</p>
                     </div>
                     {isAdmin && (
                         <motion.button 
                            onClick={() => setShowGroupTools(true)} 
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 hover:bg-white/10 transition-all group"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                         >
                             <Icons.Settings className="w-5 h-5 text-gray-400 group-hover:rotate-90 transition-transform" /> 
                             {t('tools')}
                         </motion.button>
                     )}
                 </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map(g => (
                        <GlassCard 
                            key={g.id} 
                            onClick={() => setActiveGroupId(g.id)} 
                            className="flex flex-col gap-0 !p-0 overflow-hidden group cursor-pointer border border-white/10 hover:border-orange-500/50 transition-all duration-500"
                        >
                            <div className="aspect-video w-full relative overflow-hidden bg-[#111]">
                                {g.image ? (
                                    <img src={g.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-black">
                                        <Icons.Vote className="w-16 h-16 text-white/10" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent group-hover:via-transparent transition-all duration-500" />
                                
                                <div className="absolute bottom-0 left-0 p-6 w-full">
                                    <h3 className="font-display font-black text-3xl text-white drop-shadow-lg translate-y-1 group-hover:translate-y-0 transition-transform">{g.name}</h3>
                                    <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity delay-100 flex items-center gap-2 mt-1">
                                        <span>{g.people.length} Candidates</span>
                                        <Icons.ArrowRight className="w-4 h-4 text-orange-500" />
                                    </p>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                    {groups.length === 0 && !loading && (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
                            <Icons.SearchX className="w-12 h-12 opacity-50" />
                            <p>{t('noResults')}</p>
                        </div>
                    )}
                </div>
                <AnimatePresence>{showGroupTools && <VoteGroupToolsModal onClose={() => setShowGroupTools(false)} />}</AnimatePresence>
            </div>
        );
    }

    // --- CANDIDATE VOTING VIEW ---
    return (
        <div className="w-full max-w-[1800px] mx-auto flex flex-col gap-8 relative min-h-[600px] px-2">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button 
                        onClick={() => setActiveGroupId(null)} 
                        className="w-10 h-10 bg-black/20 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors border border-white/5"
                    >
                        <Icons.ArrowLeft className={`w-5 h-5 text-white ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-white leading-none">{activeGroup?.name}</h2>
                        <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('voteFor')} your favorite</span>
                    </div>
                </div>
                
                {isAdmin && (
                    <motion.button 
                        onClick={() => setShowTools(true)} 
                        className="px-5 py-2.5 bg-orange-600 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 hover:bg-orange-700 transition-all ml-auto md:ml-0"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Icons.Settings className="w-5 h-5" /> 
                        <span>Manage Candidates</span>
                    </motion.button>
                )}
            </div>
            
            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-12">
                {activeGroup?.people.map(person => {
                    const uiChar: VoteCharacter = { ...person };
                    return (
                        <Vote3DCard 
                            key={person.id} 
                            char={uiChar} 
                            votes={person.votes} 
                            onVote={handleVote} 
                            cooldownActive={false} 
                            rank={0} 
                            locked={false} 
                            justVoted={false} 
                            onSocialClick={handleSocialClick} 
                        />
                    );
                })}
            </div>

            <AnimatePresence>
                {showTools && activeGroup && <AdminToolsModal onClose={() => setShowTools(false)} candidates={activeGroup.people} groupId={activeGroupId} />}
            </AnimatePresence>
            <AnimatePresence>
                {showDiscordModal && <DiscordInfoModal social={showDiscordModal} onClose={() => setShowDiscordModal(null)} />}
            </AnimatePresence>
        </div>
    );
};
