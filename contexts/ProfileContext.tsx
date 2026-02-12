
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useLocalStorage } from '../hooks';
import { UserProfile } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { Icons } from '../constants';
import { useI18n } from './I18nContext';
import { GlassCard } from '../components/ui/GlassCard';
import { ImageUploadControl } from '../components/ui/SharedInputs';
import { AsyncButton } from '../components/ui/AsyncButton';

interface ProfileContextType {
    profile: UserProfile | null;
    updateProfile: (name: string, avatar: string) => void;
    openProfileModal: () => void;
    hasProfile: boolean;
}

const ProfileContext = createContext<ProfileContextType | null>(null);

const ProfileModal: React.FC<{ onClose: () => void; currentProfile: UserProfile | null; onSave: (name: string, avatar: string) => void }> = ({ onClose, currentProfile, onSave }) => {
    const { t } = useI18n();
    const [name, setName] = useState(currentProfile?.name || '');
    const [avatar, setAvatar] = useState(currentProfile?.avatar || '');

    const handleSave = async (signal: AbortSignal) => {
        if (!name || (!avatar && !currentProfile)) {
            alert(t('fillAllFields'));
            throw new Error("Missing Fields");
        }
        onSave(name, avatar || currentProfile?.avatar || '');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[10000] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-sm flex flex-col gap-6" noRound>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">{currentProfile ? t('changeProfile') : t('createProfile')}</h3>
                    <button onClick={onClose}><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>
                
                <div className="flex flex-col gap-4">
                    <div className="flex justify-center mb-2">
                        <div className="w-24 h-24 rounded-full bg-white/10 overflow-hidden border-2 border-dashed border-white/20 flex items-center justify-center relative group">
                            {avatar ? (
                                <img src={avatar} className="w-full h-full object-cover" />
                            ) : (
                                <Icons.UserCircle className="w-12 h-12 text-gray-500" />
                            )}
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase font-bold">{t('profileName')}</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white" />
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs text-gray-400 uppercase font-bold">{t('profileAvatar')}</label>
                        <ImageUploadControl 
                            singleMode 
                            onUrlsChange={(urls) => setAvatar(urls[0])} 
                            onFilesChange={() => {}} 
                        />
                    </div>

                    <div className="flex gap-3 mt-2">
                        <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold">{t('cancel')}</button>
                        <AsyncButton onClick={handleSave} label={currentProfile ? t('saveChanges') : t('create')} variant="success" className="flex-1" />
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [profile, setProfile] = useLocalStorage<UserProfile | null>('mtnews-user-profile', null);
    const [showModal, setShowModal] = useState(false);

    const updateProfile = (name: string, avatar: string) => {
        setProfile({ name, avatar });
    };

    return (
        <ProfileContext.Provider value={{ 
            profile, 
            updateProfile, 
            openProfileModal: () => setShowModal(true),
            hasProfile: !!profile
        }}>
            {children}
            <AnimatePresence>
                {showModal && <ProfileModal onClose={() => setShowModal(false)} currentProfile={profile} onSave={updateProfile} />}
            </AnimatePresence>
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (!context) throw new Error("useProfile must be used within ProfileProvider");
    return context;
};
