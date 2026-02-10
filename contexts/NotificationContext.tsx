
import React, { createContext, useContext, useCallback, useState, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../constants';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    duration?: number;
}

interface NotificationContextType {
    addToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: 'success' | 'error' | 'info', duration = 3000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type, duration }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    return (
        <NotificationContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[10000] flex flex-col gap-2 items-end pointer-events-none">
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 50, scale: 0.9 }}
                            layout
                            className={`pointer-events-auto min-w-[250px] p-4 rounded-xl border backdrop-blur-md shadow-2xl flex items-center gap-3 ${
                                toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                                toast.type === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                                'bg-blue-500/10 border-blue-500/30 text-blue-500'
                            }`}
                        >
                            {toast.type === 'success' ? <Icons.CheckCircle2 className="w-5 h-5 shrink-0" /> :
                             toast.type === 'error' ? <Icons.AlertCircle className="w-5 h-5 shrink-0" /> :
                             <Icons.AlertTriangle className="w-5 h-5 shrink-0" />}
                            <span className="font-bold text-sm">{toast.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useToast must be used within NotificationProvider");
    return context;
};
