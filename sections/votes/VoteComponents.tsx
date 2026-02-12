
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons, API_BASE } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { VoteCharacter, SocialLink } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { AsyncButton } from '../../components/ui/AsyncButton';
import { ImageUploadControl } from '../../components/ui/SharedInputs';
import { useGlobalActions } from '../../contexts/GlobalActionsContext';
import { logAction } from '../../utils/logging';

// --- VOTE CARD (OPTIMIZED PERFORMANCE) ---
export const Vote3DCard: React.FC<{ 
    char: VoteCharacter; 
    votes: number; 
    onVote: (id: string, name: string, img: string) => void; 
    cooldownActive: boolean; 
    rank: number; 
    locked: boolean; 
    justVoted: boolean; 
    isSingleVoteMode?: boolean; 
    hasVotedOnce?: boolean; 
    onSocialClick: (social: SocialLink) => void; 
}> = ({ char, votes, onVote, locked, onSocialClick }) => {
    const { t } = useI18n();
    
    const handleVote = (e: React.MouseEvent) => { 
        e.stopPropagation(); 
        if (locked) return; 
        onVote(char.id, char.name, char.image); 
    };

    const socialArray: SocialLink[] = [];
    if (char.social) {
        if (char.social.discord) socialArray.push({ platform: 'Discord', url: '#', username: char.social.discord });
        if (char.social.kick) socialArray.push({ platform: 'Kick', url: char.social.kick });
        if (char.social.twitter) socialArray.push({ platform: 'Twitter', url: char.social.twitter });
        if (char.social.youtube) socialArray.push({ platform: 'YouTube', url: char.social.youtube });
        if (char.social.instagram) socialArray.push({ platform: 'Instagram', url: char.social.instagram });
    }

    return (
        <div className="w-full h-[500px] py-4 flex justify-center">
            <motion.div 
                className="relative w-full max-w-sm h-full rounded-[30px] bg-[#121212] border border-white/10 flex flex-col items-center p-1 shadow-xl group overflow-hidden transition-all duration-300"
                initial={{ opacity: 0, y: 20 }} 
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ y: -8, borderColor: "rgba(249, 115, 22, 0.3)", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}
                transition={{ duration: 0.3 }}
            >
                <div className="absolute inset-1 rounded-[26px] bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/5 flex flex-col items-center p-5 overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none" />
                    <div className="relative z-10 w-40 h-40 mt-4 mb-4 group-hover:scale-105 transition-transform duration-500 ease-out">
                        <div className="w-full h-full rounded-full p-1 bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-2xl relative overflow-hidden">
                            {char.image ? (
                                <img src={char.image} alt={char.name} className="w-full h-full rounded-full object-cover" loading="lazy" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-neutral-800 flex items-center justify-center">
                                    <span className="text-4xl font-black text-gray-600">{char.name?.substring(0,2).toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                        {char.rank && (
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg border border-white/20">
                                {char.rank}
                            </div>
                        )}
                    </div>
                    <div className="text-center z-10 w-full flex flex-col items-center gap-1 mb-auto">
                        <h3 className="text-2xl font-display font-black text-white tracking-tight drop-shadow-md line-clamp-1 px-2">{char.name}</h3>
                        <div className="flex flex-wrap gap-1.5 justify-center mt-1">
                            {char.faction && <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{char.faction}</span>}
                            {char.tags && char.tags.slice(0, 2).map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{tag}</span>
                            ))}
                        </div>
                    </div>
                    <div className="w-full z-20 mt-auto pt-4 flex flex-col gap-3">
                        <div className="flex justify-center items-center gap-2 min-h-[36px]">
                            {socialArray.map((social, idx) => {
                                const Icon = Icons[social.platform as keyof typeof Icons] || Icons.Link;
                                const colors: Record<string, string> = {
                                    'Twitter': 'hover:bg-[#1DA1F2] hover:text-white',
                                    'Kick': 'hover:bg-[#53FC18] hover:text-black',
                                    'YouTube': 'hover:bg-[#FF0000] hover:text-white',
                                    'Discord': 'hover:bg-[#5865F2] hover:text-white',
                                    'Instagram': 'hover:bg-[#E4405F] hover:text-white'
                                };
                                return (
                                    <button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); onSocialClick(social); }}
                                        className={`w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-gray-400 transition-all duration-200 border border-white/5 hover:scale-110 ${colors[social.platform] || 'hover:bg-white hover:text-black'}`}
                                        title={social.platform}
                                    >
                                        {/* @ts-ignore */}
                                        <Icon className="w-4 h-4" />
                                    </button>
                                );
                            })}
                        </div>
                        <motion.button 
                            onClick={handleVote} 
                            whileTap={{ scale: 0.97 }} 
                            className="w-full py-3.5 relative group overflow-hidden rounded-xl bg-[#151515] border border-orange-500/20 hover:border-orange-500/50 transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-10 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative z-10 flex items-center justify-center gap-2">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400 group-hover:text-white font-black text-xl tracking-tight transition-colors">
                                    {votes.toLocaleString()}
                                </span>
                                <Icons.Vote className="w-5 h-5 text-orange-500 group-hover:text-white transition-colors" />
                            </div>
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

