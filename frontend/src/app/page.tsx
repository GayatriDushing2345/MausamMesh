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
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [forecast, setForecast] = useState<PanchayatForecastResponse | null>(null);
  const [mapData, setMapData] = useState<MapGeoJSONResponse | null>(null);

  const [loadingLocations, setLoadingLocations] = useState<boolean>(true);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Restore persistent state from localStorage on mount
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('sih_language') as Language;
      if (savedLang && ['en', 'hi', 'mr'].includes(savedLang)) {
        setActiveLanguage(savedLang);
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
      console.warn("Could not restore stored selection:", e);
    }
  }, []);

  // Save location selection to localStorage
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

    async function loadPanchayatData() {
      try {
        setLoadingData(true);
        setError(null);
        const [fc, mp] = await Promise.all([
          fetchPanchayatForecast(selectedPanchayat),
          fetchPanchayatMap(selectedPanchayat)
        ]);
        setForecast(fc);
        setMapData(mp);
      } catch (err: any) {
        console.error("Data load error:", err);
        setError(err.message || "Failed to load forecast data");
      } finally {
        setLoadingData(false);
      }
    }

    loadPanchayatData();
  }, [selectedPanchayat]);

  // Handlers for Location Selector Level Drilldown
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
  };

  const handleDownloadReport = () => {
    const pdfUrl = getReportDownloadUrl(selectedPanchayat, 'Cotton', activeLanguage);
    window.open(pdfUrl, '_blank');
  };

  const panchayatName = forecast?.panchayat_name || 'Wagholi';

  return (
    <div className="relative min-h-screen flex bg-slate-900 text-slate-900">
      
      {/* ATMOSPHERIC AGRICULTURAL LANDSCAPE BACKGROUND IMAGE */}
      <div 
        className="fixed inset-0 bg-cover bg-fixed bg-center z-0 pointer-events-none opacity-25"
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1920&auto=format&fit=crop')` }}
      />
      <div className="fixed inset-0 bg-gradient-to-br from-slate-100/95 via-[#FAF9F5]/98 to-emerald-50/90 backdrop-blur-[1px] z-0 pointer-events-none" />

      {/* 1. PERSISTENT LEFT SIDEBAR NAVIGATION */}
      <SidebarNav
        activeTab={activeTab}
        activeLanguage={activeLanguage}
        onTabChange={setActiveTab}
        onDownloadReport={handleDownloadReport}
      />

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        
        {/* 2. UNIFIED TOP BAR */}
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
        />

        {error && (
          <div className="bg-red-700 text-white px-4 py-2.5 text-sm text-center font-black">
            ⚠️ {error}. Please ensure FastAPI backend is running at <code>http://127.0.0.1:8000</code>.
          </div>
        )}

        <div className="flex-1">
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
        </div>

        {/* Floating AI Assistant Chatbot */}
        <ChatbotWidget activeTab={activeTab} activeLanguage={activeLanguage} />
      </div>

    </div>
  );
}
