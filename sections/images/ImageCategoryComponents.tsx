
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { AsyncButton } from '../../components/ui/AsyncButton';
import { useImages } from '../../contexts/ImageContext';
import { ImageCategory, ImageData } from '../../types';
import { logAction } from '../../utils/logging';

// --- CATEGORY CARD (PUBLIC) ---
export const CategoryCard: React.FC<{ category: ImageCategory, allImages: ImageData[], onClick: () => void }> = ({ category, allImages, onClick }) => {
    const { t } = useI18n();
    
    // Get images that match any of the category tags
    const categoryImages = useMemo(() => {
        return allImages.filter(img => 
            img.tags.some(tag => category.tags.includes(tag))
        );
    }, [category, allImages]);

    // Pick random 3-4 images for preview collage
    const previewImages = useMemo(() => {
        const shuffled = [...categoryImages].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 4);
    }, [categoryImages]);

    return (
        <GlassCard onClick={onClick} className="flex flex-col gap-3 group h-full cursor-pointer hover:bg-white/10 dark:hover:bg-white/5 transition-all">
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/30 relative grid grid-cols-2 grid-rows-2 gap-0.5 border border-white/5">
                {previewImages.length > 0 ? (
                    previewImages.map((img, i) => (
                        <div key={i} className={`relative overflow-hidden ${previewImages.length === 1 ? 'col-span-2 row-span-2' : ''} ${previewImages.length === 2 && i === 0 ? 'row-span-2' : ''} ${previewImages.length === 3 && i === 0 ? 'row-span-2' : ''}`}>
                            <img src={img.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-2 row-span-2 flex items-center justify-center">
                        <Icons.Images className="w-10 h-10 text-gray-600" />
                    </div>
                )}
                
                {/* Category Name Overlay */}
                <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                    <div className="w-full">
                        <h3 className="text-xl font-black text-white drop-shadow-md truncate">{category.name}</h3>
                        <div className="flex items-center gap-2 text-xs text-gray-300 font-bold mt-1">
                            <span className="px-2 py-0.5 bg-white/20 rounded-md backdrop-blur-sm border border-white/10">
                                {categoryImages.length} {t('imagesCount')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-wrap gap-1 px-1">
                {category.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-400">
                        {tag}
                    </span>
                ))}
                {category.tags.length > 3 && <span className="text-[10px] px-1 text-gray-500">+{category.tags.length - 3}</span>}
            </div>
        </GlassCard>
    );
};

// --- TAG MULTI-SELECTOR ---
const TagSelector: React.FC<{ 
    allTags: Record<string, number>, 
    selectedTags: string[], 
    onChange: (tags: string[]) => void 
}> = ({ allTags, selectedTags, onChange }) => {
    const { t } = useI18n();
    const [query, setQuery] = useState('');

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) onChange(selectedTags.filter(t => t !== tag));
        else onChange([...selectedTags, tag]);
    };

    const filteredTags = Object.keys(allTags).filter(tag => tag.toLowerCase().includes(query.toLowerCase()));

    return (
        <div className="flex flex-col gap-2 p-3 rounded-xl bg-black/20 border border-white/10">
            <div className="flex items-center gap-2 px-2 bg-white/5 rounded-lg border border-white/5">
                <Icons.Search className="w-4 h-4 text-gray-500" />
                <input 
                    value={query} 
                    onChange={e => setQuery(e.target.value)} 
                    placeholder={t('enterTagName')} 
                    className="w-full py-2 bg-transparent outline-none text-sm text-white" 
                />
            </div>
            <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto custom-scrollbar p-1">
                {filteredTags.map(tag => (
                    <button 
                        key={tag} 
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${selectedTags.includes(tag) ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}
                    >
                        <span>{tag}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] ${selectedTags.includes(tag) ? 'bg-white/20' : 'bg-black/30'}`}>{allTags[tag]}</span>
                    </button>
                ))}
            </div>
            <div className="text-xs text-gray-500 px-1 mt-1 font-bold">{t('selectedTags')}: {selectedTags.length}</div>
        </div>
    );
};

// --- ADMIN CATEGORY TOOL MODAL ---
export const CategoryAdminModal: React.FC<{ onClose: () => void, allImages: ImageData[] }> = ({ onClose, allImages }) => {
    const { t } = useI18n();
    const { categories, addCategory, updateCategoryTags, removeCategory } = useImages();
    const [view, setView] = useState<'menu' | 'add' | 'edit'>('menu');
    
    // Add State
    const [newName, setNewName] = useState('');
    const [newTags, setNewTags] = useState<string[]>([]);
    
    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTags, setEditingTags] = useState<string[]>([]);

    // Compile all available tags from all images
    const allTagsMap = useMemo(() => {
        const map: Record<string, number> = {};
        allImages.forEach(img => {
            img.tags.forEach(tag => {
                map[tag] = (map[tag] || 0) + 1;
            });
        });
        return map;
    }, [allImages]);

    const handleCreate = async (signal: AbortSignal) => {
        if(!newName || newTags.length === 0) return;
        await addCategory(newName, newTags, signal);
        logAction('admin', 'Created Category', newName);
        setView('menu');
        setNewName('');
        setNewTags([]);
    };

    const handleUpdate = async (signal: AbortSignal) => {
        if(!editingId || editingTags.length === 0) return;
        await updateCategoryTags(editingId, editingTags, signal);
        logAction('admin', 'Updated Category', editingId);
        setEditingId(null);
    };

    const handleDelete = async (id: string, signal: AbortSignal) => {
        if(!confirm(t('deleteConfirm'))) return;
        await removeCategory(id, signal);
        logAction('admin', 'Deleted Category', id);
        if(editingId === id) setEditingId(null);
    };

    const openEdit = (cat: ImageCategory) => {
        setEditingId(cat.id);
        setEditingTags(cat.tags);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-xl flex flex-col max-h-[85vh] overflow-hidden" noRound>
                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        {view !== 'menu' && <button onClick={() => { setView('menu'); setEditingId(null); }}><Icons.ArrowLeft className="w-6 h-6" /></button>}
                        {t('categoriesTool')}
                    </h3>
                    <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                    <AnimatePresence mode="wait">
                        {view === 'menu' && (
                            <motion.div key="menu" {...({ initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } as any)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button onClick={() => setView('add')} className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl hover:bg-green-500/20 flex flex-col items-center gap-3 transition-all group">
                                    <div className="p-3 bg-green-500 text-white rounded-full shadow-lg group-hover:scale-110 transition-transform"><Icons.Plus className="w-6 h-6" /></div>
                                    <span className="font-bold text-lg text-white">{t('addCategory')}</span>
                                </button>
                                <button onClick={() => setView('edit')} className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-2xl hover:bg-blue-500/20 flex flex-col items-center gap-3 transition-all group">
                                    <div className="p-3 bg-blue-500 text-white rounded-full shadow-lg group-hover:scale-110 transition-transform"><Icons.Edit className="w-6 h-6" /></div>
                                    <span className="font-bold text-lg text-white">{t('editCategory')}</span>
                                </button>
                            </motion.div>
                        )}

                        {view === 'add' && (
                            <motion.div key="add" {...({ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } } as any)} className="flex flex-col gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-bold uppercase">{t('categoryName')}</label>
                                    <input 
                                        value={newName} 
                                        onChange={e => setNewName(e.target.value)} 
                                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-gray-400 font-bold uppercase">{t('tagSelection')}</label>
                                    <TagSelector allTags={allTagsMap} selectedTags={newTags} onChange={setNewTags} />
                                </div>
                                <AsyncButton onClick={handleCreate} disabled={!newName || newTags.length === 0} label={t('createCategory')} variant="success" className="w-full py-4" />
                            </motion.div>
                        )}

                        {view === 'edit' && (
                            <motion.div key="edit" {...({ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } } as any)} className="flex flex-col gap-4">
                                {editingId ? (
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                                            <span className="font-bold text-lg text-white">{categories.find(c => c.id === editingId)?.name}</span>
                                            <button onClick={() => setEditingId(null)} className="text-sm text-gray-400 hover:text-white underline">{t('return')}</button>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-400 font-bold uppercase">{t('tagSelection')}</label>
                                            <TagSelector allTags={allTagsMap} selectedTags={editingTags} onChange={setEditingTags} />
                                        </div>
                                        <div className="flex gap-3">
                                            <AsyncButton onClick={(s) => handleDelete(editingId, s)} label={t('deleteCategory')} variant="danger" className="flex-1" />
                                            <AsyncButton onClick={handleUpdate} disabled={editingTags.length === 0} label={t('saveChanges')} variant="success" className="flex-[2]" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {categories.length === 0 && <div className="text-center text-gray-500 py-10">{t('noCategories')}</div>}
                                        {categories.map(cat => (
                                            <div key={cat.id} onClick={() => openEdit(cat)} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
                                                <span className="font-bold text-white">{cat.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs bg-black/30 px-2 py-1 rounded text-gray-400">{cat.tags.length} tags</span>
                                                    <Icons.ChevronRight className="w-4 h-4 text-gray-500" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </GlassCard>
        </div>
    );
};
