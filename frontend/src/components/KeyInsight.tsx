'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldCheck, ArrowRight } from 'lucide-react';
import { Language, t } from '@/lib/i18n';

export type InsightSeverity = 'green' | 'yellow' | 'orange' | 'red';

interface KeyInsightProps {
  severity: InsightSeverity;
  messageKey?: string;
  message?: string;
  title?: string;
  params?: Record<string, string | number>;
  activeLanguage?: Language;
  actionText?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  onAction?: () => void;
  className?: string;
}

export const KeyInsight: React.FC<KeyInsightProps> = ({
  severity,
  messageKey,
  message: directMessage,
  title: directTitle,
  params,
  activeLanguage = 'en',
  actionText,
  actionLabel,
  onActionClick,
  onAction,
  className = ''
}) => {
  const displayMessage = directMessage || (messageKey ? t(messageKey, activeLanguage, params) : '');
  const handleAction = onAction || onActionClick;
  const displayActionLabel = actionLabel || actionText;

  // Strictly conform to IMD Warning Color Scale: Green (No warning), Yellow (Watch), Orange (Alert), Red (Warning)
  const severityStyles: Record<InsightSeverity, {
    bg: string;
    border: string;
    text: string;
    icon: React.ReactNode;
    badgeBg: string;
    badgeText: string;
    badgeLabel: string;
  }> = {
    red: {
      bg: 'bg-red-500/10 dark:bg-red-950/40',
      border: 'border-l-4 border-red-500 dark:border-red-400 border-t border-r border-b border-red-200/60 dark:border-red-800/40',
      text: 'text-red-950 dark:text-red-100',
      icon: <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />,
      badgeBg: 'bg-red-600 text-white',
      badgeText: 'text-red-700 dark:text-red-300',
      badgeLabel: 'IMD WARNING / CRITICAL ACTION'
    },
    orange: {
      bg: 'bg-amber-500/10 dark:bg-amber-950/40',
      border: 'border-l-4 border-[#F28C28] dark:border-amber-400 border-t border-r border-b border-amber-200/60 dark:border-amber-800/40',
      text: 'text-amber-950 dark:text-amber-100',
      icon: <AlertCircle className="w-5 h-5 text-[#F28C28] dark:text-amber-400 shrink-0" />,
      badgeBg: 'bg-[#F28C28] text-white',
      badgeText: 'text-amber-800 dark:text-amber-300',
      badgeLabel: 'IMD ALERT / ACTION REQUIRED'
    },
    yellow: {
      bg: 'bg-yellow-500/10 dark:bg-yellow-950/30',
      border: 'border-l-4 border-[#F2C230] dark:border-yellow-400 border-t border-r border-b border-yellow-200/60 dark:border-yellow-800/40',
      text: 'text-yellow-950 dark:text-yellow-100',
      icon: <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0" />,
      badgeBg: 'bg-[#F2C230] text-[#0B1F33]',
      badgeText: 'text-yellow-800 dark:text-yellow-300',
      badgeLabel: 'IMD WATCH / ADVISORY'
    },
    green: {
      bg: 'bg-emerald-500/10 dark:bg-emerald-950/30',
      border: 'border-l-4 border-emerald-500 dark:border-emerald-400 border-t border-r border-b border-emerald-200/60 dark:border-emerald-800/40',
      text: 'text-emerald-950 dark:text-emerald-100',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
      badgeBg: 'bg-emerald-600 text-white',
      badgeText: 'text-emerald-800 dark:text-emerald-300',
      badgeLabel: 'IMD NORMAL / ROUTINE OPERATIONS'
    }
  };

  const style = severityStyles[severity] || severityStyles.green;

  return (
    <aside 
      aria-label="Key Agrometeorological Insight"
      className={`rounded-2xl p-4 md:p-4.5 backdrop-blur-md shadow-xs transition-all ${style.bg} ${style.border} ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{style.icon}</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${style.badgeBg}`}>
                {style.badgeLabel}
              </span>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
                {t('key_insight.label', activeLanguage)}
              </span>
            </div>
            <p className={`text-xs sm:text-sm font-semibold leading-relaxed ${style.text}`}>
              {displayMessage}
            </p>
          </div>
        </div>

        {displayActionLabel && handleAction && (
          <button
            onClick={handleAction}
            className="shrink-0 self-end sm:self-center font-bold text-xs sm:text-sm text-[#0E7C86] dark:text-[#2DB3C0] hover:underline flex items-center gap-1.5 py-1 px-2 rounded-lg transition-colors cursor-pointer group"
          >
            <span>{displayActionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    </aside>
  );
};
