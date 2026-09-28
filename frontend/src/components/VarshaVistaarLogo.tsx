'use client';

import React from 'react';
import { MausamMeshLogo } from './MausamMeshLogo';
import { Language } from '@/lib/i18n';

interface VarshaVistaarLogoProps {
  language?: Language;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const VarshaVistaarLogo: React.FC<VarshaVistaarLogoProps> = ({
  language = 'en',
  size = 'md',
  showTagline = true,
}) => {
  return (
    <MausamMeshLogo
      language={language}
      size={size}
      showSubtitle={showTagline}
    />
  );
};

