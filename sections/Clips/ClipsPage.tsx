
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { useClips } from '../../contexts/ClipContext';
import { ClipCard, ClipPlayerModal, ClipFormModal, PendingRequestsModal, ClipManagerModal } from './ClipComponents';
import { Clip } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { useToast } from '../../contexts/NotificationContext';
import { logAction } from '../../utils/logging';

export const ClipsPage: React.FC = () => {
    const { t, dir } = useI18n();
    const { clips, loading, fetchClips, addClip, submitRequest } = useClips();
    const { addToast } = useToast();
    
    // UI State
    const [search, setSearch] = useState('');
    const [selectedClip, setSelectedClip] = useState<Clip | null>(null);
    const [showRequestModal, setShowRequestModal] = useState(false);
    
    // Admin States
    const [isAdmin, setIsAdmin] = useState(false);
    const [showTools, setShowTools] = useState(false);
    const [showPending, setShowPending] = useState(false);
    const [showAddAdmin, setShowAddAdmin] = useState(false);
    const [showManager, setShowManager] = useState(false);

    useEffect(() => {
        const hash = localStorage.getItem('mtnews-auth-hash');
        if (hash) setIsAdmin(true);
        fetchClips();
    }, []);

    const filteredClips = clips.filter(c => c.content.toLowerCase().includes(search.toLowerCase()));

    const handleRequestSubmit = async (content: string, file: File | null, url: string) => {
        await submitRequest(content, file, url);
        addToast(t('clipRequestSent'), 'success');
        logAction('system', 'Clip Request Sent');
    };

    const handleAdminAdd = async (content: string, file: File | null, url: string) => {
        await addClip(content, file, url);
        addToast(t('clipAdded'), 'success');
        logAction('admin', 'Added Clip Direct', `Content: ${content}`);
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative min-h-[600px] pb-24">
            {/* Header / Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <GlassCard className="flex-1 w-full !rounded-full !p-2 flex items-center relative shadow-lg">
                    <Icons.Search className={`absolute text-gray-400 w-5 h-5 ${dir==='rtl' ? 'right-5' : 'left-5'}`} />
                    <input 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        placeholder={t('searchClips')} 
                        className={`w-full bg-transparent p-3 outline-none text-white placeholder-gray-500 ${dir==='rtl' ? 'pr-14 pl-4' : 'pl-14 pr-4'}`} 
                    />
                </GlassCard>

                <div className="flex gap-2">
                    <motion.button 
                        onClick={() => setShowRequestModal(true)}
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }} 
                        className="px-6 py-4 bg-orange-600 rounded-full text-white font-bold shadow-lg flex items-center gap-2"
                    >
                        <Icons.Clapperboard className="w-5 h-5" />
                        <span className="hidden sm:inline">{t('requestClip')}</span>
                    </motion.button>

                    {isAdmin && (
                        <>
                            <motion.button 
                                onClick={() => setShowPending(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-4 py-4 bg-purple-600 rounded-full text-white font-bold shadow-lg relative"
                            >
                                <Icons.List className="w-5 h-5" />
                            </motion.button>
                            <div className="relative">
                                <motion.button 
                                    onClick={() => setShowTools(!showTools)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 py-4 bg-blue-600 rounded-full text-white font-bold shadow-lg"
                                >
                                    <Icons.Settings className="w-5 h-5" />
                                </motion.button>
                                <AnimatePresence>
                                    {showTools && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                            className="absolute top-full right-0 mt-2 bg-[#121212] border border-white/10 rounded-xl p-2 min-w-[150px] z-50 shadow-xl flex flex-col gap-1"
                                        >
                                            <button onClick={() => { setShowAddAdmin(true); setShowTools(false); }} className="p-2 hover:bg-white/10 rounded-lg text-left text-sm font-bold text-white flex items-center gap-2">
                                                <Icons.Plus className="w-4 h-4 text-green-500" /> {t('addClip')}
                                            </button>
                                            <button onClick={() => { setShowManager(true); setShowTools(false); }} className="p-2 hover:bg-white/10 rounded-lg text-left text-sm font-bold text-white flex items-center gap-2">
                                                <Icons.Edit className="w-4 h-4 text-blue-500" /> {t('editClip')}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="w-full h-60 flex items-center justify-center"><Icons.Loader2 className="w-12 h-12 animate-spin text-orange-500" /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClips.length === 0 && <div className="col-span-full text-center text-gray-500 py-20">{t('noClips')}</div>}
                    {filteredClips.map(clip => (
                        <div key={clip.id} className="h-full">
                            <ClipCard clip={clip} onClick={() => setSelectedClip(clip)} />
                        </div>
                    ))}
                </div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {selectedClip && <ClipPlayerModal clip={selectedClip} onClose={() => setSelectedClip(null)} />}
                {showRequestModal && (
                    <ClipFormModal 
                        onClose={() => setShowRequestModal(false)} 
                        onSubmit={handleRequestSubmit} 
                        title={t('requestClip')} 
                        submitLabel={t('send')}
                    />
                )}
                {showAddAdmin && (
                    <ClipFormModal 
                        onClose={() => setShowAddAdmin(false)} 
                        onSubmit={handleAdminAdd} 
                        title={t('addClip')} 
                        submitLabel={t('add')}
                    />
                )}
                {showPending && <PendingRequestsModal onClose={() => setShowPending(false)} />}
                {showManager && <ClipManagerModal onClose={() => setShowManager(false)} />}
            </AnimatePresence>
        </div>
    );
};
