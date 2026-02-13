
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, useMotionValue, useTransform, useMotionValueEvent } from 'framer-motion';
import { Icons } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { GlassCard } from '../components/ui/GlassCard';
import { AsyncButton } from '../components/ui/AsyncButton';
import { useProfile } from '../contexts/ProfileContext';
import { useGlobalActions } from '../contexts/GlobalActionsContext';
import { AnalysisForm, FormMessage } from '../types';
import { logAction } from '../utils/logging';
import { useToast } from '../contexts/NotificationContext';
import { RobustImage } from '../components/ui/RobustImage';
import { robustFetch } from '../utils/apiWrapper';

const CreateSubjectModal: React.FC<{ onClose: () => void; onSuccess: () => Promise<void> }> = ({ onClose, onSuccess }) => {
    const { t } = useI18n();
    const { profile } = useProfile();
    const { addToast } = useToast();
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (signal: AbortSignal) => {
        if (!title.trim() || !message.trim()) { 
            addToast(t('fillAllFields'), 'error'); throw new Error("Validation Failed");
        }
        try {
            const fd = new FormData();
            fd.append('title', title);
            fd.append('message', message);
            fd.append('authorName', profile?.name || 'Unknown');
            fd.append('authorAvatar', profile?.avatar || '');
            // Attachments removed per request

            const res = await robustFetch('/subject/create', { method: 'POST', body: fd, signal });
            if (res.ok) {
                await onSuccess(); 
                addToast(t('success'), 'success');
                onClose();
            } else throw new Error("Failed");
        } catch (e) {
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
                <AsyncButton onClick={handleSubmit} label={t('create')} variant="success" className="w-full py-3" />
            </GlassCard>
        </div>
    );
};

const MessageItem: React.FC<{ 
    msg: FormMessage & { isPending?: boolean, isError?: boolean }, 
    subjectId: string,
    onReply: (msg: FormMessage) => void, 
    onDelete: (subjectId: string, messageId: string) => void,
    isAdmin: boolean,
    replyingToMsg?: FormMessage 
}> = ({ msg, subjectId, onReply, onDelete, isAdmin, replyingToMsg }) => {
    const { dir } = useI18n();
    const isRtl = dir === 'rtl';
    const x = useMotionValue(0);
    const dragControls = useDragControls();
    
    // Always swipe Right-to-Left (pulling from right side towards left)
    // Negative X means moving left.
    const swipeThreshold = -80; 
    
    const arrowOpacity = useTransform(x, [-20, swipeThreshold], [0, 1]);
    const arrowScale = useTransform(x, [-20, swipeThreshold], [0.5, 1.2]);
    // Allow arrow to move slightly with the drag
    const arrowX = useTransform(x, [-20, swipeThreshold], [0, -20]);

    // Haptic Feedback Logic
    useMotionValueEvent(x, "change", (latest) => {
        if (latest < swipeThreshold && latest > swipeThreshold - 5) {
             if (navigator.vibrate) navigator.vibrate(15);
        }
    });

    const handleDragEnd = () => {
        const currentX = x.get();
        if (currentX < swipeThreshold) {
            onReply(msg);
            if (navigator.vibrate) navigator.vibrate(30);
        }
    };

    return (
        <div className={`relative w-full py-2 group/msg ${msg.isPending ? 'opacity-70' : ''}`}>
            {/* Reply Icon Indicator - Always on Right */}
            <motion.div 
                style={{ opacity: arrowOpacity, scale: arrowScale, x: arrowX, top: '50%', y: '-50%' }} 
                className="absolute right-0 z-10 text-blue-500 flex items-center justify-center pointer-events-none pr-4"
            >
                <Icons.CornerUpLeft className="w-8 h-8" />
            </motion.div>

            <motion.div 
                style={{ x }}
                drag={msg.isPending ? false : "x"}
                dragControls={dragControls}
                // Constraints: Can only drag left (negative), not right (positive)
                dragConstraints={{ left: -150, right: 0 }}
                dragElastic={0.1}
                dragSnapToOrigin
                onDragEnd={handleDragEnd}
                className={`relative flex gap-3 ${isRtl ? 'flex-row' : 'flex-row-reverse'} items-start select-none touch-pan-y`}
            >
                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0 border border-white/10 relative z-20"><RobustImage src={msg.author.avatar || 'https://via.placeholder.com/100'} className="w-full h-full object-cover" /></div>
                <div className={`flex flex-col gap-1 max-w-[85%] ${isRtl ? 'items-start' : 'items-end'} relative`}>
                    {isAdmin && !msg.isPending && (
                        <motion.button onClick={(e) => { e.stopPropagation(); onDelete(subjectId, msg.id); }} className={`absolute -top-3 ${isRtl ? '-right-8' : '-left-8'} p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover/msg:opacity-100 transition-opacity shadow-lg z-30`} {...({ whileTap: { scale: 0.9 } } as any)}>
                            <Icons.Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                    )}
                    <div className="flex items-center gap-2 px-1 text-xs"><span className="font-bold text-gray-300">{msg.author.name}</span><span className="text-[10px] text-gray-600">•</span><span className="text-[10px] text-gray-500">{msg.date}</span>{msg.isPending && <Icons.Loader2 className="w-3 h-3 animate-spin text-orange-500" />}{msg.isError && <Icons.AlertCircle className="w-3 h-3 text-red-500" />}</div>
                    
                    {replyingToMsg && (
                        <div className={`text-xs bg-white/5 border-l-2 border-blue-500 p-2 rounded mb-1 text-gray-400 max-w-full truncate flex items-center gap-2 w-full select-none pointer-events-none`}>
                            <Icons.CornerUpRight className={`w-3 h-3 ${isRtl ? '-scale-x-100' : ''}`} />
                            <span className="font-bold">{replyingToMsg.author.name}:</span>
                            <span className="truncate">{replyingToMsg.content.substring(0, 30)}...</span>
                        </div>
                    )}
                    
                    <div className={`p-4 rounded-2xl ${isRtl ? 'rounded-tr-none bg-[#1A1A1A] border border-white/5' : 'rounded-tl-none bg-[#222] border border-white/5'} shadow-md text-white whitespace-pre-wrap break-words ${msg.isError ? 'border-red-500/50' : ''} text-right`}>
                        {msg.content}
                    </div>
                    {/* Attachments rendering removed */}
                    {msg.isError && <span className="text-xs text-red-500 font-bold">Failed to send</span>}
                </div>
            </motion.div>
        </div>
    );
};

export const AnalyzingPage: React.FC = () => {
    const { t, dir } = useI18n();
    const { profile, openProfileModal, hasProfile } = useProfile();
    const { requestDelete } = useGlobalActions();
    const { addToast } = useToast();
    
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [subjects, setSubjects] = useState<AnalysisForm[]>([]);
    const [currentSubject, setCurrentSubject] = useState<AnalysisForm | null>(null);
    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [chatInput, setChatInput] = useState('');
    const [replyTo, setReplyTo] = useState<FormMessage | null>(null);
    const [isError, setIsError] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Initial Load
    useEffect(() => {
        const hash = localStorage.getItem('mtnews-auth-hash');
        if (hash) setIsAdmin(true);
        fetchSubjects();
        return () => {
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, []);

    // Polling logic for detail view
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (view === 'detail' && currentSubject) {
            interval = setInterval(() => {
                fetchMessagesForSubject(currentSubject.id);
            }, 3000); 
        }
        return () => clearInterval(interval);
    }, [view, currentSubject?.id]);

    const fetchSubjects = async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setLoading(true);
        setIsError(false);
        
        try {
            const res = await robustFetch('/subjects', { 
                method: 'GET',
                signal,
                retryForever: false 
            });
            
            if (res.ok) {
                const data = await res.json();
                setSubjects(Array.isArray(data) ? data.reverse() : []);
            } else {
                throw new Error("Failed to load");
            }
        } catch(e: any) {
            if (!signal.aborted) {
                console.error("Subject fetch failed:", e);
                setIsError(true);
            }
        } finally { 
            if (!signal.aborted) {
                setLoading(false); 
            }
        }
    };

    const fetchMessagesForSubject = async (id: string) => {
        try {
            const res = await robustFetch(`/subject/${id}/messages`, { skipErrorLog: true });
            if (res.ok) {
                const data = await res.json();
                setCurrentSubject(prev => {
                    if (!prev || prev.id !== id) return prev;
                    if (prev.messages.length !== data.messages.length) {
                        return { ...prev, messages: data.messages };
                    }
                    return prev;
                });
            }
        } catch (e) {}
    };

    const handleCreateClick = () => { (!hasProfile) ? openProfileModal() : setShowCreate(true); };

    const handleSubjectClick = async (subject: AnalysisForm) => {
        setCurrentSubject(subject);
        setView('detail');
        fetchMessagesForSubject(subject.id);
    };

    const handleReturn = () => {
        setCurrentSubject(null);
        setView('list');
        fetchSubjects(); 
    };

    const handleSendMessage = async () => {
        if (!hasProfile) { openProfileModal(); return; }
        if (!currentSubject || !chatInput.trim()) return;
        
        const contentToSend = chatInput;
        const replyToSend = replyTo ? replyTo.id : undefined;
        
        setChatInput(''); 
        setReplyTo(null);

        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: FormMessage & { isPending: boolean } = {
            id: tempId, 
            author: { name: profile!.name, avatar: profile!.avatar }, 
            content: contentToSend,
            date: t('sending'), 
            attachments: [], 
            replyTo: replyTo?.id, 
            isPending: true
        };

        setCurrentSubject(prev => { 
            if(!prev) return null; 
            return { ...prev, messages: [...prev.messages, optimisticMsg] }; 
        });
        
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);

        try {
            const fd = new FormData();
            fd.append('content', contentToSend);
            fd.append('authorName', profile!.name);
            fd.append('authorAvatar', profile!.avatar);
            if (replyToSend) fd.append('replyTo', replyToSend);
            // Attachments removed

            const res = await robustFetch(`/subject/${currentSubject.id}/add`, { method: 'POST', body: fd });
            if (res.ok) {
                const data = await res.json();
                setCurrentSubject(prev => { 
                    if(!prev) return null; 
                    const filtered = prev.messages.filter(m => m.id !== tempId);
                    return { ...prev, messages: [...filtered, data.message] }; 
                });
            } else throw new Error("Server error");
        } catch (e) {
            addToast("Failed to send message", 'error');
            setCurrentSubject(prev => { 
                if(!prev) return null; 
                return { ...prev, messages: prev.messages.map(m => m.id === tempId ? { ...m, isPending: false, isError: true } : m) }; 
            });
        }
    };

    const handleDeleteSubject = (id: string, title: string) => {
        if (!isAdmin) return;
        requestDelete(t('deleteFormConfirm'), t('formDeleted'), async () => {
            try {
                const res = await robustFetch('/subject/delete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
                if(res.ok) {
                    setSubjects(prev => prev.filter(s => s.id !== id));
                    if(currentSubject?.id === id) {
                        setView('list');
                        setCurrentSubject(null);
                    }
                    logAction('admin', 'Deleted Subject', `Title: ${title}, ID: ${id}`);
                    addToast("Subject deleted successfully", 'success');
                }
            } catch(e) { addToast("Failed to delete subject", 'error'); }
        }, undefined, 'admin', `Deleted Form: ${title}`);
    };

    const handleDeleteMessage = async (subjectId: string, messageId: string) => {
        if (!isAdmin) return;
        requestDelete(t('deleteMessageConfirm'), t('messageDeleted'), async () => {
            try {
                const res = await robustFetch(`/subject/${subjectId}/remove`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId }) });
                if (res.ok) {
                    setCurrentSubject(prev => prev ? { ...prev, messages: prev.messages.filter(m => m.id !== messageId) } : null);
                    logAction('admin', 'Deleted Message', `Subject: ${subjectId}, Msg: ${messageId}`);
                }
            } catch(e) { addToast("Failed to delete message", 'error'); }
        }, undefined, 'admin', 'Deleted a Message');
    };

    const filteredSubjects = subjects.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

    if (isError && !loading && subjects.length === 0) {
        return (
            <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30 mb-2">
                    <Icons.AlertTriangle className="w-10 h-10 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-white">Data Load Failed</h3>
                <p className="text-gray-400">Failed to fetch analysis subjects.</p>
                <button 
                    onClick={fetchSubjects} 
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-colors flex items-center gap-2"
                >
                    <Icons.RotateCcw className="w-4 h-4" />
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl mx-auto h-[92vh] flex flex-col relative">
            <AnimatePresence mode="wait">
                {view === 'list' && (
                    <motion.div key="list" {...({ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } } as any)} className="flex flex-col gap-6 h-full pb-20">
                        <div className="flex gap-4 items-center">
                            <div className="flex-1 relative">
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchPlaceholder')} className="w-full p-4 pl-12 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500 transition-colors" disabled={loading} />
                                <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            </div>
                            <motion.button onClick={handleCreateClick} {...({ whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } } as any)} className={`px-6 py-4 rounded-2xl text-white font-bold flex items-center gap-2 shadow-lg bg-orange-600`}>
                                <Icons.Plus className="w-5 h-5" /><span className="hidden md:inline">{t('createForm')}</span>
                            </motion.button>
                        </div>
                        {loading && subjects.length === 0 ? <div className="flex-1 flex items-center justify-center"><Icons.Loader2 className="w-12 h-12 text-orange-500 animate-spin" /></div> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pr-2">
                                {filteredSubjects.map(sub => {
                                    // Removed Cover preview
                                    return (
                                        <div key={sub.id} onClick={() => handleSubjectClick(sub)} className="group relative bg-[#121212] border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-orange-500/50 hover:bg-white/5 transition-all flex gap-4 overflow-hidden">
                                            <div className="flex-1 flex flex-col justify-between z-10">
                                                <div><h3 className="text-xl font-bold text-white mb-2 line-clamp-2">{sub.title}</h3><p className="text-gray-400 text-sm line-clamp-3">{sub.initialMessage.content}</p></div>
                                                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500"><div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden"><RobustImage src={sub.initialMessage.author.avatar || 'https://via.placeholder.com/50'} className="w-full h-full object-cover"/></div><span>{sub.initialMessage.author.name}</span><span>•</span><span>{new Date(sub.createdAt).toLocaleDateString()}</span></div>
                                            </div>
                                            {isAdmin && (<motion.button onClick={(e) => { e.stopPropagation(); handleDeleteSubject(sub.id, sub.title); }} className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20" {...({ whileTap: { scale: 0.9 } } as any)}><Icons.Trash2 className="w-4 h-4" /></motion.button>)}
                                        </div>
                                    );
                                })}
                                {filteredSubjects.length === 0 && <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500 gap-2"><Icons.Activity className="w-12 h-12 opacity-50" /><p>{t('noFormsFound')}</p><button onClick={handleCreateClick} className="text-orange-500 hover:underline">{t('clickToCreate')}</button></div>}
                            </div>
                        )}
                    </motion.div>
                )}
                {view === 'detail' && currentSubject && (
                    <motion.div key="detail" {...({ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 20 } } as any)} className="flex flex-col h-full bg-[#0a0a0a] rounded-2xl border border-white/10 overflow-hidden relative pb-20 md:pb-0">
                        <div className="p-4 md:p-6 border-b border-white/10 bg-white/5 relative z-20">
                            <button onClick={handleReturn} className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} md:top-6 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white`}>
                                <Icons.X className="w-5 h-5" />
                            </button>
                            <div className={`flex items-center gap-4 mb-4 ${dir === 'rtl' ? 'pl-10' : 'pr-10'}`}>
                                <div className="w-14 h-14 rounded-full border-2 border-orange-500 p-0.5 overflow-hidden"><RobustImage src={currentSubject.initialMessage.author.avatar} className="w-full h-full object-cover" /></div>
                                <div><h2 className="text-2xl font-black text-white line-clamp-1">{currentSubject.title}</h2><div className="flex gap-2 text-sm text-gray-400"><span className="text-orange-500 font-bold">{currentSubject.initialMessage.author.name}</span><span>•</span><span>{currentSubject.createdAt}</span></div></div>
                            </div>
                            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed mb-4 text-right">{currentSubject.initialMessage.content}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-2">
                            {currentSubject.messages.length === 0 && <div className="text-center text-gray-600 py-10">No replies yet.</div>}
                            {currentSubject.messages.map(msg => (<MessageItem key={msg.id} msg={msg} subjectId={currentSubject.id} onReply={setReplyTo} onDelete={handleDeleteMessage} isAdmin={isAdmin} replyingToMsg={currentSubject.messages.find(m => m.id === msg.replyTo)} />))}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-3 md:p-4 bg-[#121212] border-t border-white/10 relative z-20">
                            {replyTo && (<div className="flex items-center justify-between bg-blue-500/10 border-l-4 border-blue-500 p-2 mb-2 rounded text-xs mx-1"><div className="flex items-center gap-2"><span className="font-bold text-blue-400">{t('replyingTo')}:</span><span className="text-gray-300">{replyTo.author.name}</span></div><button onClick={() => setReplyTo(null)}><Icons.X className="w-4 h-4 text-gray-400" /></button></div>)}
                            <div className="flex gap-3 items-end">
                                <div className="flex-1 bg-white/5 rounded-[24px] border border-white/10 flex flex-col overflow-hidden focus-within:border-orange-500/50 transition-colors min-h-[50px]">
                                    <textarea value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={t('messagePlaceholder')} className="w-full p-3 px-4 bg-transparent text-white outline-none resize-none max-h-32 h-full min-h-[50px] leading-[24px]" style={{ height: 'auto', textAlign: dir === 'rtl' ? 'right' : 'left' }} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
                                </div>
                                <motion.button onClick={handleSendMessage} disabled={(chatInput.length === 0)} {...({ whileTap: { scale: 0.9 } } as any)} className={`p-0 rounded-full flex-shrink-0 h-[50px] w-[50px] flex items-center justify-center transition-all bg-orange-500 hover:bg-orange-600 text-white shadow-lg`}>
                                    <Icons.Send className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
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
