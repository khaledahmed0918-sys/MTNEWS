
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, useMotionValue, useTransform } from 'framer-motion';
import { Icons, API_BASE } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { GlassCard } from '../components/ui/GlassCard';
import { AsyncButton } from '../components/ui/AsyncButton';
import { useProfile } from '../contexts/ProfileContext';
import { useGlobalActions } from '../contexts/GlobalActionsContext';
import { ImageUploadControl } from '../components/ui/SharedInputs';
import { AnalysisForm, FormMessage, FormAttachment } from '../types';
import { resolvePath, logAction } from '../utils/logging';
import { useToast } from '../contexts/NotificationContext';
import { RobustImage } from '../components/ui/RobustImage';

// --- HELPERS ---
const AttachmentPreview: React.FC<{ url: string, type: string, compact?: boolean }> = ({ url, type, compact }) => {
    const isImage = type.includes('image');
    const isVideo = type.includes('video');
    
    // Fix Image Loading: Ensure we have a full URL
    const fullUrl = url.startsWith('blob:') || url.startsWith('http') 
        ? url 
        : resolvePath(url);

    if (isImage) return <RobustImage src={fullUrl} className={`w-full h-full object-cover ${compact ? 'rounded-lg' : 'rounded-xl'}`} />;
    if (isVideo) return (
        <div className="w-full h-full bg-black flex items-center justify-center relative rounded-xl overflow-hidden">
            <video src={fullUrl} className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center"><Icons.Play className="w-8 h-8 text-white opacity-80" /></div>
        </div>
    );
    return (
        <a href={fullUrl} target="_blank" download className="flex items-center justify-center gap-2 p-4 bg-white/5 rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors w-full h-full">
            <Icons.FolderOpen className="w-6 h-6" />
            {!compact && <span className="text-sm font-bold">Download File</span>}
        </a>
    );
};

