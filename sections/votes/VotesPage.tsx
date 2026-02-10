
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { useLocalStorage } from '../../hooks';
import { db, ref, onValue, runTransaction } from '../../firebase';
import { VoteGroup, VoteCharacter, VoteConfig, SocialLink } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { logAction } from '../../utils/logging';
import { Vote3DCard, AdminToolsModal, VoteGroupToolsModal, DiscordInfoModal } from './VoteComponents';

export const VotesPage: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
    const { t } = useI18n();
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [groups, setGroups] = useState<VoteGroup[]>([]);
    const [candidates, setCandidates] = useState<VoteCharacter[]>([]);
    const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
    const [config, setConfig] = useState<VoteConfig>({ deadline: '', cooldownTime: '1h', onceVote: false });
    const [timeLeft, setTimeLeft] = useState('');
    const [cooldownTimeLeft, setCooldownTimeLeft] = useState('');
    const [isLocked, setIsLocked] = useState(false);
    const [justVotedId, setJustVotedId] = useState<string | null>(null);
    const [cooldowns, setCooldowns] = useLocalStorage<Record<string, number>>('mtnews-vote-cooldowns', {});
    const [votedOnce, setVotedOnce] = useLocalStorage<Record<string, boolean>>('mtnews-vote-once', {});
    const [showTools, setShowTools] = useState(false);
    const [showGroupTools, setShowGroupTools] = useState(false);
    const [showDiscordModal, setShowDiscordModal] = useState<SocialLink | null>(null);

    useEffect(() => {
        const groupsRef = ref(db, 'votes/groups');
        const unsub = onValue(groupsRef, snap => {
            const data = snap.val();
            if(data) setGroups(Object.values(data));
            else setGroups([]);
        });
        return () => unsub();
    }, []);
    
    useEffect(() => {
        const now = Date.now();
        const existingCooldowns = cooldowns;
        const cleanedCooldowns = Object.entries(existingCooldowns).reduce((acc, [key, value]) => {
            if (value > now) acc[key] = value;
            return acc;
        }, {} as Record<string, number>);
        if (Object.keys(cleanedCooldowns).length !== Object.keys(existingCooldowns).length) setCooldowns(cleanedCooldowns);
    }, []);

    useEffect(() => {
        if (!activeGroupId) return;
        const candidatesRef = ref(db, `votes/data/${activeGroupId}/candidates`);
        const countsRef = ref(db, `votes/data/${activeGroupId}/counts`);
        const configRef = ref(db, `votes/data/${activeGroupId}/config`);
        const unsub1 = onValue(candidatesRef, s => setCandidates(s.exists() ? Object.values(s.val()) : []));
        const unsub2 = onValue(countsRef, s => setVoteCounts(s.val() || {}));
        const unsub3 = onValue(configRef, s => s.exists() && setConfig(s.val()));
        return () => { unsub1(); unsub2(); unsub3(); };
    }, [activeGroupId]);

    const activeGroup = groups.find(g => g.id === activeGroupId);
    const deadlineDate = useMemo(() => new Date(config.deadline || Date.now() + 10000000), [config.deadline]);
    
    useEffect(() => {
        if (!activeGroupId) return;
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = deadlineDate.getTime() - now;
            if (diff <= 0 && config.deadline) {
                setIsLocked(true);
                setTimeLeft(t('votingClosed'));
            } else if (config.deadline) {
                setIsLocked(false);
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${d>0?d+'d ':''}${h}h ${m}m ${s}s`);
            } else {
                setTimeLeft('');
            }
            const groupCooldown = cooldowns[activeGroupId] || 0;
            if (!config.onceVote && groupCooldown > now) {
                const cDiff = groupCooldown - now;
                const h = Math.floor((cDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); 
                const m = Math.floor((cDiff % (1000 * 60 * 60)) / (1000 * 60)); 
                const s = Math.floor((cDiff % (1000 * 60)) / 1000); 
                setCooldownTimeLeft(`${h}h ${m}m ${s}s`);
            } else {
                setCooldownTimeLeft('');
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [deadlineDate, config, cooldowns, activeGroupId, t]);

    const handleSocialClick = (social: SocialLink) => {
        if (social.platform === 'Discord') setShowDiscordModal(social);
        else window.open(social.url, '_blank', 'noopener,noreferrer');
    };

    const handleVote = async (id: string, name: string, img: string) => {
        if (!activeGroupId) return;
        const now = Date.now();
        if (config.onceVote) {
            if (votedOnce[activeGroupId]) return;
            setVotedOnce(prev => ({ ...prev, [activeGroupId]: true }));
        } else {
            if ((cooldowns[activeGroupId] || 0) > now) return;
            const match = (config.cooldownTime || '1h').match(/(\d+)([smhdw])/);
            const multipliers: any = { s: 1000, m: 60000, h: 3600000, d: 86400000, w: 604800000 };
            const addedTime = match ? parseInt(match[1]) * (multipliers[match[2]] || 0) : 3600000;
            setCooldowns(prev => ({...prev, [activeGroupId]: now + addedTime}));
        }
        setJustVotedId(id);
        setTimeout(() => setJustVotedId(null), 2000);
        await runTransaction(ref(db, `votes/data/${activeGroupId}/counts/${id}`), (curr) => (curr || 0) + 1);
        logAction('vote', `Voted in ${activeGroup?.name}`, `Candidate: ${name}, Group: ${activeGroup?.name}`);
    };

    const displayCandidates = useMemo(() => {
        if (!isLocked) return candidates;
        return [...candidates].sort((a,b) => (voteCounts[b.id]||0) - (voteCounts[a.id]||0));
    }, [candidates, isLocked, voteCounts]);

    if (!activeGroupId) {
        return (
            <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative min-h-[500px]">
                 {isAdmin && (<div className="flex justify-end mb-4"><button onClick={() => setShowGroupTools(true)} className="px-4 py-2 bg-orange-500 rounded-full font-bold text-white shadow-lg flex items-center gap-2 hover:bg-orange-600"><Icons.Settings className="w-4 h-4" /> {t('tools')}</button></div>)}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map(g => (<GlassCard key={g.id} onClick={() => setActiveGroupId(g.id)} className="flex flex-col gap-4 group hover:bg-white/10 transition-colors"><div className="aspect-video rounded-xl overflow-hidden bg-black/20 relative">{g.image ? <img src={g.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="w-full h-full flex items-center justify-center"><Icons.Vote className="w-12 h-12 text-gray-600" /></div>}<div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors"></div><div className="absolute bottom-4 left-4 font-black text-2xl text-white drop-shadow-lg">{g.name}</div></div></GlassCard>))}
                    {groups.length === 0 && <div className="col-span-full text-center py-10 text-gray-500">{t('noResults')}</div>}
                </div>
                <AnimatePresence>{showGroupTools && <VoteGroupToolsModal onClose={() => setShowGroupTools(false)} />}</AnimatePresence>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative min-h-[600px]">
            <div className="flex items-center justify-between mb-4">
                <div className="flex-1 flex justify-start"><button onClick={() => setActiveGroupId(null)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-full flex items-center gap-2 text-white hover:bg-white/10"><Icons.ArrowLeft className={`w-4 h-4 ${useI18n().dir==='rtl'?'rotate-180':''}`} /> {t('return')}</button></div>
                <div className="flex-1 text-center"><h2 className="text-3xl font-black text-white">{activeGroup?.name}</h2></div>
                <div className="flex-1 flex justify-end">{isAdmin && (<button onClick={() => setShowTools(true)} className="px-4 py-2 bg-orange-500 rounded-full font-bold text-white shadow-lg flex items-center gap-2 hover:bg-orange-600"><Icons.Settings className="w-4 h-4" /> {t('tools')}</button>)}</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center gap-4">
                <div className="flex flex-col items-center"><div className="flex items-center gap-2 px-8 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md shadow-lg"><Icons.Clock className={`w-6 h-6 ${isLocked ? 'text-red-500' : 'text-orange-500 animate-pulse'}`} /><span className="font-mono text-2xl font-bold text-white tracking-widest">{timeLeft || '--:--:--'}</span></div><h2 className="text-gray-400 text-sm font-bold uppercase tracking-[0.2em] mt-2">{isLocked ? t('votingClosed') : t('votingEndsIn')}</h2></div>
                {cooldownTimeLeft && (<div className="flex flex-col items-center"><div className="flex items-center gap-2 px-6 py-2 rounded-full bg-red-500/10 border border-red-500/30 backdrop-blur-md"><Icons.AlertCircle className="w-5 h-5 text-red-400" /><span className="font-mono text-lg font-bold text-red-200">{cooldownTimeLeft}</span></div><span className="text-red-400 text-xs font-bold uppercase tracking-widest mt-1">{t('nextVoteIn')}</span></div>)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 px-4 perspective-container pb-12">
                {displayCandidates.map(char => (<Vote3DCard key={char.id} char={char} votes={voteCounts[char.id] || 0} onVote={handleVote} cooldownActive={(cooldowns[activeGroupId] || 0) > Date.now()} rank={!isLocked ? 0 : displayCandidates.indexOf(char)+1} locked={isLocked} justVoted={justVotedId === char.id} isSingleVoteMode={config.onceVote} hasVotedOnce={!!votedOnce[activeGroupId]} onSocialClick={handleSocialClick} />))}
            </div>
            <AnimatePresence>{showTools && <AdminToolsModal onClose={() => setShowTools(false)} candidates={candidates} groupId={activeGroupId} />}</AnimatePresence>
            <AnimatePresence>{showDiscordModal && <DiscordInfoModal social={showDiscordModal} onClose={() => setShowDiscordModal(null)} />}</AnimatePresence>
        </div>
    );
};
