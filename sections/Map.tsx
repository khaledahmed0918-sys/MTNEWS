
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, Marker, Popup, ImageOverlay, useMap } from 'react-leaflet';
import * as L from 'leaflet';
import { Icons, mapObjectsData, mapObjectGroupsData } from '../constants';
import { useI18n } from '../contexts/I18nContext';
import { useLocalStorage } from '../hooks';
import { MapObjectItem, MapObjectLocation, MapObjectGroup } from '../types';
import { ToggleSwitch } from '../components/ui/SharedInputs';
import { resolvePath } from '../utils/logging';

// --- Components ---

// Component to handle map resizing when visibility changes (Fix for display:none issue)
const MapInvalidator: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
    const map = useMap();
    useEffect(() => {
        if (isVisible) {
            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }, [isVisible, map]);
    return null;
};

// Map Controller must utilize the map instance from context or passed via ref if outside
const MapController: React.FC<{ mapRef: React.RefObject<L.Map> }> = ({ mapRef }) => { 
    const zoomIn = () => mapRef.current?.zoomIn();
    const zoomOut = () => mapRef.current?.zoomOut();
    const resetView = () => mapRef.current?.flyTo([4096, 4096], -3, { animate: true, duration: 1.5 });

    return (
        <div className="absolute top-6 right-6 flex flex-col gap-3 z-[400] pointer-events-auto">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={resetView} className="w-12 h-12 flex items-center justify-center bg-black/60 backdrop-blur-xl rounded-2xl text-white border border-white/10 shadow-xl hover:bg-orange-500 hover:border-orange-500 transition-colors">
                <Icons.RotateCcw className="w-6 h-6" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={zoomIn} className="w-12 h-12 flex items-center justify-center bg-black/60 backdrop-blur-xl rounded-2xl text-white border border-white/10 shadow-xl hover:bg-white/20">
                <Icons.SearchPlus className="w-6 h-6" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={zoomOut} className="w-12 h-12 flex items-center justify-center bg-black/60 backdrop-blur-xl rounded-2xl text-white border border-white/10 shadow-xl hover:bg-white/20">
                <Icons.SearchMinus className="w-6 h-6" />
            </motion.button>
        </div>
    ); 
}

// --- Main Map Component ---
const mapBounds: L.LatLngBoundsExpression = [[0, 0], [8192, 8192]]; 
const maxBounds: L.LatLngBoundsExpression = [[-3000, -3000], [12000, 12000]]; // Expanded bounds
const mapUrlSvg = 'https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV_ATLUS_8192x8192.png'; 

