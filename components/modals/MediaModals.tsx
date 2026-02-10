
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { GlassCard } from '../ui/GlassCard';
import { AsyncButton } from '../ui/AsyncButton';
import { ImageUploadControl } from '../ui/SharedInputs';
import { useGlobalActions } from '../../contexts/GlobalActionsContext';
import { db, ref, push, get, set, onValue } from '../../firebase';
import { ImageData } from '../../types';
import { logAction } from '../../utils/logging';
import { useImages } from '../../contexts/ImageContext';

// --- DOWNLOAD MODAL ---
export const DownloadableMediaModal: React.FC<{ mediaUrl: string; mediaType: 'image' | 'video'; title?: string; onClose: () => void }> = ({ mediaUrl, mediaType, title, onClose }) => {
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        if (isDownloading) return;
        setIsDownloading(true);
        setDownloadProgress(0);
        const interval = setInterval(() => {
            setDownloadProgress(prev => (prev >= 90 ? 90 : prev + 10));
        }, 150);

        try {
            const response = await fetch(mediaUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            clearInterval(interval);
            setDownloadProgress(100);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `MTNEWS-${title || 'Media'}-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            setTimeout(() => { setIsDownloading(false); setDownloadProgress(0); }, 1000);
        } catch (error) {
            clearInterval(interval);
            window.open(mediaUrl, '_blank');
            setIsDownloading(false);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[9999] flex flex-col items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
             <div className="flex-1 w-full flex items-center justify-center overflow-hidden relative">
                <motion.div className="relative shadow-2xl max-w-full max-h-[80vh] w-auto h-auto flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <img src={mediaUrl} className="max-w-full max-h-[80vh] object-contain" />
                </motion.div>
            </div>
            <div className="w-full max-w-xs mt-6 mb-2" onClick={(e) => e.stopPropagation()}>
                <motion.button onClick={handleDownload} disabled={isDownloading} className="relative w-full h-12 overflow-hidden bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold tracking-wide shadow-lg transition-all backdrop-blur-md rounded-full">
                        <motion.div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 z-0" initial={{ width: "0%" }} animate={{ width: `${downloadProgress}%` }} />
                        <div className="absolute inset-0 flex items-center justify-center gap-2 z-10 drop-shadow-md">
                            {!isDownloading && <Icons.Link className="w-5 h-5 rotate-90" />}
                            <span>{isDownloading ? `${downloadProgress}%` : 'Download'}</span>
                        </div>
                </motion.button>
            </div>
            <motion.button onClick={onClose} className="absolute top-6 right-6 bg-white/10 backdrop-blur-md text-white rounded-full w-10 h-10 flex items-center justify-center border border-white/20 hover:bg-red-500 hover:border-red-500 transition-colors z-[10000]"><Icons.X /></motion.button>
        </motion.div>
    );
};

// --- IMAGE MANAGEMENT MODAL ---
export const ImageManagementModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useI18n();
    const { dynamicImages, uploadImageFile, uploadImageUrl, updateImageTags, deleteImage, refreshImages } = useImages();
    const [view, setView] = useState<'add' | 'list'>('add');
    const [pendingUrls, setPendingUrls] = useState<string[]>([]);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [tags, setTags] = useState('');
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [editImageId, setEditImageId] = useState<string | null>(null);
    const [editTags, setEditTags] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const processAdd = async () => {
        if (!tags.trim()) { alert(t('fillAllFields')); return; }

        if (pendingFiles.length > 0) {
            // Upload files
            for (const file of pendingFiles) {
                await uploadImageFile(file, tags);
            }
        } else if (pendingUrls.length > 0) {
            // Upload URLs
            for (const url of pendingUrls) {
                await uploadImageUrl(url, tags);
            }
        }

        logAction('image', 'Added Images', `Files: ${pendingFiles.length}, URLs: ${pendingUrls.length}`);
        setPendingUrls([]);
        setPendingFiles([]);
        setTags('');
    };

    const handleDeleteSelected = async () => {
        if(selectedIds.length === 0) return;
        if(!confirm(t('deleteConfirm'))) return;

        for(const id of selectedIds) {
            await deleteImage(id);
        }
        setSelectedIds([]);
        logAction('image', 'Deleted Images', `Count: ${selectedIds.length}`);
    };

    const handleDeleteSingle = async (img: ImageData) => {
        if(!confirm(t('deleteConfirm'))) return;
        await deleteImage(img.id);
        logAction('image', 'Deleted Image', `ID: ${img.id}`);
    };

    const startEdit = (img: ImageData) => { 
        setEditImageId(img.id); 
        setEditTags(img.tags.join(', ')); 
    };

    const saveEdit = async () => { 
        if (!editImageId) return; 
        await updateImageTags(editImageId, editTags);
        logAction('image', 'Edited Image Tags', `ID: ${editImageId}`); 
        setEditImageId(null); 
    };

    const toggleSelection = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
    const selectAll = () => { if(selectedIds.length === filteredListImages.length) setSelectedIds([]); else setSelectedIds(filteredListImages.map(i => i.id)); };
    const filteredListImages = dynamicImages.filter(img => { if (!searchQuery) return true; const q = searchQuery.toLowerCase(); return img.tags.some(t => t.toLowerCase().includes(q)) || img.url.toLowerCase().includes(q); });

    const handleFilesChange = (files: File[]) => {
        setPendingFiles(files);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-4xl flex flex-col max-h-[85vh] overflow-hidden" noRound>
                 <div className="flex justify-between items-center mb-4 shrink-0">
                    <h3 className="text-xl font-bold text-white">{t('imageManager')}</h3>
                    <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="flex gap-4 mb-4 shrink-0">
                    <button onClick={() => setView('add')} className={`px-4 py-2 rounded-lg font-bold ${view === 'add' ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400'}`}>{t('add')}</button>
                    <button onClick={() => setView('list')} className={`px-4 py-2 rounded-lg font-bold ${view === 'list' ? 'bg-orange-500 text-white' : 'bg-white/5 text-gray-400'}`}>{t('manageImages')}</button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                    {view === 'add' ? (
                        <div className="flex flex-col gap-4">
                            <input value={tags} onChange={e => setTags(e.target.value)} placeholder={t('imageTags')} className="p-3 rounded-xl bg-white/5 border border-white/10 text-white" />
                            <ImageUploadControl 
                                onUrlsChange={setPendingUrls} 
                                onFilesChange={handleFilesChange}
                            />
                            <AsyncButton 
                                onClick={processAdd} 
                                disabled={pendingUrls.length === 0 && pendingFiles.length === 0} 
                                label={t('add')} 
                                variant="success" 
                                className="w-full" 
                                progressSpeed="fast" 
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4 h-full">
                            <div className="flex gap-2 sticky top-0 bg-black/40 z-10 p-2 backdrop-blur-md rounded-xl">
                                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('searchImagesAdmin')} className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10 text-white" />
                                <button onClick={selectAll} className="px-3 py-2 bg-blue-500/20 text-blue-500 rounded-lg text-sm font-bold whitespace-nowrap">{selectedIds.length === filteredListImages.length ? t('deselectAll') : t('selectAll')}</button>
                                {selectedIds.length > 0 && (<AsyncButton onClick={handleDeleteSelected} label={`${t('deleteSelected')} (${selectedIds.length})`} variant="danger" />)}
                            </div>
                            {editImageId ? (<div className="p-4 bg-white/10 rounded-xl flex flex-col gap-3 border border-orange-500/30"><h4 className="font-bold text-orange-400">{t('editImage')}</h4><input value={editTags} onChange={e => setEditTags(e.target.value)} placeholder={t('imageTags')} className="p-2 bg-black/40 rounded-lg text-white" /><div className="flex gap-2"><button onClick={() => setEditImageId(null)} className="flex-1 py-2 bg-gray-600 rounded-lg text-white font-bold">{t('cancel')}</button><AsyncButton onClick={saveEdit} label={t('update')} variant="success" className="flex-1" /></div></div>) : null}
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {filteredListImages.map(img => (
                                    <div key={img.id} onClick={() => toggleSelection(img.id)} className={`relative group aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${selectedIds.includes(img.id) ? 'border-orange-500 scale-95' : 'border-transparent bg-black/20 hover:border-white/20'}`}>
                                        <img src={img.url} className="w-full h-full object-cover" loading="lazy" />
                                        <div className={`absolute top-2 left-2 w-5 h-5 rounded-full border border-white/50 flex items-center justify-center transition-colors ${selectedIds.includes(img.id) ? 'bg-orange-500 border-orange-500' : 'bg-black/40'}`}>{selectedIds.includes(img.id) && <Icons.Check className="w-3 h-3 text-white" />}</div>
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); startEdit(img); }} className="p-1.5 bg-blue-500 rounded-full text-white hover:bg-blue-600"><Icons.Edit className="w-4 h-4" /></button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteSingle(img); }} className="p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600"><Icons.Trash2 className="w-4 h-4" /></button>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 p-1 bg-black/50 text-[10px] text-white truncate text-center">{img.tags.join(', ')}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};
