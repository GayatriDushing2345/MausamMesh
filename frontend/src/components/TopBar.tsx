'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LocationHierarchy } from '@/lib/types';
import { Language } from '@/lib/i18n';
import { Search, Globe, User, MapPin, CheckCircle2, ChevronRight } from 'lucide-react';

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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const statesList = locations?.states || [];
  const currentStateObj = statesList.find(s => s.id === selectedState) || statesList[0];
  const districtsList = currentStateObj?.districts || locations?.districts || [];
  const currentDistrictObj = districtsList.find(d => d.id === selectedDistrict) || districtsList[0];
  const blocksList = currentDistrictObj?.blocks || [];
  const currentBlockObj = blocksList.find(b => b.id === selectedBlock) || blocksList[0];
  const panchayatsList = currentBlockObj?.panchayats || [];

  // Flatten panchayats for global search-as-you-type
  const allPanchayats = React.useMemo(() => {
    const list: Array<{ id: string; name: string; blockName: string; districtName: string; stateName: string }> = [];
    statesList.forEach(st => {
      st.districts.forEach(dist => {
        dist.blocks.forEach(blk => {
          blk.panchayats.forEach(panc => {
            list.push({
              id: panc.id,
              name: panc.name,
              blockName: blk.name,
              districtName: dist.name,
              stateName: st.name,
            });
          });
        });
      });
    });
    return list;
  }, [statesList]);

  const filteredPanchayats = searchQuery.trim()
    ? allPanchayats.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.blockName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.districtName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 py-2.5 shadow-2xs">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-3">
        
        {/* Left: Unified Location Hierarchy Selectors */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto text-xs">
          <div className="flex items-center gap-1 text-slate-700 font-extrabold text-xs pr-1 border-r border-slate-200 mr-1 shrink-0">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>Target Location:</span>
          </div>

          {/* State */}
          <select
            value={selectedState}
            onChange={(e) => onSelectState(e.target.value)}
            className="bg-[#FAF9F5] border border-slate-300/80 rounded-lg px-2 py-1 text-slate-900 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs cursor-pointer"
            aria-label="Select State"
          >
            {statesList.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 hidden sm:inline" />

          {/* District */}
          <select
            value={selectedDistrict}
            onChange={(e) => onSelectDistrict(e.target.value)}
            className="bg-[#FAF9F5] border border-slate-300/80 rounded-lg px-2 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs cursor-pointer"
            aria-label="Select District"
          >
            {districtsList.map(d => (
              <option key={d.id} value={d.id}>{d.name} District</option>
            ))}
          </select>

          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 hidden sm:inline" />

          {/* Block */}
          <select
            value={selectedBlock}
            onChange={(e) => onSelectBlock(e.target.value)}
            className="bg-[#FAF9F5] border border-slate-300/80 rounded-lg px-2 py-1 text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs cursor-pointer"
            aria-label="Select Block"
          >
            {blocksList.map(b => (
              <option key={b.id} value={b.id}>{b.name} Block</option>
            ))}
          </select>

          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0 hidden sm:inline" />

          {/* Panchayat */}
          <select
            value={selectedPanchayat}
            onChange={(e) => onSelectPanchayat(e.target.value)}
            className="bg-emerald-700 text-white font-extrabold border border-emerald-800 rounded-lg px-2.5 py-1 text-xs cursor-pointer shadow-2xs"
            aria-label="Select Panchayat"
          >
            {panchayatsList.map(p => (
              <option key={p.id} value={p.id} className="text-slate-900 font-medium">
                {p.name} Panchayat
              </option>
            ))}
          </select>
        </div>

        {/* Right: Search-as-you-type Bar & Language Switcher */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end text-xs">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-64" ref={dropdownRef}>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search Panchayat..."
                className="w-full bg-[#FAF9F5] border border-slate-300/80 rounded-xl px-3 py-1.5 pl-8 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>

            {/* Dropdown Results */}
            {showDropdown && filteredPanchayats.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto z-50">
                {filteredPanchayats.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPanchayat(p.id);
                      setSearchQuery('');
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-emerald-50 border-b border-slate-100 flex justify-between items-center transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{p.name} Panchayat</span>
                      <span className="text-[11px] text-slate-500 block">
                        {p.blockName} Block, {p.districtName}
                      </span>
                    </div>
                    {selectedPanchayat === p.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-white border border-slate-300/80 px-2.5 py-1 rounded-xl shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-emerald-700" />
            <select
              value={activeLanguage}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="bg-transparent text-slate-800 font-bold focus:outline-none cursor-pointer text-xs"
              aria-label="Language Switcher"
            >
              <option value="en">EN</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
            </select>
          </div>

          {/* User Icon */}
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
            <User className="w-3.5 h-3.5 text-emerald-700" />
          </div>

        </div>

      </div>
    </header>
  );
};