export const MapPageFull: React.FC<{ isVisible?: boolean }> = ({ isVisible = true }) => {
    const { t, dir } = useI18n();
    const [activeObjectIds, setActiveObjectIds] = useLocalStorage<string[]>('mtnews-map-objects', []);
    const [searchQuery, setSearchQuery] = useState('');
    const [highlightedMarker, setHighlightedMarker] = useState<{ item: MapObjectItem, location: MapObjectLocation } | null>(null);
    const [showObjects, setShowObjects] = useState(false);
    const [mapProgress, setMapProgress] = useState(0);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [isMapActive, setIsMapActive] = useState(false); // New: Map active state
    const mapRef = useRef<L.Map>(null);
    
    // Simulate Loading when Activate
    useEffect(() => {
        if (isMapActive) {
            let isMounted = true;
            const interval = setInterval(() => { 
                if (!isMounted || mapLoaded) return; 
                setMapProgress(prev => (prev >= 90 ? 90 : prev + 10)); 
            }, 100);
            
            // Preload Image
            const img = new Image();
            img.src = mapUrlSvg;
            img.onload = () => { 
                if (!isMounted) return;
                clearInterval(interval); 
                setMapProgress(100); 
                setTimeout(() => setMapLoaded(true), 200); 
            };
            
            return () => { isMounted = false; clearInterval(interval); };
        }
    }, [isMapActive]);

    // Unload when section changes
    useEffect(() => {
        if (!isVisible) {
            setIsMapActive(false);
            setMapLoaded(false);
            setMapProgress(0);
        }
    }, [isVisible]);

    const toggleObjectId = (id: string) => { setActiveObjectIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]); };
    const isGroupActive = (group: MapObjectGroup) => group.objectIds.every(id => activeObjectIds.includes(id));
    const toggleGroup = (group: MapObjectGroup) => { const isActive = isGroupActive(group); if (isActive) { setActiveObjectIds(prev => prev.filter(id => !group.objectIds.includes(id))); } else { setActiveObjectIds(prev => { const next = [...prev]; group.objectIds.forEach(id => { if (!next.includes(id)) next.push(id); }); return next; }); } };
    
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault(); setHighlightedMarker(null);
        if(!isMapActive) return;
        const rawQuery = searchQuery.trim(); if (!rawQuery) return;
        const queries = rawQuery.split(/[,،]/).map(s => s.trim().toLowerCase()).filter(s => s.length > 0);
        const foundIds: string[] = []; const foundLocations: L.LatLngTuple[] = [];
        queries.forEach(q => { mapObjectsData.forEach(item => { if (item.name.toLowerCase().includes(q)) { if (!foundIds.includes(item.id)) foundIds.push(item.id); item.locations.forEach(loc => foundLocations.push([loc.y, loc.x])); if (queries.length === 1 && mapObjectsData.filter(i => i.name.toLowerCase().includes(q)).length === 1) { setHighlightedMarker({ item, location: item.locations[0] }); } } }); });
        if (foundIds.length > 0) { setActiveObjectIds(prev => { const next = new Set([...prev, ...foundIds]); return Array.from(next); }); if (mapRef.current) { mapRef.current.flyTo([4096, 4096], -2, { animate: true, duration: 0.8 }); setTimeout(() => { if (foundLocations.length > 0 && mapRef.current) { const bounds = L.latLngBounds(foundLocations); mapRef.current.flyToBounds(bounds, { padding: [150, 150], maxZoom: 3, animate: true, duration: 1.5 }); } }, 900); } }
    };

    return (
        <div className="absolute inset-0 w-full h-full flex flex-col bg-[#050505]">
            
            {/* Expanded Search Bar & Controls */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] w-full max-w-3xl px-4 pointer-events-none">
                <div className="flex gap-4 pointer-events-auto">
                    <motion.div 
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="flex-1 relative group"
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
                        <form onSubmit={handleSearch} className="relative w-full flex items-center bg-[#0a0a0a]/90 backdrop-blur-xl rounded-2xl border border-white/10 p-2 shadow-2xl">
                            <Icons.Search className="w-6 h-6 text-gray-400 ml-3" />
                            <input 
                                type="text" 
                                value={searchQuery} 
                                onChange={e => setSearchQuery(e.target.value)} 
                                placeholder={t('searchMapPlaceholder')} 
                                className="bg-transparent w-full py-4 px-4 outline-none text-white text-lg font-medium placeholder-gray-500" 
                                disabled={!isMapActive}
                            />
                            <button type="submit" className="bg-white/10 hover:bg-orange-500 text-white p-3 rounded-xl transition-all duration-300" disabled={!isMapActive}>
                                <Icons.ArrowRight className="w-5 h-5" />
                            </button>
                        </form>
                    </motion.div>
                    
                    <motion.button 
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => setShowObjects(!showObjects)} 
                        disabled={!isMapActive} 
                        className={`px-5 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-white hover:bg-white/10 transition-all shadow-xl ${!isMapActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Icons.Filter className={`w-6 h-6 ${showObjects ? 'text-orange-500' : 'text-gray-300'}`} />
                    </motion.button>
                </div>
            </div>
            
            {/* Map Container - Full Screen */}
            <div className="w-full h-full relative bg-[#0a0a0a]">
                
                {/* Activate Button / Overlay */}
                {!isMapActive && (
                    <div className="absolute inset-0 z-[600] flex flex-col items-center justify-center bg-[#0a0a0a]">
                        {/* Beautiful Vivid Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a8a] via-[#4c1d95] to-[#be185d] opacity-80"></div>
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        
                        <motion.button 
                            onClick={() => setIsMapActive(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative z-10 px-12 py-6 bg-white/10 backdrop-blur-xl rounded-3xl font-black text-2xl text-white shadow-[0_0_50px_rgba(255,255,255,0.2)] border border-white/30 flex items-center gap-4 hover:bg-white/20 transition-all group"
                        >
                            <div className="p-3 bg-white text-black rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                                <Icons.Map className="w-8 h-8" />
                            </div>
                            <span>{t('loadInteractiveMap')}</span>
                        </motion.button>
                        <p className="relative z-10 mt-6 text-white/70 font-medium bg-black/30 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">{t('clickToLoadMap')}</p>
                    </div>
                )}

                {/* Map Objects List Drawer */}
                <AnimatePresence>
                    {showObjects && isMapActive && (
                        <motion.div 
                            initial={{ opacity: 0, x: "100%" }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: "100%" }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="absolute top-0 right-0 h-full w-full md:w-96 z-[1000] bg-[#050505]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col pt-24"
                        >
                            <div className="p-6 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">{t('mapObjects')}</h3>
                                <button onClick={() => setShowObjects(false)} className="p-2 hover:bg-white/10 rounded-full"><Icons.X className="w-6 h-6 text-gray-400" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-8">
                                {/* Groups */}
                                <div>
                                    <span className="text-xs font-bold text-orange-500 uppercase tracking-widest px-1 mb-4 block">{t('mapGroups')}</span>
                                    <div className="flex flex-col gap-3">
                                        {mapObjectGroupsData.map(group => (
                                            <div key={group.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                <span className="font-bold text-white text-sm flex-1">{group.name}</span>
                                                <ToggleSwitch isOn={isGroupActive(group)} onToggle={() => toggleGroup(group)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Items */}
                                <div>
                                    <span className="text-xs font-bold text-orange-500 uppercase tracking-widest px-1 mb-4 block">Individual Locations</span>
                                    <div className="flex flex-col gap-3">
                                        {mapObjectsData.map(item => (
                                            <div key={item.id} className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                                                <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center p-1.5">
                                                    <img src={resolvePath(item.icon)} className="w-full h-full object-contain" />
                                                </div>
                                                <span className="font-bold text-white text-sm flex-1">{item.name}</span>
                                                <ToggleSwitch isOn={activeObjectIds.includes(item.id)} onToggle={() => toggleObjectId(item.id)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading State */}
                <AnimatePresence>
                    {isMapActive && !mapLoaded && (
                        <motion.div exit={{ opacity: 0 }} className="absolute inset-0 z-[500] bg-[#050505] flex flex-col items-center justify-center">
                            <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6" />
                            <h2 className="text-2xl font-bold text-white">{t('mapLoadingTitle')}</h2>
                            <div className="mt-3 text-orange-500 font-bold text-xl">{mapProgress}%</div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {isMapActive && (
                    <>
                        <MapController mapRef={mapRef} />
                        <MapContainer 
                            ref={mapRef} 
                            bounds={mapBounds} 
                            maxBounds={maxBounds} 
                            maxBoundsViscosity={0.5}
                            minZoom={-5} 
                            maxZoom={5} 
                            crs={L.CRS.Simple} 
                            // Changed background to gradient for better aesthetics
                            className="w-full h-full outline-none bg-gradient-to-b from-[#1e4b5a] to-[#0fa8d2]" 
                            zoomControl={false} 
                            attributionControl={false} 
                            preferCanvas={true}
                        >
                            <MapInvalidator isVisible={isVisible} />
                            <ImageOverlay url={mapUrlSvg} bounds={mapBounds} />
                            {mapObjectsData.map(item => activeObjectIds.includes(item.id) && item.locations.map((loc, index) => { 
                                const isHighlighted = highlightedMarker?.item.id === item.id && highlightedMarker?.location.x === loc.x && highlightedMarker?.location.y === loc.y; 
                                const baseSize = item.size || 36; 
                                const iconSize: [number, number] = isHighlighted ? [baseSize * 1.8, baseSize * 1.8] : [baseSize, baseSize]; 
                                const iconAnchor: [number, number] = [iconSize[0] / 2, iconSize[1] / 2]; 
                                return (
                                    <Marker 
                                        key={`${item.id}-${index}`} 
                                        position={[loc.y, loc.x]} 
                                        icon={L.icon({ 
                                            iconUrl: resolvePath(item.icon), 
                                            iconSize: iconSize, 
                                            iconAnchor: iconAnchor, 
                                            className: isHighlighted ? 'z-[1000] drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]' : 'drop-shadow-md' 
                                        })}
                                    >
                                        <Popup className="glass-popup" closeButton={false} autoPan={true}>
                                            <div className="text-center font-bold text-lg">{item.name}</div>
                                        </Popup>
                                    </Marker>
                                ) 
                            }))}
                        </MapContainer>
                    </>
                )}
            </div>
        </div>
    );
};
