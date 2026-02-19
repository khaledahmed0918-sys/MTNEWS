
import React, { useState, useEffect, useRef, useLayoutEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Section } from './types';
import { ADMIN_CREDENTIALS, Icons, navConfig } from './constants';

// Providers
import { I18nProvider, useI18n } from './contexts/I18nContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { GlobalActionsLayer } from './contexts/GlobalActionsContext';
import { LiveProvider } from './contexts/LiveContext';
import { ImageProvider } from './contexts/ImageContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ClipProvider } from './contexts/ClipContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useLocalStorage } from './hooks';

// Components
import { SnowEffect } from './components/SnowEffect';
import { AdminAuthModal } from './components/modals/AuthModals';
import { LogoutConfirmModal } from './components/modals/ConfirmationModals';
import { QuranCard } from './components/ui/QuranCard'; 
import { RamadanIntro, BackgroundCrescent } from './components/ui/RamadanDecorations';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Hotbar } from './components/layout/Hotbar';

// Lazy Load Sections for Performance
const HomePage = lazy(() => import('./sections/Home').then(module => ({ default: module.HomePage })));
const LivePage = lazy(() => import('./sections/live/LivePage').then(module => ({ default: module.LivePage })));
const VotesPage = lazy(() => import('./sections/votes/VotesPage').then(module => ({ default: module.VotesPage })));
const MapPageFull = lazy(() => import('./sections/Map').then(module => ({ default: module.MapPageFull })));
const AnalyzingPage = lazy(() => import('./sections/Analyzing').then(module => ({ default: module.AnalyzingPage })));
const ClipsPage = lazy(() => import('./sections/Clips/ClipsPage').then(module => ({ default: module.ClipsPage })));

// Split modules
const ThreadsPage = lazy(() => import('./sections/Threads').then(module => ({ default: module.ThreadsPage })));
const LinksPage = lazy(() => import('./sections/Links').then(module => ({ default: module.LinksPage })));
const CreditsPage = lazy(() => import('./sections/Credits').then(module => ({ default: module.CreditsPage })));

const ImagesPage = lazy(() => import('./sections/images/ImagesPage').then(module => ({ default: module.ImagesPage })));

// Loading Component
const SectionLoader = () => (
    <div className="w-full h-[60vh] flex flex-col items-center justify-center gap-4">
        <Icons.Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <span className="text-gray-400 font-bold animate-pulse">Loading Content...</span>
    </div>
);

// --- MAIN APP CONTENT ---
const AppContent: React.FC = () => {
    // Initial state set based on first enabled section
    const [activeSection, setActiveSection] = useState<Section>(() => {
        const home = navConfig.find(n => n.id === 'Home');
        if (home && home.enabled) return 'Home';
        const first = navConfig.find(n => n.enabled);
        return first ? first.id : 'Home';
    });
    
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [snowEnabled, setSnowEnabled] = useLocalStorage('mtnews-snow', true); // Default true
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { t } = useI18n();
    
    // Sidebar State (Mobile)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Initial Auth Check & Visitor Tracking
    useEffect(() => {
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

    // Ensure active section is enabled
    useEffect(() => {
        const currentConfig = navConfig.find(n => n.id === activeSection);
        if (!currentConfig || !currentConfig.enabled) {
            const firstEnabled = navConfig.find(n => n.enabled);
            if (firstEnabled) {
                setActiveSection(firstEnabled.id);
            }
        }
    }, [activeSection, isAdmin]);

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
        // Safety check to ensure we don't render disabled sections
        const currentConfig = navConfig.find(n => n.id === activeSection);
        if (!currentConfig || !currentConfig.enabled) return null;

        return (
            <Suspense fallback={<SectionLoader />}>
                {(() => {
                    switch (activeSection) {
                        case 'Home': return <HomePage setActiveSection={setActiveSection} />;
                        case 'Live': return <LivePage snowEnabled={snowEnabled} isAdmin={isAdmin} />;
                        case 'Votes': return <VotesPage isAdmin={isAdmin} />;
                        case 'Map': return <MapPageFull isVisible={true} />; 
                        case 'Analyzing': return <AnalyzingPage />;
                        case 'Clips': return <ClipsPage />;
                        case 'Threads': return <ThreadsPage />;
                        case 'Images': return <ImagesPage isAdmin={isAdmin} />;
                        case 'Links': return <LinksPage />;
                        case 'Credits': return <CreditsPage />;
                        default: return <HomePage setActiveSection={setActiveSection} />;
                    }
                })()}
            </Suspense>
        );
    };

    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-black via-blue-950/30 to-black text-white font-sans selection:bg-orange-500/30 selection:text-orange-200 overflow-hidden relative">
            <SnowEffect enabled={snowEnabled} />
            <BackgroundCrescent />
            
            {/* Ramadan Intro Overlay */}
            <RamadanIntro />

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
                {/* Content Container - Scrollable - Removed transform-gpu to fix scroll lag */}
                <div ref={scrollContainerRef} className={`flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar ${activeSection === 'Analyzing' ? 'p-0' : 'p-0 md:p-8 pb-32 md:pb-8'} flex flex-col`}>
                    
                    {/* Map Section Special Handling: Absolute fill when active */}
                    {activeSection === 'Map' ? (
                        <div className="absolute inset-0 z-0 flex flex-col">
                             <Suspense fallback={<SectionLoader />}>
                                <MapPageFull isVisible={true} />
                            </Suspense>
                        </div>
                    ) : (
                         <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                {...({
                                    initial: { opacity: 0, y: 10, filter: 'blur(10px)' },
                                    animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
                                    exit: { opacity: 0, y: -10, filter: 'blur(10px)' },
                                    transition: { duration: 0.3, ease: "easeOut" }
                                } as any)}
                                className={`w-full ${activeSection === 'Home' ? 'max-w-[1600px]' : 'max-w-[1900px]'} mx-auto min-h-full ${activeSection === 'Analyzing' ? 'h-full' : 'px-4 md:px-0 pt-4 md:pt-0'}`}
                            >
                                <QuranCard section={activeSection} />
                                {renderSection()}
                            </motion.div>
                        </AnimatePresence>
                    )}
                    
                    {/* Footer Removed */}
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
                        <ProfileProvider>
                            <LiveProvider>
                                <ClipProvider>
                                    <ImageProvider>
                                        <AppContent />
                                    </ImageProvider>
                                </ClipProvider>
                            </LiveProvider>
                        </ProfileProvider>
                    </GlobalActionsLayer>
                </NotificationProvider>
            </I18nProvider>
        </ErrorBoundary>
    );
};

export default App;
