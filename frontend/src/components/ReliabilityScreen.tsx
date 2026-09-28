'use client';

import React, { useState, useEffect } from 'react';
import { ModelReliabilityResponse } from '@/lib/types';
import { fetchPanchayatReliability, getReportDownloadUrl } from '@/lib/api';
import { Language, translations } from '@/lib/i18n';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  Area
} from 'recharts';
import { 
  ShieldCheck, 
  Download, 
  Activity
} from 'lucide-react';

interface ReliabilityScreenProps {
  selectedPanchayatId: string;
  panchayatName: string;
  activeLanguage: Language;
}

export const ReliabilityScreen: React.FC<ReliabilityScreenProps> = ({
  selectedPanchayatId,
  panchayatName,
  activeLanguage,
}) => {
  const [data, setData] = useState<ModelReliabilityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const t = translations[activeLanguage] || translations.en;

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetchPanchayatReliability(selectedPanchayatId);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load reliability metrics');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedPanchayatId]);

  const handleDownloadPDF = () => {
    setDownloading(true);
    const pdfUrl = getReportDownloadUrl(selectedPanchayatId, 'Cotton', activeLanguage);
    window.open(pdfUrl, '_blank');
    setTimeout(() => setDownloading(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        </div>
        <div className="h-[300px] bg-slate-100 border border-slate-200/80 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-600">
        <p className="text-sm font-bold">Error loading reliability data: {error}</p>
      </div>
    );
  }

  const featureChartData = data.feature_importances.map(item => ({
    name: item.feature_description,
    importance: item.importance_score,
  }));

  const scatterData = data.historical_comparison.map(item => ({
    date: item.date,
    observed: item.panchayat_observed_mm,
    predicted: item.panchayat_predicted_mm,
    blockBaseline: item.block_forecast_mm,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="mausam-card-hero p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-700 p-3 rounded-xl text-white shadow-xs shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-200">
                Model Verification
              </span>
              <span className="text-xs text-slate-500">Version: {data.model_version}</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Model Insights &amp; Reliability — {panchayatName}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified on <strong className="text-slate-900">{data.training_sample_size.toLocaleString()}</strong> historical daily observations.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all shadow-xs min-h-[44px] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? t.downloading : t.download_report}</span>
          </button>
        </div>
      </div>

      {/* Part 2.10 Forecast Reliability Summary Card */}
      <div className="mausam-card p-5 rounded-2xl space-y-3">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="text-sm font-bold text-slate-900">Forecast Reliability Summary</h3>
          <p className="text-xs text-slate-500">Human-readable statistical explanation of uncertainty quantification</p>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed font-medium">
          Downscaled predictions for {panchayatName} are calibrated using Split-Conformal inference. The model provides a guaranteed <strong>{data.conformal_coverage_rate_pct}% coverage interval</strong>, maintaining 100% MinT reconciliation with the parent Block forecast.
        </p>
      </div>

      {/* Metric Callout Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-slate-200/60">
          <span className="text-xs text-slate-500">Model MAE</span>
          <div className="text-xl font-extrabold text-slate-900">{data.overall_mae_mm} mm</div>
          <span className="text-[10px] text-slate-400">Mean Absolute Error</span>
        </div>

        <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-slate-200/60">
          <span className="text-xs text-slate-500">Model RMSE</span>
          <div className="text-xl font-extrabold text-slate-900">{data.overall_rmse_mm} mm</div>
          <span className="text-[10px] text-slate-400">Standard Dev</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-xs text-emerald-800 font-bold">Conformal Coverage</span>
          <div className="text-xl font-extrabold text-emerald-800">{data.conformal_coverage_rate_pct}%</div>
          <span className="text-[10px] text-emerald-700 font-medium">MAPIE 90% Guarantee</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-xs text-emerald-800 font-bold">MinT Coherence</span>
          <div className="text-xl font-extrabold text-emerald-800">100.0%</div>
          <span className="text-[10px] text-emerald-700 font-medium">Block ↔ Panchayat Sum</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 shadow-2xs">
          <span className="text-xs text-amber-800 font-bold">Skill Gate Pass</span>
          <div className="text-xl font-extrabold text-amber-800">{data.loso_skill_gate_pass_rate_pct}%</div>
          <span className="text-[10px] text-amber-700 font-medium">LOSO Gate Audit</span>
        </div>

        <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-slate-200/60">
          <span className="text-xs text-slate-500">Heavy Rain Brier</span>
          <div className="text-xl font-extrabold text-slate-900">{data.brier_score_heavy_rain}</div>
          <span className="text-[10px] text-slate-400">Calibration (&gt;15mm)</span>
        </div>
      </div>

      {/* Feature Importance Horizontal Bar Chart */}
      <div className="mausam-card-hero p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-700" />
              <span>XGBoost Spatial &amp; Topographic Feature Importance</span>
            </h3>
            <p className="text-xs text-slate-500">Gini importance weights derived for spatial downscaling features</p>
          </div>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
            Spatial XGBoost
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={featureChartData} margin={{ top: 5, right: 30, left: 160, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 600 }} width={155} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#1E293B', fontSize: '12px' }}
                itemStyle={{ color: '#15803D' }}
              />
              <Bar dataKey="importance" name="Gini Importance" fill="#15803D" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Historical Time Series + Categorical Event Skills Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Historical Time Series */}
        <div className="mausam-card p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Historical Observed vs Downscaled Predicted</h3>
            <p className="text-xs text-slate-500">30-day continuous verification trajectory</p>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={scatterData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis label={{ value: 'Rain (mm)', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#64748B' } }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', color: '#1E293B', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="observed" name="Observed Rain (mm)" stroke="#15803D" fill="#15803D" fillOpacity={0.1} strokeWidth={2} />
                <Line type="monotone" dataKey="predicted" name="ML Predicted Rain (mm)" stroke="#0284C7" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="blockBaseline" name="Block Baseline (mm)" stroke="#94A3B8" strokeDasharray="4 4" strokeWidth={1.5} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Event Skill Table */}
        <div className="mausam-card p-5 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Categorical Event Skill Metrics (CSI / POD / FAR)</h3>
            <p className="text-xs text-slate-500">Threshold verification across rainfall categories</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-slate-200/80 text-slate-800 font-bold">
                  <th className="py-2.5 px-3">Threshold</th>
                  <th className="py-2.5 px-3 text-right">CSI</th>
                  <th className="py-2.5 px-3 text-right">POD</th>
                  <th className="py-2.5 px-3 text-right">FAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.event_skills.map((skill, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {skill.threshold_mm === 2.5 ? 'Light Rain (≥ 2.5 mm)' :
                       skill.threshold_mm === 15.0 ? 'Heavy Rain (≥ 15.0 mm)' :
                       `Extreme Rain (≥ ${skill.threshold_mm} mm)`}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-800">
                      {skill.csi.toFixed(3)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-800">
                      {(skill.pod * 100).toFixed(1)}%
                    </td>
                    <td className="py-3 px-3 text-right text-amber-700 font-bold">
                      {(skill.far * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
