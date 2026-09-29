'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { 
  MapGeoJSONResponse, 
  PanchayatForecastResponse, 
  PriorityQueueResponse, 
  PriorityQueueItem 
} from '@/lib/types';
import { 
  fetchPriorityQueue, 
  getPriorityCsvExportUrl 
} from '@/lib/api';
import { Language, translations, getReasonText } from '@/lib/i18n';
import { getIMDRainfallCategory, getIMDCategoryLabel } from '@/lib/imdCategories';
import { 
  Layers, 
  MapPin, 
  CloudRain, 
  TrendingUp, 
  Info, 
  ChevronUp,
  ChevronDown,
  Sparkles,
  Search,
  Filter,
  Download,
  AlertTriangle,
  AlertCircle,
  AlertOctagon,
  CheckCircle2,
  SlidersHorizontal,
  X,
  ArrowRight,
  ChevronRight,
  Shield,
  FileText,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { KeyInsight } from './KeyInsight';

const LeafletMapInner = dynamic(
  () => import('./LeafletMapInner').then((mod) => mod.LeafletMapInner),
  { ssr: false, loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-slate-900/60 text-slate-400 text-xs font-medium rounded-2xl border border-slate-800">
      Loading GIS Leaflet Map Surface...
    </div>
  )}
);

