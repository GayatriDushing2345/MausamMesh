'use client';

import React, { useState } from 'react';
import { LocationHierarchy } from '@/lib/types';
import { Language, SUPPORTED_LANGUAGES, t, getLocalizedLocationName } from '@/lib/i18n';
import { LocationExplorerModal } from './LocationExplorerModal';
import { DataHealthModal } from './DataHealthModal';
import { CommandPalette } from './CommandPalette';
import { MausamMeshLogo } from './MausamMeshLogo';
import { Search, Globe, MapPin, Sun, Moon, ChevronDown, Mic, Activity, Share2, Check } from 'lucide-react';

interface TopBarProps {
  locations: LocationHierarchy | null;
  selectedState: string;
  selectedDistrict: string;
  selectedBlock: string;
  selectedPanchayat: string;
  activeLanguage: Language;
  onSelectState: (stateId: string) => void;
  onSelectDistrict: (distId: string) => void;
  onSelectBlock: (blockId: string) => void;
  onSelectPanchayat: (panchayatId: string) => void;
  onLanguageChange: (lang: Language) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onNavigateTab: (tabId: string) => void;
  onTriggerVoice?: () => void;
  leadDay?: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  locations,
  selectedState,
  selectedDistrict,
  selectedBlock,
  selectedPanchayat,
  activeLanguage,
  onSelectState,
  onSelectDistrict,
  onSelectBlock,
  onSelectPanchayat,
  onLanguageChange,
  isDarkMode,
  onToggleTheme,
  onNavigateTab,
  onTriggerVoice,
  leadDay = 1,
}) => {
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [dataHealthOpen, setDataHealthOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const statesList = locations?.states || [];
  const currentStateObj = statesList.find(s => s.id === selectedState) || statesList[0];
  const districtsList = currentStateObj?.districts || locations?.districts || [];
  const currentDistrictObj = districtsList.find(d => d.id === selectedDistrict) || districtsList[0];
  const blocksList = currentDistrictObj?.blocks || [];
  const currentBlockObj = blocksList.find(b => b.id === selectedBlock) || blocksList[0];
  const panchayatsList = currentBlockObj?.panchayats || [];
  const currentPanchayatObj = panchayatsList.find(p => p.id === selectedPanchayat) || panchayatsList[0];

  const localizedPanchayat = getLocalizedLocationName(currentPanchayatObj?.name || 'Wagholi', activeLanguage);
  const localizedBlock = getLocalizedLocationName(currentBlockObj?.name || 'Haveli', activeLanguage);
  const localizedDistrict = getLocalizedLocationName(currentDistrictObj?.name || 'Pune', activeLanguage);
  const localizedState = getLocalizedLocationName(currentStateObj?.name || 'Maharashtra', activeLanguage);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}${window.location.pathname}?gp=${selectedPanchayat}&day=${leadDay}`;
      navigator.clipboard.writeText(url).then(() => {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2000);
      });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#0B1622]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 px-[clamp(12px,2vw,32px)] py-2.5 shadow-xs transition-colors">
        <div className="w-full max-w-[2200px] mx-auto flex flex-col gap-2">
          
          {/* Top Row: Brand on Mobile, Location Chip on Desktop + Actions */}
          <div className="w-full flex items-center justify-between gap-2.5">
            
            {/* Left Desktop: Location Explorer Chip */}
            <div className="hidden md:flex items-center gap-2.5 flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setExplorerOpen(true)}
                className="flex items-center justify-between gap-2.5 bg-[#F6F3EC] dark:bg-[#121F2F] hover:bg-slate-200/70 dark:hover:bg-[#1A2E44] border border-slate-300/80 dark:border-white/10 px-3.5 py-2 rounded-2xl text-xs text-[#0B1F33] dark:text-slate-100 transition-all font-semibold group cursor-pointer min-h-[44px] max-w-md shadow-2xs"
                aria-label="Open Location Explorer"
              >
                <div className="flex items-center gap-2 truncate">
                  <MapPin className="w-4 h-4 text-[#0E7C86] dark:text-[#2DD4BF] shrink-0" />
                  <span className="font-extrabold text-sm text-[#0B1F33] dark:text-white truncate">{localizedPanchayat}</span>
                  <span className="text-slate-500 dark:text-slate-400 text-xs truncate">
                    • {localizedBlock}, {localizedDistrict}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:translate-y-0.5 transition-transform shrink-0" />
              </button>
            </div>

            {/* Left Mobile: Clean Brand Logo with Live Health Beacon */}
            <div className="md:hidden flex items-center gap-2 shrink-0 min-w-0">
              <MausamMeshLogo language={activeLanguage} size="sm" showSubtitle={false} />
              <button
                type="button"
                onClick={() => setDataHealthOpen(true)}
                className="relative flex items-center justify-center p-1 rounded-full hover:bg-slate-100 dark:hover:bg-[#121F2F] transition-colors"
                title="Operational Data Pipeline: Nominal"
                aria-label="View data pipeline health"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </button>
            </div>

            {/* Right Controls: Streamlined on Mobile, Comprehensive on Desktop */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0 text-xs">
              
              {/* Desktop Live Data Health Indicator */}
              <button
                type="button"
                onClick={() => setDataHealthOpen(true)}
                className="hidden sm:flex items-center gap-1.5 bg-[#F6F3EC] dark:bg-[#121F2F] hover:bg-slate-200/80 dark:hover:bg-[#1A2E44] text-slate-700 dark:text-slate-200 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200/80 dark:border-white/10 text-xs font-semibold transition-colors min-h-[38px] sm:min-h-[44px] cursor-pointer shadow-2xs"
                title="Operational Data Pipeline Health: Nominal (Click for details)"
                aria-label="View data pipeline health"
              >
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="hidden md:inline font-bold text-xs">Data: Nominal</span>
              </button>

              {/* Share URL Button (Desktop & Tablet) */}
              <button
                type="button"
                onClick={handleShare}
                className="hidden sm:flex p-2 sm:px-3 sm:py-2 rounded-xl bg-[#F6F3EC] dark:bg-[#0F2742] hover:bg-slate-200/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold transition-colors items-center gap-1.5 min-h-[38px] sm:min-h-[44px] justify-center cursor-pointer"
                title="Share link with current panchayat and lead day"
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="hidden lg:inline text-xs text-emerald-600 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden lg:inline text-xs">Share</span>
                  </>
                )}
              </button>

              {/* Quick Search / Command Trigger */}
              <button
                type="button"
                onClick={() => setCmdOpen(true)}
                className="flex items-center gap-1.5 bg-[#F6F3EC] dark:bg-[#0F2742] hover:bg-slate-200/80 dark:hover:bg-slate-800 text-[#5B6472] dark:text-[#B8C4D6] p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs font-semibold transition-colors min-h-[38px] sm:min-h-[44px] min-w-[38px] justify-center"
                aria-label="Search Command Palette"
                title="Search locations and commands (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden lg:inline text-xs">Search...</span>
                <kbd className="hidden sm:inline font-mono text-[10px] bg-white dark:bg-slate-800 px-1 py-0.5 rounded text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  ⌘K
                </kbd>
              </button>

              {/* Global Voice Assistant Button */}
              {onTriggerVoice && (
                <button
                  type="button"
                  onClick={onTriggerVoice}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#E6F6F7] dark:bg-[#0E7C86]/25 hover:bg-[#0E7C86]/20 text-[#0E7C86] dark:text-[#2DB3C0] border border-[#0E7C86]/30 font-bold transition-all flex items-center gap-1.5 min-w-[38px] sm:min-w-[44px] min-h-[38px] sm:min-h-[44px] justify-center cursor-pointer shadow-2xs"
                  title={t('voice.mic_button_label', activeLanguage)}
                  aria-label={t('voice.mic_button_label', activeLanguage)}
                >
                  <Mic className="w-4 h-4" />
                  <span className="hidden xl:inline text-xs">Voice</span>
                </button>
              )}

              {/* 11 Indian Languages Native Switcher */}
              <div className="flex items-center gap-1 bg-[#F6F3EC] dark:bg-[#0F2742] px-2 py-1.5 sm:px-2.5 sm:py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 min-h-[38px] sm:min-h-[44px]">
                <Globe className="w-3.5 h-3.5 text-[#0E7C86] dark:text-[#2DB3C0] shrink-0" />
                <select
                  value={activeLanguage}
                  onChange={(e) => onLanguageChange(e.target.value as Language)}
                  className="bg-transparent font-extrabold text-[#0B1F33] dark:text-slate-100 focus:outline-none cursor-pointer text-xs max-w-[65px] sm:max-w-none"
                  aria-label="Select Language"
                >
                  {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.code} className="text-slate-900 bg-white dark:bg-[#0B1F33] dark:text-white">
                      {lang.nativeName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day / Night Theme Toggle */}
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#F6F3EC] dark:bg-[#121F2F] hover:bg-slate-200 dark:hover:bg-[#1A2E44] text-[#0B1F33] dark:text-slate-100 border border-slate-300/80 dark:border-white/10 transition-colors flex items-center gap-1 font-bold min-h-[38px] sm:min-h-[44px] min-w-[38px] sm:min-w-[44px] justify-center cursor-pointer shadow-2xs"
                aria-label="Toggle Light and Dark Theme"
              >
                {isDarkMode ? (
                  <>
                    <Moon className="w-4 h-4 text-[#2DD4BF]" />
                    <span className="hidden sm:inline text-xs">Night</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="hidden sm:inline text-xs">Day</span>
                  </>
                )}
              </button>

            </div>

        </div>

        {/* Row 2 (Mobile only): Full-Width Location Explorer Button */}
        <div className="md:hidden w-full pt-1">
          <button
            type="button"
            onClick={() => setExplorerOpen(true)}
            className="w-full flex items-center justify-between gap-2 bg-[#F6F3EC] dark:bg-[#121F2F] hover:bg-slate-200/80 dark:hover:bg-[#1A2E44] border border-slate-300/80 dark:border-white/10 px-3.5 py-2 rounded-xl text-xs text-[#0B1F33] dark:text-slate-100 transition-all font-semibold shadow-2xs"
            aria-label="Open Location Explorer"
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-[#0E7C86] dark:text-[#2DD4BF] shrink-0" />
              <span className="font-extrabold text-sm text-[#0B1F33] dark:text-white truncate">{localizedPanchayat}</span>
              <span className="text-slate-500 dark:text-slate-400 text-xs truncate">
                • {localizedBlock}, {localizedDistrict}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>

      </div>
    </header>

      {/* Location Explorer Modal (Round 4A Core) */}
      <LocationExplorerModal
        isOpen={explorerOpen}
        onClose={() => setExplorerOpen(false)}
        selectedPanchayatId={selectedPanchayat}
        onSelectPanchayat={(pId) => {
          onSelectPanchayat(pId);
        }}
        leadDay={leadDay}
      />

      {/* Data Health Pipeline Modal (Round 4B Core) */}
      <DataHealthModal
        isOpen={dataHealthOpen}
        onClose={() => setDataHealthOpen(false)}
      />

      {/* Command Palette Keyboard Dialog */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        activeLanguage={activeLanguage}
        onNavigateTab={onNavigateTab}
        onOpenLocationSearch={() => {
          setCmdOpen(false);
          setExplorerOpen(true);
        }}
      />
    </>
  );
};

