
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons, imagesData, appConfig } from '../../constants';
import { ImageData, ImageCategory } from '../../types';
import { useI18n } from '../../contexts/I18nContext';
import { useGlobalActions } from '../../contexts/GlobalActionsContext';
import { useImages } from '../../contexts/ImageContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { LazyImageCard } from './LazyImageCard';
import { DownloadableMediaModal, ImageManagementModal, UserImageRequestModal, AdminPendingRequestsModal } from '../../components/modals/MediaModals';
import { CategoryAdminModal, CategoryCard } from './ImageCategoryComponents';
import { ConfirmDeleteModal } from '../../components/modals/ConfirmationModals';

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
    const { dynamicImages, categories, requests, loading, deleteImage } = useImages(); 
    const [viewMode, setViewMode] = useState<'all' | 'categories'>('all');
    const [activeCategory, setActiveCategory] = useState<ImageCategory | null>(null);
    const [search, setSearch] = useState('');
    const [filterMode, setFilterMode] = useState<'contains' | 'excludes'>('contains');
    const [modalData, setModalData] = useState<{url: string, title: string} | null>(null);
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
    const [retrySession, setRetrySession] = useState(0);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showCategoryTool, setShowCategoryTool] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [deleteConfirmImg, setDeleteConfirmImg] = useState<ImageData | null>(null);

    const allImages = useMemo(() => {
        return [...imagesData, ...dynamicImages];
    }, [dynamicImages]);

    const displayImages = useMemo(() => {
        // If in category mode and a category is active, filter by category tags
        if (viewMode === 'categories' && activeCategory) {
            return allImages.filter(img => img.tags.some(tag => activeCategory.tags.includes(tag)));
        }
        return allImages;
    }, [allImages, viewMode, activeCategory]);

    const filteredImages = useMemo(() => {
        let items = displayImages;
        const searchTerms = search.split(/[,،]/).map(s => s.trim().toLowerCase()).filter(s => s.length > 0);

        if (searchTerms.length > 0) {
            items = items.filter(img => {
                const imgTags = img.tags.map(t => t.toLowerCase());
                const matches = searchTerms.some(term => imgTags.some(tag => tag.includes(term)));
                
                if (filterMode === 'contains') {
                    return matches;
                } else {
                    return !matches;
                }
            });
        }
        return items;
    }, [search, filterMode, displayImages]);

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

    const handleDeleteClick = (e: React.MouseEvent, img: ImageData) => {
        e.stopPropagation();
        const isBuiltIn = imagesData.some(i => i.id === img.id);
        if (isBuiltIn) { alert("Cannot delete built-in images."); return; }
        setDeleteConfirmImg(img);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmImg) return;
        await deleteImage(deleteConfirmImg.id);
        setDeleteConfirmImg(null);
    };

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative">
             <div className="flex flex-col gap-6 w-full mx-auto mb-4">
                
                {/* Top Controls: Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4">
                    <GlassCard className="!p-0 !rounded-full flex-1 order-2 md:order-1 shadow-lg border border-white/20">
                        <div className="relative w-full h-full">
                            <div className={`absolute top-1/2 -translate-y-1/2 text-orange-500 ${dir === 'rtl' ? 'right-6' : 'left-6'}`}><Icons.Search className="w-6 h-6" /></div>
                            <input 
                                type="text" 
                                value={search} 
                                onChange={e => setSearch(e.target.value)} 
                                placeholder={t('searchTagsPlaceholder')} 
                                dir={dir} 
                                className={`w-full h-full bg-transparent rounded-full py-4 focus:outline-none ${dir === 'rtl' ? 'pr-16 pl-6' : 'pl-16 pr-6'} text-gray-900 dark:text-white placeholder-gray-500 text-lg font-medium`} 
                            />
                        </div>
                    </GlassCard>
                    
                    <div className="flex gap-2 order-1 md:order-2 items-center flex-wrap justify-end">
                        <div className="flex p-1 bg-black/30 rounded-full backdrop-blur-md border border-white/10">
                           <button 
                               onClick={() => setFilterMode('contains')} 
                               className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${filterMode === 'contains' ? 'bg-orange-500 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-white'}`}
                           >
                               <Icons.Check className="w-4 h-4" />
                               {t('contains')}
                           </button>
                           <button 
                               onClick={() => setFilterMode('excludes')} 
                               className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${filterMode === 'excludes' ? 'bg-red-500 text-white shadow-lg scale-105' : 'text-gray-400 hover:text-white'}`}
                           >
                               <Icons.X className="w-4 h-4" />
                               {t('doesntContain')}
                           </button>
                        </div>
                        
                        {appConfig.addImages && (
                             <motion.button
                                onClick={() => setShowRequestModal(true)}
                                className="px-4 py-3 bg-green-600 rounded-full text-white font-bold flex items-center gap-2 hover:bg-green-700 transition-colors shadow-lg border border-white/10"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Icons.Plus className="w-5 h-5" />
                                <span className="hidden md:inline">Request Image</span>
                            </motion.button>
                        )}

                         {isAdmin && (
                            <div className="flex gap-2">
                                {appConfig.addImages && (
                                     <motion.button
                                        onClick={() => setShowPendingModal(true)}
                                        className="px-4 py-3 bg-yellow-600 rounded-full text-white font-bold flex items-center gap-2 hover:bg-yellow-700 transition-colors shadow-lg border border-white/10 relative"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Icons.Clock className="w-5 h-5" />
                                        <span className="hidden md:inline">Pending Requests</span>
                                        {requests.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border border-black shadow-sm">{requests.length}</span>}
                                    </motion.button>
                                )}
                                <motion.button
                                    onClick={() => setShowCategoryTool(true)}
                                    className="px-4 py-3 bg-purple-600 rounded-full text-white font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors shadow-lg border border-white/10"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Icons.Layers className="w-5 h-5" />
                                    <span className="hidden md:inline">{t('categoriesTool')}</span>
                                </motion.button>
                                <motion.button
                                    onClick={() => setShowAdminModal(true)}
                                    className="px-4 py-3 bg-blue-600 rounded-full text-white font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg border border-white/10"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Icons.Edit className="w-5 h-5" />
                                    <span className="hidden md:inline">{t('addEditImages')}</span>
                                </motion.button>
                            </div>
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

                {/* Main View Switcher - Premium Design */}
                <div className="flex justify-center md:justify-start">
                    <div className="bg-black/40 p-1.5 rounded-full flex relative border border-white/10 backdrop-blur-xl shadow-2xl min-w-[300px]">
                        {['all', 'categories'].map((mode) => (
                            <button
                                key={mode}
                                onClick={() => { setViewMode(mode as any); setActiveCategory(null); }}
                                className={`relative flex-1 py-3 px-6 rounded-full font-bold text-base transition-all duration-500 z-10 flex items-center justify-center gap-2 ${viewMode === mode ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                            >
                                {viewMode === mode && (
                                    <motion.div
                                        layoutId="activeTabBg"
                                        className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-full shadow-[0_0_20px_rgba(234,88,12,0.5)]"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-20 flex items-center gap-2">
                                    {mode === 'all' ? <Icons.Images className="w-5 h-5" /> : <Icons.Layers className="w-5 h-5" />}
                                    {t(mode === 'all' ? 'allImages' : 'categories')}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {search.trim() !== '' && filteredImages.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 justify-center">
                             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]"></div>
                             <span className="text-gray-400 font-bold text-sm tracking-wide">{filteredImages.length} {t('imagesFound')}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>

             <AnimatePresence mode="wait">
                 {/* CATEGORY VIEW */}
                 {viewMode === 'categories' && !activeCategory ? (
                     <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.length > 0 ? categories.map(cat => (
                            <div key={cat.id} className="h-64">
                                <CategoryCard category={cat} allImages={allImages} onClick={() => setActiveCategory(cat)} />
                            </div>
                        )) : <div className="col-span-full"><NoResults /></div>}
                     </motion.div>
                 ) : (
                     /* IMAGE GRID VIEW (All Images OR Specific Category) */
                     <motion.div key="images" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                        {activeCategory && (
                            <div className="flex items-center gap-4 mb-2 p-2 bg-white/5 rounded-2xl border border-white/10 w-fit pr-6">
                                <button onClick={() => setActiveCategory(null)} className="p-3 bg-black/40 rounded-xl hover:bg-white/10 border border-white/10 transition-colors group">
                                    <Icons.ArrowLeft className={`w-5 h-5 text-gray-400 group-hover:text-white ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                                </button>
                                <div>
                                    <h2 className="text-xl font-bold text-white leading-none">{activeCategory.name}</h2>
                                    <span className="text-xs text-gray-500 font-bold">{filteredImages.length} {t('imagesCount')}</span>
                                </div>
                            </div>
                        )}
                        {loading && filteredImages.length === 0 ? (
                            <div className="flex justify-center py-20"><Icons.Loader2 className="w-12 h-12 animate-spin text-orange-500" /></div>
                        ) : filteredImages.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredImages.map(img => (
                                    <LazyImageCard 
                                        key={img.id} 
                                        img={img} 
                                        onClick={() => setModalData({ url: img.url, title: img.tags.join(', ') })} 
                                        onErrorChange={handleImageError}
                                        retryKey={retrySession}
                                        onDelete={isAdmin && !imagesData.some(i => i.id === img.id) ? (e) => handleDeleteClick(e, img) : undefined}
                                    />
                                ))}
                            </div>
                        ) : (
                            <NoResults />
                        )}
                     </motion.div>
                 )}
             </AnimatePresence>

             <AnimatePresence>{modalData && <DownloadableMediaModal mediaUrl={modalData.url} mediaType="image" title={modalData.title} onClose={() => setModalData(null)} />}</AnimatePresence>
             <AnimatePresence>{showAdminModal && isAdmin && <ImageManagementModal onClose={() => setShowAdminModal(false)} />}</AnimatePresence>
             <AnimatePresence>{showCategoryTool && isAdmin && <CategoryAdminModal onClose={() => setShowCategoryTool(false)} allImages={allImages} />}</AnimatePresence>
             <AnimatePresence>{showRequestModal && <UserImageRequestModal onClose={() => setShowRequestModal(false)} />}</AnimatePresence>
             <AnimatePresence>{showPendingModal && isAdmin && <AdminPendingRequestsModal onClose={() => setShowPendingModal(false)} />}</AnimatePresence>
             <AnimatePresence>{deleteConfirmImg && (<ConfirmDeleteModal isOpen={true} onClose={() => setDeleteConfirmImg(null)} onConfirm={confirmDelete} title={t('deleteImage')} message={`${t('deleteConfirm')} (${deleteConfirmImg.tags.join(', ')})`} />)}</AnimatePresence>
        </div>
    );
};
