
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
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[400] pointer-events-auto">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={resetView} className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 shadow-lg hover:bg-orange-500 hover:border-orange-500 transition-colors">
                <Icons.RotateCcw className="w-5 h-5" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={zoomIn} className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 shadow-lg hover:bg-white/20">
                <Icons.SearchPlus className="w-5 h-5" />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={zoomOut} className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-md rounded-full text-white border border-white/10 shadow-lg hover:bg-white/20">
                <Icons.SearchMinus className="w-5 h-5" />
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
        <div className="w-full h-full flex flex-col relative overflow-hidden">
            
            {/* Top Control Bar (Outside Map) */}
            <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-transparent z-10 shrink-0">
                <div className="flex-1 w-full max-w-2xl relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-600 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-1000"></div>
                    <form onSubmit={handleSearch} className="relative w-full flex items-center bg-[#0a0a0a] rounded-full border border-white/10 p-1 pl-4 pr-1">
                        <Icons.Search className="w-5 h-5 text-gray-400 mr-2" />
                        <input 
                            type="text" 
                            value={searchQuery} 
                            onChange={e => setSearchQuery(e.target.value)} 
                            placeholder={t('searchMapPlaceholder')} 
                            className="bg-transparent w-full h-full py-3 outline-none text-white font-medium" 
                            disabled={!isMapActive}
                        />
                        <button type="submit" className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors" disabled={!isMapActive}>
                            <Icons.ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                </div>
                
                <motion.button onClick={() => setShowObjects(!showObjects)} disabled={!isMapActive} className={`px-6 py-3.5 bg-[#0a0a0a] border border-white/10 rounded-full flex items-center gap-3 text-white hover:bg-white/5 transition-all ${!isMapActive ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <span className="font-bold text-sm tracking-wide">{t('mapObjects')}</span>
                    <motion.div animate={{ rotate: showObjects ? 180 : 0 }} className="text-orange-500"><Icons.ChevronDown className="w-5 h-5" /></motion.div>
                </motion.button>
            </div>
            
            {/* Map Container Wrapper */}
            <div className="relative flex-1 w-full overflow-hidden rounded-t-[30px] border-t border-white/10 shadow-2xl bg-[#0a0a0a]">
                
                {/* Activate Button / Overlay */}
                {!isMapActive && (
                    <div className="absolute inset-0 z-[600] flex flex-col items-center justify-center bg-[#0a0a0a]">
                        <div className="absolute inset-0 bg-[url('https://www.bragitoff.com/wp-content/uploads/2015/11/GTAV_ATLUS_8192x8192.png')] opacity-10 bg-center bg-cover filter blur-sm"></div>
                        <motion.button 
                            onClick={() => setIsMapActive(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative z-10 px-10 py-5 bg-gradient-to-r from-orange-600 to-red-600 rounded-full font-black text-xl text-white shadow-2xl border border-white/20 flex items-center gap-3"
                        >
                            <Icons.Map className="w-6 h-6" />
                            Load Map
                        </motion.button>
                        <p className="relative z-10 mt-4 text-gray-500 font-medium">Click to load heavy map resources</p>
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
                            className="absolute top-0 right-0 h-full w-full md:w-80 z-[1000] bg-[#050505]/90 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col"
                        >
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <span className="font-bold text-white">{t('mapObjects')}</span>
                                <button onClick={() => setShowObjects(false)}><Icons.X className="w-5 h-5 text-gray-400" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-6">
                                {/* Groups */}
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2 mb-2 block">{t('mapGroups')}</span>
                                    <div className="flex flex-col gap-2">
                                        {mapObjectGroupsData.map(group => (
                                            <div key={group.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10">
                                                <span className="font-bold text-white text-xs flex-1">{group.name}</span>
                                                <ToggleSwitch isOn={isGroupActive(group)} onToggle={() => toggleGroup(group)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Items */}
                                <div>
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2 mb-2 block">Locations</span>
                                    <div className="flex flex-col gap-2">
                                        {mapObjectsData.map(item => (
                                            <div key={item.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10">
                                                <img src={resolvePath(item.icon)} className="w-6 h-6 object-contain" />
                                                <span className="font-bold text-white text-xs flex-1">{item.name}</span>
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
                            <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                            <h2 className="text-xl font-bold text-white">{t('mapLoadingTitle')}</h2>
                            <div className="mt-2 text-orange-500 font-bold">{mapProgress}%</div>
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
                            className="w-full h-full outline-none bg-[#0fa8d2]" 
                            zoomControl={false} 
                            attributionControl={false} 
                            preferCanvas={true}
                        >
                            <MapInvalidator isVisible={isVisible} />
                            <ImageOverlay url={mapUrlSvg} bounds={mapBounds} />
                            {mapObjectsData.map(item => activeObjectIds.includes(item.id) && item.locations.map((loc, index) => { 
                                const isHighlighted = highlightedMarker?.item.id === item.id && highlightedMarker?.location.x === loc.x && highlightedMarker?.location.y === loc.y; 
                                const baseSize = item.size || 30; 
                                const iconSize: [number, number] = isHighlighted ? [baseSize * 1.5, baseSize * 1.5] : [baseSize, baseSize]; 
                                const iconAnchor: [number, number] = [iconSize[0] / 2, iconSize[1] / 2]; 
                                return (
                                    <Marker 
                                        key={`${item.id}-${index}`} 
                                        position={[loc.y, loc.x]} 
                                        icon={L.icon({ 
                                            iconUrl: resolvePath(item.icon), 
                                            iconSize: iconSize, 
                                            iconAnchor: iconAnchor, 
                                            className: isHighlighted ? 'z-[1000]' : '' 
                                        })}
                                    >
                                        <Popup className="glass-popup" closeButton={false} autoPan={true}>
                                            <div className="text-center font-bold">{item.name}</div>
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
