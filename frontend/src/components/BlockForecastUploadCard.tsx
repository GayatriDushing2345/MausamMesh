'use client';

import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  FileSpreadsheet, 
  RefreshCw, 
  Download, 
  Info,
  Check
} from 'lucide-react';
import { uploadBlockForecastCSV } from '@/lib/api';
import { BlockForecastUploadResponse } from '@/lib/types';

export const BlockForecastUploadCard: React.FC = () => {
  const [csvContent, setCsvContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<BlockForecastUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedTag, setAppliedTag] = useState<string | null>(null);

  const sampleCSV = `block_id,lead_day,rainfall_mean,temp_max,temp_min,wind_speed,rh_mean
BLK_HAVELI,1,28.4,32.5,23.1,14.2,82
BLK_HAVELI,2,14.2,31.0,22.8,11.5,78
BLK_HAVELI,3,5.6,33.0,24.0,9.0,70
BLK_PUNE_CITY,1,22.1,31.8,22.5,12.0,80
BLK_PUNE_CITY,2,10.5,30.5,22.0,10.0,75`;

  const handleLoadSample = () => {
    setCsvContent(sampleCSV);
    setResult(null);
    setError(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content || '');
      setResult(null);
      setError(null);
    };
    reader.readAsText(file);
  };

  const handleValidate = async () => {
    if (!csvContent.trim()) {
      setError('Please provide CSV content or upload a file first.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await uploadBlockForecastCSV(csvContent, true);
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Validation request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!csvContent.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await uploadBlockForecastCSV(csvContent, false);
      setResult(res);
      setAppliedTag(res.dataset_id || 'CUSTOM_TAG');
    } catch (err: any) {
      setError(err.message || 'Apply request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mausam-card p-5 rounded-2xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Official Block Forecast CSV Ingestion
            </h3>
            <p className="text-xs text-slate-400">
              DAMU / IMD custom forecast upload with automated validation &amp; input tagging
            </p>
          </div>
        </div>

        {appliedTag && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Active Tag: {appliedTag}</span>
          </div>
        )}
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        Upload or paste official block-level NWP bulletins. The downscaling engine validates required header schemas, lead day limits (1–7), and non-negative rainfall thresholds before incorporating values into downstream panchayat predictions.
      </p>

      {/* CSV Input Controls */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <label className="font-bold text-slate-700">Forecast CSV Payload:</label>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className="text-teal-700 hover:text-teal-900 font-bold underline text-[11px]"
            >
              Insert Sample CSV
            </button>
            <label className="cursor-pointer px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] flex items-center gap-1">
              <Upload className="w-3 h-3" />
              <span>Browse CSV</span>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <textarea
          value={csvContent}
          onChange={(e) => setCsvContent(e.target.value)}
          placeholder={`block_id,lead_day,rainfall_mean,temp_max,temp_min,wind_speed,rh_mean\nBLK_HAVELI,1,28.4,32.5,23.1,14.2,82...`}
          className="w-full h-32 p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all resize-none"
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Validation / Execution Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleValidate}
            disabled={loading || !csvContent.trim()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            <span>Dry-Run Validation</span>
          </button>

          <button
            onClick={handleApply}
            disabled={loading || !csvContent.trim()}
            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Apply Forecast to Pipeline</span>
          </button>
        </div>
      </div>

      {/* Validation Results Display */}
      {result && (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`font-bold ${result.status !== 'errors' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {result.status !== 'errors' ? 'Validation Succeeded' : 'Validation Found Errors'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">{result.total_rows} total rows ({result.valid_rows} valid)</span>
            </div>
            {result.dataset_id && (
              <div className="font-mono text-[11px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                tag: {result.dataset_id}
              </div>
            )}
          </div>

          {result.errors.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200">
              <span className="font-bold text-red-700 block">Row-level validation issues:</span>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {result.errors.map((err, idx) => (
                  <div key={idx} className="p-2 bg-red-50 text-red-800 rounded-lg text-[11px] flex items-center justify-between">
                    <span>Row {err.row}: <strong>{err.column}</strong> — {err.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.status !== 'errors' && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-[11px] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                All {result.valid_rows} forecast records conform to IMD agromet schema standards.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
