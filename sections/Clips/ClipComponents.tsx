
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons, API_BASE } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { AsyncButton } from '../../components/ui/AsyncButton';
import { useGlobalActions } from '../../contexts/GlobalActionsContext';
import { useClips } from '../../contexts/ClipContext';
import { Clip, ClipRequest } from '../../types';
import { resolvePath } from '../../utils/logging';

// --- CLIP CARD ---
export const ClipCard: React.FC<{ clip: Clip | ClipRequest, onClick?: () => void, onDelete?: () => void, onEdit?: () => void, showActions?: boolean }> = ({ clip, onClick, onDelete, onEdit, showActions }) => {
    const { t } = useI18n();
    const videoUrl = clip.type === 'file' ? resolvePath(clip.path) : clip.url;

    return (
        <GlassCard onClick={onClick} className={`flex flex-col gap-3 group h-full transition-all ${onClick ? 'cursor-pointer hover:bg-white/10' : ''}`} noRound>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/40 relative border border-white/5">
                <video src={videoUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" preload="metadata" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="p-3 bg-white/10 rounded-full backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform">
                        <Icons.Play className="w-6 h-6 text-white" />
                    </div>
                </div>
                
                {/* Actions Overlay */}
                {showActions && (
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 bg-blue-500 rounded-lg text-white hover:bg-blue-600"><Icons.Edit className="w-4 h-4" /></button>}
                        {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 bg-red-500 rounded-lg text-white hover:bg-red-600"><Icons.Trash2 className="w-4 h-4" /></button>}
                    </div>
                )}
            </div>
            <p className="text-sm font-bold text-white line-clamp-2">{clip.content}</p>
            <div className="mt-auto text-xs text-gray-500">{new Date(clip.createdAt).toLocaleDateString()}</div>
        </GlassCard>
    );
};

// --- CLIP PLAYER MODAL ---
export const ClipPlayerModal: React.FC<{ clip: Clip, onClose: () => void }> = ({ clip, onClose }) => {
    const { t } = useI18n();
    const videoUrl = clip.type === 'file' ? resolvePath(clip.path) : clip.url;
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const response = await fetch(videoUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `clip-${clip.id}.mp4`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            window.open(videoUrl, '_blank');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[10000] flex items-center justify-center p-4" onClick={onClose}>
            <GlassCard className="w-full max-w-4xl flex flex-col max-h-[90vh] p-0 overflow-hidden" onClick={(e) => e.stopPropagation()} noRound>
                <div className="relative aspect-video bg-black flex items-center justify-center">
                    <video src={videoUrl} controls autoPlay className="max-w-full max-h-[70vh] w-full h-full" />
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-white/20"><Icons.X className="w-6 h-6" /></button>
                </div>
                <div className="p-6 bg-[#121212] border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-white">{clip.content}</h3>
                        <p className="text-xs text-gray-500">{new Date(clip.createdAt).toLocaleString()}</p>
                    </div>
                    <AsyncButton 
                        onClick={async () => handleDownload()} 
                        label={t('download')} 
                        variant="primary" 
                        className="w-full sm:w-auto min-w-[140px] flex items-center justify-center gap-2"
                    >
                        <Icons.Download className="w-4 h-4" />
                        <span>{isDownloading ? 'Downloading...' : t('download')}</span>
                    </AsyncButton>
                </div>
            </GlassCard>
        </div>
    );
};

// --- REQUEST / ADD CLIP MODAL ---
export const ClipFormModal: React.FC<{ 
    onClose: () => void, 
    onSubmit: (content: string, file: File | null, url: string) => Promise<void>,
    title: string,
    submitLabel: string
}> = ({ onClose, onSubmit, title, submitLabel }) => {
    const { t } = useI18n();
    const [content, setContent] = useState('');
    const [mode, setMode] = useState<'url' | 'file'>('url');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const handleSubmit = async (signal: AbortSignal) => {
        if (!content || (mode === 'url' && !url) || (mode === 'file' && !file)) {
            alert(t('fillAllFields'));
            throw new Error("Validation Error");
        }
        await onSubmit(content, file, url);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[10000] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-lg flex flex-col gap-4" noRound>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-bold uppercase">{t('clipContent')}</label>
                    <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white min-h-[80px] focus:border-orange-500 outline-none" />
                </div>

                <div className="flex gap-2 p-1 bg-white/5 rounded-lg w-fit">
                    <button onClick={() => setMode('url')} className={`px-4 py-2 text-sm rounded-md transition-all ${mode === 'url' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>{t('clipUrl')}</button>
                    <button onClick={() => setMode('file')} className={`px-4 py-2 text-sm rounded-md transition-all ${mode === 'file' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>{t('videoFile')}</button>
                </div>

                {mode === 'url' ? (
                    <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-orange-500 outline-none" />
                ) : (
                    <div className="w-full p-4 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-white/5 transition-colors relative">
                        <Icons.Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-400">{file ? file.name : t('dropFiles')}</span>
                        <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setFile(e.target.files?.[0] || null)} />
                    </div>
                )}

                <div className="flex gap-3 mt-2">
                    <button onClick={onClose} className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-white transition-colors">{t('cancel')}</button>
                    <AsyncButton onClick={handleSubmit} label={submitLabel} variant="success" className="flex-1" />
                </div>
            </GlassCard>
        </div>
    );
};

// --- ADMIN: PENDING REQUESTS MODAL ---
export const PendingRequestsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useI18n();
    const { requests, fetchRequests, deleteRequest, acceptRequest } = useClips();
    const { requestDelete } = useGlobalActions();
    const [editingRequest, setEditingRequest] = useState<ClipRequest | null>(null);
    const [editContent, setEditContent] = useState('');

    useEffect(() => { fetchRequests(); }, []);

    const handleDelete = (req: ClipRequest) => {
        requestDelete(
            t('deleteConfirm'),
            t('requestDeleted'),
            async () => { await deleteRequest(req.id); },
            undefined,
            'admin',
            `Deleted Clip Request: ${req.content}`
        );
    };

    const handleEditOpen = (req: ClipRequest) => {
        setEditingRequest(req);
        setEditContent(req.content);
    };

    const handleAcceptEdit = async (signal: AbortSignal) => {
        if (!editingRequest) return;
        await acceptRequest(editingRequest, editContent);
        setEditingRequest(null);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[10000] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-4xl flex flex-col max-h-[85vh]" noRound>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">{t('pendingRequests')}</h3>
                    <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>

                {editingRequest ? (
                    <div className="flex flex-col gap-4">
                        <input value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white" />
                        <div className="aspect-video bg-black rounded-xl overflow-hidden">
                            <video src={editingRequest.type === 'file' ? resolvePath(editingRequest.path) : editingRequest.url} controls className="w-full h-full object-contain" />
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setEditingRequest(null)} className="flex-1 py-3 bg-gray-600 rounded-xl font-bold text-white">{t('cancel')}</button>
                            <AsyncButton onClick={handleAcceptEdit} label={t('add')} variant="success" className="flex-1" />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto custom-scrollbar p-1">
                        {requests.length === 0 && <div className="col-span-full text-center text-gray-500 py-10">{t('noResults')}</div>}
                        {requests.map(req => (
                            <ClipCard 
                                key={req.id} 
                                clip={req} 
                                showActions 
                                onDelete={() => handleDelete(req)}
                                onEdit={() => handleEditOpen(req)}
                            />
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

// --- ADMIN: CLIP MANAGER MODAL ---
export const ClipManagerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useI18n();
    const { clips, deleteClip, editClip, fetchClips } = useClips();
    const { requestDelete } = useGlobalActions();
    const [editingClip, setEditingClip] = useState<Clip | null>(null);
    const [editContent, setEditContent] = useState('');

    useEffect(() => { fetchClips(); }, []);

    const handleDelete = (clip: Clip) => {
        requestDelete(
            t('deleteConfirm'),
            t('clipDeleted'),
            async () => { await deleteClip(clip.id, clip.content); },
            undefined,
            'admin',
            `Deleted Clip: ${clip.content}`
        );
    };

    const handleEditOpen = (clip: Clip) => {
        setEditingClip(clip);
        setEditContent(clip.content);
    };

    const handleSaveEdit = async (signal: AbortSignal) => {
        if(!editingClip) return;
        await editClip(editingClip.id, editContent);
        setEditingClip(null);
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[10000] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-5xl flex flex-col max-h-[90vh]" noRound>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">{t('manageClips')}</h3>
                    <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>

                {editingClip ? (
                    <div className="flex flex-col gap-4 max-w-lg mx-auto w-full">
                        <h4 className="text-lg font-bold text-orange-500">{t('editClip')}</h4>
                        <div className="space-y-1">
                            <label className="text-xs text-gray-400 font-bold uppercase">{t('clipContent')}</label>
                            <input value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-orange-500 outline-none" />
                        </div>
                        <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                            <video src={editingClip.type === 'file' ? resolvePath(editingClip.path) : editingClip.url} controls className="w-full h-full object-contain" />
                        </div>
                        <div className="flex gap-3 mt-2">
                            <button onClick={() => setEditingClip(null)} className="flex-1 py-3 bg-gray-600 rounded-xl font-bold text-white hover:bg-gray-700 transition-colors">{t('cancel')}</button>
                            <AsyncButton onClick={handleSaveEdit} label={t('saveChanges')} variant="success" className="flex-1" />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar p-1">
                        {clips.length === 0 && <div className="col-span-full text-center text-gray-500 py-10">{t('noClips')}</div>}
                        {clips.map(clip => (
                            <ClipCard 
                                key={clip.id} 
                                clip={clip} 
                                showActions 
                                onDelete={() => handleDelete(clip)}
                                onEdit={() => handleEditOpen(clip)}
                            />
                        ))}
                    </div>
                )}
            </GlassCard>
        </div>
    );
};
