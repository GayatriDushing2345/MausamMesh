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

  const iconConfig = {
    sm: { cls: 'w-6 h-6', px: 24 },
    md: { cls: 'w-8 h-8', px: 32 },
    lg: { cls: 'w-10 h-10', px: 40 },
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const currentIcon = iconConfig[size] || iconConfig.md;

  return (
    <div className="flex items-center gap-2.5 select-none shrink-0">
      {/* Monsoon Teal Leaf & Weather Mesh SVG Logo Mark */}
      <div 
        style={{ width: currentIcon.px, height: currentIcon.px, minWidth: currentIcon.px, minHeight: currentIcon.px, maxWidth: currentIcon.px, maxHeight: currentIcon.px }}
        className={`relative bg-[#0E7C86] text-white p-1 rounded-xl shadow-xs shrink-0 flex items-center justify-center overflow-hidden ${currentIcon.cls}`}
      >
        <svg
          viewBox="0 0 24 24"
          width={currentIcon.px}
          height={currentIcon.px}
          style={{ width: '100%', height: '100%', maxWidth: currentIcon.px, maxHeight: currentIcon.px }}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white shrink-0"
        >
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 4.4-3.6 8-8 8" />
          <path d="M11 20v2" />
          <circle cx="12" cy="11" r="1.5" fill="currentColor" />
        </svg>
      </div>

      <div>
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-extrabold tracking-tight text-[#0B1F33] dark:text-white ${titleSizes[size]}`}>
            Mausam<span className="text-[#0E7C86] dark:text-[#2DB3C0]">Mesh</span>
          </span>
          <span className="text-xs font-bold text-[#0E7C86] dark:text-[#2DB3C0] bg-[#E6F6F7] dark:bg-monsoon-950/80 px-1.5 py-0.5 rounded border border-[#0E7C86]/30 hidden sm:inline-block">
            मौसममेश
          </span>
        </div>
        {showSubtitle && (
          <p className="text-xs font-medium text-[#5B6472] dark:text-[#B8C4D6] leading-none mt-1">
            {getSubtitle()}
          </p>
        )}
      </div>
    </div>
  );
};
