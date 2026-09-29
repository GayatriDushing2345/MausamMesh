'use client';

import React, { useState } from 'react';
import { MausamMeshLogo } from './MausamMeshLogo';
import { Language, t } from '@/lib/i18n';
import { 
  Home, 
  Map as MapIcon, 
  Sprout, 
  ShieldCheck, 
  Settings, 
  MoreHorizontal,
  X,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sun,
  Moon,
  Radio,
  PhoneCall,
  Activity
} from 'lucide-react';

interface SidebarNavProps {
  activeTab: string;
  activeLanguage: Language;
  onTabChange: (tab: string) => void;
  onDownloadReport: () => void;
  onLanguageChange?: (lang: Language) => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onSelectPanchayat?: (panchayatId: string) => void;
  selectedPanchayatId?: string;
  priorityAlertCount?: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  activeLanguage,
  onTabChange,
  onLanguageChange,
  isDarkMode = false,
  onToggleTheme,
  onSelectPanchayat,
  selectedPanchayatId = 'PANC_001',
  priorityAlertCount = 2,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);
  const [recents, setRecents] = useState<Array<{ id: string; name: string; block: string }>>([
    { id: 'PANC_001', name: 'Wagholi', block: 'Haveli' },
    { id: 'PANC_002', name: 'Hadapsar Rural', block: 'Haveli' },
    { id: 'PANC_007', name: 'Khanapur Hill', block: 'Haveli' },
  ]);

  // Load actual recent locations if available
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('mausammesh_recent_locations');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRecents(parsed.slice(0, 3));
          }
        }
      } catch (e) {}
    }
  }, [selectedPanchayatId]);

  // Desktop Navigation items
  const desktopNavItems = [
    { id: 'dashboard', label: t('nav.dashboard', activeLanguage), icon: Home },
    { 
      id: 'map', 
      label: t('nav.map', activeLanguage), 
      icon: MapIcon,
      badge: priorityAlertCount > 0 ? `${priorityAlertCount} Alerts` : undefined,
      badgeColor: 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
    },
    { id: 'analysis', label: t('nav.analysis', activeLanguage), icon: TrendingUp },
    { 
      id: 'advisory', 
      label: t('nav.advisory', activeLanguage), 
      icon: Sprout,
    },
    { id: 'reliability', label: t('nav.reliability', activeLanguage), icon: ShieldCheck },
    { id: 'settings', label: t('nav.settings', activeLanguage), icon: Settings },
  ];

  // Mobile Bottom Tab Bar (5 items max: Home, Map, Forecast, Advisory, More)
  const mobileTabItems = [
    { id: 'dashboard', label: t('nav.dashboard', activeLanguage), icon: Home },
    { id: 'map', label: t('nav.map', activeLanguage), icon: MapIcon },
    { id: 'analysis', label: t('nav.analysis', activeLanguage), icon: TrendingUp },
    { id: 'advisory', label: t('nav.advisory', activeLanguage), icon: Sprout },
  ];

  return (
    <>
      {/* 1. DESKTOP COLLAPSIBLE SIDEBAR (Hidden on mobile < md) */}
      <aside 
        aria-label="Desktop Navigation"
        className={`
          hidden md:flex flex-col justify-between sticky top-0 left-0 z-30 h-screen
          bg-white dark:bg-[#0B1622] border-r border-slate-200/80 dark:border-white/10
          transition-all duration-300 ease-in-out shrink-0
          ${collapsed ? 'w-[76px]' : 'w-[280px]'}
        `}
      >
        <div className="p-3.5 space-y-4 overflow-y-auto flex-1">
          {/* Top Logo & Collapse Toggle */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10 min-h-[48px]">
            {!collapsed && <MausamMeshLogo language={activeLanguage} size="sm" showSubtitle={false} />}
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-[#122137] text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors mx-auto min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer shadow-2xs"
              aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="space-y-1" aria-label="Main Menu">
            {!collapsed && (
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 px-3 mb-1.5 uppercase tracking-wider">
                {t('nav.control_navigation', activeLanguage)}
              </div>
            )}

            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs sm:text-sm
                    transition-all duration-150 text-left min-h-[44px] group relative cursor-pointer
                    ${isActive
                      ? 'bg-gradient-to-r from-teal-500/15 via-teal-500/5 to-transparent text-[#0E7C86] dark:text-[#2DD4BF] font-black border-l-[3px] border-[#0E7C86] dark:border-[#2DD4BF] shadow-2xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/90 dark:hover:bg-[#122238] hover:text-slate-950 dark:hover:text-white'
                    }
                  `}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-5 h-5 shrink-0 transition-transform duration-150 group-hover:scale-105 ${isActive ? 'text-[#0E7C86] dark:text-[#2DD4BF]' : 'text-slate-400 group-hover:text-[#0E7C86] dark:group-hover:text-[#2DD4BF]'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Jump: Recent Panchayats */}
          {!collapsed && recents.length > 0 && onSelectPanchayat && (
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-1">
              <div className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3 mb-1">
                Recent Locations
              </div>
              <div className="space-y-0.5">
                {recents.map(r => (
                  <button
                    key={r.id}
                    onClick={() => onSelectPanchayat(r.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs transition duration-150 cursor-pointer ${
                      r.id === selectedPanchayatId
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-[#0E7C86] dark:text-[#2DD4BF] font-black shadow-2xs border border-teal-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#122137]'
                    }`}
                  >
                    <span className="truncate font-bold flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${r.id === selectedPanchayatId ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      {r.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">({r.block})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. ACTIVE BLOCK AGROMET TELEMETRY MONITOR */}
          {!collapsed && (
            <div className="pt-2 border-t border-slate-100 dark:border-white/10 space-y-2.5">
              <div className="flex items-center justify-between px-3">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3 h-3 text-[#0E7C86] dark:text-[#2DD4BF]" />
                  <span>Telemetry Mesh</span>
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>

              {/* Telemetry Stats Card */}
              <div className="bg-[#F6F3EC] dark:bg-[#122238] rounded-2xl p-3 border border-slate-200/90 dark:border-white/10 space-y-2 text-xs shadow-2xs">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">Mesh Coverage</span>
                  <span className="font-mono font-black text-slate-900 dark:text-white">42 Panchayats</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">AWS Telemetry</span>
                  <span className="font-mono font-black text-emerald-600 dark:text-emerald-400">14/14 Online</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">Cycle Sync</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-300">06:00 UTC (3hr)</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">MinT Coherence</span>
                  <span className="font-mono font-black text-teal-700 dark:text-[#2DD4BF]">100% Gated</span>
                </div>
              </div>

              {/* DAMU Kisan Agromet Advisory Hotline */}
              <div className="bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent rounded-2xl p-3 border border-teal-500/25 dark:border-teal-400/20 space-y-1.5 text-xs shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-black text-teal-950 dark:text-teal-200 text-[11px] flex items-center gap-1.5">
                    <PhoneCall className="w-3.5 h-3.5 text-[#0E7C86] dark:text-[#2DD4BF]" />
                    <span>DAMU Agromet Nodal</span>
                  </span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-200 border border-teal-300 dark:border-teal-700">
                    24x7
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-tight font-medium">
                  Toll-Free Kisan Agromet Advisory:
                </p>
                <div className="font-mono font-black text-[#0E7C86] dark:text-[#2DD4BF] text-xs flex items-center gap-1">
                  <span>1800-180-1551</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Footer Metadata & Shortcut */}
        {!collapsed && (
          <div className="p-3 border-t border-slate-100 dark:border-white/10 bg-[#F6F3EC] dark:bg-[#080E17] text-xs space-y-1.5 shrink-0">
            <div className="font-bold text-[#0B1F33] dark:text-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Data: Nominal</span>
              </div>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#122137] border border-slate-300 dark:border-white/10 text-[10px] font-mono text-slate-600 dark:text-slate-300">
                Ctrl+K
              </kbd>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-xs leading-tight">
              MinT + 90% Conformal Calibrated
            </p>
          </div>
        )}
      </aside>

      {/* 2. MOBILE BOTTOM TAB BAR (Visible on mobile < md, exactly 5 items) */}
      <nav 
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B1622]/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-white/10 flex items-center justify-around px-2 py-1 pb-[max(8px,env(safe-area-inset-bottom))] shadow-2xl"
      >
        {mobileTabItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-colors cursor-pointer ${
                isActive 
                  ? 'text-[#0E7C86] dark:text-[#2DD4BF] font-black' 
                  : 'text-slate-500 dark:text-slate-300 font-semibold hover:text-slate-800 dark:hover:text-white'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#0E7C86] dark:text-[#2DD4BF] stroke-[2.4]' : 'text-slate-400 dark:text-slate-400 stroke-[1.8]'}`} />
              <span className="text-[11px] truncate mt-1 leading-none">{item.label}</span>
            </button>
          );
        })}

        {/* 5th Item: "More" button that opens bottom sheet */}
        <button
          type="button"
          onClick={() => setMoreSheetOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 min-h-[48px] rounded-xl transition-colors cursor-pointer ${
            ['reliability', 'settings'].includes(activeTab) || moreSheetOpen
              ? 'text-[#0E7C86] dark:text-[#2DD4BF] font-black' 
              : 'text-slate-500 dark:text-slate-300 font-semibold hover:text-slate-800 dark:hover:text-white'
          }`}
          aria-label="Open More Menu"
          aria-expanded={moreSheetOpen}
        >
          <MoreHorizontal className="w-5 h-5 stroke-[2]" />
          <span className="text-[11px] truncate mt-1 leading-none">{t('nav.more', activeLanguage)}</span>
        </button>
      </nav>

      {/* 3. MOBILE "MORE" BOTTOM SHEET */}
      {moreSheetOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMoreSheetOpen(false)}
          />

          {/* Sheet Surface */}
          <div className="relative bg-white dark:bg-[#0E1A29] rounded-t-3xl border-t border-slate-200 dark:border-white/10 p-5 space-y-4 shadow-2xl z-10 animate-in slide-in-from-bottom duration-200 pb-[max(20px,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-3">
              <span className="font-extrabold text-sm text-[#0B1F33] dark:text-white">
                {t('nav.more', activeLanguage)}
              </span>
              <button
                type="button"
                onClick={() => setMoreSheetOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 dark:bg-[#132238] text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer shadow-2xs"
                aria-label="Close sheet"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onTabChange('reliability');
                  setMoreSheetOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all min-h-[48px] ${
                  activeTab === 'reliability'
                    ? 'bg-[#E6F6F7] dark:bg-[#14B8A6]/20 border-[#0E7C86] dark:border-[#2DD4BF] text-[#0E7C86] dark:text-[#2DD4BF] font-bold'
                    : 'bg-slate-50 dark:bg-[#132238] border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-[#0E7C86] dark:text-[#2DD4BF] shrink-0" />
                <span className="text-xs font-bold">{t('nav.reliability', activeLanguage)}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onTabChange('settings');
                  setMoreSheetOpen(false);
                }}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all min-h-[48px] ${
                  activeTab === 'settings'
                    ? 'bg-[#E6F6F7] dark:bg-[#14B8A6]/20 border-[#0E7C86] dark:border-[#2DD4BF] text-[#0E7C86] dark:text-[#2DD4BF] font-bold'
                    : 'bg-slate-50 dark:bg-[#132238] border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200'
                }`}
              >
                <Settings className="w-5 h-5 text-[#0E7C86] dark:text-[#2DD4BF] shrink-0" />
                <span className="text-xs font-bold">{t('nav.settings', activeLanguage)}</span>
              </button>
            </div>

            {/* Quick Actions (Theme & Language) */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold min-h-[44px]"
                >
                  {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                  <span>{isDarkMode ? t('settings.day_mode', activeLanguage) : t('settings.night_mode', activeLanguage)}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onTabChange('settings');
                  setMoreSheetOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0E7C86] dark:text-[#2DB3C0] min-h-[44px] px-2"
              >
                <Globe className="w-4 h-4" />
                <span>Change Language</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
