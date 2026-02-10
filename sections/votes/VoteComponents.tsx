
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { VoteCharacter, VoteConfig, SocialLink, VoteGroup } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { AsyncButton } from '../../components/ui/AsyncButton';
import { ImageUploadControl } from '../../components/ui/SharedInputs';
import { db, ref, get, set, push, runTransaction, onValue } from '../../firebase';
import { useGlobalActions } from '../../contexts/GlobalActionsContext';
import { logAction } from '../../utils/logging';

// --- LIVE COUNT HELPER ---
const LiveCount = ({ id, groupId }: { id: string, groupId: string }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const countRef = ref(db, `votes/data/${groupId}/counts/${id}`);
        const unsubscribe = onValue(countRef, (snapshot) => {
            setCount(snapshot.val() || 0);
        });
        return () => unsubscribe();
    }, [id, groupId]);
    return <span>{count}</span>;
}

// --- VOTE 3D CARD ---
export const Vote3DCard: React.FC<{ char: VoteCharacter; votes: number; onVote: (id: string, name: string, img: string) => void; cooldownActive: boolean; rank: number; locked: boolean; justVoted: boolean; isSingleVoteMode?: boolean; hasVotedOnce?: boolean; onSocialClick: (social: SocialLink) => void; }> = ({ char, votes, onVote, cooldownActive, rank, locked, justVoted, isSingleVoteMode, hasVotedOnce, onSocialClick }) => {
    const { t } = useI18n();
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useTransform(y, [-100, 100], [10, -10]);
    const rotateY = useTransform(x, [-100, 100], [-10, 10]);
    const [shake, setShake] = useState(false);
    
    const isBlocked = isSingleVoteMode ? hasVotedOnce : cooldownActive;
    
    const handleVote = (e: React.MouseEvent) => { e.stopPropagation(); if (locked) return; if (isBlocked && !justVoted) { setShake(true); setTimeout(() => setShake(false), 500); } else { onVote(char.id, char.name, char.image); } };
    const getRankStyle = (r: number) => {
        if (r === 1) return { badge: 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-black border-yellow-200 shadow-[0_0_20px_rgba(234,179,8,0.5)]', border: 'border-yellow-500/50 shadow-[0_0_50px_rgba(250,204,21,0.2)]', icon: <Icons.Trophy className="w-5 h-5" />, text: t('theWinner') };
        if (r === 2) return { badge: 'bg-gradient-to-r from-slate-400 to-slate-200 text-black border-slate-300 shadow-[0_0_20px_rgba(148,163,184,0.5)]', border: 'border-slate-400/50 shadow-[0_0_40px_rgba(148,163,184,0.2)]', icon: <span className="font-black text-lg">#2</span>, text: '' };
        if (r === 3) return { badge: 'bg-gradient-to-r from-orange-800 to-orange-500 text-white border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.4)]', border: 'border-orange-700/50 shadow-[0_0_40px_rgba(194,65,12,0.2)]', icon: <span className="font-black text-lg">#3</span>, text: '' };
        return { badge: '', border: 'border-white/10', icon: null, text: '' };
    };
    const rankStyle = locked ? getRankStyle(rank) : { badge: '', border: 'border-white/10', icon: null, text: '' };

    return (
        <div style={{ perspective: 1200 }} className="w-full h-[600px] py-4">
            <motion.div layout style={{ rotateX, rotateY, z: 50 }} className={`relative w-full h-full rounded-[30px] border ${rankStyle.border} bg-white/5 dark:bg-black/40 backdrop-blur-2xl flex flex-col items-center p-6 gap-5 transition-all duration-300 shadow-2xl`} onMouseMove={(e) => { const rect = e.currentTarget.getBoundingClientRect(); x.set(e.clientX - (rect.left + rect.width / 2)); y.set(e.clientY - (rect.top + rect.height / 2)); }} onMouseLeave={() => { x.set(0); y.set(0); }} initial={{ opacity: 0, scale: 0.9, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} whileHover={{ scale: 1.02, z: 80 }}>
                {locked && rank <= 3 && (<motion.div initial={{ y: -50 }} animate={{ y: -25 }} className={`absolute -top-6 z-50 px-6 py-2 rounded-full flex items-center gap-2 border font-bold ${rankStyle.badge}`}>{rankStyle.icon} {rankStyle.text}</motion.div>)}
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-[30px] pointer-events-none" />
                
                <div className="relative z-10 w-40 h-40 mt-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-500 to-red-600 blur-lg opacity-40 animate-pulse"></div>
                    {char.image ? (
                        <img src={char.image} alt={char.name} className="w-full h-full rounded-full object-cover border-4 border-white/10 shadow-2xl relative z-10" />
                    ) : (
                        <div className="w-full h-full rounded-full object-cover border-4 border-white/10 shadow-2xl relative z-10 bg-gray-800 flex items-center justify-center">
                            <span className="text-4xl font-black text-gray-500">{char.name.substring(0,2).toUpperCase()}</span>
                        </div>
                    )}
                </div>
                <div className="text-center z-10 w-full flex flex-col items-center gap-3">
                    <h3 className="text-4xl font-black text-white drop-shadow-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">{char.name}</h3>
                    <div className="flex flex-wrap justify-center gap-2 w-full">
                        {char.role && <span className={`px-4 py-1.5 rounded-xl text-xs font-bold border bg-white/5 border-white/10 uppercase tracking-wider text-orange-400`}>{t(char.role)}</span>}
                        {char.faction && <span className="px-4 py-1.5 rounded-xl text-xs font-bold border bg-white/5 border-white/10 text-gray-300 uppercase tracking-wider">{t(char.faction)}</span>}
                    </div>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-1"></div>
                    <div className="flex flex-col gap-1 w-full text-sm">
                        {char.rank && <div className="flex justify-between text-gray-400 px-4"><span>{t('rank')}:</span><span className="text-white font-bold">{t(char.rank)}</span></div>}
                        {char.tags && char.tags.length > 0 && <div className="flex flex-wrap gap-1 justify-center mt-2">{char.tags.map(tag => <span key={tag} className="text-[10px] px-2 py-0.5 bg-white/5 rounded border border-white/10 text-gray-300">{tag}</span>)}</div>}
                        {char.note && <p className="text-gray-400 italic text-xs mt-2 line-clamp-2 px-4">"{char.note}"</p>}
                    </div>
                </div>

                <div className="mt-auto w-full z-10 flex flex-col items-center gap-3 pt-4 border-t border-white/5">
                    {char.socials && char.socials.length > 0 && (
                        <div className="flex justify-center items-center gap-4 mb-4">
                            {(char.socials).map((social, idx) => {
                                const Icon = Icons[social.platform as keyof typeof Icons] || Icons.Link;
                                return (
                                    <motion.button
                                        key={idx}
                                        onClick={(e) => { e.stopPropagation(); onSocialClick(social); }}
                                        className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white transition-colors"
                                        whileHover={{
                                            scale: 1.15,
                                            borderColor: 'rgba(249, 115, 22, 0.7)',
                                            boxShadow: '0 0 15px rgba(249, 115, 22, 0.6)',
                                            y: -2
                                        }}
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

                    {locked ? (
                        <div className="text-3xl font-black text-white">{votes.toLocaleString()} <span className="text-sm font-normal text-gray-400">{t('totalVotes')}</span></div>
                    ) : (
                        <motion.button 
                            onClick={handleVote} 
                            animate={shake ? { x: [-5, 5, -5, 5, 0] } : {}} 
                            transition={{ duration: 0.4 }} 
                            whileHover={(!isBlocked || justVoted) ? { scale: 1.05 } : {}} 
                            whileTap={(!isBlocked || justVoted) ? { scale: 0.95 } : {}} 
                            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(0,0,0,0.3)] transition-all ${justVoted ? 'bg-green-600 text-white border border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.5)]' : isBlocked ? 'bg-gray-400/20 backdrop-blur-sm grayscale text-gray-400 border border-white/5 cursor-not-allowed' : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white border border-white/20'}`}
                        >
                            {justVoted ? (<><Icons.Check className="w-5 h-5" /> {t('voted')}</>) : isBlocked ? (<><Icons.Clock className="w-5 h-5" /> {isSingleVoteMode ? t('voted') : t('cooldownActive')}</>) : (<><Icons.Vote className="w-5 h-5" /> {t('voteFor')}</>)}
                        </motion.button>
                    )}
                </div>
                <AnimatePresence>{shake && isBlocked && !justVoted && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-20 left-4 right-4 bg-red-900/90 backdrop-blur-md text-white text-xs p-3 rounded-xl border border-red-500/50 shadow-2xl z-[100] text-center"><div className="font-bold mb-1">{t('voteError')}</div></motion.div>)}</AnimatePresence>
            </motion.div>
        </div>
    );
};

// --- ADMIN TOOLS ---
export const AdminToolsModal: React.FC<{ onClose: () => void; candidates: VoteCharacter[]; groupId: string; }> = ({ onClose, candidates, groupId }) => {
    const { t, dir } = useI18n();
    const { requestDelete } = useGlobalActions();
    const [view, setView] = useState<'menu' | 'add' | 'edit' | 'reset' | 'start'>('menu');
    const [subViewData, setSubViewData] = useState<any>(null); 
    const [config, setConfig] = useState<VoteConfig>({ deadline: '', cooldownTime: '1h', onceVote: false });
    const [formData, setFormData] = useState<VoteCharacter>({ id: '', name: '', role: '', faction: '', rank: '', note: '', image: '', socials: [], tags: [] });
    const [socialPlatform, setSocialPlatform] = useState('Discord');
    const [socialUrl, setSocialUrl] = useState('');
    const [socialUsername, setSocialUsername] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [resetAmount, setResetAmount] = useState<string>('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'removed'>('idle');

    useEffect(() => {
        const configRef = ref(db, `votes/data/${groupId}/config`);
        get(configRef).then(snap => { if(snap.exists()) setConfig(snap.val()); });
    }, [groupId]);

    const resetForm = () => {
        setFormData({ id: '', name: '', role: '', faction: '', rank: '', note: '', image: '', socials: [], tags: [] });
        setTagsInput('');
        setSocialUsername('');
        setStatus('idle');
    };

    const handleAddCandidate = async () => {
        if (!formData.name) { setStatus('error'); return; }
        if (view === 'add' && candidates.some(c => c.name.toLowerCase() === formData.name.toLowerCase())) { alert(t('duplicateNameError')); return; }
        const finalTags = tagsInput.split(/[,،]/).map(s => s.trim()).filter(Boolean);
        const payload = { ...formData, tags: finalTags };
        if (view === 'add') {
            const newRef = push(ref(db, `votes/data/${groupId}/candidates`));
            await set(newRef, { ...payload, id: newRef.key });
            logAction('admin', 'Added Candidate', `Name: ${payload.name}, Group: ${groupId}`);
        } else {
            await set(ref(db, `votes/data/${groupId}/candidates/${formData.id}`), payload);
            logAction('admin', 'Edited Candidate', `Name: ${payload.name}, Group: ${groupId}`);
        }
        if (view === 'add') resetForm(); else setView('menu');
    };

    const handleDeleteClick = (e: React.MouseEvent, candidate: VoteCharacter) => {
        e.stopPropagation();
        requestDelete(
            t('deleteConfirm'), `${t('name')}: ${candidate.name}`,
            [`votes/data/${groupId}/candidates/${candidate.id}`, `votes/data/${groupId}/counts/${candidate.id}`],
            async () => {
                const candSnap = await get(ref(db, `votes/data/${groupId}/candidates/${candidate.id}`));
                const countSnap = await get(ref(db, `votes/data/${groupId}/counts/${candidate.id}`));
                return [ { path: `votes/data/${groupId}/candidates/${candidate.id}`, data: candSnap.val() }, { path: `votes/data/${groupId}/counts/${candidate.id}`, data: countSnap.val() || 0 } ];
            }
        );
        if (view === 'edit') setView('menu');
    };

    const handleStartConfig = async () => {
        await set(ref(db, `votes/data/${groupId}/config`), config);
        logAction('admin', 'Updated Vote Config', `Group: ${groupId}, Config: ${JSON.stringify(config)}`);
        onClose();
    };

    const handleResetAll = async () => {
        requestDelete(t('resetAllConfirm'), '', [`votes/data/${groupId}/counts`], async () => {
                const countSnap = await get(ref(db, `votes/data/${groupId}/counts`));
                return [{ path: `votes/data/${groupId}/counts`, data: countSnap.val() }];
        });
    };

    const handleSingleReset = async (id: string) => {
        requestDelete(t('resetConfirm'), '', [`votes/data/${groupId}/counts/${id}`], async () => {
                 const countSnap = await get(ref(db, `votes/data/${groupId}/counts/${id}`));
                 return [{ path: `votes/data/${groupId}/counts/${id}`, data: countSnap.val() }];
        });
    };

    const handleModifyVotes = async (id: string, mode: 'add' | 'remove') => {
        const amt = parseInt(resetAmount);
        if (isNaN(amt) || amt < 0) { alert(t('invalidAmount')); return; }
        const countRef = ref(db, `votes/data/${groupId}/counts/${id}`);
        await runTransaction(countRef, (current) => { const val = current || 0; return mode === 'add' ? val + amt : Math.max(0, val - amt); });
        setStatus(mode === 'add' ? 'success' : 'removed');
        logAction('admin', `Vote ${mode}`, `Amount: ${amt}, ID: ${id}, Group: ${groupId}`);
        setTimeout(() => { setStatus('idle'); setResetAmount(''); }, 1000);
    };

    const addSocial = () => {
        if (socialUrl) {
            const newSocial: SocialLink = { platform: socialPlatform as any, url: socialUrl };
            if (socialPlatform === 'Discord' && socialUsername) newSocial.username = socialUsername;
            setFormData(prev => ({ ...prev, socials: [...(prev.socials || []), newSocial] }));
            setSocialUrl(''); setSocialUsername('');
        }
    };

    const removeSocial = (idx: number) => { setFormData(prev => ({ ...prev, socials: (prev.socials || []).filter((_, i) => i !== idx) })); };
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
                            <MenuButton icon={Icons.Plus} label="add" onClick={() => { resetForm(); setView('add'); }} color="border-green-500/30 hover:border-green-500 text-green-500" />
                            <MenuButton icon={Icons.Edit} label="edit" onClick={() => setView('edit')} color="border-blue-500/30 hover:border-blue-500 text-blue-500" />
                            <MenuButton icon={Icons.RotateCcw} label="reset" onClick={() => setView('reset')} color="border-red-500/30 hover:border-red-500 text-red-500" />
                            <MenuButton icon={Icons.Settings} label="start" onClick={() => setView('start')} color="border-orange-500/30 hover:border-orange-500 text-orange-500" />
                        </motion.div>
                    )}
                    {(view === 'add' || (view === 'edit' && subViewData)) && (
                        <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder={t('name')} className="p-3 rounded-xl bg-white/5 border border-white/10" />
                            <input value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder={t('imageTags')} className="p-3 rounded-xl bg-white/5 border border-white/10" />
                            <input value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder={t('role')} className="p-3 rounded-xl bg-white/5 border border-white/10" />
                            <input value={formData.rank} onChange={e => setFormData({...formData, rank: e.target.value})} placeholder={t('rank')} className="p-3 rounded-xl bg-white/5 border border-white/10" />
                            <textarea value={formData.note} onChange={e => setFormData({...formData, note: e.target.value})} placeholder={t('notes')} className="p-3 rounded-xl bg-white/5 border border-white/10" />
                            <ImageUploadControl singleMode={true} initialUrl={formData.image} onUrlsChange={(urls) => setFormData({...formData, image: urls[0] || ''})} />
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10"><h4 className="font-bold mb-2 text-sm text-gray-400">{t('socials')}</h4><div className="flex flex-col sm:flex-row gap-2 mb-2"><select value={socialPlatform} onChange={e => setSocialPlatform(e.target.value)} className="bg-black/40 rounded-lg p-2 text-white outline-none">{['Discord', 'Twitter', 'YouTube', 'TikTok', 'Instagram', 'Kick'].map(p => <option key={p} value={p}>{p}</option>)}</select><input value={socialUrl} onChange={e => setSocialUrl(e.target.value)} placeholder={t('url')} className="flex-1 bg-black/40 rounded-lg p-2 text-white outline-none" />{socialPlatform === 'Discord' && (<input value={socialUsername} onChange={e => setSocialUsername(e.target.value)} placeholder={t('username')} className="flex-1 bg-black/40 rounded-lg p-2 text-white outline-none" />)}<button onClick={addSocial} className="p-2 bg-green-600 rounded-lg"><Icons.Plus className="w-4 h-4" /></button></div><div className="flex flex-wrap gap-2">{(formData.socials || []).map((s, i) => (<div key={i} className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full text-xs"><span>{s.platform}{s.username ? ` (${s.username})` : ''}</span><button onClick={() => removeSocial(i)} className="text-red-500"><Icons.X className="w-3 h-3" /></button></div>))}</div></div>
                            <AsyncButton onClick={handleAddCandidate} label={t(view === 'add' ? 'add' : 'saveChanges')} variant="success" className="w-full" />
                        </motion.div>
                    )}
                    {view === 'edit' && !subViewData && (
                        <motion.div key="editlist" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-2">
                            {candidates.map(c => (<div key={c.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10"><div className="flex items-center gap-3">{c.image ? (<img src={c.image} className="w-10 h-10 rounded-full object-cover" />) : (<div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-gray-400 text-sm">{c.name.substring(0, 2)}</div>)}<span className="font-bold">{c.name}</span></div><div className="flex gap-2"><button onClick={() => { setFormData({ ...c, socials: c.socials || [] }); setTagsInput((c.tags || []).join(', ')); setSubViewData(true); }} className="p-2 bg-blue-500/20 text-blue-500 rounded-lg"><Icons.Edit className="w-4 h-4" /></button><button onClick={(e) => handleDeleteClick(e, c)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Icons.Trash2 className="w-4 h-4" /></button></div></div>))}
                        </motion.div>
                    )}
                    {view === 'reset' && (
                        <motion.div key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                            <AsyncButton onClick={handleResetAll} label={t('resetAll')} variant="danger" className="w-full" />
                            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                {candidates.map(c => (<div key={c.id} className="p-4 bg-white/5 rounded-xl border border-white/10"><div className="flex justify-between items-center mb-3"><span className="font-bold text-lg">{c.name}</span><div className="text-sm text-gray-400 font-mono flex items-center gap-2"><Icons.Vote className="w-3 h-3" /> <LiveCount id={c.id} groupId={groupId} /></div></div><div className="grid grid-cols-2 gap-2 mb-2"><button onClick={() => handleSingleReset(c.id)} className="col-span-2 py-2 bg-red-500/10 text-red-500 border border-red-500/30 rounded-lg font-bold text-sm hover:bg-red-500 hover:text-white transition-all">{t('reset')}</button><div className="col-span-2 flex gap-2"><input type="number" placeholder={t('enterAmount')} value={resetAmount} onChange={e => setResetAmount(e.target.value)} className="flex-1 bg-black/30 rounded-lg px-2 text-center" /></div><button onClick={() => handleModifyVotes(c.id, 'add')} className={`py-2 rounded-lg font-bold text-sm border flex items-center justify-center gap-1 ${status === 'success' ? 'bg-green-500 text-white border-green-500' : 'bg-green-500/10 text-green-500 border-green-500/30 hover:bg-green-500 hover:text-white'}`}>{status === 'success' ? t('added') : <><Icons.Plus className="w-3 h-3"/> {t('add')}</>}</button><button onClick={() => handleModifyVotes(c.id, 'remove')} className={`py-2 rounded-lg font-bold text-sm border flex items-center justify-center gap-1 ${status === 'removed' ? 'bg-red-500 text-white border-red-500' : 'bg-orange-500/10 text-orange-500 border-orange-500/30 hover:bg-orange-500 hover:text-white'}`}>{status === 'removed' ? t('removed') : <><Icons.Minus className="w-3 h-3"/> {t('remove')}</>}</button></div></div>))}
                            </div>
                        </motion.div>
                    )}
                    {view === 'start' && (
                        <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1"><label className="text-sm text-gray-400 ml-1">{t('endDate')}</label><input type="datetime-local" value={config.deadline} onChange={e => setConfig({...config, deadline: e.target.value})} className="p-3 rounded-xl bg-white/5 border border-white/10 text-white" /></div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"><span className="font-bold">{t('onceVote')}</span><div onClick={() => setConfig({...config, onceVote: !config.onceVote})} className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${config.onceVote ? 'bg-green-500' : 'bg-gray-600'}`}><motion.div layout className="w-4 h-4 bg-white rounded-full" animate={{ x: config.onceVote ? (dir==='rtl'?-24:24) : 0 }} /></div></div>
                            {!config.onceVote && (<div className="flex flex-col gap-1"><label className="text-sm text-gray-400 ml-1">{t('cooldownTime')} (e.g., 1h, 30m)</label><input type="text" value={config.cooldownTime} onChange={e => setConfig({...config, cooldownTime: e.target.value})} placeholder="1h" className="p-3 rounded-xl bg-white/5 border border-white/10" /></div>)}
                            <AsyncButton onClick={handleStartConfig} label={t('saveChanges')} variant="primary" className="w-full" />
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
    const { requestDelete } = useGlobalActions();
    const [view, setView] = useState<'menu' | 'add' | 'edit'>('menu');
    const [groupName, setGroupName] = useState('');
    const [groupImage, setGroupImage] = useState('');
    const [groups, setGroups] = useState<VoteGroup[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    useEffect(() => {
        onValue(ref(db, 'votes/groups'), snap => { if (snap.exists()) setGroups(Object.values(snap.val())); });
    }, []);

    const handleSave = async () => {
        if (!groupName) return;
        const payload: VoteGroup = { id: editingId || '', name: groupName, image: groupImage };
        if (view === 'add' && {}.toString.call(payload) === '[object Object]') {
            const newRef = push(ref(db, 'votes/groups'));
            payload.id = newRef.key!;
            await set(newRef, payload);
            logAction('admin', 'Added Category', `Name: ${groupName}`);
        } else if (editingId) {
            await set(ref(db, `votes/groups/${editingId}`), payload);
            logAction('admin', 'Edited Category', `Name: ${groupName}, ID: ${editingId}`);
        }
        setView('menu'); setGroupName(''); setGroupImage(''); setEditingId(null);
    };

    const handleDeleteClick = (e: React.MouseEvent, group: VoteGroup) => {
        e.stopPropagation();
        requestDelete(
            t('deleteCategoryConfirm'), `${t('name')}: ${group.name}`, [`votes/groups/${group.id}`, `votes/data/${group.id}`],
            async () => { const groupSnap = await get(ref(db, `votes/groups/${group.id}`)); const dataSnap = await get(ref(db, `votes/data/${group.id}`)); return [{ path: `votes/groups/${group.id}`, data: groupSnap.val() }, { path: `votes/data/${group.id}`, data: dataSnap.val() }]; }
        );
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-lg" noRound>
                <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white">{t('voteCategories')}</h3><button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button></div>
                {view === 'menu' && (
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setView('add')} className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl hover:bg-green-500/20 flex flex-col items-center gap-2"><Icons.Plus className="w-8 h-8 text-green-500" /><span className="font-bold text-green-500">{t('addCategory')}</span></button>
                        <button onClick={() => setView('edit')} className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl hover:bg-blue-500/20 flex flex-col items-center gap-2"><Icons.Edit className="w-8 h-8 text-blue-500" /><span className="font-bold text-blue-500">{t('editCategory')}</span></button>
                    </div>
                )}
                {view === 'add' || (view === 'edit' && editingId) ? (
                    <div className="flex flex-col gap-4"><input value={groupName} onChange={e => setGroupName(e.target.value)} placeholder={t('categoryName')} className="p-3 bg-white/5 border border-white/10 rounded-xl text-white" /><ImageUploadControl singleMode initialUrl={groupImage} onUrlsChange={(urls) => setGroupImage(urls[0] || '')} /><div className="flex gap-2"><button onClick={() => { setView(view === 'add' ? 'menu' : 'edit'); setEditingId(null); }} className="flex-1 py-3 bg-gray-600 rounded-xl font-bold text-white">{t('cancel')}</button><AsyncButton onClick={handleSave} label={t('saveChanges')} variant="primary" className="flex-1" /></div></div>
                ) : null}
                {view === 'edit' && !editingId && (
                    <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar">
                        <button onClick={() => setView('menu')} className="text-left mb-2 text-gray-400 hover:text-white flex items-center gap-1"><Icons.ArrowLeft className="w-4 h-4" /> {t('return')}</button>
                        {groups.map(g => (<div key={g.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl"><span className="font-bold">{g.name}</span><div className="flex gap-2"><button onClick={() => { setEditingId(g.id); setGroupName(g.name); setGroupImage(g.image); }} className="p-2 bg-blue-500/20 text-blue-500 rounded-lg"><Icons.Edit className="w-4 h-4" /></button><button onClick={(e) => handleDeleteClick(e, g)} className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Icons.Trash2 className="w-4 h-4" /></button></div></div>))}
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
