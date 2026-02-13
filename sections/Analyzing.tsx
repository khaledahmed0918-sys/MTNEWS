
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls, useMotionValue, useTransform } from 'framer-motion';
import { Icons } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { GlassCard } from '../components/ui/GlassCard';
import { AsyncButton } from '../components/ui/AsyncButton';
import { useProfile } from '../contexts/ProfileContext';
import { useGlobalActions } from '../contexts/GlobalActionsContext';
import { AnalysisForm, FormMessage } from '../types';
import { logAction } from '../utils/logging';
import { useToast } from '../contexts/NotificationContext';
import { robustFetch } from '../utils/apiWrapper';

// --- IN-MEMORY CACHE ---
// This variable exists outside the component lifecycle, preserving data during SPA navigation
let cachedSubjects: AnalysisForm[] | null = null;

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
            fd.append('authorAvatar', ''); 

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
    const x = useMotionValue(0);
    const dragControls = useDragControls();
    
    const swipeThreshold = -80; 
    
    const arrowOpacity = useTransform(x, [-20, swipeThreshold], [0, 1]);
    const arrowScale = useTransform(x, [-20, swipeThreshold], [0.5, 1.2]);
    const arrowX = useTransform(x, [-20, swipeThreshold], [0, -20]);

    const handleDragEnd = () => {
        const currentX = x.get();
        if (currentX < swipeThreshold) {
            onReply(msg);
            if (navigator.vibrate) navigator.vibrate(30);
        }
    };

    return (
        <div className={`relative w-full py-1 group/msg ${msg.isPending ? 'opacity-70' : ''}`}>
            {/* Reply Icon Indicator */}
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
                dragConstraints={{ left: -150, right: 0 }}
                dragElastic={0.1}
                dragSnapToOrigin
                onDragEnd={handleDragEnd}
                className={`relative flex flex-col gap-1 items-end select-none touch-pan-y`}
            >
                {/* Admin Delete Button - Shows on Hover */}
                {isAdmin && !msg.isPending && (
                    <motion.button 
                        onClick={(e) => { e.stopPropagation(); onDelete(subjectId, msg.id); }} 
                        className={`absolute top-2 left-0 p-1.5 bg-red-500 rounded-full text-white opacity-0 group-hover/msg:opacity-100 transition-opacity shadow-lg z-30 cursor-pointer`} 
                        whileTap={{ scale: 0.9 }}
                    >
                        <Icons.Trash2 className="w-3.5 h-3.5" />
                    </motion.button>
                )}
                
                {/* Sender Name */}
                <div className="flex items-center gap-2 px-1 text-xs text-gray-400">
                    <span className="font-bold text-gray-300">{msg.author.name}</span>
                    <span>•</span>
                    <span>{msg.date}</span>
                    {msg.isPending && <Icons.Loader2 className="w-3 h-3 animate-spin text-orange-500" />}
                    {msg.isError && <Icons.AlertCircle className="w-3 h-3 text-red-500" />}
                </div>
                
                {replyingToMsg && (
                    <div className={`text-xs bg-white/5 border-r-2 border-blue-500 p-2 rounded mb-1 text-gray-400 max-w-full truncate flex items-center justify-end gap-2 w-full select-none pointer-events-none`}>
                        <span className="truncate">{replyingToMsg.content.substring(0, 30)}...</span>
                        <span className="font-bold">:{replyingToMsg.author.name}</span>
                        <Icons.CornerUpRight className={`w-3 h-3`} />
                    </div>
                )}
                
                {/* Message Content Bubble - Pure Text */}
                <div className={`px-4 py-2 rounded-2xl rounded-tr-none bg-[#1A1A1A] border border-white/5 shadow-sm text-white whitespace-pre-wrap break-words ${msg.isError ? 'border-red-500/50' : ''} text-right w-fit max-w-full`}>
                    {msg.content}
                </div>
                
                {msg.isError && <span className="text-xs text-red-500 font-bold">Failed to send</span>}
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
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const hash = localStorage.getItem('mtnews-auth-hash');
        if (hash) setIsAdmin(true);
        
        // Initial Data Load Logic with Caching
        if (cachedSubjects) {
            setSubjects(cachedSubjects);
            setLoading(false);
            // Silent fetch to update cache
            fetchSubjects(true); 
        } else {
            fetchSubjects();
        }
    }, []);

    const fetchSubjects = async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const res = await robustFetch('/subjects', { skipErrorLog: true });
            if (res.ok) {
                const data = await res.json();
                const processed = Array.isArray(data) ? data.reverse() : [];
                setSubjects(processed);
                cachedSubjects = processed; // Update Cache
            }
        } catch(e) {
            console.error("Subject fetch error", e);
        } finally { 
            if (!isSilent) setLoading(false); 
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

    // Polling only when in detail view
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (view === 'detail' && currentSubject) {
            interval = setInterval(() => {
                fetchMessagesForSubject(currentSubject.id);
            }, 2000); 
        }
        return () => clearInterval(interval);
    }, [view, currentSubject?.id]);

    const handleCreateClick = () => { (!hasProfile) ? openProfileModal() : setShowCreate(true); };

    const handleSubjectClick = async (subject: AnalysisForm) => {
        setCurrentSubject(subject);
        setView('detail');
        // Initial fetch for details
        fetchMessagesForSubject(subject.id);
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
            author: { name: profile!.name, avatar: '' }, 
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
            fd.append('authorAvatar', ''); 
            if (replyToSend) fd.append('replyTo', replyToSend);

            const res = await robustFetch(`/subject/${currentSubject.id}/add`, { method: 'POST', body: fd });
            if (res.ok) {
                const data = await res.json();
                setCurrentSubject(prev => { 
                    if(!prev) return null; 
                    const filtered = prev.messages.filter(m => m.id !== tempId);
                    return { ...prev, messages: [...filtered, data.message] }; 
                });
            }
        } catch (e) {
            setCurrentSubject(prev => { 
                if(!prev) return null; 
                return { ...prev, messages: prev.messages.map(m => m.id === tempId ? { ...m, isPending: false, isError: true } : m) }; 
            });
        }
    };

    const handleDeleteSubject = (id: string, title: string) => {
        if (!isAdmin) return;
        requestDelete(
            t('deleteFormConfirm'), 
            t('formDeleted'), 
            async () => {
                const res = await robustFetch('/subject/delete', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ id }) 
                });
                
                if(res.ok) {
                    setSubjects(prev => {
                        const next = prev.filter(s => s.id !== id);
                        cachedSubjects = next; // Update cache
                        return next;
                    });
                    if(currentSubject?.id === id) {
                        setView('list');
                        setCurrentSubject(null);
                    }
                    addToast(t('itemDeleted'), 'success');
                    logAction('admin', 'Deleted Subject', `Title: ${title}, ID: ${id}`);
                } else {
                    throw new Error("Delete failed");
                }
            }, 
            undefined, 
            'admin', 
            `Deleted Form: ${title}`
        );
    };

    const handleDeleteMessage = async (subjectId: string, messageId: string) => {
        if (!isAdmin) return;
        requestDelete(
            t('deleteMessageConfirm'), 
            t('messageDeleted'), 
            async () => {
                const res = await robustFetch(`/subject/${subjectId}/remove`, { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' }, 
                    body: JSON.stringify({ messageId }) 
                });
                
                if (res.ok) {
                    setCurrentSubject(prev => prev ? { ...prev, messages: prev.messages.filter(m => m.id !== messageId) } : null);
                    addToast(t('itemDeleted'), 'success');
                    logAction('admin', 'Deleted Message', `Subject: ${subjectId}, Msg: ${messageId}`);
                } else {
                    throw new Error("Delete failed");
                }
            }, 
            undefined, 
            'admin', 
            'Deleted a Message'
        );
    };

    const filteredSubjects = subjects.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="w-full max-w-5xl mx-auto h-[calc(100vh-20px)] md:h-[calc(100vh-40px)] flex flex-col relative">
            <AnimatePresence mode="wait">
                {view === 'list' && (
                    <motion.div key="list" {...({ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -20 } } as any)} className="flex flex-col gap-6 h-full pb-20">
                        
                        {/* Header Area - Pushed Down */}
                        <div className="flex gap-4 items-center mt-12 md:mt-16">
                            <div className="flex-1 relative">
                                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchPlaceholder')} className="w-full p-4 pl-12 rounded-2xl bg-white/5 border border-white/10 text-white outline-none focus:border-orange-500 transition-colors" disabled={loading && subjects.length === 0} />
                                <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                            </div>
                            <motion.button onClick={handleCreateClick} {...({ whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 } } as any)} className={`px-6 py-4 rounded-2xl text-white font-bold flex items-center gap-2 shadow-lg bg-orange-600`}>
                                <Icons.Plus className="w-5 h-5" /><span className="hidden md:inline">{t('createForm')}</span>
                            </motion.button>
                        </div>

                        {loading && subjects.length === 0 ? <div className="flex-1 flex items-center justify-center"><Icons.Loader2 className="w-12 h-12 text-orange-500 animate-spin" /></div> : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pr-2">
                                {filteredSubjects.map(sub => {
                                    return (
                                        <div key={sub.id} onClick={() => handleSubjectClick(sub)} className="group relative bg-[#121212] border border-white/10 rounded-2xl p-4 cursor-pointer hover:border-orange-500/50 hover:bg-white/5 transition-all flex gap-4 overflow-hidden h-[120px]">
                                            <div className="flex-1 flex flex-col justify-between z-10 overflow-hidden">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">{sub.title}</h3>
                                                    <p className="text-gray-400 text-sm line-clamp-2">{sub.initialMessage.content}</p>
                                                </div>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                    <span>{sub.initialMessage.author.name}</span>
                                                    <span>•</span>
                                                    <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Admin Delete Button on Hover */}
                                            {isAdmin && (
                                                <motion.button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteSubject(sub.id, sub.title); }} 
                                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-20 hover:scale-110" 
                                                    whileTap={{ scale: 0.9 }}
                                                >
                                                    <Icons.Trash2 className="w-4 h-4" />
                                                </motion.button>
                                            )}
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
                            <button onClick={() => { setView('list'); setCurrentSubject(null); }} className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} md:top-6 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white`}>
                                <Icons.X className="w-5 h-5" />
                            </button>
                            <div className={`flex flex-col gap-1 mb-4 ${dir === 'rtl' ? 'pl-10 text-right' : 'pr-10 text-left'}`}>
                                <h2 className="text-2xl font-black text-white line-clamp-1">{currentSubject.title}</h2>
                                <div className="flex gap-2 text-sm text-gray-400">
                                    <span className="text-orange-500 font-bold">{currentSubject.initialMessage.author.name}</span>
                                    <span>•</span>
                                    <span>{currentSubject.createdAt}</span>
                                </div>
                            </div>
                            <p className="text-gray-200 whitespace-pre-wrap leading-relaxed mb-4 text-right px-2">{currentSubject.initialMessage.content}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3">
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
                        <div className="p-3 md:p-4 bg-[#121212] border-t border-white/10 relative z-20">
                            {replyTo && (<div className="flex items-center justify-between bg-blue-500/10 border-r-4 border-blue-500 p-2 mb-2 rounded text-xs mx-1"><div className="flex items-center gap-2"><span className="text-gray-300">{replyTo.author.name}</span><span className="font-bold text-blue-400">:{t('replyingTo')}</span></div><button onClick={() => setReplyTo(null)}><Icons.X className="w-4 h-4 text-gray-400" /></button></div>)}
                            <div className="flex gap-3 items-end">
                                <motion.button onClick={handleSendMessage} disabled={(chatInput.length === 0)} {...({ whileTap: { scale: 0.9 } } as any)} className={`p-0 rounded-full flex-shrink-0 h-[50px] w-[50px] flex items-center justify-center transition-all bg-orange-500 hover:bg-orange-600 text-white shadow-lg`}>
                                    <Icons.Send className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
                                </motion.button>
                                <div className="flex-1 bg-white/5 rounded-[24px] border border-white/10 flex flex-col overflow-hidden focus-within:border-orange-500/50 transition-colors min-h-[50px]">
                                    <textarea value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder={t('messagePlaceholder')} className="w-full p-3 px-4 bg-transparent text-white outline-none resize-none max-h-32 h-full min-h-[50px] leading-[24px]" style={{ height: 'auto', textAlign: 'right' }} onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>{showCreate && <CreateSubjectModal onClose={() => setShowCreate(false)} onSuccess={fetchSubjects} />}</AnimatePresence>
        </div>
    );
};
