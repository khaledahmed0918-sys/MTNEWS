
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { VoteCharacter, SocialLink } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { AsyncButton } from '../../components/ui/AsyncButton';
import { ImageUploadControl } from '../../components/ui/SharedInputs';
import { useGlobalActions } from '../../contexts/GlobalActionsContext';
import { logAction } from '../../utils/logging';

const API_BASE = "https://dolabriform-fascinatedly-lecia.ngrok-free.dev";

// --- VOTE 3D CARD (PREMIUM REALISTIC STYLE) ---
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
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [15, -15]);
    const rotateY = useTransform(x, [-100, 100], [-15, 15]);
    
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
        <div style={{ perspective: 1500 }} className="w-full h-[550px] py-6 flex justify-center">
            <motion.div 
                layout 
                style={{ rotateX, rotateY, z: 50 }} 
                className="relative w-full max-w-sm h-full rounded-[35px] bg-[#121212] border border-white/10 flex flex-col items-center p-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] group overflow-visible transition-all duration-300"
                onMouseMove={(e) => { 
                    const rect = e.currentTarget.getBoundingClientRect(); 
                    x.set(e.clientX - (rect.left + rect.width / 2)); 
                    y.set(e.clientY - (rect.top + rect.height / 2)); 
                }} 
                onMouseLeave={() => { x.set(0); y.set(0); }} 
                initial={{ opacity: 0, scale: 0.9, y: 50 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ scale: 1.03, z: 50 }}
            >
                {/* Inner Container with Glass Effect */}
                <div className="absolute inset-2 rounded-[30px] bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] border border-white/5 flex flex-col items-center p-6 overflow-hidden">
                    
                    {/* Background Shine */}
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_50%)] pointer-events-none" />

                    {/* Image Area */}
                    <div className="relative z-10 w-44 h-44 mt-2 mb-6 group-hover:scale-105 transition-transform duration-500">
                        <div className="absolute inset-0 rounded-full bg-orange-500/20 blur-2xl opacity-50 animate-pulse" />
                        <div className="w-full h-full rounded-full p-1 bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-2xl relative overflow-hidden">
                            {char.image ? (
                                <img src={char.image} alt={char.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-neutral-800 flex items-center justify-center">
                                    <span className="text-4xl font-black text-gray-600">{char.name?.substring(0,2).toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                        {/* Rank Badge if exists */}
                        {char.rank && (
                            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg border border-white/20">
                                {char.rank}
                            </div>
                        )}
                    </div>

                    {/* Info Area */}
                    <div className="text-center z-10 w-full flex flex-col items-center gap-2 mb-auto">
                        <h3 className="text-3xl font-display font-black text-white tracking-tight drop-shadow-md line-clamp-1">{char.name}</h3>
                        
                        {/* Role/Faction Tags */}
                        <div className="flex flex-wrap gap-2 justify-center mt-1">
                            {char.faction && <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{char.faction}</span>}
                            {char.tags && char.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-wider">{tag}</span>
                            ))}
                        </div>
                    </div>

                    {/* Footer / Interaction Area */}
                    <div className="w-full z-20 mt-auto pt-6 flex flex-col gap-4">
                        {/* Social Links */}
                        <div className="flex justify-center items-center gap-3 min-h-[40px]">
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
                                    <motion.button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); onSocialClick(social); }}
                                        className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 transition-all duration-300 border border-white/5 ${colors[social.platform] || 'hover:bg-white hover:text-black'}`}
                                        whileHover={{ y: -3, scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {/* @ts-ignore */}
                                        <Icon className="w-5 h-5" />
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Vote Button */}
                        <motion.button 
                            onClick={handleVote} 
                            whileHover={{ scale: 1.02 }} 
                            whileTap={{ scale: 0.98 }} 
                            className="w-full py-4 relative group overflow-hidden rounded-xl bg-[#1a1a1a] border border-orange-500/30 hover:border-orange-500/60 transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 opacity-20 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative z-10 flex items-center justify-center gap-3">
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

    const handleDelete = async (signal: AbortSignal, id: string) => {
        if(!confirm(t('deleteConfirm'))) return;
        await fetch(`${API_BASE}/categories/${groupId}/remove/${id}`, {
            method: 'POST',
            headers: { "ngrok-skip-browser-warning": "true" },
            signal
        });
        logAction('admin', 'Deleted Candidate', `ID: ${id}`);
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
                                        <AsyncButton onClick={(s) => handleDelete(s, c.id)} label="" className="px-3 py-1.5" variant="danger"><Icons.Trash2 className="w-4 h-4" /></AsyncButton>
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

// --- GROUP TOOLS (No changes to logic, just UI refinement) ---
export const VoteGroupToolsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useI18n();
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

    const handleRemove = async (signal: AbortSignal, id: string) => {
        if(!confirm(t('deleteConfirm'))) return;
        await fetch(`${API_BASE}/categories/remove`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
            body: JSON.stringify({ id }),
            signal
        });
        logAction('admin', 'Deleted Category', id);
        const res = await fetch(`${API_BASE}/categories`, { headers: { "ngrok-skip-browser-warning": "true" }});
        if(res.ok) setGroups(await res.json());
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
                                 <AsyncButton onClick={(s) => handleRemove(s, g.id)} label={t('remove')} variant="danger" className="py-1 text-sm" />
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
