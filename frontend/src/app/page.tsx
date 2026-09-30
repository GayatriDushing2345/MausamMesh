'use client';

import React, { useState, useEffect } from 'react';
import { SidebarNav } from '@/components/SidebarNav';
import { TopBar } from '@/components/TopBar';
import { DashboardScreen } from '@/components/DashboardScreen';
import { MapScreen } from '@/components/MapScreen';
import { AnalysisScreen } from '@/components/AnalysisScreen';
import { AdvisoryScreen } from '@/components/AdvisoryScreen';
import { ReliabilityScreen } from '@/components/ReliabilityScreen';
import { SettingsScreen } from '@/components/SettingsScreen';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { VoiceAssistantModal } from '@/components/VoiceAssistantModal';
import { Language } from '@/lib/i18n';
import { 
  LocationHierarchy, 
  PanchayatForecastResponse, 
  MapGeoJSONResponse 
} from '@/lib/types';
import { 
  fetchLocations, 
  fetchPanchayatForecast, 
  fetchPanchayatMap,
  getReportDownloadUrl 
} from '@/lib/api';

export default function Home() {
  const [locations, setLocations] = useState<LocationHierarchy | null>(null);
  const [selectedState, setSelectedState] = useState<string>('STATE_27');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('DIST_001');
  const [selectedBlock, setSelectedBlock] = useState<string>('BLK_001');
  const [selectedPanchayat, setSelectedPanchayat] = useState<string>('PANC_001');
  const [activeLanguage, setActiveLanguage] = useState<Language>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [leadDay, setLeadDay] = useState<number>(1);

  const [forecast, setForecast] = useState<PanchayatForecastResponse | null>(null);
  const [mapData, setMapData] = useState<MapGeoJSONResponse | null>(null);

  const [loadingLocations, setLoadingLocations] = useState<boolean>(true);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [isWakingUp, setIsWakingUp] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Restore persistent state (language, location, theme, URL params) on mount
  useEffect(() => {
    try {
      // 1. URL search params sync (?gp=&day=)
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const gpParam = params.get('gp');
        const dayParam = params.get('day');
        if (gpParam) setSelectedPanchayat(gpParam);
        if (dayParam) {
          const d = parseInt(dayParam, 10);
          if (!isNaN(d) && d >= 0 && d <= 7) setLeadDay(d);
        }
      }

      const savedLang = localStorage.getItem('sih_language') as Language;
      if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) {
        setActiveLanguage(savedLang);
      }

      const savedTheme = localStorage.getItem('sih_theme');
      if (savedTheme === 'dark') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
      }

      const savedLoc = localStorage.getItem('sih_location');
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        if (parsed.state) setSelectedState(parsed.state);
        if (parsed.district) setSelectedDistrict(parsed.district);
        if (parsed.block) setSelectedBlock(parsed.block);
        if (parsed.panchayat) setSelectedPanchayat(parsed.panchayat);
      }
    } catch (e) {
      console.warn("Could not restore stored state:", e);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('sih_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('sih_theme', 'light');
      }
      return next;
    });
  };

  const saveLocationSelection = (st: string, dist: string, blk: string, panc: string) => {
    try {
      localStorage.setItem('sih_location', JSON.stringify({ state: st, district: dist, block: blk, panchayat: panc }));
    } catch (e) {
      console.warn("Could not save location selection:", e);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setActiveLanguage(lang);
    try {
      localStorage.setItem('sih_language', lang);
    } catch (e) {
      console.warn("Could not save language choice:", e);
    }
  };

  // 1. Fetch Location Hierarchy on initial mount
  useEffect(() => {
    async function initLocations() {
      try {
        setLoadingLocations(true);
        const data = await fetchLocations();
        setLocations(data);
        
        if (data.states && data.states.length > 0) {
          const st = data.states.find(s => s.id === selectedState) || data.states[0];
          setSelectedState(st.id);
          if (st.districts && st.districts.length > 0) {
            const dist = st.districts.find(d => d.id === selectedDistrict) || st.districts[0];
            setSelectedDistrict(dist.id);
            if (dist.blocks && dist.blocks.length > 0) {
              const blk = dist.blocks.find(b => b.id === selectedBlock) || dist.blocks[0];
              setSelectedBlock(blk.id);
              if (blk.panchayats && blk.panchayats.length > 0) {
                const p = blk.panchayats.find(p => p.id === selectedPanchayat) || blk.panchayats[0];
                setSelectedPanchayat(p.id);
              }
            }
          }
        }
      } catch (err: any) {
        console.error("Location init error:", err);
        setError("Failed to load locations. Is backend running?");
      } finally {
        setLoadingLocations(false);
      }
    }
    initLocations();
  }, []);

  // 2. Fetch Forecast & Map data whenever selected Panchayat changes
  useEffect(() => {
    if (!selectedPanchayat) return;

    let isMounted = true;
    const wakeTimer = setTimeout(() => {
      if (isMounted) setIsWakingUp(true);
    }, 2000);

    async function loadPanchayatData() {
      try {
        setLoadingData(true);
        setError(null);
        const [fc, mp] = await Promise.all([
          fetchPanchayatForecast(selectedPanchayat),
          fetchPanchayatMap(selectedPanchayat)
        ]);
        if (isMounted) {
          setForecast(fc);
          setMapData(mp);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Data load error:", err);
          setError(err.message || "Failed to load forecast data");
        }
      } finally {
        if (isMounted) {
          clearTimeout(wakeTimer);
          setIsWakingUp(false);
          setLoadingData(false);
        }
      }
    }

    loadPanchayatData();

    return () => {
      isMounted = false;
      clearTimeout(wakeTimer);
    };
  }, [selectedPanchayat]);

  // Handlers for Location Selector Drilldown
  const handleSelectState = (stateId: string) => {
    setSelectedState(stateId);
    const stObj = locations?.states.find(s => s.id === stateId);
    if (stObj && stObj.districts.length > 0) {
      const distObj = stObj.districts[0];
      setSelectedDistrict(distObj.id);
      if (distObj.blocks.length > 0) {
        const blkObj = distObj.blocks[0];
        setSelectedBlock(blkObj.id);
        if (blkObj.panchayats.length > 0) {
          const pancId = blkObj.panchayats[0].id;
          setSelectedPanchayat(pancId);
          saveLocationSelection(stateId, distObj.id, blkObj.id, pancId);
        }
      }
    }
  };

  const handleSelectDistrict = (distId: string) => {
    setSelectedDistrict(distId);
    const stObj = locations?.states.find(s => s.id === selectedState);
    const distObj = stObj?.districts.find(d => d.id === distId) || locations?.districts.find(d => d.id === distId);
    if (distObj && distObj.blocks.length > 0) {
      const blkObj = distObj.blocks[0];
      setSelectedBlock(blkObj.id);
      if (blkObj.panchayats.length > 0) {
        const pancId = blkObj.panchayats[0].id;
        setSelectedPanchayat(pancId);
        saveLocationSelection(selectedState, distId, blkObj.id, pancId);
      }
    }
  };

  const handleSelectBlock = (blkId: string) => {
    setSelectedBlock(blkId);
    const stObj = locations?.states.find(s => s.id === selectedState);
    const distObj = stObj?.districts.find(d => d.id === selectedDistrict) || locations?.districts.find(d => d.id === selectedDistrict);
    const blkObj = distObj?.blocks.find(b => b.id === blkId);
    if (blkObj && blkObj.panchayats.length > 0) {
      const pancId = blkObj.panchayats[0].id;
      setSelectedPanchayat(pancId);
      saveLocationSelection(selectedState, selectedDistrict, blkId, pancId);
    }
  };

  const handleSelectPanchayat = (pId: string) => {
    setSelectedPanchayat(pId);
    saveLocationSelection(selectedState, selectedDistrict, selectedBlock, pId);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('gp', pId);
      url.searchParams.set('day', String(leadDay));
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleDaySelect = (day: number) => {
    setLeadDay(day);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('gp', selectedPanchayat);
      url.searchParams.set('day', String(day));
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleDownloadReport = () => {
    const pdfUrl = getReportDownloadUrl(selectedPanchayat, 'Cotton', activeLanguage);
    window.open(pdfUrl, '_blank');
  };

  const panchayatName = forecast?.panchayat_name || 'Wagholi';

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F6F3EC] dark:bg-[#061321] text-slate-900 dark:text-slate-100 font-sans transition-colors w-full">
      
      {/* 1. PERSISTENT SIDEBAR NAVIGATION (Desktop left sidebar / Mobile bottom tab bar) */}
      <SidebarNav
        activeTab={activeTab}
        activeLanguage={activeLanguage}
        onTabChange={setActiveTab}
        onDownloadReport={handleDownloadReport}
        onLanguageChange={handleLanguageChange}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onSelectPanchayat={handleSelectPanchayat}
        selectedPanchayatId={selectedPanchayat}
      />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 w-full pb-24 md:pb-6">
        
        {/* 2. UNIFIED STICKY TOP BAR */}
        <TopBar
          locations={locations}
          selectedState={selectedState}
          selectedDistrict={selectedDistrict}
          selectedBlock={selectedBlock}
          selectedPanchayat={selectedPanchayat}
          activeLanguage={activeLanguage}
          onSelectState={handleSelectState}
          onSelectDistrict={handleSelectDistrict}
          onSelectBlock={handleSelectBlock}
          onSelectPanchayat={handleSelectPanchayat}
          onLanguageChange={handleLanguageChange}
          isDarkMode={isDarkMode}
          onToggleTheme={toggleTheme}
          onNavigateTab={setActiveTab}
          onTriggerVoice={() => setVoiceModalOpen(true)}
          leadDay={leadDay}
        />

        {isWakingUp && !forecast && (
          <div className="bg-gradient-to-r from-teal-700 via-cyan-700 to-teal-800 text-white px-4 py-2.5 text-xs text-center font-bold flex items-center justify-center gap-2 shadow-sm animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping" />
            <span>Connecting to MausamMesh Cloud Server... (Free-tier cloud engine spins up in ~25s on first request, subsequent requests are instant)</span>
          </div>
        )}

        {error && (
          <div className="bg-red-600 text-white px-4 py-2 text-xs text-center font-bold flex items-center justify-center gap-2">
            <span>⚠️ {error}</span>
            <button
              onClick={() => window.location.reload()}
              className="underline hover:text-red-100 ml-2 cursor-pointer font-extrabold"
            >
              Retry
            </button>
          </div>
        )}

        <main className="flex-1 w-full min-w-0 max-w-[2200px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          {activeTab === 'dashboard' && (
            <DashboardScreen
              forecast={forecast}
              mapData={mapData}
              selectedPanchayatId={selectedPanchayat}
              loading={loadingData}
              activeLanguage={activeLanguage}
              onNavigateToMap={() => setActiveTab('map')}
              onNavigateToAdvisory={() => setActiveTab('advisory')}
              onNavigateToAnalysis={() => setActiveTab('analysis')}
              leadDay={leadDay}
              onSelectLeadDay={handleDaySelect}
            />
          )}

          {activeTab === 'map' && (
            <MapScreen
              mapData={mapData}
              forecast={forecast}
              selectedPanchayatId={selectedPanchayat}
              loading={loadingData}
              activeLanguage={activeLanguage}
              onSelectPanchayat={handleSelectPanchayat}
              onNavigateToAdvisory={() => setActiveTab('advisory')}
              onNavigateToAnalysis={() => setActiveTab('analysis')}
            />
          )}

          {activeTab === 'analysis' && (
            <AnalysisScreen
              forecast={forecast}
              selectedPanchayatId={selectedPanchayat}
              loading={loadingData}
              activeLanguage={activeLanguage}
              onNavigateToAdvisory={() => setActiveTab('advisory')}
            />
          )}

          {activeTab === 'advisory' && (
            <AdvisoryScreen
              selectedPanchayatId={selectedPanchayat}
              panchayatName={panchayatName}
              forecast={forecast}
              activeLanguage={activeLanguage}
              onNavigateToReliability={() => setActiveTab('reliability')}
            />
          )}

          {activeTab === 'reliability' && (
            <ReliabilityScreen
              selectedPanchayatId={selectedPanchayat}
              panchayatName={panchayatName}
              activeLanguage={activeLanguage}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              activeLanguage={activeLanguage}
              onLanguageChange={handleLanguageChange}
            />
          )}
        </main>

        {/* Floating AI Assistant Chatbot */}
        <ChatbotWidget activeTab={activeTab} activeLanguage={activeLanguage} />

        {/* Multilingual Voice Assistant Modal */}
        <VoiceAssistantModal
          isOpen={voiceModalOpen}
          onClose={() => setVoiceModalOpen(false)}
          activeLanguage={activeLanguage}
          onNavigateTab={setActiveTab}
          onDownloadReport={handleDownloadReport}
          onLanguageChange={handleLanguageChange}
          liveForecast={forecast}
        />
      </div>

    </div>
  );
}
