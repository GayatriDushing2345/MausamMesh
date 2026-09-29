'use client';

import React, { useState, useMemo } from 'react';
import { LocationHierarchy } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';
import { Search, MapPin, ChevronRight, X, Check } from 'lucide-react';

interface MegaDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  locations: LocationHierarchy | null;
  selectedState: string;
  selectedDistrict: string;
  selectedBlock: string;
  selectedPanchayat: string;
  activeLanguage: Language;
  onSelectPanchayat: (stateId: string, distId: string, blkId: string, pancId: string) => void;
}

export const MegaDropdown: React.FC<MegaDropdownProps> = ({
  isOpen,
  onClose,
  locations,
  selectedState,
  selectedDistrict,
  selectedBlock,
  selectedPanchayat,
  activeLanguage,
  onSelectPanchayat,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const t = translations[activeLanguage] || translations.en;

  // Flatten all panchayats for instant search across states/districts/blocks
  const allPanchayatsList = useMemo(() => {
    if (!locations || !locations.states) return [];
    const list: Array<{
      stateId: string;
      stateName: string;
      distId: string;
      distName: string;
      blkId: string;
      blkName: string;
      pancId: string;
      pancName: string;
      pancCode: string;
    }> = [];

    for (const st of locations.states) {
      for (const d of st.districts || []) {
        for (const b of d.blocks || []) {
          for (const p of b.panchayats || []) {
            list.push({
              stateId: st.id,
              stateName: st.name,
              distId: d.id,
              distName: d.name,
              blkId: b.id,
              blkName: b.name,
              pancId: p.id,
              pancName: p.name,
              pancCode: p.code,
            });
          }
        }
      }
    }
    return list;
  }, [locations]);

  const filteredPanchayats = useMemo(() => {
    if (!searchTerm.trim()) return allPanchayatsList;
    const term = searchTerm.toLowerCase();
    return allPanchayatsList.filter(
      item =>
        item.pancName.toLowerCase().includes(term) ||
        item.blkName.toLowerCase().includes(term) ||
        item.distName.toLowerCase().includes(term) ||
        item.pancCode.toLowerCase().includes(term)
    );
  }, [allPanchayatsList, searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#0B1F33] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-3 bg-slate-50/50 dark:bg-[#061321]/50">
          <Search className="w-5 h-5 text-monsoon-700 dark:text-monsoon-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.search_panchayat_placeholder}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredPanchayats.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              {t.no_results_found}
            </div>
          ) : (
            filteredPanchayats.map((item) => {
              const isSelected = item.pancId === selectedPanchayat;
              return (
                <button
                  key={item.pancId}
                  onClick={() => {
                    onSelectPanchayat(item.stateId, item.distId, item.blkId, item.pancId);
                    onClose();
                  }}
                  className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-monsoon-100/70 dark:bg-monsoon-950/60 border-monsoon-400 dark:border-monsoon-700 text-slate-900 dark:text-white'
                      : 'bg-white dark:bg-[#0F2742] border-slate-200/60 dark:border-slate-800/80 hover:border-monsoon-300 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-monsoon-700 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold flex items-center gap-2">
                        <span>{item.pancName}</span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {item.pancCode}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.stateName} &gt; {item.distName} &gt; {item.blkName} Block
                      </div>
                    </div>
                  </div>

                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-monsoon-700 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-[#061321] border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
          <span>Showing {filteredPanchayats.length} Gram Panchayats</span>
          <span className="font-mono text-[10px] text-slate-400">Esc to close</span>
        </div>
      </div>
    </div>
  );
};
