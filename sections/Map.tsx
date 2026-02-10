
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, Marker, Popup, ImageOverlay } from 'react-leaflet';
import * as L from 'leaflet';
import { Icons, mapObjectsData, mapObjectGroupsData } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { useLocalStorage } from '../hooks';
import { MapObjectItem, MapObjectLocation, MapObjectGroup } from '../types';
import { GlassCard } from '../components/ui/GlassCard';
import { Tooltip, ToggleSwitch } from '../components/ui/SharedInputs';
import { resolvePath } from '../utils/logging';

const MapController: React.FC<{ zoomIn: () => void; zoomOut: () => void; resetView: () => void; }> = ({ zoomIn, zoomOut, resetView }) => { const { t } = useI18n(); return (<div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000] pointer-events-auto"><Tooltip content={t('resetView')}><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={resetView} className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 shadow-lg hover:bg-white/30"><Icons.RotateCcw className="w-5 h-5" /></motion.button></Tooltip><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={zoomIn} className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 shadow-lg hover:bg-white/30"><Icons.SearchPlus className="w-5 h-5" /></motion.button><motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={zoomOut} className="w-10 h-10 flex items-center justify-center bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 shadow-lg hover:bg-white/30"><Icons.SearchMinus className="w-5 h-5" /></motion.button></div>); }
const mapBounds: L.LatLngBoundsExpression = [[0, 0], [8192, 8192]]; const maxBounds: L.LatLngBoundsExpression = [[-2000, -2000], [10192, 10192]]; const mapUrlSvg = 'https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV_ATLUS_8192x8192.png'; 
const CircularProgress: React.FC<{ progress: number; error?: boolean; onRetry?: () => void }> = ({ progress, error, onRetry }) => { const size = 56, strokeWidth = 3, center = size / 2, radius = 22, circumference = 2 * Math.PI * radius; const strokeDashoffset = circumference - (progress / 100) * circumference; return (<div className="absolute top-4 left-4 z-[2005] flex flex-col items-center gap-2 pointer-events-auto"><div className={`bg-neutral-900/80 backdrop-blur-md rounded-full w-14 h-14 flex items-center justify-center shadow-2xl border ${error ? 'border-red-500' : 'border-orange-500/50'}`}><svg className="transform -rotate-90 w-full h-full p-0.5" viewBox={`0 0 ${size} ${size}`}><circle className="text-gray-700" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={center} cy={center} /><circle className={`${error ? 'text-red-500' : 'text-orange-500'} transition-all duration-300 ease-out`} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx={center} cy={center} /></svg><span className="absolute text-[10px] font-bold text-white">{Math.round(progress)}%</span></div>{error && onRetry && <motion.button onClick={onRetry} className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg" whileHover={{ scale: 1.1 }}><Icons.Refresh className="w-4 h-4" /></motion.button>}</div>); };
const MapLoadingScreen: React.FC<{ progress: number, onContinue: () => void, error: boolean, onRetry: () => void }> = ({ progress, onContinue, error, onRetry }) => { const { t } = useI18n(); return (<div className="absolute inset-0 z-[3000] bg-neutral-900/90 backdrop-blur-xl flex flex-col items-center justify-center gap-8"><div className="flex flex-col items-center gap-4 w-full max-w-md px-6"><motion.img src="https://i.postimg.cc/PrqvJ5RX/IMG-7993.png" alt="Loading" className={`w-24 h-24 rounded-full shadow-[0_0_40px_rgba(249,115,22,0.3)] mb-4 ${error ? 'grayscale' : 'animate-pulse'}`} /><h2 className="text-2xl font-bold text-white tracking-wider">{error ? t('mapLoadFailed') : t('mapLoadingTitle')}</h2><div className={`w-full h-3 rounded-full overflow-hidden relative border border-white/10 ${error ? 'bg-red-900/30' : 'bg-gray-800'}`}><motion.div className={`absolute inset-y-0 left-0 bg-gradient-to-r ${error ? 'from-red-600 to-red-500' : 'from-orange-600 via-orange-500 to-orange-400'}`} initial={{ width: 0 }} animate={{ width: `${progress}%` }} /></div><div className="text-sm font-bold text-gray-400">{Math.round(progress)}%</div>{error ? <motion.button onClick={onRetry} className="px-8 py-2.5 bg-red-500/20 border border-red-500/50 text-red-200 font-bold rounded-2xl transition-all flex items-center gap-2" whileHover={{ scale: 1.05 }}><Icons.Refresh className="w-4 h-4" />{t('mapReload')}</motion.button> : <motion.button onClick={onContinue} className="px-8 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-2xl" whileHover={{ scale: 1.05 }}>{t('mapContinue')}</motion.button>}</div></div>); };

export const MapPageFull: React.FC = () => {
    const { t, dir } = useI18n();
    const [activeObjectIds, setActiveObjectIds] = useLocalStorage<string[]>('mtnews-map-objects', []);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedMarker, setHighlightedMarker] = useState<{ item: MapObjectItem, location: MapObjectLocation } | null>(null);
    const [showObjects, setShowObjects] = useState(false);
    const [mapProgress, setMapProgress] = useState(0);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [mapError, setMapError] = useState(false);
    const [hasContinued, setHasContinued] = useState(false);
    const [retryTrigger, setRetryTrigger] = useState(0);
    const [listHeight, setListHeight] = useState(500);
    const [searchError, setSearchError] = useState(false);
    const mapRef = useRef<L.Map>(null);
    
    useEffect(() => {
        let isMounted = true;
        setMapProgress(0); setMapLoaded(false); setMapError(false);
        const interval = setInterval(() => { if (!isMounted) return; setMapProgress(prev => { if (prev >= 80) { clearInterval(interval); return 80; } return prev + 10; }); }, 100);
        const img = new Image();
        img.src = mapUrlSvg;
        img.onload = () => { if (!isMounted) return; clearInterval(interval); setMapProgress(100); setTimeout(() => setMapLoaded(true), 100); };
        img.onerror = () => { if (!isMounted) return; clearInterval(interval); setMapError(true); };
        return () => { isMounted = false; clearInterval(interval); };
    }, [retryTrigger]);

    const handleRetry = () => { setRetryTrigger(prev => prev + 1); setHasContinued(false); };
    const onMapImageLoad = () => { setMapLoaded(true); setMapProgress(100); };
    const toggleObjectId = (id: string) => { setActiveObjectIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]); };
    const isGroupActive = (group: MapObjectGroup) => group.objectIds.every(id => activeObjectIds.includes(id));
    const toggleGroup = (group: MapObjectGroup) => { const isActive = isGroupActive(group); if (isActive) { setActiveObjectIds(prev => prev.filter(id => !group.objectIds.includes(id))); } else { setActiveObjectIds(prev => { const next = [...prev]; group.objectIds.forEach(id => { if (!next.includes(id)) next.push(id); }); return next; }); } };
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault(); setSearchError(false); setHighlightedMarker(null);
        const rawQuery = searchQuery.trim(); if (!rawQuery) return;
        const queries = rawQuery.split(/[,ØŒ]/).map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
        const foundIds: string[] = []; const foundLocations: L.LatLngTuple[] = [];
        queries.forEach(q => { mapObjectsData.forEach(item => { if (item.name.toLowerCase().includes(q)) { if (!foundIds.includes(item.id)) foundIds.push(item.id); item.locations.forEach(loc => foundLocations.push([loc.y, loc.x])); if (queries.length === 1 && mapObjectsData.filter(i => i.name.toLowerCase().includes(q)).length === 1) { setHighlightedMarker({ item, location: item.locations[0] }); } } }); });
        if (foundIds.length === 0) { setSearchError(true); } else { setActiveObjectIds(prev => { const next = new Set([...prev, ...foundIds]); return Array.from(next); }); if (mapRef.current) { mapRef.current.flyTo([4096, 4096], -2, { animate: true, duration: 0.8 }); setTimeout(() => { if (foundLocations.length > 0 && mapRef.current) { const bounds = L.latLngBounds(foundLocations); mapRef.current.flyToBounds(bounds, { padding: [150, 150], maxZoom: 3, animate: true, duration: 1.5 }); } }, 900); } }
    };
    
    const handleResetView = () => { mapRef.current?.flyTo([4096, 4096], -3, { animate: true, duration: 1.5 }); setHighlightedMarker(null); };

    return (
        <div className="w-full max-w-7xl mx-auto p-4 flex flex-col gap-6 relative min-h-[700px] h-full">
            <div className={`flex flex-col md:flex-row gap-4 items-start md:items-stretch relative z-[2000] transition-all duration-300 ${!mapLoaded ? 'opacity-80' : ''}`}>
                <GlassCard className={`!p-0 !rounded-full flex-1 w-full transition-colors duration-300 ${searchError ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-shake' : ''}`}>
                    <form onSubmit={handleSearch} className="relative w-full h-full flex items-center">
                        <div className={`absolute top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none ${dir === 'rtl' ? 'right-6' : 'left-6'}`}><Icons.Search className="w-5 h-5" /></div>
                        <input type="text" value={searchQuery} onChange={e => { setSearchQuery(e.target.value); if(searchError) setSearchError(false); }} placeholder={t('searchMapPlaceholder')} dir={dir} className={`w-full h-full bg-transparent rounded-full py-4 focus:outline-none text-lg ${dir === 'rtl' ? 'pr-16 pl-6' : 'pl-16 pr-6'} text-gray-900 dark:text-white placeholder-gray-500/70 font-medium`} />
                    </form>
                </GlassCard>
                <div className="relative w-full md:w-auto">
                    <motion.button onClick={() => setShowObjects(!showObjects)} className={`w-full md:w-auto px-6 py-4 backdrop-blur-xl border rounded-full flex justify-between items-center gap-4 shadow-lg h-full relative z-[2001] bg-white/60 dark:bg-white/10 border-gray-300 dark:border-white/20 text-gray-900 dark:text-white hover:bg-white/80 dark:hover:bg-white/20 transition-all`}>
                        <span className="font-bold whitespace-nowrap">{t('mapObjects')}</span>
                        <motion.div animate={{ rotate: showObjects ? 180 : 0 }}><Icons.ChevronDown /></motion.div>
                    </motion.button>
                </div>
            </div>
            
            <AnimatePresence>
                {showObjects && (
                    <motion.div 
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.1}
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        className="fixed inset-x-0 bottom-0 z-[9999] md:absolute md:top-24 md:right-4 md:bottom-auto md:left-auto md:w-full md:max-w-sm drop-shadow-2xl rounded-t-[30px] md:rounded-[30px]"
                        style={{ height: window.innerWidth < 768 ? '70vh' : listHeight, maxHeight: '85vh' }}
                    >
                        <div className="w-full h-full rounded-t-[30px] md:rounded-[30px] p-1 overflow-hidden backdrop-blur-3xl bg-white/95 dark:bg-neutral-900/95 border border-white/20 shadow-2xl flex flex-col relative">
                            {/* Drag Handle for Mobile */}
                            <div className="w-full flex justify-center pt-3 pb-1 md:hidden cursor-grab active:cursor-grabbing">
                                <div className="w-16 h-1.5 bg-gray-300 dark:bg-white/20 rounded-full"></div>
                            </div>

                            <div className="p-4 bg-gray-100/50 dark:bg-white/5 flex items-center justify-between border-b border-gray-200 dark:border-white/10 shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-2">{t('mapObjects')}</span>
                                </div>
                                <button onClick={() => setShowObjects(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 text-gray-400"><Icons.X className="w-4 h-4" /></button>
                            </div>
                            
                            <div className="p-3 overflow-y-auto custom-scrollbar flex-1" onPointerDown={(e) => e.stopPropagation()}>
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-3 px-3 mt-2"><Icons.Layers className="w-5 h-5 text-orange-500" /><span className="text-sm font-black text-gray-400 uppercase tracking-widest">{t('mapGroups')}</span></div>
                                    <div className="flex flex-col gap-2">{mapObjectGroupsData.map(group => (<div key={group.id} className="flex items-center gap-3 p-4 rounded-2xl transition-all bg-orange-500/5 dark:bg-orange-500/10 border border-orange-500/10 hover:border-orange-500/30"><div className="flex flex-col flex-1"><span className="text-base font-extrabold text-gray-900 dark:text-white leading-tight">{group.name}</span><span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-tight">{group.objectIds.length} Categories</span></div><ToggleSwitch isOn={isGroupActive(group)} onToggle={() => toggleGroup(group)} /></div>))}</div>
                                </div>
                                <div className="h-px w-full my-5 bg-gray-200 dark:bg-white/10 opacity-50"></div>
                                <div>
                                    <div className="flex items-center gap-2 mb-3 px-3"><Icons.Map className="w-5 h-5 text-blue-500" /><span className="text-sm font-black text-gray-400 uppercase tracking-widest">{t('mapObjects')}</span></div>
                                    <div className="flex flex-col gap-2">{mapObjectsData.map(item => (<div key={item.id} className="flex items-center gap-3 p-3 rounded-2xl transition-all bg-gray-100/50 dark:bg-white/5 border border-transparent hover:border-gray-300 dark:hover:border-white/20"><div className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-800 p-1.5 flex items-center justify-center shadow-sm border border-black/5 dark:border-white/5 overflow-hidden"><img src={resolvePath(item.icon)} alt={item.name} className="w-full h-full object-contain" /></div><span className="text-base flex-1 font-bold text-gray-900 dark:text-white">{item.name}</span><ToggleSwitch isOn={activeObjectIds.includes(item.id)} onToggle={() => toggleObjectId(item.id)} /></div>))}</div>
                                </div>
                                <div className="h-px w-full my-4 bg-gray-200 dark:bg-white/10 opacity-50"></div>
                                <motion.button onClick={() => setActiveObjectIds([])} className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-red-500/10 hover:bg-red-500/20 rounded-2xl text-red-500 font-black transition-colors" whileTap={{scale:0.98}}><Icons.PowerOff className="w-4 h-4" /><span>{t('disableAll')}</span></motion.button>
                            </div>
                            
                            {/* Resize Handle only for Desktop */}
                            <div className="hidden md:flex w-full h-6 bg-gray-100 dark:bg-white/5 cursor-ns-resize items-center justify-center shrink-0 border-t border-gray-200 dark:border-white/10" onPointerDown={(e) => {
                                const startY = e.clientY;
                                const startHeight = listHeight;
                                const onPointerMove = (moveEvent: PointerEvent) => {
                                    setListHeight(Math.max(300, Math.min(800, startHeight + (moveEvent.clientY - startY))));
                                };
                                const onPointerUp = () => {
                                    document.removeEventListener('pointermove', onPointerMove);
                                    document.removeEventListener('pointerup', onPointerUp);
                                };
                                document.addEventListener('pointermove', onPointerMove);
                                document.addEventListener('pointerup', onPointerUp);
                            }}>
                                <div className="w-12 h-1 bg-gray-300 dark:bg-white/20 rounded-full"></div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="relative w-full h-[600px] md:h-[700px] rounded-glass shadow-2xl bg-[#0fa8d2] overflow-hidden border border-white/10 group z-0">
                <AnimatePresence>{(!hasContinued && !mapLoaded) && <motion.div initial={{opacity: 1}} exit={{opacity: 0}} className="absolute inset-0 z-[3000]"><MapLoadingScreen progress={mapProgress} error={mapError} onContinue={() => setHasContinued(true)} onRetry={handleRetry} /></motion.div>}</AnimatePresence>
                {(hasContinued && !mapLoaded) && <CircularProgress progress={mapProgress} error={mapError} onRetry={handleRetry} />}
                <MapController zoomIn={() => mapRef.current?.zoomIn()} zoomOut={() => mapRef.current?.zoomOut()} resetView={handleResetView} />
                <MapContainer ref={mapRef} bounds={mapBounds} maxBounds={maxBounds} maxBoundsViscosity={1.0} minZoom={-3} maxZoom={5} crs={L.CRS.Simple} className="w-full h-full z-0" zoomControl={false} attributionControl={false} preferCanvas={true} dragging={true} doubleClickZoom={false}>
                    <ImageOverlay url={mapUrlSvg} bounds={mapBounds} eventHandlers={{ load: onMapImageLoad }} />
                    {mapObjectsData.map(item => activeObjectIds.includes(item.id) && item.locations.map((loc, index) => { const isHighlighted = highlightedMarker?.item.id === item.id && highlightedMarker?.location.x === loc.x && highlightedMarker?.location.y === loc.y; const baseSize = item.size || 26; const iconSize: [number, number] = isHighlighted ? [baseSize * 1.5, baseSize * 1.5] : [baseSize, baseSize]; const iconAnchor: [number, number] = isHighlighted ? [iconSize[0] / 2, iconSize[1] / 2] : [baseSize / 2, baseSize / 2]; return (<Marker key={`${item.id}-${index}`} position={[loc.y, loc.x]} eventHandlers={{click: (e) => { L.DomEvent.stopPropagation(e); }}} icon={L.icon({ iconUrl: resolvePath(item.icon), iconSize: iconSize, iconAnchor: iconAnchor, className: isHighlighted ? 'highlighted-marker' : '' })}><Popup className="glass-popup" closeButton={false} autoPan={false}>{item.name}</Popup></Marker>) }))}
                </MapContainer>
            </div>
        </div>
    );
};
