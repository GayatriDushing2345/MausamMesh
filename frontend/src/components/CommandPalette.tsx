'use client';

import React, { useState, useEffect } from 'react';
import { Language, translations } from '@/lib/i18n';
import { Search, LayoutDashboard, Map, LineChart, FileText, Shield, Settings, X, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  activeLanguage: Language;
  onNavigateTab: (tabId: string) => void;
  onOpenLocationSearch: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  activeLanguage,
  onNavigateTab,
  onOpenLocationSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const t = translations[activeLanguage] || translations.en;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onOpenLocationSearch();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onOpenLocationSearch]);

  if (!isOpen) return null;

  const pages = [
    { id: 'dashboard', label: t.tab_dashboard, icon: LayoutDashboard, desc: 'Panchayat weather summary & tomorrow forecast' },
    { id: 'map', label: t.tab_map, icon: Map, desc: 'Interactive Leaflet GIS map with topography layers' },
    { id: 'analysis', label: t.tab_analysis, icon: LineChart, desc: '5-day lead predictions and skill metrics' },
    { id: 'advisory', label: t.tab_advisory, icon: FileText, desc: 'DAMU agricultural advisories and dispatches' },
    { id: 'reliability', label: t.tab_reliability, icon: Shield, desc: 'Model confidence, CSI score, and verification' },
    { id: 'settings', label: t.tab_settings, icon: Settings, desc: 'System configurations and language preferences' },
  ];

  const filteredPages = pages.filter(
    p => p.label.toLowerCase().includes(searchTerm.toLowerCase()) || p.desc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-[#0B1F33] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-monsoon-700 dark:text-monsoon-400 shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t.command_palette_title}
            autoFocus
            className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none font-medium"
          />
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 space-y-1 max-h-[60vh] overflow-y-auto">
          <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 py-1">
            Page Navigation
          </div>
          {filteredPages.map((page) => {
            const Icon = page.icon;
            return (
              <button
                key={page.id}
                onClick={() => {
                  onNavigateTab(page.id);
                  onClose();
                }}
                className="w-full text-left p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-monsoon-300 dark:hover:border-monsoon-700 bg-white dark:bg-[#0F2742] transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-monsoon-700 dark:text-monsoon-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-slate-100">{page.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{page.desc}</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-slate-50 dark:bg-[#061321] border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between items-center">
          <span>Press Esc to dismiss</span>
          <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">
            Ctrl+K
          </span>
        </div>
      </div>
    </div>
  );
};