// --- ADMIN TOOLS ---
export const AdminToolsModal: React.FC<{ onClose: () => void; candidates: VoteCharacter[]; groupId: string; }> = ({ onClose, candidates, groupId }) => {
    const { t, dir } = useI18n();
    const { requestDelete } = useGlobalActions();
    const [view, setView] = useState<'menu' | 'add' | 'reset'>('menu');
    const [name, setName] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [socials, setSocials] = useState({ discord: '', kick: '', instagram: '', youtube: '', twitter: '' });

    const handleAddCandidate = async (signal: AbortSignal) => {
        if (!name) return;
        const fd = new FormData();
        fd.append('name', name);
        fd.append('tags', tagsInput);
        if (imageFile) fd.append('image', imageFile);
        Object.entries(socials).forEach(([k, v]) => fd.append(k, v as string));

        const res = await fetch(`${API_BASE}/categories/${groupId}/add`, {
            method: 'POST',
            headers: { "ngrok-skip-browser-warning": "true" },
            body: fd,
            signal
        });

        if (res.ok) {
            logAction('admin', 'Added Candidate', `Name: ${name}`);
            onClose();
        }
    };

    const handleDelete = (id: string, candidateName: string) => {
        requestDelete(
            t('deleteConfirm'),
            `Delete Candidate: ${candidateName}?`,
            async () => {
                await fetch(`${API_BASE}/categories/${groupId}/remove/${id}`, {
                    method: 'POST',
                    headers: { "ngrok-skip-browser-warning": "true" }
                });
            },
            undefined, 
            'admin',
            `Deleted Candidate: ${candidateName}`
        );
    };

    const handleResetVotes = async (signal: AbortSignal, id: string) => {
        await fetch(`${API_BASE}/categories/${groupId}/restart/${id}`, {
            method: 'POST',
            headers: { "ngrok-skip-browser-warning": "true" },
            signal
        });
        logAction('admin', 'Reset Votes', `ID: ${id}`);
    };
    
    const handleModifyVotes = async (signal: AbortSignal, id: string, amount: number) => {
        await fetch(`${API_BASE}/categories/${groupId}/vote/${id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ increment: amount }),
            signal
        });
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-2xl min-h-[500px] flex flex-col relative max-h-[90vh] overflow-y-auto custom-scrollbar" noRound>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-black/20 p-4 -m-6 backdrop-blur-md z-10 border-b border-white/10">
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">
                        {view !== 'menu' && <button onClick={() => setView('menu')}><Icons.ArrowLeft className={`w-6 h-6 ${dir==='rtl'?'rotate-180':''}`} /></button>}
                        {t('toolsTitle')}
                    </h3>
                    <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <AnimatePresence mode="wait">
                    {view === 'menu' && (
                        <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-4 pt-4">
                            <button onClick={() => setView('add')} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-all">
                                <Icons.Plus className="w-8 h-8 text-green-500" />
                                <span className="font-bold text-lg text-green-500">{t('add')}</span>
                            </button>
                            <button onClick={() => setView('reset')} className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-all">
                                <Icons.Settings className="w-8 h-8 text-blue-500" />
                                <span className="font-bold text-lg text-blue-500">{t('manageCategories')}</span>
                            </button>
                        </motion.div>
                    )}
                    {view === 'add' && (
                        <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                            <input value={name} onChange={e => setName(e.target.value)} placeholder={t('name')} className="p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500" />
                            <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder={t('imageTags')} className="p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500" />
                            <ImageUploadControl singleMode={true} onFilesChange={(files) => setImageFile(files[0])} onUrlsChange={() => {}} />
                            <AsyncButton onClick={handleAddCandidate} label={t('add')} variant="success" className="w-full" />
                        </motion.div>
                    )}
                    {view === 'reset' && (
                        <motion.div key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                            {candidates.map(c => (
                                <div key={c.id} className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-lg text-white">{c.name}</span>
                                        <span className="text-orange-500 font-bold text-xl">{c.votes}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <AsyncButton onClick={(s) => handleModifyVotes(s, c.id, 1)} label="+1" className="flex-1 py-1.5 text-xs" variant="success" />
                                        <AsyncButton onClick={(s) => handleModifyVotes(s, c.id, -1)} label="-1" className="flex-1 py-1.5 text-xs" variant="primary" />
                                        <AsyncButton onClick={(s) => handleResetVotes(s, c.id)} label={t('reset')} className="flex-1 py-1.5 text-xs" variant="danger" />
                                        <button onClick={() => handleDelete(c.id, c.name)} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"><Icons.Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </div>
    );
};

// --- GROUP TOOLS ---
export const VoteGroupToolsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useI18n();
    const { requestDelete } = useGlobalActions();
    const [view, setView] = useState<'menu' | 'add' | 'remove'>('menu');
    const [groupName, setGroupName] = useState('');
    const [groupImage, setGroupImage] = useState('');
    const [groups, setGroups] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${API_BASE}/categories`, { headers: { "ngrok-skip-browser-warning": "true" }})
            .then(r => r.json())
            .then(setGroups)
            .catch(() => {});
    }, []);

    const handleAdd = async (signal: AbortSignal) => {
        await fetch(`${API_BASE}/categories/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ name: groupName, image: groupImage }),
            signal
        });
        logAction('admin', 'Added Category', groupName);
        onClose();
    };

    const handleRemove = (id: string, name: string) => {
        requestDelete(
            t('deleteCategoryConfirm'),
            `Delete Category: ${name}?`,
            async () => {
                await fetch(`${API_BASE}/categories/remove`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
                    body: JSON.stringify({ id })
                });
                const res = await fetch(`${API_BASE}/categories`, { headers: { "ngrok-skip-browser-warning": "true" }});
                if(res.ok) setGroups(await res.json());
            },
            undefined,
            'admin',
            `Deleted Category: ${name}`
        );
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-lg" noRound>
                <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white">{t('voteCategories')}</h3><button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button></div>
                {view === 'menu' && (
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setView('add')} className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl hover:bg-green-500/20 flex flex-col items-center gap-2"><Icons.Plus className="w-8 h-8 text-green-500" /><span className="font-bold text-green-500">{t('addCategory')}</span></button>
                        <button onClick={() => setView('remove')} className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 flex flex-col items-center gap-2"><Icons.Trash2 className="w-8 h-8 text-red-500" /><span className="font-bold text-red-500">{t('manageCategories')}</span></button>
                    </div>
                )}
                {view === 'add' && (
                    <div className="flex flex-col gap-4">
                        <input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder={t('categoryName')} className="p-3 bg-white/5 border border-white/10 rounded-xl text-white" />
                        <ImageUploadControl singleMode initialUrl={groupImage} onUrlsChange={(urls) => setGroupImage(urls[0] || '')} />
                        <AsyncButton onClick={handleAdd} label={t('saveChanges')} variant="primary" className="w-full" />
                    </div>
                )}
                {view === 'remove' && (
                    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                         {groups.map(g => (
                             <div key={g.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                                 <span className="font-bold">{g.name}</span>
                                 <button onClick={() => handleRemove(g.id, g.name)} className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-white text-sm font-bold">{t('remove')}</button>
                             </div>
                         ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export const DiscordInfoModal: React.FC<{ social: SocialLink, onClose: () => void }> = ({ social, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10001] flex items-center justify-center p-4" onClick={onClose}>
            <GlassCard onClick={e => e.stopPropagation()} className="w-full max-w-sm flex flex-col items-center gap-4 relative" noRound>
                 <button onClick={onClose} className="absolute top-3 right-3 hover:bg-white/10 p-1 rounded-full"><Icons.X className="w-6 h-6 text-gray-400" /></button>
                 <div className="p-3 bg-white/10 rounded-full"><Icons.Discord className="w-10 h-10" /></div>
                 <h3 className="text-xl font-bold">{social.username || 'Discord User'}</h3>
            </GlassCard>
        </div>
    );
};
