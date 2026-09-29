import en from '../locales/en.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';
import gu from '../locales/gu.json';
import bn from '../locales/bn.json';
import ta from '../locales/ta.json';
import te from '../locales/te.json';
import kn from '../locales/kn.json';
import ml from '../locales/ml.json';
import pa from '../locales/pa.json';
import orLocale from '../locales/or.json';

export type Language = 'en' | 'hi' | 'mr' | 'gu' | 'bn' | 'ta' | 'te' | 'kn' | 'ml' | 'pa' | 'or';

export interface LanguageInfo {
  code: Language;
  nameEn: string;
  nativeName: string;
  speechLocale: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'en', nameEn: 'English', nativeName: 'English', speechLocale: 'en-IN' },
  { code: 'hi', nameEn: 'Hindi', nativeName: 'हिन्दी', speechLocale: 'hi-IN' },
  { code: 'mr', nameEn: 'Marathi', nativeName: 'मराठी', speechLocale: 'mr-IN' },
  { code: 'gu', nameEn: 'Gujarati', nativeName: 'ગુજરાતી', speechLocale: 'gu-IN' },
  { code: 'bn', nameEn: 'Bengali', nativeName: 'বাংলা', speechLocale: 'bn-IN' },
  { code: 'ta', nameEn: 'Tamil', nativeName: 'தமிழ்', speechLocale: 'ta-IN' },
  { code: 'te', nameEn: 'Telugu', nativeName: 'తెలుగు', speechLocale: 'te-IN' },
  { code: 'kn', nameEn: 'Kannada', nativeName: 'ಕನ್ನಡ', speechLocale: 'kn-IN' },
  { code: 'ml', nameEn: 'Malayalam', nativeName: 'മലയാളം', speechLocale: 'ml-IN' },
  { code: 'pa', nameEn: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechLocale: 'pa-IN' },
  { code: 'or', nameEn: 'Odia', nativeName: 'ଓଡ଼ିଆ', speechLocale: 'or-IN' },
];

export const RAW_LOCALES: Record<Language, any> = {
  en,
  hi,
  mr,
  gu,
  bn,
  ta,
  te,
  kn,
  ml,
  pa,
  or: orLocale
};

/**
 * Format parameterized message e.g. "Rain {rain_mm} mm in {panchayat}" -> "Rain 24.5 mm in Wagholi"
 */
