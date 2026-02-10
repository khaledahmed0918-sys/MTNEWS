
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

// --- VOTE 3D CARD ---
export const Vote3DCard: React.FC<{ char: VoteCharacter; votes: number; onVote: (id: string, name: string, img: string) => void; cooldownActive: boolean; rank: number; locked: boolean; justVoted: boolean; isSingleVoteMode?: boolean; hasVotedOnce?: boolean; onSocialClick: (social: SocialLink) => void; }> = ({ char, votes, onVote, cooldownActive, rank, locked, justVoted, isSingleVoteMode, hasVotedOnce, onSocialClick }) => {
    const { t } = useI18n();
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);
    const [shake, setShake] = useState(false);
    
    const handleVote = (e: React.MouseEvent) => { e.stopPropagation(); if (locked) return; onVote(char.id, char.name, char.image); };

    // Convert API social object to array for UI
    const socialArray: SocialLink[] = [];
    if (char.social) {
        if (char.social.discord) socialArray.push({ platform: 'Discord', url: '#', username: char.social.discord });
        if (char.social.kick) socialArray.push({ platform: 'Kick', url: char.social.kick });
        if (char.social.twitter) socialArray.push({ platform: 'Twitter', url: char.social.twitter });
        if (char.social.youtube) socialArray.push({ platform: 'YouTube', url: char.social.youtube });
        if (char.social.instagram) socialArray.push({ platform: 'Instagram', url: char.social.instagram });
    }

    return (
        <div style={{ perspective: 1200 }} className="w-full h-[600px] py-4">
            <motion.div layout style={{ rotateX, rotateY, z: 50 }} className={`relative w-full h-full rounded-[30px] border border-white/10 bg-white/5 dark:bg-black/40 backdrop-blur-2xl flex flex-col items-center p-6 gap-5 transition-all duration-300 shadow-2xl`} onMouseMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); x.set(e.clientX - (rect.left + rect.width / 2)); y.set(e.clientY - (rect.top + rect.height / 2)); }} onMouseLeave={() => { x.set(0); y.set(0); }} initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} whileHover={{ scale: 1.02, z: 80 }}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[30px] pointer-events-none" />
                
                <div className="relative z-10 w-40 h-40 mt-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 blur-lg opacity-40 animate-pulse"></div>
                    {char.image ? (
                        <img src={char.image} alt={char.name} className="w-full h-full rounded-full object-cover border-4 border-white/10 shadow-2xl relative z-10" />
                    ) : (
                        <div className="w-full h-full rounded-full object-cover border-4 border-white/10 shadow-2xl relative z-10 bg-gray-800 flex items-center justify-center">
                            <span className="text-4xl font-black text-gray-500">{char.name ? char.name.substring(0,2).toUpperCase() : '?'}</span>
                        </div>
                    )}
                </div>
                <div className="text-center z-10 w-full flex flex-col items-center gap-3">
                    <h3 className="text-4xl font-black text-white drop-shadow-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">{char.name}</h3>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-1"></div>
                    <div className="flex flex-col gap-1 w-full text-sm">
                        {char.tags && char.tags.length > 0 && <div className="flex flex-wrap gap-1 justify-center mt-2">{char.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/5 rounded border border-white/10 text-gray-300">{tag}</span>)}</div>}
                    </div>
                </div>

                <div className="mt-auto w-full z-10 flex flex-col items-center gap-3 pt-4 border-t border-white/5">
                    {socialArray.length > 0 && (
                        <div className="flex justify-center items-center gap-4 mb-4">
                            {socialArray.map((social, idx) => {
                                const Icon = Icons[social.platform as keyof typeof Icons] || Icons.Link;
                                return (
                                    <motion.button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); onSocialClick(social); }}
                                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-colors"
                                        whileHover={{ scale: 1.15, borderColor: 'rgba(249, 115, 22, 0.7)', boxShadow: '0 0 15px rgba(249, 115, 22, 0.6)', y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        title={social.platform}
                                    >
                                        {/* @ts-ignore */}
                                        <Icon className="w-5 h-5" />
                                    </motion.button>
                                );
                            })}
                        </div>
                    )}

                    <motion.button 
                        onClick={handleVote} 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }} 
                        className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white border border-white/20`}
                    >
                         <Icons.Vote className="w-5 h-5" />
                         <span>{votes.toLocaleString()}</span>
                    </motion.button>
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
    const [status, setStatus] = useState('idle');

    const handleAddCandidate = async (signal: AbortSignal) => {
        if (!name) { setStatus('error'); return; }
        
        const fd = new FormData();
        fd.append('name', name);
        fd.append('tags', tagsInput);
        if (imageFile) fd.append('image', imageFile);
        Object.entries(socials).forEach(([k, v]) => fd.append(k, v));

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

    const MenuButton = ({ icon: Icon, label, onClick, color }: any) => (
        <motion.button onClick={onClick} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border ${color} bg-white/5 backdrop-blur-md shadow-lg transition-all`}>
            <Icon className="w-8 h-8" /><span className="font-bold text-lg">{t(label)}</span>
        </motion.button>
    );

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-2xl min-h-[500px] flex flex-col relative max-h-[90vh] overflow-y-auto custom-scrollbar" noRound>
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-black/20 p-4 -m-6 backdrop-blur-md z-10 border-b border-white/10">
                    <h3 className="text-2xl font-black text-white flex items-center gap-2">{view !== 'menu' && <button onClick={() => setView('menu')}><Icons.ArrowLeft className={`w-6 h-6 ${dir==='rtl'?'rotate-180':''}`} /></button>}{t('toolsTitle')}</h3><button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <AnimatePresence mode="wait">
                    {view === 'menu' && (
                        <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 gap-4 pt-4">
                            <MenuButton icon={Icons.Plus} label="add" onClick={() => setView('add')} color="border-green-500/30 hover:border-green-500 text-green-500" />
                            <MenuButton icon={Icons.Settings} label="manageCategories" onClick={() => setView('reset')} color="border-blue-500/30 hover:border-blue-500 text-blue-500" />
                        </motion.div>
                    )}
                    {view === 'add' && (
                        <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                            <input value={name} onChange={e => setName(e.target.value)} placeholder={t('name')} className="p-3 rounded-xl bg-white/5 border border-white/10" />
                            <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder={t('imageTags')} className="p-3 rounded-xl bg-white/5 border border-white/10" />
                            <ImageUploadControl singleMode={true} onFilesChange={(files) => setImageFile(files[0])} onUrlsChange={() => {}} />
                            
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                                <h4 className="font-bold mb-2 text-sm text-gray-400">{t('socials')}</h4>
                                <input value={socials.discord} onChange={e => setSocials({...socials, discord: e.target.value})} placeholder="Discord ID/Username" className="p-2 bg-black/40 rounded-lg text-white" />
                                <input value={socials.twitter} onChange={e => setSocials({...socials, twitter: e.target.value})} placeholder="Twitter URL" className="p-2 bg-black/40 rounded-lg text-white" />
                                <input value={socials.kick} onChange={e => setSocials({...socials, kick: e.target.value})} placeholder="Kick URL" className="p-2 bg-black/40 rounded-lg text-white" />
                                <input value={socials.youtube} onChange={e => setSocials({...socials, youtube: e.target.value})} placeholder="YouTube URL" className="p-2 bg-black/40 rounded-lg text-white" />
                                <input value={socials.instagram} onChange={e => setSocials({...socials, instagram: e.target.value})} placeholder="Instagram URL" className="p-2 bg-black/40 rounded-lg text-white" />
                            </div>

                            <AsyncButton onClick={handleAddCandidate} label={t('add')} variant="success" className="w-full" />
                        </motion.div>
                    )}
                    {view === 'reset' && (
                        <motion.div key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {candidates.map(c => (
                                    <div key={c.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-bold text-lg">{c.name}</span>
                                            <span className="text-orange-500 font-bold">{c.votes}</span>
                                        </div>
                                        <div className="flex gap-2 mb-2">
                                            <AsyncButton onClick={(s) => handleModifyVotes(s, c.id, 1)} label="+1" className="flex-1 py-1 text-sm" variant="success" />
                                            <AsyncButton onClick={(s) => handleModifyVotes(s, c.id, -1)} label="-1" className="flex-1 py-1 text-sm" variant="primary" />
                                            <AsyncButton onClick={(s) => handleResetVotes(s, c.id)} label={t('reset')} className="flex-1 py-1 text-sm" variant="danger" />
                                        </div>
                                        <AsyncButton onClick={(s) => handleDelete(s, c.id)} label={t('deleteImage')} variant="danger" className="w-full py-1 text-sm" />
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </GlassCard>
        </div>
    );
};

// --- CATEGORY TOOLS ---
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
        // Refresh list
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
