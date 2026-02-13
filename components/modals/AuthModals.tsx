
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Icons, ADMIN_CREDENTIALS } from '../../constants';
import { useI18n } from '../../contexts/I18nContext';
import { GlassCard } from '../ui/GlassCard';
import { InputWithEye } from '../ui/SharedInputs';
import { logAction } from '../../utils/logging';

export const AdminAuthModal: React.FC<{ onClose: () => void; onLogin: () => void }> = ({ onClose, onLogin }) => {
    const { t } = useI18n();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authCode, setAuthCode] = useState('');
    const [shake, setShake] = useState({ username: false, password: false, auth: false, button: false });
    const [isSuccess, setIsSuccess] = useState(false);

    // Helper to remove invisible unicode characters that might be copied by mistake
    const sanitize = (str: string) => str.replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, '').trim();

    const handleLogin = () => {
        let hasError = false;
        const newShake = { username: false, password: false, auth: false, button: false };

        const cleanUser = sanitize(username);
        const cleanPass = sanitize(password);
        const cleanCode = sanitize(authCode);

        if (!cleanUser) { newShake.username = true; hasError = true; }
        if (!cleanPass) { newShake.password = true; hasError = true; }
        if (!cleanCode) { newShake.auth = true; hasError = true; }

        if (hasError) {
            setShake(newShake);
            setTimeout(() => setShake({ username: false, password: false, auth: false, button: false }), 500);
            return;
        }

        // Check against constants
        if (cleanUser === ADMIN_CREDENTIALS.username && cleanPass === ADMIN_CREDENTIALS.password && cleanCode === ADMIN_CREDENTIALS.authCode) {
            logAction('admin', `Admin Login: ${cleanUser}`, `Auth Code used: ${cleanCode}`);
            
            // Store unique hash for session validation
            const sessionHash = btoa(`${cleanUser}:${cleanPass}:${cleanCode}`);
            localStorage.setItem('mtnews-auth-hash', sessionHash);
            
            setIsSuccess(true);
            setTimeout(() => {
                onLogin();
                onClose();
            }, 1500);
        } else {
            console.error('Login Failed. Input:', { cleanUser, cleanPass, cleanCode });
            setShake({ ...newShake, button: true, username: true, password: true, auth: true });
            setTimeout(() => setShake({ username: false, password: false, auth: false, button: false }), 500);
        }
    };

    const getInputClass = (isShake: boolean) => 
        `w-full p-4 pl-12 rounded-xl bg-white/5 border ${isShake ? 'border-red-500 animate-shake' : 'border-white/10'} focus:outline-none focus:border-orange-500 transition-colors text-white`;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <GlassCard className="w-full max-w-sm flex flex-col gap-6 relative" noRound>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">{t('login')}</h3>
                    <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-full"><Icons.X className="w-6 h-6 text-gray-400" /></button>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <Icons.UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder={t('username')} className={getInputClass(shake.username)} />
                    </div>
                    <InputWithEye value={password} onChange={setPassword} placeholder={t('password')} icon={Icons.Key} />
                    <InputWithEye value={authCode} onChange={setAuthCode} placeholder={t('authenticate')} icon={Icons.ShieldCheck} />
                </div>

                <motion.button 
                    onClick={handleLogin} 
                    {...({ animate: shake.button ? { x: [-5, 5, -5, 5, 0] } : {} } as any)}
                    className={`w-full py-4 font-black text-lg rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${isSuccess ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:shadow-orange-500/25'}`}
                >
                    {isSuccess ? <><Icons.Check className="w-6 h-6" /> {t('loginSuccess')}</> : t('login')}
                </motion.button>
            </GlassCard>
        </div>
    );
};
