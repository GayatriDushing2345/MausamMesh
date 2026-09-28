'use client';

import React from 'react';
import { Language } from '@/lib/i18n';

interface MausamMeshLogoProps {
  language?: Language;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const MausamMeshLogo: React.FC<MausamMeshLogoProps> = ({
  language = 'en',
  size = 'md',
  showSubtitle = true,
}) => {
  const getSubtitle = () => {
    switch (language) {
      case 'hi':
        return 'पंचायत मौसम बुद्धिमत्ता';
      case 'mr':
        return 'पंचायत हवामान बुद्धिमत्ता';
      default:
        return 'Panchayat Weather Intelligence';
    }
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Simple Green Leaf & Weather Mesh SVG Logo Mark */}
      <div className={`relative bg-emerald-700 text-white p-1.5 rounded-xl shadow-xs shrink-0 flex items-center justify-center ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full text-white"
        >
          {/* Leaf / Crop outline */}
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 4.4-3.6 8-8 8" />
          <path d="M11 20v2" />
          {/* Weather mesh grid dot */}
          <circle cx="12" cy="11" r="1.5" fill="currentColor" />
        </svg>
      </div>

      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-bold tracking-tight text-slate-900 ${titleSizes[size]}`}>
            Mausam<span className="text-emerald-700">Mesh</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
            मौसममेश
          </span>
        </div>
        {showSubtitle && (
          <p className="text-xs font-medium text-slate-500 leading-none mt-1">
            {getSubtitle()}
          </p>
        )}
      </div>
    </div>
  );
};
