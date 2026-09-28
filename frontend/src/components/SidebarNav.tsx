'use client';

import React, { useState } from 'react';
import { MausamMeshLogo } from './MausamMeshLogo';
import { Language, translations } from '@/lib/i18n';
import { 
  Home, 
  Map as MapIcon, 
  BarChart3, 
  Sprout, 
  ShieldCheck, 
  FileText, 
  Settings, 
  Menu, 
  X,
  TrendingUp
} from 'lucide-react';

interface SidebarNavProps {
  activeTab: string;
  activeLanguage: Language;
  onTabChange: (tab: string) => void;
  onDownloadReport: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  activeLanguage,
  onTabChange,
  onDownloadReport,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const t = translations[activeLanguage] || translations.en;

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'analysis', label: 'Forecast', icon: TrendingUp },
    { id: 'map', label: t.tab_map || 'Panchayat Map', icon: MapIcon },
    { id: 'advisory', label: t.tab_advisory || 'Agricultural Advisory', icon: Sprout },
    { id: 'reliability', label: 'Model Insights', icon: ShieldCheck },
    { id: 'reports', label: 'Data & Reports', icon: FileText, action: onDownloadReport },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-white text-slate-900 px-4 py-3 flex justify-between items-center sticky top-0 z-50 border-b border-slate-200">
        <MausamMeshLogo language={activeLanguage} size="sm" showSubtitle={false} />
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle Navigation Menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Desktop Persistent Light Sidebar / Mobile Drawer */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40
        w-64 h-screen bg-white border-r border-slate-200/80
        flex flex-col justify-between
        transition-transform duration-200 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Top Logo */}
          <div className="pb-4 border-b border-slate-100">
            <MausamMeshLogo language={activeLanguage} size="md" showSubtitle={true} />
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 px-3 mb-2 uppercase tracking-wider">
              Navigation
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      onTabChange(item.id);
                    }
                    setMobileOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm
                    transition-all text-left min-h-[44px]
                    ${isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border-l-4 border-emerald-600 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Metadata */}
        <div className="p-4 border-t border-slate-100 bg-[#FAF9F5] text-xs space-y-1">
          <div className="font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>MausamMesh Live Pipeline</span>
          </div>
          <p className="text-slate-500 text-[11px]">
            LGD Level-5 Downscaling Engine
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex justify-around p-1.5 shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
              <span className="truncate max-w-[64px] mt-0.5">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
