'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, MapPin, Check, Navigation, Clock, Star, Share2, 
  X, ChevronRight, AlertCircle, ArrowLeft, Loader2, Sparkles
} from 'lucide-react';
import { LocationTreeNode, LocationSearchItem } from '../lib/types';
import { fetchLocationTree, searchLocations, fetchNearestLocation } from '../lib/api';

interface LocationExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPanchayatId: string;
  onSelectPanchayat: (panchayatId: string) => void;
  leadDay?: number;
}

interface RecentLocation {
  id: string;
  name: string;
  block: string;
  district: string;
  timestamp: number;
}

export function LocationExplorerModal({
  isOpen,
  onClose,
  selectedPanchayatId,
  onSelectPanchayat,
  leadDay = 1
}: LocationExplorerModalProps) {
  // Search state
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Drilldown hierarchy state
  const [states, setStates] = useState<LocationTreeNode[]>([]);
  const [districts, setDistricts] = useState<LocationTreeNode[]>([]);
  const [blocks, setBlocks] = useState<LocationTreeNode[]>([]);
  const [panchayats, setPanchayats] = useState<LocationTreeNode[]>([]);

  const [selectedState, setSelectedState] = useState<string>('STATE_27'); // Maharashtra default
  const [selectedDistrict, setSelectedDistrict] = useState<string>('DIST_492'); // Pune default
  const [selectedBlock, setSelectedBlock] = useState<string>('BLK_001'); // Haveli default

  // Mobile wizard step: 1 (State) -> 2 (District) -> 3 (Block) -> 4 (Panchayat)
  const [mobileStep, setMobileStep] = useState<number>(4);

  // UX state
  const [recentLocations, setRecentLocations] = useState<RecentLocation[]>([]);
  const [pinnedLocation, setPinnedLocation] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isGPSLoading, setIsGPSLoading] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load recents & pinned from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedRecents = localStorage.getItem('mausammesh_recent_locations');
        if (storedRecents) setRecentLocations(JSON.parse(storedRecents));
        const storedPinned = localStorage.getItem('mausammesh_pinned_location');
        if (storedPinned) setPinnedLocation(storedPinned);
      } catch (e) {
        console.error('Failed to parse saved locations', e);
      }
    }
  }, []);

  // Fetch States on open
  useEffect(() => {
    if (isOpen) {
      fetchLocationTree('state').then(setStates).catch(console.error);
    }
  }, [isOpen]);

  // Fetch Districts when selectedState changes
  useEffect(() => {
    if (selectedState) {
      fetchLocationTree('district', selectedState).then(setDistricts).catch(console.error);
    }
  }, [selectedState]);

  // Fetch Blocks when selectedDistrict changes
  useEffect(() => {
    if (selectedDistrict) {
      fetchLocationTree('block', selectedDistrict).then(setBlocks).catch(console.error);
    }
  }, [selectedDistrict]);

  // Fetch Panchayats when selectedBlock changes
  useEffect(() => {
    if (selectedBlock) {
      fetchLocationTree('panchayat', selectedBlock).then(setPanchayats).catch(console.error);
    }
  }, [selectedBlock]);

  // Search debounce (150ms)
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await searchLocations(query.trim());
        setSearchResults(res);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [query]);

  // Save selected GP to recents
  const handleSelectGP = (id: string, name: string, block: string = 'Haveli', district: string = 'Pune') => {
    onSelectPanchayat(id);
    
    // Update recents
    const updated = [
      { id, name, block, district, timestamp: Date.now() },
      ...recentLocations.filter(r => r.id !== id)
    ].slice(0, 3);
    setRecentLocations(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('mausammesh_recent_locations', JSON.stringify(updated));
      localStorage.setItem('mausammesh_selected_gp', id);
    }
    onClose();
  };

  // Toggle Pinned
  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextPinned = pinnedLocation === id ? null : id;
    setPinnedLocation(nextPinned);
    if (typeof window !== 'undefined') {
      if (nextPinned) localStorage.setItem('mausammesh_pinned_location', nextPinned);
      else localStorage.removeItem('mausammesh_pinned_location');
    }
  };

  // GPS Nearest Location
  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setInfoMessage('Geolocation is not supported by your browser.');
      return;
    }
    setIsGPSLoading(true);
    setInfoMessage(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const nearest = await fetchNearestLocation(pos.coords.latitude, pos.coords.longitude);
          if (nearest) {
            handleSelectGP(nearest.gp_id, nearest.gp_name);
          } else {
            setInfoMessage('Could not find a mapped panchayat near your coordinates.');
          }
        } catch (e) {
          setInfoMessage('Error resolving nearest panchayat.');
        } finally {
          setIsGPSLoading(false);
        }
      },
      (err) => {
        setIsGPSLoading(false);
        setInfoMessage('GPS location access denied or unavailable.');
      },
      { timeout: 8000 }
    );
  };

  // Share URL with ?gp=&day=
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}?gp=${selectedPanchayatId}&day=${leadDay}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-5xl max-h-[90vh] flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-explorer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/10 dark:bg-teal-400/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 id="location-explorer-title" className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Location Explorer
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
                  LGD Level 5
                </span>
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Panchayat Weather Intelligence hierarchy • Universal search across states, districts, blocks & villages
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close Location Explorer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: Search + GPS + Share */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Universal Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search panchayat, village, block, district or LGD code (e.g. Wagholi, वाघोली, 187211)..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                autoFocus
              />
              {isSearching && (
                <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 animate-spin" />
              )}
              {query && !isSearching && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* GPS Location Button */}
            <button
              onClick={handleUseGPS}
              disabled={isGPSLoading}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/50 transition active:scale-95 disabled:opacity-60 whitespace-nowrap"
            >
              {isGPSLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              Use my location
            </button>

            {/* Share URL Button */}
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95 whitespace-nowrap"
              title="Copy shareable link with current panchayat and day"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Share link</span>
                </>
              )}
            </button>
          </div>

          {/* Recents & Pinned Chips */}
          {(recentLocations.length > 0 || pinnedLocation) && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 text-xs">
              <span className="text-slate-400 flex items-center gap-1 font-medium whitespace-nowrap">
                <Clock className="w-3.5 h-3.5" /> Recent:
              </span>
              {recentLocations.map(r => (
                <button
                  key={r.id}
                  onClick={() => handleSelectGP(r.id, r.name, r.block, r.district)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold whitespace-nowrap transition ${
                    r.id === selectedPanchayatId
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-500'
                  }`}
                >
                  <span>{r.name}</span>
                  <span className="text-slate-400 text-[11px] font-normal">({r.block})</span>
                  {pinnedLocation === r.id && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                </button>
              ))}
            </div>
          )}

          {/* Feedback banner */}
          {infoMessage && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="flex-1">{infoMessage}</div>
              <button onClick={() => setInfoMessage(null)} className="text-amber-500 hover:text-amber-700">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* A. Search Results View */}
          {query.trim().length > 0 ? (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Search Results ({searchResults.length})
              </div>
              {searchResults.length === 0 && !isSearching ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm">No locations matched "{query}".</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Try searching for "Wagholi", "Haveli", or an LGD code like "187211".
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {searchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.has_data) {
                          handleSelectGP(item.gp_id, item.gp_name);
                        } else {
                          setInfoMessage(
                            `Weather forecasts for "${item.name}" are currently being provisioned. Prototype telemetry and XGBoost downscaling are active for Pune district GPs (e.g. Wagholi, Loni Kalbhor).`
                          );
                        }
                      }}
                      className={`flex items-start justify-between p-3.5 rounded-xl border text-left transition ${
                        item.gp_id === selectedPanchayatId
                          ? 'border-teal-500 bg-teal-50/60 dark:bg-teal-950/30'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {item.name}
                          </span>
                          {item.level === 'village' && (
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 font-medium">
                              Village ➔ {item.gp_name} GP
                            </span>
                          )}
                          {item.has_data ? (
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 font-medium">
                              Live Data
                            </span>
                          ) : (
                            <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 font-medium">
                              Not loaded yet
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.full_path}
                        </p>
                        {item.lgd_code && (
                          <p className="text-[11px] text-slate-400">
                            LGD Code: {item.lgd_code}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-3">
                        <button
                          onClick={(e) => togglePin(item.gp_id, e)}
                          className="p-1 text-slate-400 hover:text-amber-500"
                          title="Pin location"
                        >
                          <Star className={`w-4 h-4 ${pinnedLocation === item.gp_id ? 'text-amber-400 fill-amber-400' : ''}`} />
                        </button>
                        {item.gp_id === selectedPanchayatId && (
                          <Check className="w-5 h-5 text-teal-600 dark:text-teal-400 font-bold" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* B. 4-Column Drilldown View */
            <div className="space-y-4">
              {/* Mobile Step Navigator (< 768px) */}
              <div className="md:hidden flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <div className="flex items-center gap-1">
                  {mobileStep > 1 && (
                    <button
                      onClick={() => setMobileStep((s) => Math.max(1, s - 1))}
                      className="p-1 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 mr-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    Step {mobileStep} of 4:
                  </span>
                  <span className="text-teal-600 font-semibold">
                    {mobileStep === 1 ? 'Select State' : mobileStep === 2 ? 'Select District' : mobileStep === 3 ? 'Select Block' : 'Select Panchayat'}
                  </span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(st => (
                    <div
                      key={st}
                      className={`w-2 h-2 rounded-full ${mobileStep === st ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Responsive 4 Columns / Mobile Single Step */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                {/* 1. State Column */}
                <div className={`space-y-1.5 ${mobileStep !== 1 ? 'hidden md:block' : ''}`}>
                  <div className="flex items-center justify-between px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>1. State</span>
                    <span className="text-[11px] font-normal">{states.length}</span>
                  </div>
                  <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                    {states.map(st => (
                      <button
                        key={st.id}
                        onClick={() => {
                          setSelectedState(st.id);
                          setMobileStep(2);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm transition min-h-[52px] ${
                          selectedState === st.id
                            ? 'bg-teal-600 text-white font-bold shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="truncate">
                          <div>{st.name}</div>
                          {st.name_hi && (
                            <div className="text-[11px] opacity-75">{st.name_hi}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                            selectedState === st.id ? 'bg-teal-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}>
                            {st.item_count}
                          </span>
                          <ChevronRight className="w-4 h-4 opacity-60" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. District Column */}
                <div className={`space-y-1.5 ${mobileStep !== 2 ? 'hidden md:block' : ''}`}>
                  <div className="flex items-center justify-between px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>2. District</span>
                    <span className="text-[11px] font-normal">{districts.length}</span>
                  </div>
                  <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                    {districts.map(d => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setSelectedDistrict(d.id);
                          setMobileStep(3);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm transition min-h-[52px] ${
                          selectedDistrict === d.id
                            ? 'bg-teal-600 text-white font-bold shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="truncate">
                          <div>{d.name}</div>
                          {d.name_hi && (
                            <div className="text-[11px] opacity-75">{d.name_hi}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {d.has_data && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          )}
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                            selectedDistrict === d.id ? 'bg-teal-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}>
                            {d.item_count}
                          </span>
                          <ChevronRight className="w-4 h-4 opacity-60" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Block Column */}
                <div className={`space-y-1.5 ${mobileStep !== 3 ? 'hidden md:block' : ''}`}>
                  <div className="flex items-center justify-between px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>3. Block / Taluka</span>
                    <span className="text-[11px] font-normal">{blocks.length}</span>
                  </div>
                  <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                    {blocks.map(b => (
                      <button
                        key={b.id}
                        onClick={() => {
                          setSelectedBlock(b.id);
                          setMobileStep(4);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left text-sm transition min-h-[52px] ${
                          selectedBlock === b.id
                            ? 'bg-teal-600 text-white font-bold shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="truncate">
                          <div>{b.name}</div>
                          {b.name_hi && (
                            <div className="text-[11px] opacity-75">{b.name_hi}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {b.has_data && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                          )}
                          <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                            selectedBlock === b.id ? 'bg-teal-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}>
                            {b.item_count}
                          </span>
                          <ChevronRight className="w-4 h-4 opacity-60" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Gram Panchayat Column */}
                <div className={`space-y-1.5 ${mobileStep !== 4 ? 'hidden md:block' : ''}`}>
                  <div className="flex items-center justify-between px-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <span>4. Gram Panchayat</span>
                    <span className="text-[11px] font-normal">{panchayats.length}</span>
                  </div>
                  <div className="space-y-1 max-h-[50vh] overflow-y-auto pr-1">
                    {panchayats.map(p => {
                      const isSelected = p.id === selectedPanchayatId;
                      return (
                        <div
                          key={p.id}
                          className={`w-full flex items-start justify-between p-3 rounded-xl border transition min-h-[56px] ${
                            isSelected
                              ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/40'
                              : p.has_data
                              ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-slate-300'
                              : 'border-slate-100 dark:border-slate-800/40 bg-slate-50/30 opacity-60'
                          }`}
                        >
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => {
                              if (p.has_data) {
                                handleSelectGP(p.id, p.name);
                              } else {
                                setInfoMessage(
                                  `Forecast models for "${p.name}" are not provisioned yet. The system currently evaluates Haveli block panchayats with AWS/ARG telemetry.`
                                );
                              }
                            }}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-slate-900 dark:text-white">
                                {p.name}
                              </span>
                              {p.has_data ? (
                                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  LIVE
                                </span>
                              ) : (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                  LGD Only
                                </span>
                              )}
                            </div>
                            {p.villages_count > 0 && (
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {p.villages_count} Villages ({p.villages.slice(0, 2).join(', ')}...)
                              </div>
                            )}
                            {p.lgd_code && (
                              <div className="text-[10px] text-slate-400">
                                LGD: {p.lgd_code}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              onClick={(e) => togglePin(p.id, e)}
                              className="p-1 text-slate-400 hover:text-amber-500"
                              title="Pin panchayat"
                            >
                              <Star className={`w-3.5 h-3.5 ${pinnedLocation === p.id ? 'text-amber-400 fill-amber-400' : ''}`} />
                            </button>
                            {isSelected && (
                              <Check className="w-5 h-5 text-teal-600 dark:text-teal-400 font-bold" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
          <div>
            Honest Coverage: Official Local Government Directory (LGD) Level 5 standard. Prototype downscaling active for Pune/Haveli GPs.
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Shortcut:</span>
            <kbd className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[11px] font-mono">Ctrl+K</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}