export function formatMessage(template: string, params?: Record<string, string | number>): string {
  if (!template) return '';
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

/**
 * Get string with Fallback chain: Selected Language -> Hindi (hi) -> English (en)
 */
export function t(keyPath: string, lang: Language = 'en', params?: Record<string, string | number>): string {
  const parts = keyPath.split('.');
  
  const resolve = (localeObj: any) => {
    let curr = localeObj;
    for (const p of parts) {
      if (!curr || typeof curr !== 'object') return null;
      curr = curr[p];
    }
    return typeof curr === 'string' ? curr : null;
  };

  const str = resolve(RAW_LOCALES[lang]) || resolve(RAW_LOCALES['hi']) || resolve(RAW_LOCALES['en']) || keyPath;
  return params ? formatMessage(str, params) : str;
}

/**
 * Backward compatibility dictionary mapping for existing components
 */
function buildLegacyTranslations(lang: Language) {
  const data = RAW_LOCALES[lang] || RAW_LOCALES['en'];
  return {
    system_title: data.system.title,
    system_subtitle: data.system.subtitle,
    portal_title: data.system.portal_title,
    portal_subtitle: data.system.portal_subtitle,
    hero_headline: data.system.tagline,
    hero_subhead: data.system.slogan,
    greeting_morning: lang === 'en' ? "Good Morning" : "शुभ प्रभात",
    greeting_afternoon: lang === 'en' ? "Good Afternoon" : "शुभ दोपहर",
    greeting_evening: lang === 'en' ? "Good Evening" : "शुभ संध्या",
    theme_day: data.settings.day_mode,
    theme_night: data.settings.night_mode,
    tab_dashboard: data.nav.dashboard,
    tab_map: data.nav.map,
    tab_analysis: data.nav.analysis,
    tab_advisory: data.nav.advisory,
    tab_reliability: data.nav.reliability,
    tab_settings: data.nav.settings,
    priority_queue_title: data.priority.title,
    needs_attention_first: data.priority.subtitle,
    open_priority_queue: data.priority.open_queue,
    tune_weights: data.priority.tune_weights,
    export_csv: data.priority.export_csv,
    download_queue_csv: data.priority.download_csv,
    how_priority_calculated: "How is Priority Calculated?",
    rank: data.priority.rank,
    tier_very_high: data.priority.very_high,
    tier_high: data.priority.high,
    tier_medium: data.priority.medium,
    tier_low: data.priority.low,
    verify_before_dispatch_note: data.priority.verify_before_dispatch_desc,
    partial_data_note: data.priority.partial_data_desc,
    why_this_rank: data.priority.why_this_rank,
    focus_on_map: "Focus on Map",
    country: "India",
    state: "State",
    district: "District",
    block: "Block",
    panchayat: "Panchayat",
    select_state: "Select State",
    select_district: "Select District",
    select_block: "Select Block",
    select_panchayat: "Select Panchayat",
    search_panchayat_placeholder: data.actions.search_placeholder,
    location_drilldown: "Location Hierarchy",
    quick_jump: "Quick Jump / Command Palette",
    command_palette_title: "Search Locations or Navigate Pages",
    no_results_found: "No matching panchayats or pages found.",
    mint_coherent: data.glossary.mint,
    conformal_90: data.glossary.conformal_range,
    winds_connected: data.system.live_data_badge,
    demo_data: data.system.demo_data_badge,
    live_data: data.system.live_data_badge,
    download_report: data.actions.download_report,
    download_pdf: "MausamMesh Agromet Bulletin (PDF)",
    downloading: data.actions.downloading,
    explore_map: data.actions.explore_map,
    view_analysis: data.actions.view_analysis,
    review_advisory: data.actions.review_advisory,
    verify_reliability: data.actions.verify_reliability,
    approve_dispatches: data.actions.approve_dispatch,
    lead_day: "Lead Day",
    block_baseline: data.weather.block_baseline,
    panchayat_downscaled: data.weather.panchayat_downscaled,
    conformal_range: data.glossary.conformal_range,
    temp: data.weather.temp,
    humidity: data.weather.humidity,
    wind: data.weather.wind,
    rainfall: data.weather.precipitation,
    risk_level: "Risk Level",
    confidence_tier: "Confidence Tier",
    heavy_rain_prob: "Heavy Rain Probability",
    risk_low: data.priority.low,
    risk_moderate: data.priority.medium,
    risk_high: data.priority.high,
    risk_severe: data.priority.very_high,
    crop_cotton: data.crops.cotton,
    crop_soybean: data.crops.soybean,
    crop_paddy: data.crops.paddy,
    crop_sugarcane: data.crops.sugarcane,
    stage_vegetative: data.crops.stages.vegetative,
    stage_flowering: data.crops.stages.flowering,
    stage_maturity: data.crops.stages.maturity,
    assistant_title: "MausamMesh Assistant",
    assistant_subtitle: "Agrometeorological Helper & FAQ",
    ask_placeholder: "Ask about priority queue, downscaling, or MinT...",
    quick_questions: "Suggested Questions:",
    hero_map_badge: "GIS Layer",
    damu_approval_badge: "DAMU Workflow",
    quality_badge: "Statistical Skill"
  };
}

export const translations: Record<Language, any> = {
  en: buildLegacyTranslations('en'),
  hi: buildLegacyTranslations('hi'),
  mr: buildLegacyTranslations('mr'),
  gu: buildLegacyTranslations('gu'),
  bn: buildLegacyTranslations('bn'),
  ta: buildLegacyTranslations('ta'),
  te: buildLegacyTranslations('te'),
  kn: buildLegacyTranslations('kn'),
  ml: buildLegacyTranslations('ml'),
  pa: buildLegacyTranslations('pa'),
  or: buildLegacyTranslations('or'),
};

/**
 * Transliteration dictionary for location names across Indic scripts
 */
export const LOCATION_TRANSLITERATIONS: Record<string, Partial<Record<Language, string>>> = {
  "Maharashtra": { hi: "महाराष्ट्र", mr: "महाराष्ट्र", gu: "મહારાષ્ટ્ર", bn: "মহারাষ্ট্র", ta: "மகாராஷ்டிரா", te: "మహారాష్ట్ర" },
  "Pune": { hi: "पुणे", mr: "पुणे", gu: "પુણે", bn: "পুনে", ta: "புனே", te: "పూణే" },
  "Haveli": { hi: "हवेली", mr: "हवेली", gu: "હવેલી", bn: "হাভেলি", ta: "ஹவேலி", te: "హవేలీ" },
  "Wagholi": { hi: "वाघोली", mr: "वाघोली", gu: "વાઘોલી", bn: "ওয়াঘোলি", ta: "வாகோலி", te: "వాఘోలి" },
  "Kesnand": { hi: "केसनंद", mr: "केसनंद", gu: "કેસનંદ", bn: "কেসনন্দ", ta: "கேஸ்நந்த்", te: "కేస్‌నంద్" },
  "Bakori": { hi: "बाकोरी", mr: "बाकोरी", gu: "બાકોરી", bn: "বাকোরি", ta: "பகோரி", te: "బాకోరి" },
  "Khed Shivapur": { hi: "खेड शिवापूर", mr: "खेड शिवापूर", gu: "ખેડ શિવાપુર", ta: "கேட் சிவாபூர்" },
  "Bihar": { hi: "बिहार", mr: "बिहार", gu: "બિહાર", bn: "বিহার", ta: "பீகார்" },
  "Patna": { hi: "पटना", mr: "पाटणा", gu: "પટના", bn: "পাটনা", ta: "பாட்னா" }
};

export function getLocalizedLocationName(name: string, lang: Language): string {
  if (!name) return '';
  const match = LOCATION_TRANSLITERATIONS[name];
  if (match && match[lang]) return match[lang]!;
  if (lang !== 'en' && match && match['hi']) return match['hi']!;
  return name;
}

/**
 * Format digits into Devanagari or other Indic digits if enabled
 */
export function formatDigits(val: number | string, useNativeDigits: boolean = false, lang: Language = 'en'): string {
  const str = String(val);
  if (!useNativeDigits) return str;
  if (['hi', 'mr'].includes(lang)) {
    const devanagari = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    return str.replace(/[0-9]/g, d => devanagari[parseInt(d, 10)]);
  }
  return str;
}

/**
 * Structured reason translator for Priority Queue
 */
export function getReasonText(reason: { key: string; params?: Record<string, any> }, lang: Language): string {
  const params = reason.params || {};
  const k = reason.key.replace('reason.', '');
  const templateKey = `priority.reasons.${k}`;
  return t(templateKey, lang, params);
}

/**
 * Deterministic Voice Assistant Intent Classifier (Round 3B Requirement)
 */
export interface VoiceQueryResult {
  text: string;
  action?: 'nav_map' | 'nav_forecast' | 'nav_advisory' | 'nav_settings' | 'download_report';
  intent: string;
}

export function askAssistant(query: string, lang: Language, liveData?: any): VoiceQueryResult {
  const q = query.toLowerCase().trim();

  // 1. Weather / Rain query
  if (q.includes('weather') || q.includes('rain') || q.includes('मौसम') || q.includes('बारिश') || q.includes('पाऊस') || q.includes('மழை') || q.includes('வானிலை')) {
    const rainMm = liveData?.rain_mm ?? 24.5;
    const temp = liveData?.temp ?? 28.5;
    const panc = getLocalizedLocationName(liveData?.panchayat_name || 'Wagholi', lang);
    return {
      text: t('voice.intents.weather_query', lang, { panchayat: panc, rain_mm: rainMm, temp }),
      intent: 'weather_query'
    };
  }

  // 2. Priority queue query
  if (q.includes('priority') || q.includes('attention') || q.includes('first') || q.includes('प्राथमिकता') || q.includes('ध्यान') || q.includes('प्राधान्य') || q.includes('முன்னுரிமை')) {
    const p1 = getLocalizedLocationName('Wagholi', lang);
    const p2 = getLocalizedLocationName('Kesnand', lang);
    const p3 = getLocalizedLocationName('Bakori', lang);
    return {
      text: t('voice.intents.priority_query', lang, { top1: p1, top2: p2, top3: p3, score: '78.4' }),
      action: 'nav_map',
      intent: 'priority_query'
    };
  }

  // 3. Advisory / Farmer query
  if (q.includes('farmer') || q.includes('crop') || q.includes('spray') || q.includes('किसान') || q.includes('फसल') || q.includes('पीक') || q.includes('விவசாய')) {
    const cropName = t('crops.cotton', lang);
    const stage = t('crops.stages.flowering', lang);
    return {
      text: t('voice.intents.advisory_query', lang, { crop: cropName, stage }),
      action: 'nav_advisory',
      intent: 'advisory_query'
    };
  }

  // 4. Reliability / Confidence
  if (q.includes('reliable') || q.includes('confidence') || q.includes('accuracy') || q.includes('सटीक') || q.includes('अचूक') || q.includes('நம்பகத்தன்மை')) {
    return {
      text: t('voice.intents.reliability_query', lang),
      intent: 'reliability_query'
    };
  }

  // 5. Navigation: Map
  if (q.includes('map') || q.includes('नक्शा') || q.includes('नकाशा') || q.includes('வரைபடம்')) {
    return {
      text: t('voice.intents.nav_map', lang),
      action: 'nav_map',
      intent: 'nav_map'
    };
  }

  // 6. Navigation: Advisory
  if (q.includes('advisory') || q.includes('सलाह') || q.includes('सल्ला') || q.includes('ஆலோசனை')) {
    return {
      text: t('voice.intents.nav_advisory', lang),
      action: 'nav_advisory',
      intent: 'nav_advisory'
    };
  }

  // 7. Download PDF
  if (q.includes('download') || q.includes('report') || q.includes('pdf') || q.includes('डाउनलोड') || q.includes('डाऊनलोड') || q.includes('பதிவிறக்க')) {
    return {
      text: t('voice.intents.report_download', lang),
      action: 'download_report',
      intent: 'report_download'
    };
  }

  // Fallback
  return {
    text: t('voice.intents.fallback', lang),
    intent: 'fallback'
  };
}
