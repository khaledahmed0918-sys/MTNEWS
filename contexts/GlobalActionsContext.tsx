
import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { db, ref, remove, set } from '../firebase';
import { useI18n } from './I18nContext';
import { useToast } from './NotificationContext';
import { ConfirmDeleteModal, UndoNotification } from '../components/modals/ConfirmationModals';

interface RestoreData {
    path: string;
    data: any;
}

interface DeleteRequest {
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
}

interface GlobalActionsContextType {
    requestDelete: (title: string, message: string, pathsToDelete: string[], restoreDataCollector?: () => Promise<RestoreData[]>) => void;
}

const GlobalActionsContext = createContext<GlobalActionsContextType | null>(null);

export const GlobalActionsLayer: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { t } = useI18n();
    const { addToast } = useToast();
    const [deleteReq, setDeleteReq] = useState<DeleteRequest & { paths: string[], restoreCollector?: () => Promise<RestoreData[]> } | null>(null);
    const [undoState, setUndoState] = useState<{ progress: number, data: RestoreData[] } | null>(null);
    const undoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const requestDelete = (title: string, message: string, paths: string[], restoreDataCollector?: () => Promise<RestoreData[]>) => {
        setDeleteReq({
             title,
             message,
             paths,
             onConfirm: async () => {
                 // Collect restore data first if needed
                 let dataToRestore: RestoreData[] = [];
                 if (restoreDataCollector) {
                     try {
                        dataToRestore = await restoreDataCollector();
                     } catch(e) { console.error("Failed to collect restore data", e); }
                 }

                 // Perform delete
                 for(const path of paths) await remove(ref(db, path));
                 addToast(t('itemDeleted'), 'info');

                 // Start Undo UI if data exists
                 if (dataToRestore.length > 0) {
                     let progress = 0;
                     setUndoState({ progress: 0, data: dataToRestore });
                     
                     if (undoTimerRef.current) clearInterval(undoTimerRef.current);
                     undoTimerRef.current = setInterval(() => {
                         progress += 2; // 50ms * 50 = 2500ms approx total or adjust for 5s
                         setUndoState(prev => prev ? { ...prev, progress } : null);
                         if (progress >= 100) {
                             if (undoTimerRef.current) clearInterval(undoTimerRef.current);
                             setUndoState(null);
                         }
                     }, 100); // 100ms * 50 steps = 5 seconds
                 }
             }
        });
    };

    const handleRestore = async () => {
        if (undoState && undoState.data.length > 0) {
            if (undoTimerRef.current) clearInterval(undoTimerRef.current);
            for(const item of undoState.data) {
                await set(ref(db, item.path), item.data);
            }
            addToast(t('restored'), 'success');
            setUndoState(null);
        }
    };

    return (
        <GlobalActionsContext.Provider value={{ requestDelete }}>
            {children}
            {deleteReq && (
                <ConfirmDeleteModal 
                    isOpen={true} 
                    onClose={() => setDeleteReq(null)} 
                    onConfirm={deleteReq.onConfirm} 
                    title={deleteReq.title} 
                    message={deleteReq.message} 
                />
            )}
            {undoState && (
                <UndoNotification 
                    isOpen={true} 
                    onRestore={handleRestore} 
                    progress={undoState.progress} 
                    text={t('itemDeleted')} 
                />
            )}
        </GlobalActionsContext.Provider>
    );
};

export const useGlobalActions = () => {
    const context = useContext(GlobalActionsContext);
    if (!context) throw new Error("useGlobalActions must be used within GlobalActionsProvider");
    return context;
};
