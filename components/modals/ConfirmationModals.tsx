
import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { AsyncButton } from '../ui/AsyncButton';
import { GlassCard } from '../ui/GlassCard';

export const ConfirmDeleteModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    title: string; 
    message: string; 
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
    const { t } = useI18n();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg z-[10000] flex items-center justify-center p-4">
            <motion.div 
                {...({
                    initial: { opacity: 0, scale: 0.9 },
                    animate: { opacity: 1, scale: 1 },
                    exit: { opacity: 0, scale: 0.9 }
                } as any)}
                className="w-full max-w-sm bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
            >
                <div className="flex flex-col items-center text-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/30">
                        <Icons.Trash2 className="w-10 h-10 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
                    </div>
                    <div className="flex gap-3 w-full mt-2">
                        <button 
                            onClick={onClose}
                            className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-gray-300 transition-colors"
                        >
                            {t('cancel')}
                        </button>
                        <AsyncButton 
                            onClick={async () => { await onConfirm(); onClose(); }}
                            label={t('confirm')}
                            variant="danger"
                            className="flex-1"
                            progressSpeed="fast"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export const UndoNotification: React.FC<{ 
    isOpen: boolean; 
    onRestore: () => void; 
    progress: number;
    text: string;
}> = ({ isOpen, onRestore, progress, text }) => {
    const { t } = useI18n();
    if (!isOpen) return null;

    return (
        <motion.div 
            {...({
                initial: { y: 100, opacity: 0 },
                animate: { y: 0, opacity: 1 },
                exit: { y: 100, opacity: 0 }
            } as any)}
            className="fixed bottom-8 right-8 z-[10000] flex flex-col items-center pointer-events-auto"
        >
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-1 shadow-2xl flex items-center gap-4 pl-4 pr-1.5 py-1.5 overflow-hidden relative min-w-[300px]">
                <div className="absolute bottom-0 left-0 h-0.5 bg-orange-500 transition-all ease-linear" style={{ width: `${progress}%` }}></div>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Icons.Trash className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="font-bold text-sm text-white">{text}</span>
                </div>
                <div className="ml-auto">
                    <button 
                        onClick={onRestore}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1"
                    >
                        <Icons.RotateCcw className="w-3 h-3" />
                        {t('restore')}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export const LogoutConfirmModal: React.FC<{ onClose: () => void; onConfirm: () => void }> = ({ onClose, onConfirm }) => {
    const { t } = useI18n();
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-sm flex flex-col items-center gap-6 text-center" noRound>
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/50">
                    <Icons.LogOut className="w-8 h-8 text-red-500 ml-1" />
                </div>
                <h3 className="text-xl font-bold">{t('confirmLogout')}</h3>
                <div className="flex gap-4 w-full">
                     <button onClick={onClose} className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors font-bold">{t('cancel')}</button>
                     <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-bold shadow-lg shadow-red-500/20">{t('confirm')}</button>
                </div>
            </GlassCard>
        </div>
    );
};
