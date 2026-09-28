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
    <div className="bg-white border-b border-slate-200/80 sticky top-[61px] z-20 px-4 py-2 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs">
        
        {/* 5-Level LGD Location Hierarchy Selector */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          <div className="flex items-center gap-1 text-slate-800 font-bold text-xs shrink-0 pr-1 border-r border-slate-300/80 mr-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>Target Location:</span>
          </div>

          {/* Country */}
          <div className="bg-white border border-slate-300/80 text-slate-800 font-semibold px-2 py-1 rounded-lg text-xs flex items-center gap-1 shrink-0">
            <span>🇮🇳</span>
            <span>India</span>
          </div>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />

          {/* State */}
          <select
            value={selectedState}
            onChange={(e) => onSelectState(e.target.value)}
            className="bg-white border border-slate-300/80 rounded-lg px-2 py-1 text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs cursor-pointer shadow-2xs"
            aria-label="Select State"
          >
            {statesList.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
            ))}
          </select>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />

          {/* District */}
          <select
            value={selectedDistrict}
            disabled={!selectedState}
            onChange={(e) => onSelectDistrict(e.target.value)}
            className="bg-white border border-slate-300/80 rounded-lg px-2 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs disabled:bg-slate-100 cursor-pointer shadow-2xs"
            aria-label="Select District"
          >
            {districtsList.map(d => (
              <option key={d.id} value={d.id}>{d.name} District</option>
            ))}
          </select>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />

          {/* Block */}
          <select
            value={selectedBlock}
            disabled={!selectedDistrict}
            onChange={(e) => onSelectBlock(e.target.value)}
            className="bg-white border border-slate-300/80 rounded-lg px-2 py-1 text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs disabled:bg-slate-100 cursor-pointer shadow-2xs"
            aria-label="Select Block"
          >
            {blocksList.map(b => (
              <option key={b.id} value={b.id}>{b.name} Block</option>
            ))}
          </select>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 hidden sm:inline" />

          {/* Gram Panchayat */}
          <select
            value={selectedPanchayat}
            disabled={!selectedBlock}
            onChange={(e) => onSelectPanchayat(e.target.value)}
            className="bg-emerald-700 text-white font-bold border border-emerald-800 rounded-lg px-2.5 py-1 text-xs cursor-pointer shadow-xs"
            aria-label="Select Panchayat"
          >
            {filteredPanchayats.map(p => (
              <option key={p.id} value={p.id} className="text-slate-900 font-medium">
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
            className="w-32 text-xs border border-slate-300/80 rounded-lg px-2 py-1 pl-6 focus:outline-none focus:ring-1 focus:ring-emerald-600 bg-white"
          />
          <Search className="w-3 h-3 text-slate-400 absolute left-2 top-2" />
        </div>

      </div>
    </div>
  );
};

