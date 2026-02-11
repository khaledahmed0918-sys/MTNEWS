
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { Streamer, KickChannelInfo, KickStreamInfo } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { AsyncButton } from '../../components/ui/AsyncButton';
import { useLive } from '../../contexts/LiveContext';
import { useToast } from '../../contexts/NotificationContext';
import { ToggleSwitch } from '../../components/ui/SharedInputs';

// --- ADD STREAMER MODAL (Universal) ---
export const AddStreamerModal: React.FC<{ 
    onClose: () => void, 
    isAdminMode?: boolean
}> = ({ onClose, isAdminMode = false }) => {
    const { t, dir } = useI18n();
    const { addLocalStreamer, addGlobalStreamer } = useLive();
    const { addToast } = useToast();

    // Form State
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<'idle' | 'searching' | 'verified' | 'failed'>('idle');
    const [foundData, setFoundData] = useState<{ kickData: KickChannelInfo, streamData: KickStreamInfo } | null>(null);
    const [customName, setCustomName] = useState('');
    const [tags, setTags] = useState('');
    const [notes, setNotes] = useState('');
    const [characters, setCharacters] = useState('');
    
    // Links (Admin Only)
    const [links, setLinks] = useState({ discord: '', kick: '', instagram: '', youtube: '', twitter: '' });

    // Search Logic
    const handleSearch = async () => {
        if(!query || query.length < 3) return;
        setStatus('searching');
        setFoundData(null);

        let username = query.trim();
        const urlMatch = username.match(/kick\.com\/([^\/]+)/);
        if (urlMatch) username = urlMatch[1];
        
        try {
            const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(`https://kick.com/api/v2/channels/${username}`)}`);
            if (!response.ok) throw new Error("Not Found");
            const json = await response.json();
            const root = json.data ? json.data : json; 
            if (!root.user) throw new Error("No user");

            setFoundData({
                kickData: {
                    id: root.id, slug: root.slug, user_id: root.user.id, username: root.user.username, profile_pic: root.user.profile_pic,
                    banner: root.banner_image?.url || root.banner_image || '', followers_count: root.followers_count, created_at: root.created_at, bio: root.user.bio || ''
                },
                streamData: { id: 0, is_live: false, viewers: 0, start_time: '', title: '', category_name: '', category_icon: '', thumbnail: '' }
            });
            setStatus('verified');
        } catch (e) {
            setStatus('failed');
        }
    };

    const handleConfirm = async (signal: AbortSignal) => {
        if (!foundData) return;
        
        if (isAdminMode) {
            // Admin Add
            await addGlobalStreamer(foundData.kickData.slug, tags, characters, links);
            addToast("Streamer Added Globally", 'success');
        } else {
            // Local Add
            const newStreamer: Streamer = {
                id: Math.random().toString(36).substring(7),
                kickUsername: foundData.kickData.slug,
                kickData: foundData.kickData,
                streamData: foundData.streamData,
                customTitle: customName,
                tags: tags.split(',').map(t => t.trim()).filter(Boolean),
                notes: notes,
                isFavorite: false,
                notificationsEnabled: false,
                lastUpdated: Date.now(),
                addedAt: Date.now(),
                isSystem: false
            };
            addLocalStreamer(newStreamer);
            addToast(t('streamerAdded'), 'success');
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[10000] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" noRound>
                 <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-xl font-bold text-white">{isAdminMode ? "Add Global Streamer" : t('addStreamer')}</h3>
                    <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1 flex flex-col gap-4">
                    {/* Search Input */}
                    <div className="relative">
                        <input 
                            value={query} 
                            onChange={e => { setQuery(e.target.value); setStatus('idle'); }} 
                            onKeyDown={e => e.key === 'Enter' && handleSearch()}
                            placeholder={t('kickUrlOrUser')} 
                            className="w-full p-4 pr-12 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500"
                        />
                        <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/10 rounded-lg hover:bg-white/20 text-white">
                            {status === 'searching' ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.Search className="w-4 h-4" />}
                        </button>
                    </div>

                    {status === 'failed' && <p className="text-red-500 text-sm font-bold">{t('streamerNotFound')}</p>}

                    {/* Found Preview */}
                    <AnimatePresence>
                        {foundData && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="flex items-center gap-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl overflow-hidden">
                                <img src={foundData.kickData.profile_pic} className="w-12 h-12 rounded-full border border-white/20" />
                                <div>
                                    <h4 className="font-bold text-white">{foundData.kickData.username}</h4>
                                    <span className="text-xs text-green-400 font-bold">{t('verified')}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Form Fields */}
                    <div className={`flex flex-col gap-3 transition-opacity ${!foundData ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                         {!isAdminMode && (
                             <div className="space-y-1">
                                 <label className="text-xs text-gray-400 uppercase font-bold">{t('customName')}</label>
                                 <input value={customName} onChange={e => setCustomName(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white" />
                             </div>
                         )}
                         <div className="space-y-1">
                             <label className="text-xs text-gray-400 uppercase font-bold">{t('streamerTags')}</label>
                             <input value={tags} onChange={e => setTags(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white" placeholder="Roleplay, Gangs, Police" />
                         </div>
                         
                         {isAdminMode && (
                             <>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400 uppercase font-bold">Characters (Comma Separated)</label>
                                    <input value={characters} onChange={e => setCharacters(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white" />
                                </div>
                                <div className="bg-black/20 p-3 rounded-xl border border-white/5 space-y-2">
                                    <label className="text-xs text-orange-500 uppercase font-bold">Social Links</label>
                                    <input value={links.discord} onChange={e => setLinks({...links, discord: e.target.value})} placeholder="Discord" className="w-full p-2 rounded-lg bg-white/5 text-sm text-white" />
                                    <input value={links.twitter} onChange={e => setLinks({...links, twitter: e.target.value})} placeholder="Twitter" className="w-full p-2 rounded-lg bg-white/5 text-sm text-white" />
                                    <input value={links.instagram} onChange={e => setLinks({...links, instagram: e.target.value})} placeholder="Instagram" className="w-full p-2 rounded-lg bg-white/5 text-sm text-white" />
                                    <input value={links.youtube} onChange={e => setLinks({...links, youtube: e.target.value})} placeholder="YouTube" className="w-full p-2 rounded-lg bg-white/5 text-sm text-white" />
                                </div>
                             </>
                         )}

                         {!isAdminMode && (
                             <div className="space-y-1">
                                 <label className="text-xs text-gray-400 uppercase font-bold">{t('streamerNotes')}</label>
                                 <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white min-h-[80px]" />
                             </div>
                         )}
                    </div>

                    <AsyncButton onClick={handleConfirm} disabled={!foundData} label={t('add')} variant="success" className="w-full py-4 mt-2" />
                </div>
            </GlassCard>
        </div>
    );
};

// --- ADMIN EDIT / LIST MODAL ---
export const AdminEditStreamerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useI18n();
    const { streamers, deleteMultipleStreamers, editGlobalStreamer } = useLive();
    const [search, setSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [view, setView] = useState<'list' | 'edit'>('list');
    const [editingStreamer, setEditingStreamer] = useState<Streamer | null>(null);

    // Edit Form State
    const [editTags, setEditTags] = useState('');
    const [editCharacters, setEditCharacters] = useState('');
    const [editLinks, setEditLinks] = useState({ discord: '', twitter: '', instagram: '', youtube: '', kick: '' });

    const filtered = useMemo(() => {
        return streamers.filter(s => s.kickUsername.toLowerCase().includes(search.toLowerCase()));
    }, [streamers, search]);

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleDeleteSelected = async (signal: AbortSignal) => {
        if (!confirm(`Delete ${selectedIds.length} streamers?`)) return;
        
        const itemsToDelete = streamers
            .filter(s => selectedIds.includes(s.id))
            .map(s => ({ id: s.id, isSystem: s.isSystem, kickUsername: s.kickUsername }));
            
        await deleteMultipleStreamers(itemsToDelete);
        setSelectedIds([]);
    };

    const startEdit = (s: Streamer) => {
        setEditingStreamer(s);
        setEditTags(s.tags.join(', '));
        setEditCharacters(s.characters?.join(', ') || '');
        setEditLinks({
            discord: s.links?.discord || '',
            twitter: s.links?.twitter || '',
            instagram: s.links?.instagram || '',
            youtube: s.links?.youtube || '',
            kick: s.links?.kick || ''
        });
        setView('edit');
    };

    const saveEdit = async (signal: AbortSignal) => {
        if (!editingStreamer) return;
        await editGlobalStreamer(
            editingStreamer.kickUsername, 
            editingStreamer.kickUsername, // Assuming username change not supported yet or same
            editTags, 
            editCharacters, 
            editLinks
        );
        setView('list');
        setEditingStreamer(null);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[10000] flex items-center justify-center p-4">
             <GlassCard className="w-full max-w-3xl flex flex-col h-[85vh] overflow-hidden" noRound>
                 {view === 'list' ? (
                     <>
                        <div className="flex justify-between items-center mb-4 shrink-0">
                            <h3 className="text-xl font-bold text-white">Manage Streamers ({streamers.length})</h3>
                            <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        
                        <div className="flex gap-2 mb-4">
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Username..." className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white" />
                            {selectedIds.length > 0 && (
                                <AsyncButton onClick={handleDeleteSelected} label={`Delete Selected (${selectedIds.length})`} variant="danger" className="text-sm px-4" />
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded-xl border border-white/5">
                            {filtered.map(s => (
                                <div key={s.id} className={`flex items-center gap-3 p-3 border-b border-white/5 hover:bg-white/5 cursor-pointer ${selectedIds.includes(s.id) ? 'bg-orange-500/10' : ''}`} onClick={() => toggleSelect(s.id)}>
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${selectedIds.includes(s.id) ? 'bg-orange-500 border-orange-500' : 'border-gray-500'}`}>
                                        {selectedIds.includes(s.id) && <Icons.Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <img src={s.kickData?.profile_pic || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full object-cover" />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white">{s.kickUsername}</span>
                                            {s.isSystem && <span className="text-[10px] bg-blue-500 px-1 rounded text-white">Global</span>}
                                        </div>
                                        <div className="text-xs text-gray-500">{s.tags.join(', ')}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); startEdit(s); }} className="p-2 bg-white/10 rounded-lg text-blue-400 hover:bg-blue-500 hover:text-white"><Icons.Edit className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </>
                 ) : (
                     <div className="flex flex-col h-full gap-4">
                        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
                            <button onClick={() => setView('list')} className="p-2 hover:bg-white/10 rounded-full"><Icons.ArrowLeft className="w-6 h-6" /></button>
                            <h3 className="text-xl font-bold">Edit {editingStreamer?.kickUsername}</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500">Tags</label>
                                <input value={editTags} onChange={e => setEditTags(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500">Characters</label>
                                <input value={editCharacters} onChange={e => setEditCharacters(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white" />
                            </div>
                            <div className="bg-black/20 p-4 rounded-xl border border-white/5 space-y-3">
                                <label className="text-xs font-bold text-orange-500">Links</label>
                                <input value={editLinks.discord} onChange={e => setEditLinks({...editLinks, discord: e.target.value})} placeholder="Discord" className="w-full p-2 rounded-lg bg-white/5 text-white" />
                                <input value={editLinks.twitter} onChange={e => setEditLinks({...editLinks, twitter: e.target.value})} placeholder="Twitter" className="w-full p-2 rounded-lg bg-white/5 text-white" />
                                <input value={editLinks.instagram} onChange={e => setEditLinks({...editLinks, instagram: e.target.value})} placeholder="Instagram" className="w-full p-2 rounded-lg bg-white/5 text-white" />
                                <input value={editLinks.youtube} onChange={e => setEditLinks({...editLinks, youtube: e.target.value})} placeholder="YouTube" className="w-full p-2 rounded-lg bg-white/5 text-white" />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-auto">
                            <button onClick={() => setView('list')} className="flex-1 py-3 rounded-xl bg-white/5 font-bold hover:bg-white/10">Cancel</button>
                            <AsyncButton onClick={saveEdit} label="Save Changes" variant="success" className="flex-1" />
                        </div>
                     </div>
                 )}
             </GlassCard>
        </div>
    );
};

// --- ADMIN TOOLS MENU ---
export const AdminLiveToolsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [view, setView] = useState<'menu' | 'add' | 'edit'>('menu');

    return (
        <>
            {view === 'menu' && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
                    <GlassCard className="w-full max-w-sm flex flex-col gap-4" noRound>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-bold text-white">Admin Live Tools</h3>
                            <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                        </div>
                        <button onClick={() => setView('add')} className="p-4 bg-green-600/20 border border-green-500/50 rounded-xl hover:bg-green-600/30 flex items-center gap-3 transition-colors">
                            <Icons.Plus className="w-8 h-8 text-green-500" />
                            <div className="text-left">
                                <div className="font-bold text-white">Add Global Streamer</div>
                                <div className="text-xs text-gray-400">Add to database for everyone</div>
                            </div>
                        </button>
                        <button onClick={() => setView('edit')} className="p-4 bg-blue-600/20 border border-blue-500/50 rounded-xl hover:bg-blue-600/30 flex items-center gap-3 transition-colors">
                            <Icons.Edit className="w-8 h-8 text-blue-500" />
                            <div className="text-left">
                                <div className="font-bold text-white">Edit / Delete Streamers</div>
                                <div className="text-xs text-gray-400">Manage existing global streamers</div>
                            </div>
                        </button>
                    </GlassCard>
                </div>
            )}
            {view === 'add' && <AddStreamerModal onClose={onClose} isAdminMode={true} />}
            {view === 'edit' && <AdminEditStreamerModal onClose={onClose} />}
        </>
    );
};

// --- NEW REDESIGNED STREAMER CARD ---
export const StreamerCard: React.FC<{ 
    streamer: Streamer, 
    onClick: () => void, 
    onToggleFavorite: (id: string) => void,
    onToggleNotify: (id: string) => void,
    snowEnabled: boolean 
}> = ({ streamer, onClick, onToggleFavorite, onToggleNotify, snowEnabled }) => {
    const { t } = useI18n();
    const isLive = streamer.streamData?.is_live;
    const banner = streamer.kickData?.banner || 'https://via.placeholder.com/800x200';
    const avatar = streamer.kickData?.profile_pic || 'https://via.placeholder.com/150';
    const viewers = streamer.streamData?.viewers || 0;
    const title = streamer.streamData?.title || streamer.customTitle || streamer.kickUsername;
    
    return (
        <GlassCard onClick={onClick} className="flex flex-col !p-0 overflow-hidden group h-full hover:border-orange-500/50 transition-all duration-300" isSnowy={snowEnabled}>
            {/* Banner Area */}
            <div className="h-28 w-full relative bg-neutral-900">
                <img src={banner} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); onToggleNotify(streamer.id); }} className={`p-1.5 rounded-full backdrop-blur-md ${streamer.notificationsEnabled ? 'bg-orange-500 text-white' : 'bg-black/40 text-gray-400 hover:text-white'}`}>
                        {streamer.notificationsEnabled ? <Icons.Bell className="w-3.5 h-3.5" /> : <Icons.BellOff className="w-3.5 h-3.5" />}
                    </button>
                    <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase backdrop-blur-md flex items-center gap-1 ${isLive ? 'bg-green-600 text-white animate-pulse' : 'bg-black/60 text-gray-400'}`}>
                        {isLive ? <><div className="w-1.5 h-1.5 rounded-full bg-white" /> LIVE</> : 'OFFLINE'}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="px-4 pb-4 relative flex-1 flex flex-col">
                {/* Avatar overlapping banner */}
                <div className="flex justify-between items-end -mt-8 mb-2">
                    <div className={`w-16 h-16 rounded-xl border-4 border-[#1a1a1a] overflow-hidden bg-black ${isLive ? 'ring-2 ring-green-500 shadow-[0_0_15px_#22c55e]' : ''}`}>
                        <img src={avatar} className="w-full h-full object-cover" />
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onToggleFavorite(streamer.id); }} className={`mb-1 ${streamer.isFavorite ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'}`}>
                        <Icons.Star className={`w-5 h-5 ${streamer.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Info */}
                <div className="mb-3">
                    <h3 className="font-bold text-white text-lg leading-tight line-clamp-1">{streamer.kickUsername}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                        {isLive && <span className="text-green-500 font-bold">{viewers.toLocaleString()} viewers</span>}
                        {streamer.customTitle && <span>• {streamer.customTitle}</span>}
                    </div>
                </div>

                {/* Stream Title / Bio */}
                {isLive && streamer.streamData?.thumbnail ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-3 border border-white/10 group-hover:border-white/30 transition-colors">
                        <img src={streamer.streamData.thumbnail} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icons.Play className="w-8 h-8 text-white" />
                        </div>
                    </div>
                ) : (
                    <p className="text-xs text-gray-400 line-clamp-2 mb-3 min-h-[2.5em]">{streamer.kickData?.bio || "No bio available."}</p>
                )}
                
                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                    {streamer.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-gray-400 uppercase tracking-wide">{tag}</span>
                    ))}
                </div>

                {/* Action */}
                <div className="mt-auto pt-3 border-t border-white/5">
                    <a 
                        href={`https://kick.com/${streamer.kickUsername}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-green-600/20 hover:bg-green-600 text-green-500 hover:text-white rounded-lg font-bold text-sm transition-colors border border-green-600/50"
                    >
                        <Icons.Video className="w-4 h-4" /> Watch Channel
                    </a>
                </div>
            </div>
        </GlassCard>
    );
};

// --- STREAMER DETAIL MODAL (No Changes needed, reusing logic) ---
export const StreamerDetailModal: React.FC<{ streamer: Streamer, onClose: () => void, onDelete: () => void, snowEnabled: boolean }> = ({ streamer, onClose, onDelete, snowEnabled }) => {
    const { t } = useI18n();
    const isLive = streamer.streamData?.is_live;
    const banner = streamer.kickData?.banner || 'https://via.placeholder.com/800x200';
    const profilePic = streamer.kickData?.profile_pic || 'https://via.placeholder.com/150';
    const username = streamer.kickUsername || 'Unknown';
    
    // Characters from Admin API
    const characters = streamer.characters || [];
    const links = streamer.links || {};

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4" onClick={onClose}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`w-full max-w-2xl bg-neutral-900 border border-white/10 rounded-[30px] overflow-hidden shadow-2xl relative ${snowEnabled ? 'frosted-effect' : ''}`} onClick={e => e.stopPropagation()}>
                <div className="h-48 w-full relative">
                    <img src={banner} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 to-transparent"></div>
                    <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full"><Icons.X className="w-5 h-5 text-white" /></button>
                    <div className="absolute -bottom-10 left-8">
                        <img src={profilePic} className="w-24 h-24 rounded-full border-4 border-neutral-900" />
                    </div>
                </div>
                
                <div className="pt-12 px-8 pb-8 flex flex-col gap-6">
                    <div>
                        <h2 className="text-3xl font-black text-white">{username}</h2>
                        <div className="text-gray-400 text-sm mt-1">{streamer.tags.join(' • ')}</div>
                    </div>

                    {characters.length > 0 && (
                        <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Known Characters</h4>
                            <div className="flex flex-wrap gap-2">
                                {characters.map((c, i) => <span key={i} className="px-2 py-1 bg-white/10 rounded text-sm">{c}</span>)}
                            </div>
                        </div>
                    )}

                    {/* Social Links from Admin */}
                    <div className="flex gap-4 justify-center">
                        {links.discord && <a href={links.discord} target="_blank" className="p-3 bg-[#5865F2] rounded-full text-white"><Icons.Discord className="w-5 h-5" /></a>}
                        {links.twitter && <a href={links.twitter} target="_blank" className="p-3 bg-[#1DA1F2] rounded-full text-white"><Icons.Twitter className="w-5 h-5" /></a>}
                        {links.youtube && <a href={links.youtube} target="_blank" className="p-3 bg-[#FF0000] rounded-full text-white"><Icons.YouTube className="w-5 h-5" /></a>}
                        {links.instagram && <a href={links.instagram} target="_blank" className="p-3 bg-[#E4405F] rounded-full text-white"><Icons.Instagram className="w-5 h-5" /></a>}
                        <a href={`https://kick.com/${username}`} target="_blank" className="p-3 bg-[#53FC18] rounded-full text-black"><Icons.Kick className="w-5 h-5" /></a>
                    </div>

                    {!streamer.isSystem && (
                         <div className="flex justify-end pt-4 border-t border-white/10">
                             <button onClick={onDelete} className="text-red-500 flex items-center gap-2 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-colors"><Icons.Trash2 className="w-4 h-4" /> Delete from My List</button>
                         </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};
