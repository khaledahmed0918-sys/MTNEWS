
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from './types';
import { ADMIN_CREDENTIALS } from './constants';

// Providers
import { I18nProvider } from './contexts/I18nContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GlobalActionsLayer } from './contexts/GlobalActionsContext';
import { ImageProvider } from './contexts/ImageContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Components
import { SnowEffect } from './components/SnowEffect';
import { AdminAuthModal } from './components/modals/AuthModals';
import { LogoutConfirmModal } from './components/modals/ConfirmationModals';

// Layout
import { Header } from './layout/Header';
import { NavBar } from './layout/NavBar';

// Sections
import { HomePage } from './sections/Home';
import { LivePage } from './sections/live/LivePage';
import { VotesPage } from './sections/votes/VotesPage';
import { MapPageFull } from './sections/Map';
import { ThreadsPage, LinksPage, CreditsPage } from './sections/Media';
import { ImagesPage } from './sections/images/ImagesPage';
import { LogsPage } from './sections/Logs';

// --- ANIMATED BACKGROUND ---
const AnimatedBackground: React.FC = () => (
    <div className="fixed inset-0 -z-10 w-full h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-gray-200 to-slate-300 dark:from-[#1a0500] dark:via-[#2a1000] dark:to-black bg-[200%_200%] animate-gradientBG transition-colors duration-500" />
    </div>
);

// --- MAIN APP COMPONENT ---
const AppContent: React.FC = () => {
    const [activeSection, setActiveSection] = useState<Section>('Home');
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [snowEnabled, setSnowEnabled] = useState(false);

    useEffect(() => {
        const hash = localStorage.getItem('mtnews-auth-hash');
        if (hash) {
            const decoded = atob(hash);
            const [u, p, c] = decoded.split(':');
            if (u === ADMIN_CREDENTIALS.username && p === ADMIN_CREDENTIALS.password && c === ADMIN_CREDENTIALS.authCode) {
                setIsAdmin(true);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('mtnews-auth-hash');
        setIsAdmin(false);
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'Home': return <HomePage />;
            case 'Live': return <LivePage snowEnabled={snowEnabled} />;
            case 'Votes': return <VotesPage isAdmin={isAdmin} />;
            case 'Map': return <MapPageFull />;
            case 'Threads': return <ThreadsPage />;
            case 'Images': return <ImagesPage isAdmin={isAdmin} />;
            case 'Links': return <LinksPage />;
            case 'Credits': return <CreditsPage />;
            case 'Logs': return <LogsPage />;
            default: return <HomePage />;
        }
    };

    return (
        <div className="min-h-screen text-white font-sans selection:bg-orange-500/30 selection:text-orange-200 overflow-x-hidden">
            <AnimatedBackground />
            <SnowEffect enabled={snowEnabled} />
            
            <Header 
                activeSection={activeSection} 
                isAdmin={isAdmin} 
                onAdminClick={() => isAdmin ? setShowLogoutModal(true) : setShowAuthModal(true)} 
                snowEnabled={snowEnabled}
                toggleSnow={() => setSnowEnabled(!snowEnabled)}
            />
            
            <NavBar activeSection={activeSection} setActiveSection={setActiveSection} isAdmin={isAdmin} />

            <main className="p-4 md:p-6 pb-20 pt-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderSection()}
                    </motion.div>
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {showAuthModal && <AdminAuthModal onClose={() => setShowAuthModal(false)} onLogin={() => setIsAdmin(true)} />}
                {showLogoutModal && <LogoutConfirmModal onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />}
            </AnimatePresence>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <I18nProvider>
                <NotificationProvider>
                    <GlobalActionsLayer>
                        <ImageProvider>
                            <AppContent />
                        </ImageProvider>
                    </GlobalActionsLayer>
                </NotificationProvider>
            </I18nProvider>
        </ErrorBoundary>
    );
};

export default App;