// --- CREATE SUBJECT MODAL ---
const CreateSubjectModal: React.FC<{ onClose: () => void; onSuccess: () => Promise<void> }> = ({ onClose, onSuccess }) => {
    const { t } = useI18n();
    const { profile } = useProfile();
    const { addToast } = useToast();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [files, setFiles] = useState<File[]>([]);

    const handleSubmit = async (signal: AbortSignal) => {
        if (!title.trim() || !message.trim()) { 
            addToast(t('fillAllFields'), 'error'); 
            throw new Error("Validation Failed");
        }
        
        try {
            const fd = new FormData();
            fd.append('title', title);
            fd.append('message', message);
            fd.append('authorName', profile?.name || 'Unknown');
            fd.append('authorAvatar', profile?.avatar || '');
            
            if (files.length > 0) {
                files.forEach(f => fd.append('attachments', f));
            }

            const res = await fetch(`${API_BASE}/subject/create`, {
                method: 'POST',
                headers: { "ngrok-skip-browser-warning": "true" },
                body: fd,
                signal
            });

            if (res.ok) {
                await onSuccess();
                addToast(t('success'), 'success');
                onClose();
            } else {
                throw new Error("Failed to create subject");
            }
        } catch (e) {
            console.warn("Subject creation failed", e);
            addToast(t('failed'), 'error');
            throw e;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[10000] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-lg flex flex-col gap-4" noRound>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-white">{t('createForm')}</h3>
                    <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder={t('formTitle')} className="p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500" />
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={t('initialMessage')} className="p-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500 min-h-[120px]" />
                <ImageUploadControl onFilesChange={setFiles} onUrlsChange={() => {}} />
                <AsyncButton onClick={handleSubmit} label={t('create')} variant="success" className="w-full py-3" />
            </GlassCard>
        </div>
    );
};

// --- MESSAGE COMPONENT ---
const MessageItem: React.FC<{ 
    msg: FormMessage & { isPending?: boolean, isError?: boolean }, 
    subjectId: string,
    onReply: (msg: FormMessage) => void, 
    onDelete: (subjectId: string, messageId: string) => void,
    isAdmin: boolean,
    replyingToMsg?: FormMessage 
}> = ({ msg, subjectId, onReply, onDelete, isAdmin, replyingToMsg }) => {
    const { dir, t } = useI18n();
    const isRtl = dir === 'rtl';
    
    // Swipe Logic
    const x = useMotionValue(0);
    const dragControls = useDragControls();
    const [triggered, setTriggered] = useState(false);
    
    // Swipe Visuals
    const swipeThreshold = 80;
    const arrowOpacity = useTransform(x, isRtl ? [20, swipeThreshold] : [-20, -swipeThreshold], [0, 1]);
    const arrowScale = useTransform(x, isRtl ? [20, swipeThreshold] : [-20, -swipeThreshold], [0.5, 1.2]);
    const arrowY = useTransform(x, isRtl ? [20, swipeThreshold] : [-20, -swipeThreshold], [10, 0]);

    const handleDragEnd = () => {
        const currentX = x.get();
        const thresholdMet = isRtl ? currentX > swipeThreshold : currentX < -swipeThreshold;
        
        if (thresholdMet) {
            onReply(msg);
            setTriggered(true);
            setTimeout(() => setTriggered(false), 500);
        }
    };

    const handleDrag = (event: any, info: any) => {
        const currentX = info.offset.x;
        const thresholdMet = isRtl ? currentX > swipeThreshold : currentX < -swipeThreshold;
        
        // Haptic Feedback
        if (thresholdMet && navigator.vibrate && !triggered) {
             // Vibrate once when threshold crossed
             // Note: Browser support varies for vibrate inside drag events
             // We can check if we just crossed the threshold
        }
    };

    // Use effect to trigger vibration only once when crossing threshold
    useEffect(() => {
        const unsubscribe = x.on("change", (latest) => {
             const thresholdMet = isRtl ? latest > swipeThreshold : latest < -swipeThreshold;
             if (thresholdMet && !triggered) {
                 if(navigator.vibrate) navigator.vibrate(15);
             }
        });
        return () => unsubscribe();
    }, [isRtl, triggered]);

    return (
        <div className={`relative w-full py-2 group/msg ${msg.isPending ? 'opacity-70' : ''}`}>
            {/* Reply Indicator (Blue Arrow) */}
            <motion.div 
                style={{ 
                    opacity: arrowOpacity, 
                    scale: arrowScale,
                    y: arrowY,
                    x: isRtl ? -20 : 20 // Offset from the side
                }}
                className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-0' : 'left-0'} z-10 text-blue-500 flex items-center justify-center`}
            >
                <Icons.CornerUpRight className={`w-8 h-8 ${isRtl ? '-scale-x-100' : ''}`} />
            </motion.div>

            <motion.div 
                style={{ x }}
                drag={msg.isPending ? false : "x"}
                dragControls={dragControls}
                dragConstraints={{ left: isRtl ? 0 : -150, right: isRtl ? 150 : 0 }}
                dragElastic={0.1}
                dragSnapToOrigin
                onDrag={handleDrag}
                onDragEnd={handleDragEnd}
                className={`relative flex gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'} items-start select-none touch-pan-y`}
            >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0 border border-white/10 relative z-20">
                    <RobustImage src={msg.author.avatar || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" />
                </div>

                <div className={`flex flex-col gap-1 max-w-[85%] ${isRtl ? 'items-start' : 'items-end'} relative`}>
                    {/* Admin Delete Button (Appears on Hover/Touch) */}
                    {isAdmin && !msg.isPending && (
                        <motion.button 
                            onClick={(e) => { e.stopPropagation(); onDelete(subjectId, msg.id); }}
                            className={`absolute -top-3 ${isRtl ? '-right-8' : '-left-8'} p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover/msg:opacity-100 transition-opacity shadow-lg z-30`}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Icons.Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                    )}

                    {/* Header: Name then Date */}
                    <div className="flex items-center gap-2 px-1 text-xs">
                        <span className="font-bold text-gray-300">{msg.author.name}</span>
                        <span className="text-[10px] text-gray-600">•</span>
                        <span className="text-[10px] text-gray-500">{msg.date}</span>
                        {msg.isPending && <Icons.Loader2 className="w-3 h-3 animate-spin text-orange-500" />}
                        {msg.isError && <Icons.AlertCircle className="w-3 h-3 text-red-500" />}
                    </div>

                    {replyingToMsg && (
                        <div className={`text-xs bg-white/5 border-l-2 border-blue-500 p-2 rounded mb-1 text-gray-400 max-w-full truncate flex items-center gap-2 w-full`}>
                            <Icons.CornerUpRight className={`w-3 h-3 ${isRtl ? '-scale-x-100' : ''}`} />
                            <span className="font-bold">{replyingToMsg.author.name}:</span>
                            <span className="truncate">{replyingToMsg.content.substring(0, 30)}...</span>
                        </div>
                    )}

                    <div className={`p-4 rounded-2xl ${isRtl ? 'rounded-tr-none bg-[#1A1A1A] border border-white/5' : 'rounded-tl-none bg-[#222] border border-white/5'} shadow-md text-white whitespace-pre-wrap break-words ${msg.isError ? 'border-red-500/50' : ''}`}>
                        {msg.content}
                    </div>

                    {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                            {msg.attachments.map((att, i) => (
                                <div key={i} className="w-32 h-32 rounded-xl overflow-hidden border border-white/10 bg-black">
                                    <AttachmentPreview url={att.path} type={att.type} />
                                </div>
                            ))}
                        </div>
                    )}
                    {msg.isError && <span className="text-xs text-red-500 font-bold">Failed to send</span>}
                </div>
            </motion.div>
        </div>
    );
};

// --- MAIN PAGE ---
export const AnalyzingPage: React.FC = () => {
    const { t, dir } = useI18n();
    const { profile, openProfileModal, hasProfile } = useProfile();
    const { requestDelete } = useGlobalActions();
    const { addToast } = useToast();
    
    // States
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [subjects, setSubjects] = useState<AnalysisForm[]>([]);
    const [currentSubject, setCurrentSubject] = useState<AnalysisForm | null>(null);
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false); // Protection state
    
    // Chat State
    const [chatInput, setChatInput] = useState('');
    const [chatFiles, setChatFiles] = useState<File[]>([]);
    const [replyTo, setReplyTo] = useState<FormMessage | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const hash = localStorage.getItem('mtnews-auth-hash');
        if (hash) setIsAdmin(true);
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/subjects`, { headers: { "ngrok-skip-browser-warning": "true" }});
            if (res.ok) {
                const data = await res.json();
                setSubjects(Array.isArray(data) ? data.reverse() : []);
            }
        } catch(e) {
            console.warn("Could not fetch subjects. Backend might be offline.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClick = () => {
        if(loading) return; // Protect against clicking while loading
        if (!hasProfile) openProfileModal();
        else setShowCreate(true);
    };

    const handleSubjectClick = async (subject: AnalysisForm) => {
        if(loading || isProcessing) return;
        setCurrentSubject(subject);
        setView('detail');
        try {
            const res = await fetch(`${API_BASE}/subject/${subject.id}/messages`, { headers: { "ngrok-skip-browser-warning": "true" }});
            if (res.ok) {
                const data = await res.json();
                setCurrentSubject(prev => prev ? { ...prev, messages: data.messages } : null);
            }
        } catch(e) {
            console.warn("Failed to fetch messages for subject", subject.id);
        }
    };

    const handleSendMessage = async () => {
        if (!hasProfile) { openProfileModal(); return; }
        if (!currentSubject || (!chatInput.trim() && chatFiles.length === 0)) return;
        if (isProcessing) return; // Strict protection

        setIsProcessing(true); // Lock

        // 1. Optimistic Update
        const tempId = `temp-${Date.now()}`;
        const tempAttachments: FormAttachment[] = chatFiles.map(f => ({
            type: f.type,
            path: URL.createObjectURL(f)
        }));

        const optimisticMsg: FormMessage & { isPending: boolean } = {
            id: tempId,
            author: { name: profile!.name, avatar: profile!.avatar },
            content: chatInput,
            date: t('sending'),
            attachments: tempAttachments,
            replyTo: replyTo?.id,
            isPending: true
        };

        setCurrentSubject(prev => {
            if(!prev) return null;
            return { ...prev, messages: [...prev.messages, optimisticMsg] };
        });
        
        // Clear Inputs
        const filesToUpload = [...chatFiles];
        const contentToSend = chatInput;
        const replyToSend = replyTo ? replyTo.id : undefined;
        
        setChatInput('');
        setChatFiles([]);
        setReplyTo(null);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

        // 2. API Call
        try {
            const fd = new FormData();
            fd.append('content', contentToSend || 'Attachment');
            fd.append('authorName', profile!.name);
            fd.append('authorAvatar', profile!.avatar);
            if (replyToSend) fd.append('replyTo', replyToSend);
            filesToUpload.forEach(f => fd.append('attachments', f));

            const res = await fetch(`${API_BASE}/subject/${currentSubject.id}/add`, {
                method: 'POST',
                headers: { "ngrok-skip-browser-warning": "true" },
                body: fd
            });

            if (res.ok) {
                const data = await res.json();
                setCurrentSubject(prev => {
                    if(!prev) return null;
                    return { 
                        ...prev, 
                        messages: prev.messages.map(m => m.id === tempId ? data.message : m) 
                    };
                });
            } else {
                throw new Error("Server error");
            }
        } catch (e) {
            console.error("Failed to send", e);
            addToast("Failed to send message", 'error');
            setCurrentSubject(prev => {
                if(!prev) return null;
                return { 
                    ...prev, 
                    messages: prev.messages.map(m => m.id === tempId ? { ...m, isPending: false, isError: true } : m) 
                };
            });
        } finally {
            setIsProcessing(false); // Unlock
        }
    };

    // --- ADMIN ACTIONS ---

    const handleDeleteSubject = (id: string, title: string) => {
        if (!isAdmin || isProcessing) return;
        
        requestDelete(
            t('deleteFormConfirm'),
            t('formDeleted'),
            async () => {
                setIsProcessing(true);
                try {
                    const res = await fetch(`${API_BASE}/subject/delete`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
                        body: JSON.stringify({ id })
                    });
                    
                    if(res.ok) {
                        // Local Update
                        setSubjects(prev => prev.filter(s => s.id !== id));
                        if(currentSubject?.id === id) setView('list');
                        
                        logAction('admin', 'Deleted Subject', `Title: ${title}, ID: ${id}`);
                        addToast("Subject deleted successfully", 'success');
                    } else {
                        throw new Error("API Error");
                    }
                } catch(e) {
                    addToast("Failed to delete subject", 'error');
                } finally {
                    setIsProcessing(false);
                }
            },
            undefined,
            'admin',
            `Deleted Form: ${title}`
        );
    };

    const handleDeleteMessage = async (subjectId: string, messageId: string) => {
        if (!isAdmin || isProcessing) return;

        requestDelete(
            t('deleteMessageConfirm'),
            t('messageDeleted'),
            async () => {
                setIsProcessing(true);
                try {
                    const res = await fetch(`${API_BASE}/subject/${subjectId}/remove`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "true" },
                        body: JSON.stringify({ messageId })
                    });

                    if (res.ok) {
                        // Local Update
                        setCurrentSubject(prev => prev ? { 
                            ...prev, 
                            messages: prev.messages.filter(m => m.id !== messageId) 
                        } : null);
                        
                        logAction('admin', 'Deleted Message', `Subject: ${subjectId}, Msg: ${messageId}`);
                    } else {
                        throw new Error("Failed");
                    }
                } catch(e) {
                    addToast("Failed to delete message", 'error');
                } finally {
                    setIsProcessing(false);
                }
            },
            undefined,
            'admin',
            'Deleted a Message'
        );
    };

    const filteredSubjects = subjects.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="w-full max-w-5xl mx-auto h-[92vh] flex flex-col relative">
            <AnimatePresence mode="wait">
                
                {/* LIST VIEW */}
                {view === 'list' && (
                    <motion.div 
                        key="list"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex flex-col gap-6 h-full pb-20"
                    >
                        <div className="flex gap-4 items-center">
                            <div className="flex-1 relative">
                                <input 
                                    value={search} 
                                    onChange={e => setSearch(e.target.value)} 
                                    placeholder={t('searchPlaceholder')} 
                                    className="w-full p-4 pl-12 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500 transition-colors"
                                    disabled={loading}
                                />
                                <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            </div>
                            <motion.button 
                                onClick={handleCreateClick}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={loading}
                                className={`px-6 py-4 rounded-2xl text-white font-bold flex items-center gap-2 shadow-lg ${loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-orange-600'}`}
                            >
                                <Icons.Plus className="w-5 h-5" />
                                <span className="hidden md:inline">{t('createForm')}</span>
                            </motion.button>
                        </div>

                        {loading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Icons.Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pr-2">
                                {filteredSubjects.map(sub => {
                                    const cover = sub.initialMessage.attachments?.[0];
                                    return (
                                        <div 
                                            key={sub.id} 
                                            onClick={() => handleSubjectClick(sub)}
                                            className="group relative bg-[#121212] border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-orange-500/50 hover:bg-white/5 transition-all flex gap-4 overflow-hidden"
                                        >
                                            <div className="flex-1 flex flex-col justify-between z-10">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{sub.title}</h3>
                                                    <p className="text-gray-400 text-sm line-clamp-3">{sub.initialMessage.content}</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500">
                                                    <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden"><RobustImage src={sub.initialMessage.author.avatar || 'https://via.placeholder.com/50'} className="w-full h-full object-cover"/></div>
                                                    <span>{sub.initialMessage.author.name}</span>
                                                    <span>•</span>
                                                    <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            {cover && (
                                                <div className="w-32 h-full absolute right-0 top-0 opacity-20 group-hover:opacity-40 transition-opacity md:static md:opacity-100 md:w-32 md:h-32 md:rounded-xl md:border md:border-white/10 overflow-hidden bg-black shrink-0">
                                                    <AttachmentPreview url={cover.path} type={cover.type} compact />
                                                </div>
                                            )}

                                            {/* Admin Delete Subject Button (Hover) */}
                                            {isAdmin && (
                                                <motion.button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteSubject(sub.id, sub.title); }}
                                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20"
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Icons.Trash2 className="w-4 h-4" />
                                                </motion.button>
                                            )}
                                        </div>
                                    );
                                })}
                                {filteredSubjects.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
                                        <Icons.Activity className="w-12 h-12 opacity-50" />
                                        <p>{t('noFormsFound')}</p>
                                        <button onClick={handleCreateClick} disabled={loading} className="text-orange-500 hover:underline disabled:opacity-50">{t('clickToCreate')}</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* DETAIL VIEW */}
                {view === 'detail' && currentSubject && (
                    <motion.div 
                        key="detail"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="flex flex-col h-full bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden relative pb-20 md:pb-0"
                    >
                        {/* Header */}
                        <div className="p-4 md:p-6 border-b border-white/10 bg-white/5 relative z-20">
                            <button onClick={() => setView('list')} className="absolute top-4 right-4 md:top-6 md:right-6 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"><Icons.X className="w-5 h-5" /></button>
                            
                            <div className="flex items-center gap-4 mb-4 pr-10">
                                <div className="w-14 h-14 rounded-full border-2 border-orange-500 p-0.5 overflow-hidden"><RobustImage src={currentSubject.initialMessage.author.avatar} className="w-full h-full object-cover" /></div>
                                <div>
                                    <h2 className="text-2xl font-black text-white line-clamp-1">{currentSubject.title}</h2>
                                    <div className="flex gap-2 text-sm text-gray-400">
                                        <span className="text-orange-500 font-bold">{currentSubject.initialMessage.author.name}</span>
                                        <span>•</span>
                                        <span>{currentSubject.createdAt}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed mb-4">{currentSubject.initialMessage.content}</p>
                            
                            {currentSubject.initialMessage.attachments?.length > 0 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {currentSubject.initialMessage.attachments.map((att, i) => (
                                        <div key={i} className="h-40 w-auto min-w-[150px] rounded-xl overflow-hidden border border-white/10 bg-black"><AttachmentPreview url={att.path} type={att.type} /></div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-2">
                            {currentSubject.messages.length === 0 && <div className="text-center text-gray-600 py-10">No replies yet.</div>}
                            {currentSubject.messages.map(msg => (
                                <MessageItem 
                                    key={msg.id} 
                                    msg={msg} 
                                    subjectId={currentSubject.id}
                                    onReply={setReplyTo} 
                                    onDelete={handleDeleteMessage}
                                    isAdmin={isAdmin}
                                    replyingToMsg={currentSubject.messages.find(m => m.id === msg.replyTo)}
                                />
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Redesigned Input Area */}
                        <div className="p-3 md:p-4 bg-[#121212] border-t border-white/10 relative z-20">
                            {replyTo && (
                                <div className="flex items-center justify-between bg-blue-500/10 border-l-4 border-blue-500 p-2 mb-2 rounded text-xs mx-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-blue-400">{t('replyingTo')}:</span>
                                        <span className="text-gray-300">{replyTo.author.name}</span>
                                    </div>
                                    <button onClick={() => setReplyTo(null)}><Icons.X className="w-4 h-4 text-gray-400" /></button>
                                </div>
                            )}
                            
                            <div className="flex gap-3 items-end">
                                <label className={`p-0 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 cursor-pointer transition-colors border border-white/5 flex-shrink-0 h-[50px] w-[50px] flex items-center justify-center ${isProcessing ? 'pointer-events-none opacity-50' : ''}`}>
                                    <Icons.Plus className="w-6 h-6" />
                                    <input type="file" multiple className="hidden" onChange={e => { if(e.target.files) setChatFiles(Array.from(e.target.files)); }} disabled={isProcessing} />
                                </label>
                                
                                <div className="flex-1 bg-white/5 rounded-[24px] border border-white/10 flex flex-col overflow-hidden focus-within:border-orange-500/50 transition-colors min-h-[50px]">
                                    {chatFiles.length > 0 && (
                                        <div className="p-2 border-b border-white/5 flex gap-2 overflow-x-auto bg-black/20">
                                            {chatFiles.map((f, i) => <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300 whitespace-nowrap flex items-center gap-1">{f.name}</span>)}
                                        </div>
                                    )}
                                    <textarea 
                                        value={chatInput} 
                                        onChange={e => setChatInput(e.target.value)} 
                                        placeholder={t('messagePlaceholder')} 
                                        className="w-full p-3 px-4 bg-transparent text-white outline-none resize-none max-h-32 h-full min-h-[50px] leading-[24px]"
                                        style={{ height: 'auto' }}
                                        disabled={isProcessing}
                                        onKeyDown={(e) => {
                                            if(e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                </div>
                                
                                <motion.button 
                                    onClick={handleSendMessage} 
                                    disabled={isProcessing || (chatInput.length === 0 && chatFiles.length === 0)}
                                    whileTap={{ scale: 0.9 }}
                                    className={`p-0 rounded-full flex-shrink-0 h-[50px] w-[50px] flex items-center justify-center transition-all ${isProcessing ? 'bg-gray-700 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg'}`}
                                >
                                    {isProcessing ? <Icons.Loader2 className="w-5 h-5 animate-spin" /> : <Icons.Send className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>{showCreate && <CreateSubjectModal onClose={() => setShowCreate(false)} onSuccess={fetchSubjects} />}</AnimatePresence>
        </div>
    );
};
