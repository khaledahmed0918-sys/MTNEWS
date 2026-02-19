
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons, imagesData, appConfig } from '../../constants';
import { imageCategories } from '../../constants/categories'; // Import Static Categories
import { ImageData, ImageCategory } from '../../types';
import { useI18n } from '../../contexts/I18nContext';
import { useGlobalActions } from '../../contexts/GlobalActionsContext';
import { useImages } from '../../contexts/ImageContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { LazyImageCard } from './LazyImageCard';
import { DownloadableMediaModal, ImageManagementModal, UserImageRequestModal, AdminPendingRequestsModal } from '../../components/modals/MediaModals';
import { CategoryCard } from './ImageCategoryComponents';
import { useFavorites } from '../../hooks';

const PAGE_SIZE = 20; 

const NoResults: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 w-full">
            <div className="mb-6 p-6 rounded-full bg-white/5 border border-white/10">
                <Icons.SearchX className="w-16 h-16 opacity-50" />
            </div>
            <h3 className="text-xl font-bold mb-2">{t('noResults')}</h3>
        </div>
    );
};

export const ImagesPage: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
    const { t, dir } = useI18n();
    const { dynamicImages, requests, deleteImage, uploadImageUrl, refreshImages } = useImages(); 
    const { requestDelete } = useGlobalActions();
    const [favorites] = useFavorites('images');
    
    // UI State
    const [viewMode, setViewMode] = useState<'all' | 'categories'>('all');
    const [activeCategory, setActiveCategory] = useState<ImageCategory | null>(null);
    const [search, setSearch] = useState('');
    const [filterMode, setFilterMode] = useState<'contains' | 'excludes'>('contains');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    
    // Sequential Loading State
    const [loadedCount, setLoadedCount] = useState(1); // Start by allowing 1 image to load
    
    // Modal State
    const [modalData, setModalData] = useState<{url: string, title: string} | null>(null);
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);
    const [retrySession, setRetrySession] = useState(0);

    // Initial Logic: Start API only when this component is mounted
    useEffect(() => {
        window.scrollTo(0, 0);
        refreshImages(); // Initial Load
        const interval = setInterval(refreshImages, 5000); // Poll only when active
        
        return () => {
            clearInterval(interval); // STOP API when leaving
        };
    }, []);

    // Reset sequential loader when view changes
    useEffect(() => {
        setLoadedCount(1);
    }, [viewMode, activeCategory, search, filterMode]);

    // Combine & Sort Data: Favorites First -> Static -> API
    const allImages = useMemo(() => {
        const favIds = new Set(favorites);
        
        // 1. Separate Static Images
        const staticFavs = imagesData.filter(img => favIds.has(img.id));
        const staticOthers = imagesData.filter(img => !favIds.has(img.id));
        
        // 2. Separate API Images
        const apiFavs = dynamicImages.filter(img => favIds.has(img.id));
        const apiOthers = dynamicImages.filter(img => !favIds.has(img.id));
        
        // 3. Combine in order
        const allFavs = [...staticFavs, ...apiFavs]; 
        
        return [...allFavs, ...staticOthers, ...apiOthers];
    }, [dynamicImages, favorites]);

    // Filtering Logic
    const filteredImages = useMemo(() => {
        let items = allImages;

        // 1. Category Filter
        if (viewMode === 'categories' && activeCategory) {
            items = items.filter(img => img.tags.some(tag => activeCategory.tags.includes(tag)));
        }

        // 2. Search/Tag Filter
        const searchTerms = search.split(/[,،]/).map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
        if (searchTerms.length > 0) {
            items = items.filter(img => {
                const imgTags = img.tags.map(t => t.toLowerCase());
                const matches = searchTerms.some(term => imgTags.some(tag => tag.includes(term)));
                return filterMode === 'contains' ? matches : !matches;
            });
        }
        return items;
    }, [allImages, viewMode, activeCategory, search, filterMode]);

    // Pagination Logic
    const displayedImages = useMemo(() => {
        return filteredImages.slice(0, visibleCount);
    }, [filteredImages, visibleCount]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + PAGE_SIZE);
    };

    // Reset pagination when filters change
    useEffect(() => {
        setVisibleCount(PAGE_SIZE);
    }, [search, viewMode, activeCategory]);

    const handleDeleteClick = (e: React.MouseEvent, img: ImageData) => {
        e.stopPropagation();
        const isBuiltIn = imagesData.some(i => i.id === img.id);
        if (isBuiltIn) { alert("Cannot delete built-in images."); return; }
        
        requestDelete(
            t('deleteImage'),
            t('deleteConfirm'),
            async () => { await deleteImage(img.id); },
            async () => { await uploadImageUrl(img.url, img.tags.join(', ')); },
            'image',
            `Deleted Image ID: ${img.id}`
        );
    };

    const handleReloadAll = () => {
        setRetrySession(prev => prev + 1);
        setLoadedCount(1);
        refreshImages();
    };

    const handleImageLoad = useCallback(() => {
        setLoadedCount(prev => prev + 1);
    }, []);

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 relative">
             <div className="flex flex-col gap-6 w-full mx-auto mb-4">
                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4">
                    <GlassCard 
                        className="!p-0 !rounded-full flex-1 order-2 md:order-1 shadow-lg border border-white/20"
                        decoration="sitting" // Sitting lantern for search
                    >
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
                                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            >
                                <Icons.Plus className="w-5 h-5" />
                                <span className="hidden md:inline">{t('requestImage')}</span>
                            </motion.button>
                        )}

                         {isAdmin && (
                            <div className="flex gap-2">
                                <motion.button
                                    onClick={() => setShowPendingModal(true)}
                                    className="px-4 py-3 bg-indigo-600 rounded-full text-white font-bold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg border border-white/10 relative"
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                >
                                    <Icons.List className="w-5 h-5" />
                                    {requests.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold">{requests.length}</span>}
                                </motion.button>
                                <motion.button
                                    onClick={() => setShowAdminModal(true)}
                                    className="px-4 py-3 bg-blue-600 rounded-full text-white font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg border border-white/10"
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                >
                                    <Icons.Edit className="w-5 h-5" />
                                </motion.button>
                            </div>
                         )}
                         <motion.button onClick={handleReloadAll} className="px-4 py-3 bg-white/5 rounded-full text-white hover:bg-white/10 border border-white/10"><Icons.Refresh className="w-5 h-5" /></motion.button>
                    </div>
                </div>

                {/* Main View Switcher */}
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
             </div>

             <AnimatePresence mode="wait">
                 {/* CATEGORY VIEW */}
                 {viewMode === 'categories' && !activeCategory ? (
                     <motion.div key="categories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {imageCategories.map(cat => (
                            <div key={cat.id} className="h-64">
                                <CategoryCard category={cat} allImages={allImages} onClick={() => setActiveCategory(cat)} />
                            </div>
                        ))}
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
                        
                        {/* Images Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {displayedImages.map((img, index) => (
                                <LazyImageCard 
                                    key={img.id} 
                                    img={img} 
                                    onClick={() => setModalData({ url: img.url, title: img.tags.join(', ') })} 
                                    onErrorChange={() => {}}
                                    retryKey={retrySession}
                                    onDelete={isAdmin && !imagesData.some(i => i.id === img.id) ? (e) => handleDeleteClick(e, img) : undefined}
                                    shouldLoad={index < loadedCount}
                                    onLoad={handleImageLoad}
                                />
                            ))}
                        </div>

                        {/* Load More Button */}
                        {visibleCount < filteredImages.length && (
                            <div className="flex justify-center py-8">
                                <motion.button 
                                    onClick={handleLoadMore}
                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                    className="px-8 py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/10 rounded-full font-bold text-white transition-all shadow-lg flex items-center gap-2"
                                >
                                    <span>More</span>
                                    <Icons.ArrowDown className="w-4 h-4" />
                                    <span className="text-xs opacity-50">({filteredImages.length - visibleCount} remaining)</span>
                                </motion.button>
                            </div>
                        )}
                        
                        {displayedImages.length === 0 && <NoResults />}
                     </motion.div>
                 )}
             </AnimatePresence>

             <AnimatePresence>{modalData && <DownloadableMediaModal mediaUrl={modalData.url} mediaType="image" title={modalData.title} onClose={() => setModalData(null)} />}</AnimatePresence>
             <AnimatePresence>{showAdminModal && isAdmin && <ImageManagementModal onClose={() => setShowAdminModal(false)} />}</AnimatePresence>
             <AnimatePresence>{showRequestModal && <UserImageRequestModal onClose={() => setShowRequestModal(false)} />}</AnimatePresence>
             <AnimatePresence>{showPendingModal && isAdmin && <AdminPendingRequestsModal onClose={() => setShowPendingModal(false)} />}</AnimatePresence>
        </div>
    );
};
