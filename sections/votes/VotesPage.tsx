
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

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_BASE}/categories`, {
                headers: { "ngrok-skip-browser-warning": "true" }
            });
            if (res.ok) {
                const data = await res.json();
                // Ensure image paths are resolved
                const processed = data.map((g: any) => ({
                    ...g,
                    people: g.people.map((p: any) => ({
                        ...p,
                        image: p.image ? (p.image.startsWith('http') ? p.image : `${API_BASE}/${p.image.replace(/^uploads\//, '')}`) : ''
                    }))
                }));
                setGroups(processed);
            }
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
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
            fetchData(); // Immediate refresh
        } catch (e) {}
    };

    if (!activeGroupId) {
        return (
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative min-h-[500px]">
                 {isAdmin && (<div className="flex justify-end mb-4"><button onClick={() => setShowGroupTools(true)} className="px-4 py-2 bg-orange-500 rounded-full font-bold text-white shadow-lg flex items-center gap-2 hover:bg-orange-600"><Icons.Settings className="w-4 h-4" /> {t('tools')}</button></div>)}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map(g => (
                        <GlassCard key={g.id} onClick={() => setActiveGroupId(g.id)} className="flex flex-col gap-4 group hover:bg-white/10 transition-colors cursor-pointer">
                            <div className="aspect-video rounded-xl overflow-hidden bg-black/20 relative">
                                {g.image ? <img src={g.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center"><Icons.Vote className="w-12 h-12 text-gray-600" /></div>}
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div>
                                <div className="absolute bottom-4 left-4 font-black text-2xl text-white drop-shadow-lg">{g.name}</div>
                            </div>
                        </GlassCard>
                    ))}
                    {groups.length === 0 && !loading && <div className="col-span-full text-center py-10 text-gray-500">{t('noResults')}</div>}
                </div>
                <AnimatePresence>{showGroupTools && <VoteGroupToolsModal onClose={() => setShowGroupTools(false)} />}</AnimatePresence>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative min-h-[600px]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1 flex justify-start"><button onClick={() => setActiveGroupId(null)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 text-white hover:bg-white/10"><Icons.ArrowLeft className={`w-4 h-4 ${dir === 'rtl' ? 'rotate-180' : ''}`} /> {t('return')}</button></div>
                <div className="flex-1 text-center"><h2 className="text-3xl font-black text-white">{activeGroup?.name}</h2></div>
                <div className="flex-1 flex justify-end">{isAdmin && (<button onClick={() => setShowTools(true)} className="px-4 py-2 bg-orange-500 rounded-full font-bold text-white shadow-lg flex items-center gap-2 hover:bg-orange-600"><Icons.Settings className="w-4 h-4" /> {t('tools')}</button>)}</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-4 perspective-container pb-12">
                {activeGroup?.people.map(person => {
                    // Map API Person to UI structure
                    const uiChar: VoteCharacter = {
                        ...person,
                        // If roles/ranks aren't supported by API, we omit them from the object but the 3DCard handles undefined gracefully
                    };
                    return (
                        <Vote3DCard 
                            key={person.id} 
                            char={uiChar} 
                            votes={person.votes} 
                            onVote={handleVote} 
                            cooldownActive={false} // Global cooldowns removed as per API capabilities
                            rank={0} 
                            locked={false} 
                            justVoted={false} 
                            onSocialClick={handleSocialClick} 
                        />
                    );
                })}
            </div>
            <AnimatePresence>{showTools && activeGroup && <AdminToolsModal onClose={() => setShowTools(false)} candidates={activeGroup.people} groupId={activeGroupId} />}</AnimatePresence>
            <AnimatePresence>{showDiscordModal && <DiscordInfoModal social={showDiscordModal} onClose={() => setShowDiscordModal(null)} />}</AnimatePresence>
        </div>
    );
};
