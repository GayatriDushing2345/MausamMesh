'use client';

import React, { useState } from 'react';
import { Language, translations } from '@/lib/i18n';
import { 
  Globe, 
  Thermometer, 
  Database, 
  CheckCircle2, 
  Sliders, 
  ShieldCheck, 
  Radio, 
  RefreshCw,
  Bell,
  Cpu
} from 'lucide-react';

interface SettingsScreenProps {
  activeLanguage: Language;
  onLanguageChange: (lang: Language) => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  activeLanguage,
  onLanguageChange,
}) => {
  const [rainUnit, setRainUnit] = useState<'mm' | 'in'>('mm');
  const [tempUnit, setTempUnit] = useState<'c' | 'f'>('c');
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<boolean>(true);

  const t = translations[activeLanguage] || translations.en;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="mausam-card p-5 rounded-2xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold mb-1">
            <Sliders className="w-4 h-4 text-emerald-700" />
            <span>Platform Configuration</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            System &amp; Display Settings
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure units, language preferences, telemetry connection, and downscaling model options.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Engine Status: Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Card 1: Language & Localization */}
        <div className="mausam-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Language &amp; Localization</h3>
              <p className="text-xs text-slate-400">Select display language for interface &amp; advisory bulletins</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <label className="block text-slate-700 font-bold">Active Interface Language:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'en', label: 'English', sub: 'EN' },
                { code: 'hi', label: 'हिन्दी', sub: 'HI' },
                { code: 'mr', label: 'मराठी', sub: 'MR' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code as Language)}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    activeLanguage === lang.code
                      ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                      : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-sm">{lang.label}</div>
                  <div className={`text-[10px] mt-0.5 ${activeLanguage === lang.code ? 'text-emerald-100' : 'text-slate-400'}`}>
                    ({lang.sub})
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Card 2: Units & Measurements */}
        <div className="mausam-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Measurement Units</h3>
              <p className="text-xs text-slate-400">Specify preferred units for rainfall and temperature</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Rainfall Unit */}
            <div className="flex justify-between items-center bg-[#FAF9F5] p-3 rounded-xl border border-slate-200/80">
              <div>
                <span className="font-bold text-slate-900 block">Rainfall Unit</span>
                <span className="text-[11px] text-slate-500">Millimeters (mm) vs Inches (in)</span>
              </div>
              <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                <button
                  onClick={() => setRainUnit('mm')}
                  className={`px-3 py-1 rounded font-bold text-xs ${rainUnit === 'mm' ? 'bg-emerald-700 text-white' : 'text-slate-600'}`}
                >
                  mm
                </button>
                <button
                  onClick={() => setRainUnit('in')}
                  className={`px-3 py-1 rounded font-bold text-xs ${rainUnit === 'in' ? 'bg-emerald-700 text-white' : 'text-slate-600'}`}
                >
                  in
                </button>
              </div>
            </div>

            {/* Temperature Unit */}
            <div className="flex justify-between items-center bg-[#FAF9F5] p-3 rounded-xl border border-slate-200/80">
              <div>
                <span className="font-bold text-slate-900 block">Temperature Unit</span>
                <span className="text-[11px] text-slate-500">Celsius (°C) vs Fahrenheit (°F)</span>
              </div>
              <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                <button
                  onClick={() => setTempUnit('c')}
                  className={`px-3 py-1 rounded font-bold text-xs ${tempUnit === 'c' ? 'bg-emerald-700 text-white' : 'text-slate-600'}`}
                >
                  °C
                </button>
                <button
                  onClick={() => setTempUnit('f')}
                  className={`px-3 py-1 rounded font-bold text-xs ${tempUnit === 'f' ? 'bg-emerald-700 text-white' : 'text-slate-600'}`}
                >
                  °F
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Data Source & Telemetry */}
        <div className="mausam-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Data Source &amp; Telemetry</h3>
              <p className="text-xs text-slate-400">WINDS AWS Ground Stations &amp; IMD Forecast feed</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center bg-[#FAF9F5] p-3 rounded-xl border border-slate-200/80">
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>WINDS Telemetry Data Mode</span>
                </div>
                <span className="text-[11px] text-slate-500">
                  {demoMode ? 'Synthetic/Demo High-Resolution Terrain Mode' : 'Live WINDS Telemetry Pipeline'}
                </span>
              </div>
              <button
                onClick={() => setDemoMode(!demoMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${demoMode ? 'bg-emerald-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${demoMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1 text-xs">
              <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Panchayat Downscaling Engine v1.0.0</span>
              </div>
              <p className="text-slate-600 text-[11px]">
                XGBoost Residual Model + MinT Hierarchical Coherence + MAPIE Conformal Uncertainty Intervals active.
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: System Information */}
        <div className="mausam-card p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">System &amp; Pipeline Info</h3>
              <p className="text-xs text-slate-400">Backend FastAPI &amp; PostGIS status</p>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-medium">FastAPI Backend:</span>
              <span className="font-bold text-emerald-700">Connected (http://127.0.0.1:8000)</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Model Architecture:</span>
              <span className="font-bold text-slate-900">Spatial XGBoost + MAPIE</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Hierarchical Guarantee:</span>
              <span className="font-bold text-slate-900">MinT 100% Coherent</span>
            </div>

            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-600 font-medium">Conformal Coverage:</span>
              <span className="font-bold text-slate-900">90% Coverage Guarantee</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
