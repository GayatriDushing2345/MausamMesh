'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Language, t } from '@/lib/i18n';

export type GlossaryTerm = 'conformal_range' | 'mint' | 'csi' | 'mae' | 'residual' | 'downscaling';

interface GlossaryTooltipProps {
  term: GlossaryTerm;
  activeLanguage: Language;
  children?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

export const GlossaryTooltip: React.FC<GlossaryTooltipProps> = ({
  term,
  activeLanguage,
  children,
  showIcon = true,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  const termTitle = t(`glossary.${term}`, activeLanguage);
  const termDesc = t(`glossary.${term}_desc`, activeLanguage);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <span ref={containerRef} className={`relative inline-flex items-center gap-1 ${className}`}>
      {children && (
        <span 
          onClick={() => setIsOpen(prev => !prev)}
          className="cursor-help border-b border-dotted border-slate-400 dark:border-slate-500 hover:text-[#0E7C86] dark:hover:text-[#2DB3C0] transition-colors"
        >
          {children}
        </span>
      )}

      {showIcon && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(prev => !prev);
          }}
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="text-slate-400 hover:text-[#0E7C86] dark:hover:text-[#2DB3C0] p-0.5 rounded transition-colors inline-flex items-center justify-center"
          aria-label={`Explanation for ${termTitle}`}
          aria-expanded={isOpen}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      )}

      {isOpen && (
        <div 
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 sm:w-72 p-3 bg-slate-900/95 dark:bg-slate-950/95 text-white text-xs rounded-xl shadow-2xl z-50 border border-slate-700/80 backdrop-blur-md space-y-1.5 animate-in fade-in zoom-in-95 duration-150 leading-relaxed font-sans"
        >
          <div className="flex justify-between items-start border-b border-slate-800 pb-1.5">
            <span className="font-extrabold text-[#2DB3C0]">{termTitle}</span>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-0.5"
              aria-label="Close explanation"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {termDesc}
          </p>
          <div className="w-2 h-2 bg-slate-900 rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2 border-r border-b border-slate-700" />
        </div>
      )}
    </span>
  );
};