interface MapScreenProps {
  mapData: MapGeoJSONResponse | null;
  forecast: PanchayatForecastResponse | null;
  selectedPanchayatId: string;
  loading: boolean;
  activeLanguage: Language;
  onSelectPanchayat: (id: string) => void;
  onNavigateToAdvisory: () => void;
  onNavigateToAnalysis: () => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  mapData,
  forecast,
  selectedPanchayatId,
  loading,
  activeLanguage,
  onSelectPanchayat,
  onNavigateToAdvisory,
  onNavigateToAnalysis,
}) => {
  const [activeLayer, setActiveLayer] = useState<'priority' | 'downscaled' | 'baseline' | 'residual'>('priority');
  const [leadDay, setLeadDay] = useState<number>(1);
  const [selectedHazard, setSelectedHazard] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Weights tuning state
  const [customWeights, setCustomWeights] = useState<Record<string, number>>({
    weather_severity: 35,
    crop_vulnerability: 25,
    potential_impact: 15,
    exposed_area: 15,
    farm_households: 10,
  });

  const [priorityData, setPriorityData] = useState<PriorityQueueResponse | null>(null);
  const [loadingPriority, setLoadingPriority] = useState<boolean>(true);
  const [panelCollapsed, setPanelCollapsed] = useState<boolean>(false);
  const [showCalcPopover, setShowCalcPopover] = useState<boolean>(false);
  const [drawerItem, setDrawerItem] = useState<PriorityQueueItem | null>(null);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState<boolean>(false);

  const t = translations[activeLanguage] || translations.en;

  // 1. Fetch Priority Queue from Backend API
  useEffect(() => {
    async function loadQueue() {
      try {
        setLoadingPriority(true);
        const data = await fetchPriorityQueue(
          undefined,
          undefined,
          leadDay,
          selectedHazard,
          selectedCrop,
          customWeights
        );
        setPriorityData(data);
      } catch (err) {
        console.warn("Could not load priority queue data:", err);
      } finally {
        setLoadingPriority(false);
      }
    }
    loadQueue();
  }, [leadDay, selectedHazard, selectedCrop, customWeights]);

  // Sync selected panchayat with detail drawer
  useEffect(() => {
    if (priorityData && selectedPanchayatId) {
      const match = priorityData.items.find(it => it.panchayat_id === selectedPanchayatId);
      if (match) setDrawerItem(match);
    }
  }, [selectedPanchayatId, priorityData]);

  // Filter queue items by search & tier chips
  const filteredQueueItems = useMemo(() => {
    if (!priorityData) return [];
    return priorityData.items.filter(item => {
      const matchTier = selectedTierFilter === 'all' || item.tier.toLowerCase().replace(" ", "_") === selectedTierFilter.toLowerCase().replace(" ", "_");
      const matchSearch = !searchQuery.trim() || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.block_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTier && matchSearch;
    });
  }, [priorityData, selectedTierFilter, searchQuery]);

  // Priority Tiers Map for LeafletMapInner coloring
  const priorityTiersMap = useMemo(() => {
    if (!priorityData) return {};
    const map: Record<string, string> = {};
    for (const it of priorityData.items) {
      map[it.panchayat_id] = it.tier;
    }
    return map;
  }, [priorityData]);

  // Tier helper styling
  const getTierInfo = (tier: string) => {
    switch (tier) {
      case 'Very High':
        return {
          label: t.tier_very_high,
          badgeClass: 'bg-[#D64545] text-white font-extrabold shadow-2xs',
          borderClass: 'border-[#D64545]',
          icon: AlertTriangle,
        };
      case 'High':
        return {
          label: t.tier_high,
          badgeClass: 'bg-[#F28C28] text-white font-bold shadow-2xs',
          borderClass: 'border-[#F28C28]',
          icon: AlertCircle,
        };
      case 'Medium':
        return {
          label: t.tier_medium,
          badgeClass: 'bg-[#F2C230] text-[#0B1F33] font-extrabold shadow-2xs',
          borderClass: 'border-[#F2C230]',
          icon: AlertOctagon,
        };
      case 'Low':
      default:
        return {
          label: t.tier_low,
          badgeClass: 'bg-[#2E9E4F] text-white font-bold shadow-2xs',
          borderClass: 'border-[#2E9E4F]',
          icon: CheckCircle2,
        };
    }
  };

  const handleWeightChange = (key: string, val: number) => {
    setCustomWeights(prev => {
      const next = { ...prev, [key]: val };
      return next;
    });
  };

  const resetWeights = () => {
    setCustomWeights({
      weather_severity: 35,
      crop_vulnerability: 25,
      potential_impact: 15,
      exposed_area: 15,
      farm_households: 10,
    });
  };

  const totalWeightSum = Object.values(customWeights).reduce((a, b) => a + b, 0);

  if (loading || !mapData) {
    return (
      <div className="w-full py-8 space-y-4">
        <div className="h-[55vh] md:h-[600px] bg-slate-900/40 rounded-3xl border border-slate-800 animate-pulse p-6"></div>
      </div>
    );
  }

  const csvUrl = getPriorityCsvExportUrl(undefined, undefined, leadDay, selectedHazard, selectedCrop, customWeights);
  const topPanchayat = priorityData?.items?.[0];
  const topPanchayatName = topPanchayat?.name || 'Wagholi';
  const topScore = topPanchayat?.score ?? 88.5;
  const veryHighCount = priorityData?.summary?.very_high ?? (priorityData?.summary as any)?.counts?.['Very High'] ?? 0;

  return (
    <div className="space-y-4 pb-8">
      {/* 0. LEVEL 1 KEY INSIGHT BANNER */}
      <KeyInsight
        title="Panchayat Priority Queue Status"
        message={
          veryHighCount > 0
            ? `${veryHighCount} panchayats in ${forecast?.district_name || 'District'} require immediate DAMU advisory intervention. Top priority: ${topPanchayatName} (Score: ${Number(topScore).toFixed(1)}/100).`
            : `All panchayats currently within normal hazard thresholds. Continuous split-conformal monitoring active.`
        }
        severity={veryHighCount > 0 ? 'red' : 'green'}
        actionLabel={t.review_advisory || "Review Advisory"}
        onAction={onNavigateToAdvisory}
      />
      
      {/* 1. TOP HERO MAP AREA WITH FLOATING SUMMARY & CONTROLS */}
      <div className="relative h-[55vh] md:h-[80vh] min-h-[420px] md:min-h-[600px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between">
        
        {/* Full-width GIS Map Surface */}
        <div className="absolute inset-0 z-0">
          <LeafletMapInner
            mapData={mapData}
            activeLayer={activeLayer}
            selectedPanchayatId={selectedPanchayatId}
            onSelectPanchayat={(id) => {
              onSelectPanchayat(id);
              if (priorityData) {
                const match = priorityData.items.find(it => it.panchayat_id === id);
                if (match) setDrawerItem(match);
              }
            }}
            priorityTiersMap={priorityTiersMap}
          />
        </div>

        {/* Top Floating Glass Summary Bar (Tier Counts & Controls) */}
        <div className="relative z-10 p-4 flex flex-wrap items-center justify-between gap-3 bg-white/85 dark:bg-[#0B1F33]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80">
          
          {/* Left: Tier Counts Chips (Clickable to Filter) */}
          <div className="-mx-1 px-1 sm:mx-0 sm:px-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth text-xs pb-1 sm:pb-0 shrink-0 max-w-full">
            <span className="font-extrabold text-[#0B1F33] dark:text-white flex items-center gap-1.5 pr-2 border-r border-slate-200 dark:border-slate-700 shrink-0">
              <Shield className="w-4 h-4 text-[#0E7C86] dark:text-[#2DB3C0]" />
              <span className="hidden sm:inline">Priority Tiers:</span>
            </span>

            <button
              onClick={() => setSelectedTierFilter('all')}
              className={`px-3 py-1 rounded-full font-bold transition-all ${
                selectedTierFilter === 'all'
                  ? 'bg-[#0B1F33] text-white dark:bg-white dark:text-[#0B1F33]'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              All ({priorityData?.summary.total_panchayats || 0})
            </button>

            <button
              onClick={() => setSelectedTierFilter('very_high')}
              className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                selectedTierFilter === 'very_high'
                  ? 'bg-[#D64545] text-white ring-2 ring-red-500'
                  : 'bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-300'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{t.tier_very_high} ({priorityData?.summary.very_high || 0})</span>
            </button>

            <button
              onClick={() => setSelectedTierFilter('high')}
              className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                selectedTierFilter === 'high'
                  ? 'bg-[#F28C28] text-white ring-2 ring-orange-500'
                  : 'bg-orange-100 dark:bg-orange-950/60 text-orange-900 dark:text-orange-300'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{t.tier_high} ({priorityData?.summary.high || 0})</span>
            </button>

            <button
              onClick={() => setSelectedTierFilter('medium')}
              className={`px-3 py-1 rounded-full font-extrabold transition-all flex items-center gap-1.5 ${
                selectedTierFilter === 'medium'
                  ? 'bg-[#F2C230] text-[#0B1F33] ring-2 ring-yellow-500'
                  : 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-900 dark:text-yellow-300'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{t.tier_medium} ({priorityData?.summary.medium || 0})</span>
            </button>

            <button
              onClick={() => setSelectedTierFilter('low')}
              className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1.5 ${
                selectedTierFilter === 'low'
                  ? 'bg-[#2E9E4F] text-white ring-2 ring-emerald-500'
                  : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t.tier_low} ({priorityData?.summary.low || 0})</span>
            </button>
          </div>

          {/* Right: Layer Toggles & Action Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Map Layer Toggle Pills */}
            <div className="flex items-center gap-1 bg-[#F6F3EC] dark:bg-slate-800 p-1 rounded-2xl border border-slate-300 dark:border-slate-700">
              <button
                onClick={() => setActiveLayer('priority')}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  activeLayer === 'priority'
                    ? 'bg-[#0E7C86] text-white shadow-2xs'
                    : 'text-[#5B6472] dark:text-slate-400'
                }`}
              >
                Priority
              </button>
              <button
                onClick={() => setActiveLayer('downscaled')}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  activeLayer === 'downscaled'
                    ? 'bg-[#0E7C86] text-white shadow-2xs'
                    : 'text-[#5B6472] dark:text-slate-400'
                }`}
              >
                Rainfall
              </button>
              <button
                onClick={() => setActiveLayer('residual')}
                className={`px-3 py-1 rounded-xl font-bold transition-all ${
                  activeLayer === 'residual'
                    ? 'bg-[#0E7C86] text-white shadow-2xs'
                    : 'text-[#5B6472] dark:text-slate-400'
                }`}
              >
                Residual
              </button>
            </div>

            {/* How priority calculated Popover link */}
            <button
              onClick={() => setShowCalcPopover(true)}
              className="flex items-center gap-1.5 bg-[#E6F6F7] dark:bg-[#0E7C86]/30 text-[#0E7C86] dark:text-[#2DB3C0] font-bold px-3 py-1.5 rounded-xl border border-[#0E7C86]/30 hover:bg-[#0E7C86]/20 transition-all"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{t.how_priority_calculated}</span>
            </button>

            {/* CSV Export Button */}
            <a
              href={csvUrl}
              download
              className="flex items-center gap-1.5 bg-[#0B1F33] dark:bg-white text-white dark:text-[#0B1F33] font-bold px-3 py-1.5 rounded-xl hover:opacity-90 transition-all shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.export_csv}</span>
            </a>
          </div>

        </div>

        {/* Floating Priority Queue Glass Panel (Positioned cleanly above mobile bottom nav) */}
        <div className={`
          absolute bottom-20 sm:bottom-4 left-3 right-3 sm:right-auto sm:left-4 z-20 w-auto sm:w-[380px] max-h-[68vh]
          bg-white/95 dark:bg-[#0B1F33]/95 backdrop-blur-md border border-slate-200 dark:border-slate-700
          rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300
          ${panelCollapsed ? 'h-12 overflow-hidden' : 'h-[44vh] sm:h-[65vh]'}
        `}>
          {/* Panel Header */}
          <div className="p-3.5 bg-slate-50/90 dark:bg-[#061321]/90 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#0E7C86] animate-pulse" />
              <h3 className="font-extrabold text-sm text-[#0B1F33] dark:text-white">
                {t.priority_queue_title}
              </h3>
            </div>
            <button
              onClick={() => setPanelCollapsed(!panelCollapsed)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              {panelCollapsed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {!panelCollapsed && (
            <>
              {/* Filter Controls (Lead Day & Search) */}
              <div className="p-3 space-y-2 border-b border-slate-100 dark:border-slate-800/80 bg-white/50 dark:bg-[#0B1F33]/50">
                {/* Search Box */}
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter queue by name..."
                    className="w-full bg-[#F6F3EC] dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 pl-8 text-xs text-[#0B1F33] dark:text-white placeholder-slate-400 focus:outline-none font-medium"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                </div>

                {/* Lead Day Selector Chips */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-[#5B6472] dark:text-[#B8C4D6]">Lead Day:</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((d) => (
                      <button
                        key={d}
                        onClick={() => setLeadDay(d)}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all ${
                          leadDay === d
                            ? 'bg-[#0E7C86] text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {d === 1 ? 'Tomorrow' : `+${d}d`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ranked Queue Items List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {loadingPriority ? (
                  <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                    <RefreshCw className="w-5 h-5 text-[#0E7C86] animate-spin mx-auto" />
                    <span>Calculating Explainable Priority Rankings...</span>
                  </div>
                ) : filteredQueueItems.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No panchayats match the selected filters.
                  </div>
                ) : (
                  filteredQueueItems.map((item) => {
                    const isSelected = item.panchayat_id === selectedPanchayatId;
                    const tierInfo = getTierInfo(item.tier);
                    const TierIcon = tierInfo.icon;
                    const topReasonText = item.reasons.length > 0 
                      ? getReasonText(item.reasons[0], activeLanguage) 
                      : 'Low risk forecast';

                    return (
                      <button
                        key={item.panchayat_id}
                        onClick={() => {
                          onSelectPanchayat(item.panchayat_id);
                          setDrawerItem(item);
                        }}
                        className={`w-full text-left p-3 rounded-2xl border transition-all space-y-1.5 group ${
                          isSelected
                            ? 'bg-[#E6F6F7]/80 dark:bg-[#0E7C86]/30 border-[#0E7C86] dark:border-[#2DB3C0] shadow-md'
                            : 'bg-white dark:bg-[#0F2742] border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center">
                              #{item.rank}
                            </span>
                            <span className="font-extrabold text-sm text-[#0B1F33] dark:text-white truncate max-w-[140px]">
                              {item.name}
                            </span>
                          </div>

                          {/* Tier Pill */}
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${tierInfo.badgeClass}`}>
                            <TierIcon className="w-3 h-3" />
                            <span>{tierInfo.label}</span>
                          </span>
                        </div>

                        {/* Score Bar & Top Reason */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[#5B6472] dark:text-[#B8C4D6] truncate pr-2 font-medium">
                              {topReasonText}
                            </span>
                            <span className="font-mono font-extrabold text-[#0B1F33] dark:text-white shrink-0">
                              {item.score} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                            </span>
                          </div>

                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{ 
                                width: `${item.score}%`,
                                backgroundColor: tierInfo.borderClass.replace('border-[', '').replace(']', '')
                              }}
                            />
                          </div>
                        </div>

                        {/* Warnings / Flags */}
                        {item.flags.length > 0 && (
                          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-semibold pt-0.5">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                              {item.flags.includes('verify_before_dispatch') 
                                ? 'Uncertain forecast — verify before dispatch'
                                : 'Partial data factor'}
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>

      </div>

      {/* 2. DETAIL DRAWER FOR SELECTED PANCHAYAT */}
      {drawerItem && (
        <div className="glass-panel p-6 space-y-4 w-full border border-slate-300 dark:border-slate-700 shadow-2xl animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5B6472] dark:text-[#B8C4D6]">
                  Panchayat Priority Breakdown
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getTierInfo(drawerItem.tier).badgeClass}`}>
                  Rank #{drawerItem.rank} • {drawerItem.tier} Tier ({drawerItem.score} pts)
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-[#0B1F33] dark:text-white mt-1">
                {drawerItem.name} Panchayat ({drawerItem.block_name} Block)
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToAdvisory}
                className="flex items-center gap-1.5 bg-[#0E7C86] hover:bg-[#0A5F67] text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Open Advisory</span>
              </button>

              <button
                onClick={onNavigateToAnalysis}
                className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-[#0B1F33] dark:text-white font-bold text-xs px-3.5 py-2 rounded-xl hover:bg-slate-200 transition-all"
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#0E7C86]" />
                <span>View Forecast</span>
              </button>
            </div>
          </div>

          {/* Factor Contribution Progress Bars */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B6472] dark:text-[#B8C4D6]">
              {t.why_this_rank}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {Object.entries(drawerItem.factors).map(([fKey, fVal]) => {
                const fLabels: Record<string, string> = {
                  weather_severity: 'Weather Severity (35%)',
                  crop_vulnerability: 'Crop Vulnerability (25%)',
                  potential_impact: 'Terrain Impact (15%)',
                  exposed_area: 'Crop Area (15%)',
                  farm_households: 'Farm Households (10%)'
                };
                return (
                  <div key={fKey} className="bg-[#F6F3EC] dark:bg-[#061321] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-xs font-bold text-[#0B1F33] dark:text-slate-200 block truncate">
                      {fLabels[fKey] || fKey}
                    </span>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-[#5B6472] font-semibold">{fVal.value * 100}% factor</span>
                      <span className="font-mono font-bold text-[#0E7C86] dark:text-[#2DB3C0]">+{fVal.contribution_points} pts</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0E7C86] rounded-full" style={{ width: `${fVal.value * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reasons List & Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-[#F6F3EC] dark:bg-[#061321] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-[#0B1F33] dark:text-white uppercase tracking-wider">
                Primary Priority Drivers
              </h4>
              <ul className="space-y-1.5 text-xs text-[#5B6472] dark:text-slate-300">
                {drawerItem.reasons.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0E7C86] mt-1.5 shrink-0" />
                    <span>{getReasonText(r, activeLanguage)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-[#F6F3EC] dark:bg-[#061321] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-[#0B1F33] dark:text-white uppercase tracking-wider">
                  Crop & Exposure Profile
                </h4>
                <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-300">
                  {drawerItem.exposure.source} data
                </span>
              </div>
              <div className="text-xs text-[#5B6472] dark:text-slate-300 space-y-1">
                <div>Dominant Crop: <strong>{drawerItem.crop.name}</strong> ({drawerItem.crop.stage})</div>
                <div>Agricultural Area: <strong>{drawerItem.exposure.agri_area_ha} ha</strong></div>
                <div>Farm Households: <strong>{drawerItem.exposure.farm_households} families</strong></div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 3. "HOW IS PRIORITY CALCULATED?" POPOVER DIALOG */}
      {showCalcPopover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0B1F33] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-extrabold text-[#0B1F33] dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#0E7C86] dark:text-[#2DB3C0]" />
                <span>{t.how_priority_calculated}</span>
              </h3>
              <button onClick={() => setShowCalcPopover(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5B6472] dark:text-slate-300 leading-relaxed font-medium">
              The Panchayat Priority Score ($0-100$) ranks panchayats so IMD and DAMU Nodal Officers can focus field inspections where agricultural risks are highest. Scores are computed dynamically using upper 90% conformal weather bounds.
            </p>

            {/* Interactive Weight Tuning Sliders */}
            <div className="bg-[#F6F3EC] dark:bg-[#061321] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#0B1F33] dark:text-white flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-[#0E7C86]" />
                  <span>Interactive Weight Tuning</span>
                </span>
                <button
                  onClick={resetWeights}
                  className="text-xs font-bold text-[#0E7C86] dark:text-[#2DB3C0] hover:underline"
                >
                  Reset Defaults
                </button>
              </div>

              {Object.entries(customWeights).map(([wKey, wVal]) => {
                const labels: Record<string, string> = {
                  weather_severity: 'Weather Severity (Upper 90% Bound)',
                  crop_vulnerability: 'Crop & Stage Sensitivity',
                  potential_impact: 'Terrain & Drainage Susceptibility',
                  exposed_area: 'Exposed Crop Area (ha)',
                  farm_households: 'Farm Household Population'
                };
                return (
                  <div key={wKey} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-[#0B1F33] dark:text-slate-200">{labels[wKey]}</span>
                      <span className="font-mono font-bold text-[#0E7C86]">{wVal}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={wVal}
                      onChange={(e) => handleWeightChange(wKey, parseFloat(e.target.value))}
                      className="w-full accent-[#0E7C86]"
                    />
                  </div>
                );
              })}

              <div className="text-xs text-right font-bold pt-1">
                Total Weight Sum: <span className={totalWeightSum === 100 ? 'text-emerald-600' : 'text-red-500'}>{totalWeightSum}%</span>
              </div>
            </div>

            <div className="text-[11px] text-[#5B6472] dark:text-slate-400 italic">
              Prototype weighting parameters. Calibrated with IMD/MoES agrometeorological expert guidelines.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
