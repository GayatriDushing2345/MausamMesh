'use client';

import React, { useState } from 'react';
import { LocationHierarchy } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';
import { 
  MapPin, 
  ChevronRight,
  Search
} from 'lucide-react';

interface NavigationProps {
  locations: LocationHierarchy | null;
  selectedState: string;
  selectedDistrict: string;
  selectedBlock: string;
  selectedPanchayat: string;
  activeTab?: string;
  activeLanguage: Language;
  onSelectState: (id: string) => void;
  onSelectDistrict: (id: string) => void;
  onSelectBlock: (id: string) => void;
  onSelectPanchayat: (id: string) => void;
  onTabChange?: (tab: string) => void;
  onLanguageChange?: (lang: Language) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
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
}) => {
  const [panchayatSearch, setPanchayatSearch] = useState('');
  const t = translations[activeLanguage] || translations.en;

  // Resolve hierarchy objects
  const statesList = locations?.states || [];
  const currentStateObj = statesList.find(s => s.id === selectedState) || statesList[0];
  const districtsList = currentStateObj?.districts || locations?.districts || [];
  const currentDistrictObj = districtsList.find(d => d.id === selectedDistrict) || districtsList[0];
  const blocksList = currentDistrictObj?.blocks || [];
  const currentBlockObj = blocksList.find(b => b.id === selectedBlock) || blocksList[0];
  const panchayatList = currentBlockObj?.panchayats || [];

  const filteredPanchayats = panchayatSearch.trim()
    ? panchayatList.filter(p => p.name.toLowerCase().includes(panchayatSearch.toLowerCase()))
    : panchayatList;

  return (
    <div className="bg-white dark:bg-[#0B1622] border-b border-slate-200/80 dark:border-white/10 sticky top-[61px] z-20 px-4 py-2.5 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* 5-Level LGD Location Hierarchy Selector */}
        <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto no-scrollbar py-0.5">
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-extrabold text-xs shrink-0 pr-1.5 border-r border-slate-300/80 dark:border-slate-700 mr-0.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden sm:inline font-bold">Target:</span>
          </div>

          {/* Country */}
          <div className="bg-slate-50 dark:bg-[#122137] border border-slate-300/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-bold px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 shrink-0 shadow-2xs">
            <span>🇮🇳</span>
            <span>India</span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 hidden sm:inline" />

          {/* State */}
          <select
            value={selectedState}
            onChange={(e) => onSelectState(e.target.value)}
            className="shrink-0 bg-white dark:bg-[#122137] border border-slate-300/80 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs cursor-pointer shadow-2xs"
            aria-label="Select State"
          >
            {statesList.map(s => (
              <option key={s.id} value={s.id} className="dark:bg-[#0E1A29] dark:text-white">{s.name} ({s.code})</option>
            ))}
          </select>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 hidden sm:inline" />

          {/* District */}
          <select
            value={selectedDistrict}
            disabled={!selectedState}
            onChange={(e) => onSelectDistrict(e.target.value)}
            className="shrink-0 bg-white dark:bg-[#122137] border border-slate-300/80 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs disabled:bg-slate-100 dark:disabled:bg-slate-800 cursor-pointer shadow-2xs"
            aria-label="Select District"
          >
            {districtsList.map(d => (
              <option key={d.id} value={d.id} className="dark:bg-[#0E1A29] dark:text-white">{d.name} District</option>
            ))}
          </select>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 hidden sm:inline" />

          {/* Block */}
          <select
            value={selectedBlock}
            disabled={!selectedDistrict}
            onChange={(e) => onSelectBlock(e.target.value)}
            className="shrink-0 bg-white dark:bg-[#122137] border border-slate-300/80 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-900 dark:text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs disabled:bg-slate-100 dark:disabled:bg-slate-800 cursor-pointer shadow-2xs"
            aria-label="Select Block"
          >
            {blocksList.map(b => (
              <option key={b.id} value={b.id} className="dark:bg-[#0E1A29] dark:text-white">{b.name} Block</option>
            ))}
          </select>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 hidden sm:inline" />

          {/* Gram Panchayat */}
          <select
            value={selectedPanchayat}
            disabled={!selectedBlock}
            onChange={(e) => onSelectPanchayat(e.target.value)}
            className="shrink-0 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold border border-emerald-800 dark:border-emerald-500 rounded-lg px-3 py-1.5 text-xs cursor-pointer shadow-xs transition-colors"
            aria-label="Select Panchayat"
          >
            {filteredPanchayats.map(p => (
              <option key={p.id} value={p.id} className="text-slate-900 bg-white dark:bg-[#0E1A29] dark:text-white font-medium">
                {p.name} Panchayat
              </option>
            ))}
          </select>
        </div>

        {/* Quick Filter Input */}
        <div className="relative shrink-0 hidden md:block">
          <input
            type="text"
            value={panchayatSearch}
            onChange={(e) => setPanchayatSearch(e.target.value)}
            placeholder="Filter panchayat..."
            className="w-36 text-xs border border-slate-300/80 dark:border-slate-700 rounded-lg px-2.5 py-1.5 pl-7 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-[#122137] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 absolute left-2 top-2.5" />
        </div>

      </div>
    </div>
  );
};

