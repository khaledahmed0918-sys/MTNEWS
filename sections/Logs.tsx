
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Icons, API_BASE } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { GlassCard } from '../components/ui/GlassCard';
import { LogEntry } from '../types';
import { AsyncButton } from '../components/ui/AsyncButton';
import { robustFetch } from '../utils/apiWrapper';

const AdminDataManagerModal: React.FC<{ onClose: () => void; onRefresh: () => void }> = ({ onClose, onRefresh }) => {
    const { t } = useI18n();

    const handleReset = async (signal: AbortSignal, type: string) => {
         if(!confirm(t('confirmReset'))) return;
         await robustFetch('/logs/remove', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ type }),
             signal
         });
         onRefresh();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-sm flex flex-col gap-4" noRound>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold">{t('dataManager')}</h3>
                    <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="flex flex-col gap-2">
                    <AsyncButton onClick={(s) => handleReset(s, 'admin')} label="Reset Admin Logs" variant="danger" className="w-full text-left" />
                    <AsyncButton onClick={(s) => handleReset(s, 'vote')} label="Reset Vote Logs" variant="danger" className="w-full text-left" />
                    <AsyncButton onClick={(s) => handleReset(s, 'image')} label="Reset Image Logs" variant="danger" className="w-full text-left" />
                    <AsyncButton onClick={(s) => handleReset(s, 'system')} label="Reset System Logs" variant="danger" className="w-full text-left" />
                </div>
            </GlassCard>
        </div>
    );
};

export const LogsPage: React.FC = () => {
    const { t } = useI18n();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'vote' | 'admin' | 'system' | 'image'>('all');
    const [showDataManager, setShowDataManager] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchLogs = async (signal?: AbortSignal) => {
        try {
            const res = await robustFetch('/logs', { signal, skipErrorLog: true });
            if (res.ok && !signal?.aborted) setLogs((await res.json()).reverse());
        } catch (e: any) {}
    };

    useEffect(() => {
        const controller = new AbortController();
        fetchLogs(controller.signal);
        
        const interval = setInterval(() => {
            fetchLogs(controller.signal);
        }, 15000); 
        
        return () => {
            controller.abort();
            clearInterval(interval);
        };
    }, [refreshTrigger]);

    const handleManualRefresh = () => {
        setLogs([]); 
        setRefreshTrigger(prev => prev + 1);
    };

    const filteredLogs = logs.filter(log => {
        if (filter !== 'all' && log.type !== filter) return false;
        if (search) {
            const term = search.toLowerCase();
            return log.message.toLowerCase().includes(term);
        }
        return true;
    });

    const getTypeColor = (type: string) => {
        switch(type) {
            case 'admin': return 'text-red-500 bg-red-500/10 border-red-500/20';
            case 'vote': return 'text-green-500 bg-green-500/10 border-green-500/20';
            case 'image': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
            default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
        }
    };
    
    return (
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 h-[80vh]">
             <div className="flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
                 <h2 className="text-2xl font-bold flex items-center gap-2"><Icons.FileText className="w-6 h-6 text-orange-500" />{t('logsTitle')}</h2>
                 <div className="flex gap-2 w-full md:w-auto">
                     <button onClick={() => setShowDataManager(true)} className="px-4 py-2 bg-blue-600 rounded-lg text-white font-bold flex items-center gap-2"><Icons.Database className="w-4 h-4" /> {t('manager')}</button>
                     <div className="relative flex-1 md:w-64"><input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchLogs')} className="w-full p-2 pl-8 rounded-lg bg-white/5 border border-white/10 text-white" /><Icons.Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /></div>
                     <select value={filter} onChange={e => setFilter(e.target.value as any)} className="bg-black/40 text-white rounded-lg p-2 border border-white/10 outline-none">
                         <option value="all">{t('allTypes')}</option>
                         <option value="admin">{t('typeAdmin')}</option>
                         <option value="vote">{t('typeVote')}</option>
                         <option value="image">{t('typeImage')}</option>
                         <option value="system">{t('typeSystem')}</option>
                     </select>
                 </div>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 rounded-2xl border border-white/5 p-2">
                 {filteredLogs.length > 0 ? (
                     <div className="flex flex-col gap-1">
                         {filteredLogs.map((log, idx) => (
                             <div key={idx} className="grid grid-cols-12 gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors items-center text-sm border-b border-white/5 last:border-0">
                                 <div className="col-span-3 md:col-span-2 text-gray-400 font-mono text-xs">{log.date}</div>
                                 <div className="col-span-2 md:col-span-1"><span className={`px-2 py-1 rounded text-xs font-bold border uppercase ${getTypeColor(log.type)}`}>{log.type}</span></div>
                                 <div className="col-span-7 md:col-span-9 flex flex-col md:flex-row md:items-center gap-1 md:gap-4"><span className="font-bold text-white">{log.message}</span></div>
                             </div>
                         ))}
                     </div>
                 ) : (
                     <div className="flex flex-col items-center justify-center h-full text-gray-500"><Icons.SearchX className="w-12 h-12 mb-2 opacity-50" /><p>{t('noLogs')}</p></div>
                 )}
             </div>
             <AnimatePresence>{showDataManager && <AdminDataManagerModal onClose={() => setShowDataManager(false)} onRefresh={handleManualRefresh} />}</AnimatePresence>
        </div>
    );
};
