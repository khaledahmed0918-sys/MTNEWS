
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons, imagesData } from '../../constants';
import { ImageData } from '../../types';
import { useI18n } from '../../contexts/I18nContext';
import { useGlobalActions } from '../../contexts/GlobalActionsContext';
import { useImages } from '../../contexts/ImageContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { LazyImageCard } from './LazyImageCard';
import { DownloadableMediaModal, ImageManagementModal } from '../../components/modals/MediaModals';
import { db, ref, get } from '../../firebase';

const NoResults: React.FC = () => {
    const { t } = useI18n();
    return (
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} className="flex flex-col items-center justify-center py-24 text-gray-400 w-full">
            <motion.div animate={{ rotate: [0, -5, 5, -5, 0], scale: [1, 1.05, 1] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }} className="mb-6 p-6 rounded-full bg-white/5 border border-white/10">
                <Icons.SearchX className="w-16 h-16 opacity-50" />
            </motion.div>
            <h3 className="text-xl font-bold mb-2">{t('noResults')}</h3>
        </motion.div>
    );
};

export const ImagesPage: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
    const { t, dir } = useI18n();
    const { requestDelete } = useGlobalActions();
    const { dynamicImages, loading } = useImages(); 
    const [search, setSearch] = useState('');
    const [filterMode, setFilterMode] = useState<'contains' | 'excludes'>('contains');
    const [modalData, setModalData] = useState<{url: string, title: string} | null>(null);
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
    const [retrySession, setRetrySession] = useState(0);
    const [showAdminModal, setShowAdminModal] = useState(false);

    const allImages = useMemo(() => {
        return [...imagesData, ...dynamicImages];
    }, [dynamicImages]);

    const filteredImages = useMemo(() => {
        let items = allImages;
        const searchTerms = search.split(/[,،]/).map(s => s.trim().toLowerCase()).filter(s => s.length > 0);

        if (searchTerms.length > 0) {
            items = items.filter(img => {
                const imgTags = img.tags.map(t => t.toLowerCase());
                const matches = searchTerms.some(term => imgTags.some(tag => tag.includes(term)));
                
                if (filterMode === 'contains') {
                    return matches; // Show if it has at least one of the tags
                } else {
                    return !matches; // Show only if it has NONE of the tags
                }
            });
        }
        return items;
    }, [search, filterMode, allImages]);

    const handleImageError = useCallback((id: string, isError: boolean) => {
        setFailedImages(prev => {
            const next = new Set(prev);
            if (isError) next.add(id);
            else next.delete(id);
            return next;
        });
    }, []);

    const handleReloadAll = () => {
        setRetrySession(prev => prev + 1);
        setFailedImages(new Set()); 
    };

    const handleDeleteFromOverlay = (e: React.MouseEvent, img: ImageData) => {
        e.stopPropagation();
        if (!img.id.startsWith('-')) {
            alert("Cannot delete built-in images.");
            return;
        }

        requestDelete(
            t('deleteConfirm'),
            `Image: ${img.tags.join(', ')}`,
            [`images/${img.id}`],
            async () => {
                const imgSnap = await get(ref(db, `images/${img.id}`));
                return [{ path: `images/${img.id}`, data: imgSnap.val() }];
            }
        );
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative">
             <div className="flex flex-col gap-4 w-full mx-auto mb-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <GlassCard className="!p-0 !rounded-full flex-1 order-2 md:order-1">
                        <div className="relative w-full h-full">
                            <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${dir === 'rtl' ? 'right-5' : 'left-5'}`}><Icons.Search /></div>
                            <input 
                                type="text" 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                                placeholder={t('searchTagsPlaceholder')} 
                                dir={dir} 
                                className={`w-full h-full bg-transparent rounded-full py-4 focus:outline-none ${dir === 'rtl' ? 'pr-14 pl-6' : 'pl-14 pr-6'} text-gray-900 dark:text-white placeholder-gray-500 text-lg`} 
                            />
                        </div>
                    </GlassCard>
                    
                    <div className="flex gap-2 order-1 md:order-2 items-center">
                        <GlassCard className="!p-1 !rounded-full flex items-center p-1 relative w-auto">
                           <div className="flex items-center relative z-10">
                               <button 
                                   onClick={() => setFilterMode('contains')} 
                                   className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${filterMode === 'contains' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                               >
                                   {t('contains')}
                               </button>
                               <button 
                                   onClick={() => setFilterMode('excludes')} 
                                   className={`px-4 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${filterMode === 'excludes' ? 'bg-red-500 text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                               >
                                   {t('doesntContain')}
                               </button>
                           </div>
                        </GlassCard>

                         {isAdmin && (
                            <motion.button
                                onClick={() => setShowAdminModal(true)}
                                className="px-4 py-3 bg-blue-600 rounded-full text-white font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Icons.Edit className="w-5 h-5" />
                                <span className="hidden md:inline">{t('addEditImages')}</span>
                            </motion.button>
                         )}

                        <AnimatePresence>
                            {failedImages.size > 0 && (
                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    onClick={handleReloadAll}
                                    className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-500 rounded-full font-bold flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors whitespace-nowrap"
                                >
                                    <Icons.Refresh className="w-4 h-4" />
                                    <span>{t('reloadAll')} ({failedImages.size})</span>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <AnimatePresence>
                    {search.trim() !== '' && filteredImages.length > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="flex items-center gap-2 px-4 justify-center"
                        >
                             <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                             <span className="text-gray-500 font-bold text-sm">
                                {filteredImages.length} {t('imagesFound')}
                             </span>
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>

             <AnimatePresence mode="wait">
                 {loading && filteredImages.length === 0 ? (
                    <div className="flex justify-center py-20"><Icons.Loader2 className="w-12 h-12 animate-spin text-orange-500" /></div>
                 ) : filteredImages.length > 0 ? (
                    <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredImages.map(img => (
                            <LazyImageCard 
                                key={img.id} 
                                img={img} 
                                onClick={() => setModalData({ url: img.url, title: img.tags.join(', ') })} 
                                onErrorChange={handleImageError}
                                retryKey={retrySession}
                                onDelete={isAdmin && img.id.startsWith('-') ? (e) => handleDeleteFromOverlay(e, img) : undefined}
                            />
                        ))}
                    </motion.div>
                 ) : (
                    <NoResults key="no-results" />
                 )}
             </AnimatePresence>

             <AnimatePresence>
                {modalData && <DownloadableMediaModal mediaUrl={modalData.url} mediaType="image" title={modalData.title} onClose={() => setModalData(null)} />}
             </AnimatePresence>

             <AnimatePresence>
                {showAdminModal && isAdmin && <ImageManagementModal onClose={() => setShowAdminModal(false)} />}
             </AnimatePresence>
        </div>
    );
};
