'use client';

import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { DataHealthResponse } from '../lib/types';
import { fetchDataHealth } from '../lib/api';

interface DataHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataHealthModal({ isOpen, onClose }: DataHealthModalProps) {
  const [healthData, setHealthData] = useState<DataHealthResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchDataHealth();
      setHealthData(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch pipeline health');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="data-health-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 id="data-health-title" className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Operational Data Pipeline Health
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  healthData?.overall_status === 'green'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : healthData?.overall_status === 'amber'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {healthData?.overall_status?.toUpperCase() || 'CHECKING'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live telemetry and upstream model ingestion status
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {isLoading && !healthData ? (
            <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Checking data pipeline health...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm">
              {error}
            </div>
          ) : (
            <>
              {/* Overall Banner */}
              <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed">
                  <span className="font-bold">Honesty Guarantee: </span>
                  MausamMesh displays data exclusively from verified upstream sources. No synthetic interpolation is rendered without conformal calibration bounds.
                </div>
              </div>

              {/* Feed List */}
              <div className="space-y-2.5">
                {healthData?.sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {src.status === 'nominal' ? (
                          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : src.status === 'degraded' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        )}
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {src.name}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {src.coverage} • Last updated: {src.last_updated}
                      </div>
                      {src.fallback_in_use && (
                        <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          Active fallback: {src.fallback_in_use}
                        </div>
                      )}
                    </div>

                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase shrink-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                      {src.status}
                    </span>
                  </div>
                ))}
              </div>

              {/* Last Checked */}
              <div className="text-xs text-slate-400 text-right pt-2">
                Last checked: {healthData?.last_checked}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh status
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
