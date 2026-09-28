'use client';

import React from 'react';

interface ContourDividerProps {
  className?: string;
  stroke?: string;
}

export const ContourDivider: React.FC<ContourDividerProps> = ({
  className = "w-full h-3 my-2",
  stroke = "#C08A3E",
}) => {
  return (
    <svg
      className={className}
      viewBox="0 0 1000 20"
      preserveAspectRatio="none"
      fill="none"
      aria-hidden="true"
    >
      {/* Irregular topographic elevation contour curve 1 */}
      <path
        d="M0 10 Q 180 2, 360 12 T 720 7 T 1000 11"
        stroke={stroke}
        strokeWidth="1.2"
        strokeOpacity="0.4"
      />
      {/* Irregular topographic elevation contour curve 2 */}
      <path
        d="M0 15 Q 220 18, 440 6 T 820 16 T 1000 9"
        stroke={stroke}
        strokeWidth="0.8"
        strokeDasharray="4 2"
        strokeOpacity="0.25"
      />
    </svg>
  );
};
