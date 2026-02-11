
import React, { createContext, useContext, useState, useRef, ReactNode, useCallback } from 'react';
import { useI18n } from './I18nContext';
import { ConfirmDeleteModal, UndoNotification } from '../components/modals/ConfirmationModals';
import { logAction } from '../utils/logging';

interface DeleteRequest {
    title: string;
    message: string;
    onConfirm: () => Promise<void>;
}

interface GlobalActionsContextType {
    requestDelete: (
        title: string, 
        message: string, 
        deleteAction: () => Promise<void>, 
        restoreAction?: () => Promise<void>,
        logType?: string,
        logMessage?: string
    ) => void;
}

const GlobalActionsContext = createContext<GlobalActionsContextType | null>(null);

export const GlobalActionsLayer: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { t } = useI18n();
    const [deleteReq, setDeleteReq] = useState<DeleteRequest | null>(null);
    const [undoState, setUndoState] = useState<{ progress: number, restore: () => Promise<void>, text: string } | null>(null);
    const undoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const requestDelete = useCallback((
        title: string, 
        message: string, 
        deleteAction: () => Promise<void>, 
        restoreAction?: () => Promise<void>,
        logType: string = 'system',
        logMessage: string = 'Item deleted'
    ) => {
        setDeleteReq({
             title,
             message,
             onConfirm: async () => {
                 try {
                     // 1. Perform Delete
                     await deleteAction();
                     
                     // 2. Log Action
                     logAction(logType, logMessage, 'Deleted via Global Action');

                     // 3. Start Undo Logic if restore action is provided
                     if (restoreAction) {
                         if (undoTimerRef.current) clearInterval(undoTimerRef.current);
                         
                         let progress = 0;
                         setUndoState({ 
                             progress: 0, 
                             restore: restoreAction,
                             text: logMessage 
                         });
                         
                         undoTimerRef.current = setInterval(() => {
                             progress += 2; // 50 steps * 100ms = 5000ms = 5s
                             setUndoState(prev => prev ? { ...prev, progress } : null);
                             
                             if (progress >= 100) {
                                 if (undoTimerRef.current) clearInterval(undoTimerRef.current);
                                 setUndoState(null);
                             }
                         }, 100);
                     }
                 } catch (e) {
                     console.error("Delete action failed");
                 }
             }
        });
    }, []);

    const handleRestore = async () => {
        if (undoState?.restore) {
            if (undoTimerRef.current) clearInterval(undoTimerRef.current);
            try {
                await undoState.restore();
                logAction('system', 'Item Restored', undoState.text);
            } catch (e) {
                console.error("Restore failed");
            }
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
