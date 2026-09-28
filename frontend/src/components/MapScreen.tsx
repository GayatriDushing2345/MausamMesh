'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapGeoJSONResponse, PanchayatForecastResponse } from '@/lib/types';
import { Language, translations } from '@/lib/i18n';
import { 
  Layers, 
  MapPin, 
  CloudRain, 
  TrendingUp, 
  Info, 
  ChevronUp,
  ChevronDown,
  Sparkles,
  Mountain,
  Gauge
} from 'lucide-react';

const LeafletMapInner = dynamic(
  () => import('./LeafletMapInner').then((mod) => mod.LeafletMapInner),
  { ssr: false, loading: () => (
    <div className="w-full h-full min-h-[450px] flex items-center justify-center bg-[#FAF9F5] text-slate-400 text-xs font-medium">
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
  const [activeLayer, setActiveLayer] = useState<'downscaled' | 'baseline' | 'residual'>('downscaled');
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);
  const t = translations[activeLanguage] || translations.en;

  if (loading || !mapData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        </div>
        <div className="h-[450px] bg-slate-100 border border-slate-200/80 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const selectedFeature = mapData.features.find(f => f.properties.id === selectedPanchayatId) || mapData.features[1] || mapData.features[0];

  return (
    <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">
      
      {/* Sleek Map Header & Segmented Layer Switcher */}
      <div className="mausam-card rounded-2xl p-4.5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold mb-0.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>Panchayat Downscaled Map Surface</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            {forecast?.block_name || 'Block'} Block downscaled to {selectedFeature.properties.name} Panchayat Map
          </h2>
          <p className="text-xs text-slate-500">
            Select any panchayat polygon to review terrain elevation features and residual rainfall deltas.
          </p>
        </div>

        {/* Segmented Layer Switcher */}
        <div className="flex items-center bg-[#FAF9F5] p-1.5 rounded-xl border border-slate-200/80 text-xs w-full lg:w-auto shrink-0">
          <button
            onClick={() => setActiveLayer('downscaled')}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
              activeLayer === 'downscaled'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Panchayat Downscaled</span>
          </button>

          <button
            onClick={() => setActiveLayer('baseline')}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
              activeLayer === 'baseline'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Block Baseline</span>
          </button>

          <button
            onClick={() => setActiveLayer('residual')}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
              activeLayer === 'residual'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Residual Delta</span>
          </button>
        </div>
      </div>

      {/* Main Grid View: Hero Map Anchor Canvas + Panchayat Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        
        {/* Leaflet Map Canvas (Hero Anchor) */}
        <div className="lg:col-span-2 mausam-card-hero p-2 rounded-2xl flex flex-col h-[460px] sm:h-[500px] relative overflow-hidden bg-slate-50">
          <div className="flex-1 w-full h-full relative z-10 overflow-hidden">
            <LeafletMapInner
              mapData={mapData}
              activeLayer={activeLayer}
              selectedPanchayatId={selectedPanchayatId}
              onSelectPanchayat={(id) => {
                onSelectPanchayat(id);
                setIsMobileSheetOpen(true);
              }}
            />
          </div>

          {/* Floating Map Legend */}
          <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-xs border border-slate-200/80 p-3 rounded-xl shadow-md text-xs max-w-[200px] sm:max-w-xs">
            <div className="font-bold text-slate-900 mb-1 text-xs">
              Map Legend ({activeLayer.toUpperCase()})
            </div>
            {activeLayer === 'residual' ? (
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-amber-600 shrink-0"></span>
                  <span>High Positive (&gt; +4.0 mm)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-emerald-600 shrink-0"></span>
                  <span>Moderate (+1.5 to +4.0 mm)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-slate-400 shrink-0"></span>
                  <span>Near Zero (-1.5 to +1.5 mm)</span>
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#14532d] shrink-0"></span>
                  <span>Heavy Rain (&gt; 30 mm)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#15803d] shrink-0"></span>
                  <span>Mod. Heavy (24 - 30 mm)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#22c55e] shrink-0"></span>
                  <span>Moderate (18 - 24 mm)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#86efac] shrink-0"></span>
                  <span>Light Rain (12 - 18 mm)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded bg-[#fde047] shrink-0"></span>
                  <span>Minimal (&lt; 12 mm)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected Panchayat Details Panel */}
        <div className={`mausam-card p-4.5 rounded-2xl space-y-4 ${
          isMobileSheetOpen ? 'block' : 'hidden lg:block'
        }`}>
          <div>
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {selectedFeature.properties.name} Panchayat
                  </h3>
                  <p className="text-xs text-slate-400">ID: {selectedFeature.properties.id}</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSheetOpen(!isMobileSheetOpen)}
                className="lg:hidden p-1 text-slate-400"
                aria-label="Toggle Panel"
              >
                {isMobileSheetOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
            </div>

            {/* Metrics */}
            <div className="space-y-2 text-xs">
              <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-slate-200/60 flex justify-between items-center">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Mountain className="w-3.5 h-3.5 text-slate-500" /> Terrain Elevation:
                </span>
                <span className="font-bold text-slate-900">{selectedFeature.properties.elevation_m} m</span>
              </div>

              <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-slate-200/60 flex justify-between items-center">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Layers className="w-3.5 h-3.5 text-slate-500" /> Block Baseline Rain:
                </span>
                <span className="font-semibold text-slate-900">{selectedFeature.properties.block_baseline_rain_mm} mm</span>
              </div>

              <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-200 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-900 font-bold text-xs flex items-center gap-1.5">
                    <CloudRain className="w-4 h-4 text-emerald-700" /> Downscaled Rain:
                  </span>
                  <span className="text-base font-extrabold text-emerald-800">{selectedFeature.properties.downscaled_rain_mm} mm</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-1 border-t border-emerald-200/60">
                  <span className="text-emerald-800 font-medium">Predicted Residual Delta:</span>
                  <span className={`font-bold ${selectedFeature.properties.residual_delta_mm >= 0 ? 'text-emerald-800' : 'text-amber-800'}`}>
                    {selectedFeature.properties.residual_delta_mm >= 0 ? `+${selectedFeature.properties.residual_delta_mm}` : selectedFeature.properties.residual_delta_mm} mm
                  </span>
                </div>
              </div>

              <div className="bg-[#FAF9F5] p-2.5 rounded-xl border border-slate-200/60 flex justify-between items-center">
                <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                  <Gauge className="w-3.5 h-3.5 text-slate-500" /> Heavy Rain Prob (&gt;15mm):
                </span>
                <span className="font-bold text-slate-900">{selectedFeature.properties.heavy_rain_prob_pct}%</span>
              </div>
            </div>

            <div className="mt-3 p-3 bg-[#FAF9F5] border border-slate-200/60 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-emerald-700" />
                Micro-Climate Physics:
              </div>
              <p className="text-slate-600">
                Spatial XGBoost residual is derived from local SRTM elevation ({selectedFeature.properties.elevation_m}m), terrain aspect angle, and 1-hop neighbor rain gauges.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToAdvisory}
            className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-3 px-4 rounded-xl transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Crop Advisory for {selectedFeature.properties.name}</span>
          </button>
        </div>

      </div>

      {/* Next Step Affordance Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-3 shadow-xs">
        <div>
          <h4 className="font-bold text-sm">Proceed to Forecast MAE Skill Analysis</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Review historical error reduction metrics and LOSO skill gate tests.
          </p>
        </div>
        <button
          onClick={onNavigateToAnalysis}
          className="bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors shrink-0 flex items-center gap-1.5 min-h-[40px]"
        >
          <span>{t.view_analysis}</span>
        </button>
      </div>

    </div>
  );
};
