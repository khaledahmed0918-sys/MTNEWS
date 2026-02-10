
import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Icons } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { GlassCard } from '../components/ui/GlassCard';
import { LogEntry } from '../types';
import { db, ref, onValue, get, set } from '../firebase';
import { setLoggingStatus } from '../utils/logging';
import { useGlobalActions } from '../contexts/GlobalActionsContext';

// --- ADMIN DATA MANAGER MODAL ---
const AdminDataManagerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useI18n();
    const { requestDelete } = useGlobalActions();

    const handleReset = (path: string, labelKey: string) => {
         requestDelete(
            t('confirmReset'),
            t(labelKey),
            [path],
            async () => {
                const snap = await get(ref(db, path));
                return [{ path, data: snap.val() }];
            }
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-sm flex flex-col gap-4" noRound>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold">{t('dataManager')}</h3>
                    <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>
                <div className="flex flex-col gap-2">
                    <button onClick={() => handleReset('threads', 'resetThreads')} className="p-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-colors text-left text-red-400">{t('resetThreads')}</button>
                    <button onClick={() => handleReset('images', 'resetImages')} className="p-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-colors text-left text-red-400">{t('resetImages')}</button>
                    <button onClick={() => handleReset('votes/groups', 'resetCategories')} className="p-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-colors text-left text-red-400">{t('resetCategories')}</button>
                    <button onClick={() => handleReset('votes/data', 'resetCharacters')} className="p-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-colors text-left text-red-400">{t('resetCharacters')}</button>
                    <button onClick={() => handleReset('logs', 'resetLogs')} className="p-3 bg-red-500/10 border border-red-500/30 hover:bg-red-500 hover:text-white rounded-xl font-bold transition-colors text-left text-red-400">{t('resetLogs')}</button>
                </div>
            </GlassCard>
        </div>
    );
};

export const LogsPage: React.FC = () => {
    const { t, dir } = useI18n();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'vote' | 'admin' | 'system' | 'image'>('all');
    const [showDataManager, setShowDataManager] = useState(false);
    const [isLoggingEnabled, setIsLoggingEnabled] = useState<boolean | null>(null);

    useEffect(() => {
        const logsRef = ref(db, 'logs');
        const q = logsRef;
        const unsubscribeLogs = onValue(q, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.entries(data).map(([k, v]: [string, any]) => ({
                    id: k,
                    ...v
                })).sort((a, b) => b.timestamp - a.timestamp);
                setLogs(list);
            } else {
                setLogs([]);
            }
        });

        const configRef = ref(db, 'config/loggingEnabled');
        const unsubscribeConfig = onValue(configRef, (snapshot) => {
            const status = snapshot.val() !== false;
            setIsLoggingEnabled(status);
            setLoggingStatus(status);
        });

        return () => {
            unsubscribeLogs();
            unsubscribeConfig();
        };

    }, []);

    const filteredLogs = logs.filter(log => {
        if (filter !== 'all' && log.type !== filter) return false;
        if (search) {
            const term = search.toLowerCase();
            return log.message.toLowerCase().includes(term) || (log.details || '').toLowerCase().includes(term);
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
                 <h2 className="text-2xl font-bold flex items-center gap-2">
                     <Icons.FileText className="w-6 h-6 text-orange-500" />
                     {t('logsTitle')}
                 </h2>
                 <div className="flex gap-2 w-full md:w-auto">
                     <button onClick={() => setShowDataManager(true)} className="px-4 py-2 bg-blue-600 rounded-lg text-white font-bold flex items-center gap-2">
                         <Icons.Database className="w-4 h-4" /> {t('manager')}
                     </button>
                     <div className="relative flex-1 md:w-64">
                         <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('searchLogs')} className="w-full p-2 pl-8 rounded-lg bg-white/5 border border-white/10 text-white" />
                         <Icons.Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                     </div>
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
                         {filteredLogs.map(log => (
                             <div key={log.id} className="grid grid-cols-12 gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors items-center text-sm border-b border-white/5 last:border-0">
                                 <div className="col-span-3 md:col-span-2 text-gray-400 font-mono text-xs">
                                     {new Date(log.timestamp).toLocaleString()}
                                 </div>
                                 <div className="col-span-2 md:col-span-1">
                                     <span className={`px-2 py-1 rounded text-xs font-bold border uppercase ${getTypeColor(log.type)}`}>
                                         {log.type}
                                     </span>
                                 </div>
                                 <div className="col-span-7 md:col-span-9 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                                     <span className="font-bold text-white">{log.message}</span>
                                     {log.details && <span className="text-gray-500 truncate">{log.details}</span>}
                                 </div>
                             </div>
                         ))}
                     </div>
                 ) : (
                     <div className="flex flex-col items-center justify-center h-full text-gray-500">
                         <Icons.SearchX className="w-12 h-12 mb-2 opacity-50" />
                         <p>{t('noLogs')}</p>
                     </div>
                 )}
             </div>

             <AnimatePresence>
                {showDataManager && <AdminDataManagerModal onClose={() => setShowDataManager(false)} />}
             </AnimatePresence>
        </div>
    );
};
