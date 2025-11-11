import React, { useState, useEffect, createContext, useContext, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useScroll, useTransform } from 'framer-motion';
import { useTheme, useFavorites, useLocalStorage, useIntersectionObserver } from './hooks';
import { translations, navConfig, threadsData, imagesData, linksData, creditsData, Icons } from './constants';
import type { Lang, Theme, Section, NavItem, Thread, ImageData, LinkData, CreditPerson, SocialLink } from './types';

// --- CONTEXT ---
interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof translations.en) => string;
  dir: 'ltr' | 'rtl';
}

const I18nContext = createContext<I18nContextType | null>(null);

const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useLocalStorage<Lang>('mtnews-lang', 'en');
  // FIX: Explicitly type `dir` to match the I18nContextType interface.
  const dir: 'ltr' | 'rtl' = lang === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = useCallback((key: keyof typeof translations.en) => {
    return translations[lang][key] || translations.en[key];
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t, dir }), [lang, t, dir, setLang]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
};

const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used within an I18nProvider');
  return context;
};

// --- HELPER COMPONENTS ---

const GlassCard = React.forwardRef<HTMLDivElement, { children: React.ReactNode, className?: string, onClick?: (e: React.MouseEvent<HTMLDivElement>) => void }>(({ children, className = '', onClick }, ref) => {
    return (
        <motion.div
            ref={ref}
            onClick={onClick}
            className={`relative overflow-hidden bg-clip-padding backdrop-filter backdrop-blur-xl bg-white/[.35] dark:bg-black/[.35] border border-white/20 rounded-glass p-6 glass-card-highlight ${className} ${onClick ? 'cursor-pointer' : ''}`}
            whileHover={onClick ? { y: -5, scale: 1.02 } : {}}
            whileTap={onClick ? { 
                scale: 1.04, 
                y: -10, 
                filter: 'drop-shadow(0 15px 20px rgba(249, 115, 22, 0.5))' 
            } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <div className="highlight-overlay" />
            {children}
        </motion.div>
    );
});


const Tooltip: React.FC<{ content: string; children: React.ReactNode }> = ({ content, children }) => {
    const [show, setShow] = useState(false);
    return (
        <div className="relative inline-block" onClick={() => setShow(!show)} onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
            {children}
            <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="absolute z-10 bottom-full mb-2 px-3 py-1.5 text-sm font-medium text-white bg-gray-900/80 rounded-lg shadow-sm whitespace-nowrap"
                >
                    {content}
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

const FavoriteButton: React.FC<{ id: string; category: string }> = ({ id, category }) => {
  const [favorites, toggleFavorite] = useFavorites(category);
  const isFavorite = favorites.includes(id);
  const controls = useAnimation();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when favoriting
    toggleFavorite(id);
    if (!isFavorite) {
      controls.start({
        scale: [1, 1.3, 1],
        rotate: [0, 15, -15, 0],
        transition: { duration: 0.4 }
      });
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      animate={controls}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="p-2 rounded-full bg-black/20 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors"
    >
      <Icons.Star className={`w-6 h-6 ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    </motion.button>
  );
};

// --- LAYOUT COMPONENTS ---

const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 w-full h-full">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-300/80 via-white to-orange-100/80 dark:from-orange-900/80 dark:via-black dark:to-orange-900/60 bg-[200%_200%] animate-gradientBG" />
    </div>
  );
};

const Header: React.FC<{ activeSection: Section }> = ({ activeSection }) => {
  const { lang, setLang, t } = useI18n();
  const [theme, toggleTheme] = useTheme();

  const toggleLanguage = () => setLang(lang === 'en' ? 'ar' : 'en');

  const langButton = (
    <motion.button
        onClick={toggleLanguage}
        whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white"
    >
        <Icons.Languages className="w-5 h-5" />
    </motion.button>
  );

  const themeButton = (
    <motion.button
        onClick={toggleTheme}
        whileHover={{ scale: 1.1, rotate: 5 }} whileTap={{ scale: 0.9 }}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/20 text-white"
    >
        <AnimatePresence mode="wait">
            <motion.div
                key={theme}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.2 }}
            >
                {theme === 'dark' ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
            </motion.div>
        </AnimatePresence>
    </motion.button>
  );
  
  return (
    <header className="w-full p-4 flex justify-between items-start">
        <div className="flex-1"></div>
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-1 flex flex-col items-center pt-2"
        >
            <img src="https://i.postimg.cc/x8XYrhtL/XRxu6D1Y3qve-Qu-Mu-G9Mzdb-G1q7NLGbu-JZ3FXya-Y1.png" alt="MTNEWS Logo" className="w-24 h-auto drop-shadow-lg" />
            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-800 animate-gradientBG bg-[200%_200%] mt-[-10px]">
                MTNEWS
            </h1>
            <p className="mt-2 text-lg text-gray-700 dark:text-gray-300 font-semibold">{t(activeSection as keyof typeof translations.en)}</p>
            <div className="w-full h-px bg-white/20 mt-4"></div>
        </motion.div>
        <div className="flex-1 flex justify-end items-start">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`flex items-center ${lang === 'ar' ? 'gap-x-4' : 'gap-x-4'}`}
            >
                {lang === 'ar' ? (
                    <>
                        {themeButton}
                        {langButton}
                    </>
                ) : (
                    <>
                        {langButton}
                        {themeButton}
                    </>
                )}
            </motion.div>
        </div>
    </header>
  );
};

const NavBar: React.FC<{ activeSection: Section; setActiveSection: (section: Section) => void }> = ({ activeSection, setActiveSection }) => {
    const { t } = useI18n();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const enabledNavItems = navConfig.filter(item => item.enabled);
  
    return (
      <nav className="w-full max-w-4xl mx-auto px-4">
        <div ref={scrollContainerRef} className="flex justify-center space-x-2 overflow-x-auto pb-3 -mx-2 px-2 no-scrollbar">
          {enabledNavItems.map(item => (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`relative px-4 py-2 text-sm md:text-base font-semibold whitespace-nowrap transition-colors duration-300 
                ${activeSection === item.id ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {t(item.id as keyof typeof translations.en)}
              {activeSection === item.id && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                  layoutId="underline"
                />
              )}
            </motion.button>
          ))}
        </div>
      </nav>
    );
  };

// --- PAGE COMPONENTS ---

const HomePage: React.FC = () => {
    const { t } = useI18n();
    const stats = [
        { value: '70,000', label: t('followers'), color: 'bg-gray-400' },
        { value: '3', label: t('teamWorkers'), color: 'bg-orange-500' },
        { value: '100K', label: t('goal'), color: 'bg-red-500' }
    ];
    return (
        <div className="w-full max-w-5xl mx-auto p-4">
             <div className="relative p-0.5 rounded-glass overflow-hidden">
                <div className="absolute inset-[-200%] animate-borderRotate bg-[conic-gradient(from_90deg_at_50%_50%,#f97316_0%,#f97316_25%,transparent_50%)]"></div>
                <GlassCard className="relative !p-0">
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-white">{t('mtnewsCardTitle')}</h2>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-8 p-6">
                        <img src="https://i.postimg.cc/PrqvJ5RX/IMG-7993.png" alt="MTNEWS Icon" className="w-40 h-40 rounded-full border-4 border-white/30 shadow-lg"/>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white">{t('cardInfoTitle')}</h3>
                            <p className="text-gray-300 mt-2">{t('cardInfoDescription')}</p>
                            <div className="flex flex-wrap gap-4 mt-6">
                                {stats.map((stat) => (
                                    <Tooltip key={stat.label} content={stat.label}>
                                        <div className="flex items-center gap-x-3 bg-black/20 px-3 py-1.5 rounded-full cursor-pointer">
                                            <div className={`w-3 h-3 rounded-full ${stat.color}`}></div>
                                            <span className="text-white font-medium">{stat.value}</span>
                                        </div>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 text-center border-t border-white/20">
                         <p className="text-gray-300 mb-4">{t('donatePrompt')}</p>
                         <motion.a 
                            href="https://link" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block bg-orange-600 text-white font-bold py-3 px-8 rounded-glass"
                            whileHover={{ scale: 1.05, boxShadow: '0 0 15px rgba(249, 115, 22, 0.5)' }}
                            whileTap={{ scale: 0.95 }}
                         >
                           {t('donateButton')}
                         </motion.a>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

const GangsPage: React.FC = () => {
    const { t } = useI18n();
    return <GlassCard className="text-center text-xl text-white">{t('gangsWip')}</GlassCard>;
};

const ThreadCardSkeleton: React.FC = () => (
    <GlassCard className="!p-0">
        <div className="p-6 animate-pulse">
            <div className="bg-white/10 w-full h-48 rounded-lg mb-4"></div>
            <div className="bg-white/10 h-6 w-3/4 rounded mb-2"></div>
            <div className="bg-white/10 h-4 w-full rounded"></div>
            <div className="bg-white/10 h-4 w-1/2 rounded mt-1"></div>
        </div>
        <div className="px-6 py-4 border-t border-white/20 flex flex-wrap gap-x-6 gap-y-2 animate-pulse">
            <div className="bg-white/10 h-5 w-12 rounded-full"></div>
            <div className="bg-white/10 h-5 w-24 rounded-full"></div>
            <div className="bg-white/10 h-5 w-10 rounded-full"></div>
        </div>
    </GlassCard>
);

const ThreadsPage: React.FC = () => {
    const { t } = useI18n();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'sections' | 'name'>('date');
    const [favorites] = useFavorites('threads');

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);
  
    const filteredAndSortedThreads = useMemo(() => {
        const lowercasedTerm = searchTerm.toLowerCase();
        let filtered = threadsData.filter(thread => 
            thread.title.toLowerCase().includes(lowercasedTerm) || 
            thread.owner.toLowerCase().includes(lowercasedTerm)
        );

        filtered.sort((a, b) => {
            const aIsFav = favorites.includes(a.id);
            const bIsFav = favorites.includes(b.id);

            if (aIsFav && !bIsFav) return -1;
            if (!aIsFav && bIsFav) return 1;

            if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortBy === 'sections') return Object.keys(b.sections).length - Object.keys(a.sections).length;
            if (sortBy === 'name') return a.owner.localeCompare(b.owner);
            return 0;
        });
        return filtered;
    }, [searchTerm, sortBy, favorites]);


    if (selectedThread) {
        return <ThreadDetail thread={selectedThread} onReturn={() => setSelectedThread(null)} />;
    }

    if (isLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
                <GlassCard>
                    <div className="bg-white/10 animate-pulse h-11 w-full rounded-glass"></div>
                </GlassCard>
                <div className="space-y-6">
                    {[...Array(3)].map((_, i) => <ThreadCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
      <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
        <GlassCard className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width={20} height={20} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-white/20 rounded-glass py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="relative">
            <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none w-full md:w-auto bg-black/20 border border-white/20 rounded-glass py-2 pl-4 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
                <option value="date">{t('sortByDate')}</option>
                <option value="sections">{t('sortBySections')}</option>
                <option value="name">{t('sortByName')}</option>
            </select>
            <Icons.ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" width={20} height={20}/>
          </div>
        </GlassCard>

        <div className="space-y-6">
          {filteredAndSortedThreads.map((thread, index) => (
             <motion.div
                key={thread.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
             >
                <ThreadCard thread={thread} onSelect={() => setSelectedThread(thread)} />
            </motion.div>
          ))}
        </div>
      </div>
    );
};

const ThreadCard: React.FC<{ thread: Thread; onSelect: () => void }> = ({ thread, onSelect }) => {
    const { t } = useI18n();
    const ownerThreadCount = useMemo(() => threadsData.filter(t => t.owner === thread.owner).length, [thread.owner]);
    const threadIndex = useMemo(() => threadsData.findIndex(t => t.id === thread.id) + 1, [thread.id]);

    return (
        <GlassCard className="!p-0 overflow-hidden group" onClick={onSelect} >
            <div className="p-6">
                <div className="relative mb-4">
                    <div className="overflow-hidden rounded-lg">
                        <img src={thread.image} alt={thread.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="absolute top-2 right-2">
                        <FavoriteButton id={thread.id} category="threads" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">{thread.title}</h3>
                <p className="text-gray-300 mt-2 text-sm">{thread.description}</p>
            </div>
            <div className="px-6 py-4 border-t border-white/20 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-300">
                <Tooltip content={t('sectionNumbers')}><div className="flex items-center gap-2 rtl:gap-3"><div className="w-2.5 h-2.5 bg-green-500 rounded-full" />{Object.keys(thread.sections).length}</div></Tooltip>
                <Tooltip content={t('Characters')}><div className="flex items-center gap-2 rtl:gap-3"><div className="w-2.5 h-2.5 bg-red-500 rounded-full" />{thread.characters.join(', ')}</div></Tooltip>
                <div className="flex items-center gap-2 rtl:gap-3"><div className="w-2.5 h-2.5 bg-gray-500 rounded-full" />#{threadIndex}</div>
                <Tooltip content={`${t('owner')}: ${thread.owner}`}><div className="flex items-center gap-2 rtl:gap-3"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />{ownerThreadCount}</div></Tooltip>
            </div>
        </GlassCard>
    );
};

const ThreadDetail: React.FC<{ thread: Thread; onReturn: () => void }> = ({ thread, onReturn }) => {
    const { t } = useI18n();
    const socialMediaRef = useRef<HTMLDivElement>(null);
    const [isCharactersOpen, setIsCharactersOpen] = useState(false);
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    
    const scrollToSocials = () => {
        socialMediaRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <GlassCard className="w-full max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <button onClick={onReturn} className="text-orange-400 hover:text-orange-300 font-semibold">&larr; {t('return')}</button>
            <div className="text-center">
                <div className="w-full h-64 rounded-lg mb-4 overflow-hidden">
                   <motion.img 
                        src={thread.image} 
                        alt={thread.title} 
                        className="w-full h-full object-cover"
                        style={{ y }}
                    />
                </div>
                <p className="font-semibold text-gray-300">{thread.owner}</p>
                <h1 className="text-3xl md:text-4xl font-bold text-white my-2">{thread.title}</h1>
                {thread.description && <p className="text-gray-400 max-w-2xl mx-auto">{thread.description}</p>}
            </div>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6 my-4">
                <div className="relative">
                    <motion.button onClick={() => setIsCharactersOpen(!isCharactersOpen)} className="px-4 py-2 bg-black/20 rounded-glass text-white" whileHover={{scale:1.05}} whileTap={{scale:0.95}}>
                        {t('threadCharacters')}
                    </motion.button>
                    <AnimatePresence>
                    {isCharactersOpen && (
                        <motion.div 
                         initial={{opacity:0, y:-10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-10}}
                         className="absolute top-full mt-2 w-48 bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg z-20 p-2">
                          {thread.characters.map(char => <div key={char} className="p-2 text-white hover:bg-white/10 rounded">{char}</div>)}
                        </motion.div>
                    )}
                    </AnimatePresence>
                </div>
                <div className="px-4 py-2 bg-black/20 rounded-glass text-gray-300">{thread.date}</div>
                <motion.button onClick={scrollToSocials} className="px-4 py-2 bg-black/20 rounded-glass text-white" whileHover={{scale:1.05}} whileTap={{scale:0.95}}>
                    {t('threadSocialMedia')}
                </motion.button>
            </div>
            
            <div className="w-full h-px bg-white/20"></div>

            <div className="prose prose-invert max-w-none text-white text-opacity-90 leading-relaxed space-y-4">
                {Object.values(thread.sections).map((content, index, arr) => (
                    <React.Fragment key={index}>
                        <p>{content}</p>
                        {index < arr.length - 1 && <div className="w-full h-px bg-white/20 my-6"></div>}
                    </React.Fragment>
                ))}
            </div>

            <div ref={socialMediaRef} className="pt-8">
                <h2 className="text-2xl font-bold text-white text-center mb-6">{t('threadSocialMedia')}</h2>
                <div className="flex justify-center flex-wrap gap-4">
                    {Object.entries(thread.socials).map(([platform, url]) => {
                        const Icon = Icons[platform.charAt(0).toUpperCase() + platform.slice(1) as keyof typeof Icons];
                        if (platform === 'kick') {
                            return (
                                <motion.a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center bg-black/20 p-2.5 rounded-glass text-white" whileHover={{scale:1.05}}>
                                  {Icon && <Icon className="w-6 h-6" />}
                                </motion.a>
                            );
                        }
                        return (
                           <motion.a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-glass text-white" whileHover={{scale:1.05}}>
                             {Icon && <Icon className="w-5 h-5" />} {platform.charAt(0).toUpperCase() + platform.slice(1)}
                           </motion.a>
                        );
                    })}
                </div>
            </div>

            <p className="text-center text-gray-300 pt-8">{t('thanks')}</p>
        </GlassCard>
    );
};

const ImageCardSkeleton: React.FC = () => (
    <GlassCard className="!p-4 flex flex-col gap-4">
        <div className="bg-white/10 animate-pulse w-full h-80 rounded-lg"></div>
        <div className="flex justify-between items-center">
            <div className="bg-white/10 h-6 w-1/3 rounded animate-pulse"></div>
            <div className="bg-white/10 h-8 w-1/4 rounded-glass animate-pulse"></div>
        </div>
    </GlassCard>
);

const ImageModal: React.FC<{ image: ImageData; onClose: () => void }> = ({ image, onClose }) => {
    return (
        <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="relative"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
            >
                <img src={image.url} alt={image.character} className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl" />
                <motion.button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 bg-white/20 backdrop-blur-md text-white rounded-full w-10 h-10 flex items-center justify-center border border-white/20"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                >
                    <Icons.X />
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

const ImagesPage: React.FC = () => {
    const { t } = useI18n();
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [favorites] = useFavorites('images');
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);
    
    const filteredAndSortedImages = useMemo(() => {
        let filtered = imagesData.filter(img => 
            img.character.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.sort((a, b) => {
            const aIsFav = favorites.includes(a.id);
            const bIsFav = favorites.includes(b.id);
            if (aIsFav && !bIsFav) return -1;
            if (!aIsFav && bIsFav) return 1;
            return 0;
        });
        return filtered;
    }, [searchTerm, favorites]);

    if (isLoading) {
        return (
            <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
                 <GlassCard>
                    <div className="bg-white/10 animate-pulse h-11 w-full rounded-glass"></div>
                </GlassCard>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, i) => <ImageCardSkeleton key={i} />)}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
            <GlassCard>
                <div className="relative">
                    <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width={20} height={20} />
                    <input
                      type="text"
                      placeholder={t('searchImagesPlaceholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-black/20 border border-white/20 rounded-glass py-2 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>
            </GlassCard>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredAndSortedImages.map((image, index) => (
                    <motion.div
                        key={image.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                       <ImageCard image={image} onImageClick={() => setSelectedImage(image)} />
                    </motion.div>
                ))}
            </div>
            <AnimatePresence>
                {selectedImage && <ImageModal image={selectedImage} onClose={() => setSelectedImage(null)} />}
            </AnimatePresence>
        </div>
    );
};

const ImageCard: React.FC<{image: ImageData; onImageClick: () => void}> = ({image, onImageClick}) => {
    const { t } = useI18n();
    const [cardRef, isVisible] = useIntersectionObserver({ rootMargin: '100px' });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isVisible) {
          const img = new Image();
          img.src = image.url;
          img.onload = () => setIsLoaded(true);
        }
    }, [isVisible, image.url]);

    return (
        <GlassCard ref={cardRef} className="!p-4 flex flex-col gap-4 overflow-hidden group bg-white/10" onClick={onImageClick}>
            <div className="relative overflow-hidden rounded-lg h-80 w-full bg-white/10">
                <AnimatePresence>
                {isLoaded && (
                    <motion.img 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        src={image.url} 
                        alt={image.character} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                )}
                </AnimatePresence>
                <div className="absolute top-2 right-2 z-10">
                    <FavoriteButton id={image.id} category="images" />
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="font-bold text-white">{image.character}</span>
                <motion.a href={image.url} target="_blank" rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-sm bg-orange-600 px-3 py-1.5 rounded-glass text-white"
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                >
                    <Icons.Link width={14} height={14} /> {t('linkButton')}
                </motion.a>
            </div>
        </GlassCard>
    );
};


const LinksPage: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
      {linksData.map((link, index) => (
          <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
          >
             <LinkCard link={link} />
          </motion.div>
      ))}
    </div>
  );
};

const LinkCard: React.FC<{ link: LinkData }> = ({ link }) => {
    const { t } = useI18n();
    const Icon = Icons[link.platform];
    return (
        <GlassCard className="text-center flex flex-col items-center justify-between h-full">
            <div>
              {Icon && <Icon className="w-16 h-16 mx-auto text-white mb-4"/>}
              <h3 className="text-2xl font-bold text-white">{link.platform}</h3>
              <p className="text-gray-300 mt-1">{t('mtrpOn')} {link.platform}</p>
            </div>
            <motion.a
                href={link.url} target="_blank" rel="noopener noreferrer"
                className="mt-6 flex items-center gap-2 bg-orange-600 text-white font-bold py-2 px-6 rounded-glass"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
                <Icons.ExternalLink width={16} height={16} /> {t('linkButton')}
            </motion.a>
        </GlassCard>
    );
};

const CreditCard: React.FC<{ person: CreditPerson }> = ({ person }) => {
    const { t } = useI18n();
    const [copied, setCopied] = useState(false);
    const [copiedUsername, setCopiedUsername] = useState<string | null>(null);

    const handleCopy = (username: string) => {
        if (copied) return;
        navigator.clipboard.writeText(username);
        setCopied(true);
        setCopiedUsername(username);
        setTimeout(() => {
            setCopied(false);
            setCopiedUsername(null);
        }, 2000);
    };

    return (
        <GlassCard className="flex flex-col items-center text-center">
            <img src={person.image} alt={person.name} className="w-24 h-24 rounded-full border-4 border-white/30 mb-4" />
            <p className="text-lg font-bold text-orange-400">{t(person.roleKey)}</p>
            <h3 className="text-2xl font-semibold text-white">{person.name}</h3>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
                {person.socials.map((social, index) => {
                    const Icon = Icons[social.platform];
                    const isCurrentlyCopied = copied && social.username === copiedUsername;

                    if (social.platform === 'Discord' && social.username) {
                        return (
                            <Tooltip key={`${social.platform}-${index}`} content={isCurrentlyCopied ? t('copied') : social.username}>
                                <motion.button
                                    onClick={() => handleCopy(social.username!)}
                                    className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-glass text-sm text-white"
                                    whileHover={{ scale: 1.05 }}
                                    animate={{ backgroundColor: isCurrentlyCopied ? 'rgba(34, 197, 94, 0.5)' : 'rgba(0, 0, 0, 0.2)' }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={isCurrentlyCopied ? 'check' : 'discord'}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            {isCurrentlyCopied ? (
                                                <Icons.Check width={16} height={16} className="text-green-400" />
                                            ) : (
                                                Icon && <Icon width={16} height={16} />
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                    {social.platform}
                                </motion.button>
                            </Tooltip>
                        );
                    }
                    return (
                        <motion.a key={`${social.platform}-${index}`} href={social.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-glass text-sm text-white" whileHover={{scale:1.05}}>
                           {Icon && <Icon width={16} height={16} />} {social.platform}
                        </motion.a>
                    );
                })}
            </div>
        </GlassCard>
    );
};

const CreditsPage: React.FC = () => {
    const { t } = useI18n();
    const founder = creditsData.find(c => c.roleKey === 'founder')!;
    const developer = creditsData.find(c => c.roleKey === 'developer')!;
    const contributors = creditsData.filter(c => c.roleKey === 'contributor');

    return (
        <div className="w-full max-w-5xl mx-auto p-4 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <CreditCard person={founder} />
                <CreditCard person={developer} />
            </div>

            <div>
                <h2 className="text-3xl font-bold text-white text-center mb-6">{t('creditsFor')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {contributors.map((person, index) => (
                         <motion.div
                            key={person.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="flex flex-col items-center text-center"
                        >
                             <img src={person.image} alt={person.name} className="w-20 h-20 rounded-full border-2 border-white/30 mb-2" />
                             <p className="text-white font-semibold">{person.name}</p>
                             <div className="flex gap-2 mt-2">
                                {person.socials.map(social => {
                                    const Icon = Icons[social.platform];
                                    return (
                                        <motion.a key={social.platform} href={social.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white" whileHover={{scale:1.1}}>
                                            {Icon && <Icon width={18} height={18} />}
                                        </motion.a>
                                    );
                                })}
                             </div>
                         </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---

const pageComponents: { [key in Section]: React.FC } = {
  Home: HomePage,
  Gangs: GangsPage,
  Threads: ThreadsPage,
  Images: ImagesPage,
  Links: LinksPage,
  Characters: () => <GlassCard>Characters Page</GlassCard>, // Placeholder
  Credits: CreditsPage,
};

const App: React.FC = () => {
    const [activeSection, setActiveSection] = useState<Section>('Home');
    const [isLoading, setIsLoading] = useState(true);
    const ActivePageComponent = pageComponents[activeSection];
  
    useEffect(() => {
      const timer = setTimeout(() => setIsLoading(false), 1500); // Simulate loading
      return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="w-screen h-screen flex flex-col items-center justify-center bg-black">
                <AnimatedBackground />
                <motion.img 
                    src="https://i.postimg.cc/PrqvJ5RX/IMG-7993.png" 
                    alt="Loading" 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1, rotate: 360 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="w-40 h-40"
                />
                <motion.h1
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     transition={{ duration: 0.5, delay: 0.5 }}
                     className="text-2xl text-white font-bold mt-4"
                >
                    MTNEWS
                </motion.h1>
            </div>
        );
    }
  
    return (
      <I18nProvider>
        <div className="min-h-screen font-sans text-white transition-colors duration-500">
          <AnimatedBackground />
          <Header activeSection={activeSection} />
          <div className="pb-2">
              <NavBar activeSection={activeSection} setActiveSection={setActiveSection} />
          </div>
          <main className="pb-10">
            <div className="mt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <ActivePageComponent />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </I18nProvider>
    );
  };
  
  export default App;