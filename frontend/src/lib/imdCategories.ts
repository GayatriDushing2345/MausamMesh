/**
 * Official IMD (India Meteorological Department) Daily Precipitation Categories & Standards
 * Reference: IMD Standard Operating Procedure for Agrometeorological Advisory Services (AAS)
 */

export interface IMDRainfallCategory {
  id: 'no_rain' | 'very_light' | 'light' | 'moderate' | 'heavy' | 'very_heavy' | 'extremely_heavy';
  labelEn: string;
  labelHi: string;
  labelMr: string;
  minMm: number;
  maxMm: number;
  mapColor: string;          // Sequential blue-purple scale for maps
  filledBadgeClass: string;  // Filled background badge styling with high-contrast text
  warningColor: string;      // Official IMD Warning scale color
  warningLevel: 'green' | 'yellow' | 'orange' | 'red';
}

export const IMD_RAINFALL_CATEGORIES: IMDRainfallCategory[] = [
  {
    id: 'no_rain',
    labelEn: 'No Rain',
    labelHi: 'शुष्क (कोई वर्षा नहीं)',
    labelMr: 'निरभ्र (पाऊस नाही)',
    minMm: 0.0,
    maxMm: 0.0,
    mapColor: '#94A3B8',
    filledBadgeClass: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200 font-bold border-none shadow-2xs',
    warningColor: '#2E9E4F',
    warningLevel: 'green'
  },
  {
    id: 'very_light',
    labelEn: 'Very Light Rain',
    labelHi: 'बहुत हल्की वर्षा',
    labelMr: 'अत्यल्प पाऊस',
    minMm: 0.1,
    maxMm: 2.4,
    mapColor: '#7DD3FC',
    filledBadgeClass: 'bg-sky-200 text-sky-950 dark:bg-sky-900 dark:text-sky-100 font-bold border-none shadow-2xs',
    warningColor: '#2E9E4F',
    warningLevel: 'green'
  },
  {
    id: 'light',
    labelEn: 'Light Rain',
    labelHi: 'हल्की वर्षा',
    labelMr: 'हलका पाऊस',
    minMm: 2.5,
    maxMm: 15.5,
    mapColor: '#38BDF8',
    filledBadgeClass: 'bg-emerald-600 text-white font-bold border-none shadow-2xs',
    warningColor: '#2E9E4F',
    warningLevel: 'green'
  },
  {
    id: 'moderate',
    labelEn: 'Moderate Rain',
    labelHi: 'मध्यम वर्षा',
    labelMr: 'मध्यम पाऊस',
    minMm: 15.6,
    maxMm: 64.4,
    mapColor: '#0284C7',
    filledBadgeClass: 'bg-[#F2C230] text-[#0B1F33] font-extrabold border-none shadow-2xs',
    warningColor: '#F2C230',
    warningLevel: 'yellow'
  },
  {
    id: 'heavy',
    labelEn: 'Heavy Rain',
    labelHi: 'भारी वर्षा',
    labelMr: 'मुसळधार पाऊस',
    minMm: 64.5,
    maxMm: 115.5,
    mapColor: '#1D4ED8',
    filledBadgeClass: 'bg-[#F28C28] text-white font-bold border-none shadow-2xs',
    warningColor: '#F28C28',
    warningLevel: 'orange'
  },
  {
    id: 'very_heavy',
    labelEn: 'Very Heavy Rain',
    labelHi: 'बहुत भारी वर्षा',
    labelMr: 'अतिमुसळधार पाऊस',
    minMm: 115.6,
    maxMm: 204.4,
    mapColor: '#6D28D9',
    filledBadgeClass: 'bg-[#D64545] text-white font-bold border-none shadow-2xs',
    warningColor: '#D64545',
    warningLevel: 'red'
  },
  {
    id: 'extremely_heavy',
    labelEn: 'Extremely Heavy Rain',
    labelHi: 'अत्यंत भारी वर्षा',
    labelMr: 'अतिवृष्टी / अत्यंत मुसळधार',
    minMm: 204.5,
    maxMm: 9999.0,
    mapColor: '#A21CAF',
    filledBadgeClass: 'bg-fuchsia-800 text-white font-bold border-none shadow-2xs',
    warningColor: '#D64545',
    warningLevel: 'red'
  }
];

/**
 * Get official IMD rainfall category object for any daily precipitation value in mm
 */
export function getIMDRainfallCategory(rainMm: number): IMDRainfallCategory {
  if (rainMm <= 0) return IMD_RAINFALL_CATEGORIES[0]; // No Rain
  if (rainMm <= 2.4) return IMD_RAINFALL_CATEGORIES[1]; // Very Light
  if (rainMm <= 15.5) return IMD_RAINFALL_CATEGORIES[2]; // Light
  if (rainMm <= 64.4) return IMD_RAINFALL_CATEGORIES[3]; // Moderate
  if (rainMm <= 115.5) return IMD_RAINFALL_CATEGORIES[4]; // Heavy
  if (rainMm <= 204.4) return IMD_RAINFALL_CATEGORIES[5]; // Very Heavy
  return IMD_RAINFALL_CATEGORIES[6]; // Extremely Heavy
}

/**
 * Get localized label for IMD category
 */
export function getIMDCategoryLabel(rainMm: number, lang: string): string {
  const cat = getIMDRainfallCategory(rainMm);
  switch (lang) {
    case 'hi': return cat.labelHi;
    case 'mr': return cat.labelMr;
    case 'en':
    default:
      return cat.labelEn;
  }
}
