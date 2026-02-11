
import React, { useState, useEffect, useRef, useLayoutEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from './types';
import { ADMIN_CREDENTIALS, Icons } from './constants';

// Providers
import { I18nProvider } from './contexts/I18nContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GlobalActionsLayer } from './contexts/GlobalActionsContext';
import { ErrorBoundary } from './components/ErrorBoundary';

// Components
import { SnowEffect } from './components/SnowEffect';
import { AdminAuthModal } from './components/modals/AuthModals';
import { LogoutConfirmModal } from './components/modals/ConfirmationModals';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Hotbar } from './components/layout/Hotbar';

// Lazy Load Sections for Performance
const HomePage = lazy(() => import('./sections/Home').then(module => ({ default: module.HomePage })));
const LivePage = lazy(() => import('./sections/live/LivePage').then(module => ({ default: module.LivePage })));
const VotesPage = lazy(() => import('./sections/votes/VotesPage').then(module => ({ default: module.VotesPage })));
const MapPageFull = lazy(() => import('./sections/Map').then(module => ({ default: module.MapPageFull })));

// Split modules
const ThreadsPage = lazy(() => import('./sections/Threads').then(module => ({ default: module.ThreadsPage })));
const LinksPage = lazy(() => import('./sections/Links').then(module => ({ default: module.LinksPage })));
const CreditsPage = lazy(() => import('./sections/Credits').then(module => ({ default: module.CreditsPage })));

const ImagesPage = lazy(() => import('./sections/images/ImagesPage').then(module => ({ default: module.ImagesPage })));
const LogsPage = lazy(() => import('./sections/Logs').then(module => ({ default: module.LogsPage })));

// Loading Component
const SectionLoader = () => (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <Icons.Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <span className="text-gray-400 font-bold animate-pulse">Loading Content...</span>
    </div>
);

// --- MAIN APP CONTENT ---
const AppContent: React.FC = () => {
    const [activeSection, setActiveSection] = useState<Section>('Home');
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [snowEnabled, setSnowEnabled] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    
    // Sidebar State (Mobile)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Initial Auth Check & Visitor Tracking
    useEffect(() => {
        // Clear caches logic to ensure fresh data
        if ('caches' in window) {
            caches.keys().then((names) => {
                names.forEach((name) => {
                    caches.delete(name);
                });
            });
        }

        const hash = localStorage.getItem('mtnews-auth-hash');
        if (hash) {
            const decoded = atob(hash);
            const [u, p, c] = decoded.split(':');
            if (u === ADMIN_CREDENTIALS.username && p === ADMIN_CREDENTIALS.password && c === ADMIN_CREDENTIALS.authCode) {
                setIsAdmin(true);
            }
        }
        
        // Track Visitor
        fetch("https://dolabriform-fascinatedly-lecia.ngrok-free.dev/visitor", { 
             method: "POST",
             headers: { "ngrok-skip-browser-warning": "true" } 
        }).catch(() => {});
    }, []);

    // Scroll to top when section changes
    useLayoutEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, [activeSection]);

    // Close mobile menu when section changes
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [activeSection]);

    const handleLogout = () => {
        localStorage.removeItem('mtnews-auth-hash');
        setIsAdmin(false);
    };

    const handleAdminClick = () => {
        if (isAdmin) {
            setShowLogoutModal(true);
        } else {
            setShowAuthModal(true);
        }
    };

    // Render Section Logic
    const renderSection = () => {
        return (
            <Suspense fallback={<SectionLoader />}>
                {(() => {
                    switch (activeSection) {
                        case 'Home': return <HomePage setActiveSection={setActiveSection} />;
                        case 'Live': return <LivePage snowEnabled={snowEnabled} isAdmin={isAdmin} />;
                        case 'Votes': return <VotesPage isAdmin={isAdmin} />;
                        // Case 'Map' is handled separately to keep it alive
                        case 'Threads': return <ThreadsPage />;
                        case 'Images': return <ImagesPage isAdmin={isAdmin} />;
                        case 'Links': return <LinksPage />;
                        case 'Credits': return <CreditsPage />;
                        case 'Logs': return <LogsPage />;
                        default: return <HomePage setActiveSection={setActiveSection} />;
                    }
                })()}
            </Suspense>
        );
    };

    return (
        <div className="flex h-screen w-full bg-[#050505] text-white font-sans selection:bg-orange-500/30 selection:text-orange-200 overflow-hidden relative">
            <SnowEffect enabled={snowEnabled} />

            {/* Sidebar (Desktop & Mobile) */}
            <Sidebar 
                activeSection={activeSection} 
                setActiveSection={setActiveSection} 
                isAdmin={isAdmin}
                onAdminClick={handleAdminClick}
                snowEnabled={snowEnabled}
                toggleSnow={() => setSnowEnabled(!snowEnabled)}
                isMobileOpen={isMobileMenuOpen}
                toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />

            {/* Main Content Area */}
            <main 
                className={`flex-1 h-full overflow-hidden relative flex flex-col z-10 transition-all duration-300 ease-in-out`}
            >
                {/* Content Container - Scrollable */}
                <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-4 md:p-8 pb-32 md:pb-8">
                    {/* Persistent Map Layer (Always mounted, hidden when inactive to preserve WebGL context) */}
                    <div 
                        style={{ 
                            display: activeSection === 'Map' ? 'flex' : 'none', 
                            height: '100%',
                            width: '100%',
                            flexDirection: 'column'
                        }}
                    >
                        <Suspense fallback={<SectionLoader />}>
                            <MapPageFull isVisible={activeSection === 'Map'} />
                        </Suspense>
                    </div>

                    {/* Other Sections (Unmounted when inactive for performance) */}
                    <AnimatePresence mode="wait">
                        {activeSection !== 'Map' && (
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, y: -10, filter: 'blur(10px)' }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className="w-full max-w-[1600px] mx-auto min-h-full"
                            >
                                {renderSection()}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                {/* Hotbar (Mobile Only) - Hidden if Sidebar is Open */}
                <AnimatePresence>
                    {!isMobileMenuOpen && (
                        <Hotbar 
                            activeSection={activeSection} 
                            setActiveSection={setActiveSection}
                            isAdmin={isAdmin}
                            onToggleSidebar={() => setIsMobileMenuOpen(true)}
                        />
                    )}
                </AnimatePresence>
            </main>

            {/* Modals */}
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
                        <AppContent />
                    </GlobalActionsLayer>
                </NotificationProvider>
            </I18nProvider>
        </ErrorBoundary>
    );
};

export default App;