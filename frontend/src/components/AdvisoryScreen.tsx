'use client';

import React, { useState, useEffect } from 'react';
import { AdvisoryResponse, PanchayatForecastResponse, DAMUApprovalResponse } from '@/lib/types';
import { fetchAdvisory, approveAdvisoryByDAMUOfficer } from '@/lib/api';
import { Language, translations } from '@/lib/i18n';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  Sparkles,
  UserCheck,
  Send,
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface AdvisoryScreenProps {
  selectedPanchayatId: string;
  panchayatName: string;
  forecast: PanchayatForecastResponse | null;
  activeLanguage: Language;
  onNavigateToReliability: () => void;
}

export const AdvisoryScreen: React.FC<AdvisoryScreenProps> = ({
  selectedPanchayatId,
  panchayatName,
  forecast,
  activeLanguage,
  onNavigateToReliability,
}) => {
  const [crop, setCrop] = useState<string>('Cotton');
  const [stage, setStage] = useState<string>('Vegetative');
  const [advisoryData, setAdvisoryData] = useState<AdvisoryResponse | null>(null);
  const [approvalResult, setApprovalResult] = useState<DAMUApprovalResponse | null>(null);
  const [officerName, setOfficerName] = useState<string>('Dr. A. K. Sharma (DAMU Agromet Nodal Officer)');
  const [loading, setLoading] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);
  const t = translations[activeLanguage] || translations.en;

  const crops = [
    { key: 'Cotton', label: t.crop_cotton },
    { key: 'Soybean', label: t.crop_soybean },
    { key: 'Paddy', label: t.crop_paddy },
    { key: 'Sugarcane', label: t.crop_sugarcane }
  ];

  const stages = [
    { key: 'Vegetative', label: t.stage_vegetative },
    { key: 'Flowering', label: t.stage_flowering },
    { key: 'Maturity', label: t.stage_maturity }
  ];

  const handleGenerateAdvisory = async () => {
    try {
      setLoading(true);
      setApprovalResult(null);
      const res = await fetchAdvisory(selectedPanchayatId, crop, stage);
      setAdvisoryData(res);
    } catch (err: any) {
      console.error("Advisory fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAdvisory = async () => {
    try {
      setApproving(true);
      const res = await approveAdvisoryByDAMUOfficer(
        selectedPanchayatId,
        crop,
        stage,
        officerName,
        ['Kisan Portal SMS', 'WhatsApp Agromet Group', 'Meghdoot App']
      );
      setApprovalResult(res);
    } catch (err: any) {
      alert('Approval failed: ' + err.message);
    } finally {
      setApproving(false);
    }
  };

  useEffect(() => {
    handleGenerateAdvisory();
  }, [selectedPanchayatId, crop, stage]);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'ActionRequired':
        return (
          <span className="flex items-center gap-1 bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <AlertTriangle className="w-3.5 h-3.5" /> Action Required
          </span>
        );
      case 'Warning':
        return (
          <span className="flex items-center gap-1 bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <ShieldAlert className="w-3.5 h-3.5" /> Advisory Warning
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <Info className="w-3.5 h-3.5" /> Good Practice
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      
      {/* Header Banner */}
      <div className="mausam-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-200">
              <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
              DAMU Nodal Officer Workflow
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Panchayat Agro-Meteorological Advisory Console
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Review auto-drafted bulletins for District Agromet Unit (DAMU) approval and multi-channel farmer dispatch for <strong className="text-emerald-800">{panchayatName}</strong>.
          </p>
        </div>

        {/* Input Selectors */}
        <div className="flex flex-wrap items-center gap-3 bg-[#FAF9F5] p-3 rounded-2xl border border-slate-200/80 w-full md:w-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Crop:</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 cursor-pointer min-h-[38px]"
            >
              {crops.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Growth Stage:</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 cursor-pointer min-h-[38px]"
            >
              {stages.map((s) => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Part 2.8 Confidence Gating Warning Banner */}
      {advisoryData?.is_confidence_gated && (
        <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl text-amber-950 space-y-1">
          <div className="flex items-center gap-2 font-bold text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>CONFIDENCE-GATED ADVISORY WARNING (Forecast Uncertainty Wide)</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed font-medium">
            {advisoryData.confidence_gated_warning}
          </p>
          <div className="text-xs text-amber-800 font-mono pt-1">
            Interval Width: <strong>{advisoryData.forecast_interval_width_mm} mm</strong> | Model Confidence Tier: <strong>{advisoryData.forecast_confidence_level}</strong>
          </div>
        </div>
      )}

      {/* DAMU OFFICER REVIEW & APPROVAL CONSOLE */}
      <div className="mausam-card p-6 rounded-2xl space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
              <FileCheck className="w-4 h-4" />
              AMFU / DAMU Agromet Scientist Approval
            </span>
            <h3 className="text-lg font-extrabold text-slate-900">
              Bulletin Review &amp; Multi-Channel Farmer Dispatch
            </h3>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Approval Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
              approvalResult ? 'bg-emerald-700 text-white' : 'bg-amber-100 text-amber-900 border border-amber-200'
            }`}>
              {approvalResult ? approvalResult.status : advisoryData?.approval_status || 'Draft (Review Pending)'}
            </span>
          </div>
        </div>

        {approvalResult ? (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-xs text-emerald-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
              <span>Bulletin Approved and Dispatched to Kisan Portal and WhatsApp</span>
            </div>
            <p className="text-emerald-800 font-medium">{approvalResult.message}</p>
            <div className="flex flex-wrap gap-3 pt-1 text-xs text-emerald-700">
              <span className="font-bold text-emerald-950">Nodal Officer: {approvalResult.approved_by}</span>
              <span>Timestamp: {approvalResult.approved_at}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FAF9F5] p-4 rounded-2xl border border-slate-200/80 text-xs">
            <div className="w-full md:w-auto flex-1">
              <label className="block font-bold text-slate-800 mb-1">Agromet Scientist Name:</label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-900 text-xs min-h-[38px]"
              />
            </div>

            <button
              onClick={handleApproveAdvisory}
              disabled={approving || !advisoryData}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-xs whitespace-nowrap min-h-[44px] cursor-pointer shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>{approving ? 'Approving...' : t.approve_dispatches}</span>
            </button>
          </div>
        )}
      </div>

      {/* Advisory Output Cards */}
      {loading ? (
        <div className="mausam-card p-12 rounded-2xl text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold">Evaluating confidence-gated advisory rules...</p>
        </div>
      ) : advisoryData ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-slate-200/80 p-4 rounded-2xl text-xs gap-2">
            <div className="flex items-center gap-2 text-slate-800 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Advisory generated for <strong>{crop}</strong> in <strong>{panchayatName}</strong>.</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Timestamp: {advisoryData.generated_at}</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {advisoryData.advisories.map((adv, idx) => (
              <div
                key={idx}
                className={`mausam-card-hero p-5 rounded-2xl space-y-3 ${
                  advisoryData.is_confidence_gated ? 'border-amber-300 bg-amber-50/20' :
                  adv.severity === 'ActionRequired' ? 'border-red-300' :
                  adv.severity === 'Warning' ? 'border-amber-300' : 'border-emerald-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {adv.category}
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">{adv.title}</h3>
                  </div>
                  {getSeverityBadge(adv.severity)}
                </div>

                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {adv.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

    </div>
  );
};
