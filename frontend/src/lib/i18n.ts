export type Language = 'en' | 'hi' | 'mr';

export interface Translations {
  system_title: string;
  system_subtitle: string;
  portal_title: string;
  portal_subtitle: string;
  hero_headline: string;
  hero_subhead: string;
  
  // Nav Tabs
  tab_dashboard: string;
  tab_map: string;
  tab_analysis: string;
  tab_advisory: string;
  tab_reliability: string;
  
  // Location Selector
  country: string;
  state: string;
  district: string;
  block: string;
  panchayat: string;
  select_state: string;
  select_district: string;
  select_block: string;
  select_panchayat: string;
  search_panchayat_placeholder: string;
  location_drilldown: string;
  
  // Badges & Statuses
  mint_coherent: string;
  conformal_90: string;
  winds_connected: string;
  demo_data: string;
  
  // Actions / Buttons
  download_report: string;
  download_pdf: string;
  downloading: string;
  explore_map: string;
  view_analysis: string;
  review_advisory: string;
  verify_reliability: string;
  approve_dispatches: string;
  
  // Weather Labels
  lead_day: string;
  block_baseline: string;
  panchayat_downscaled: string;
  conformal_range: string;
  temp: string;
  humidity: string;
  wind: string;
  rainfall: string;
  risk_level: string;
  confidence_tier: string;
  heavy_rain_prob: string;
  
  // Risks
  risk_low: string;
  risk_moderate: string;
  risk_high: string;
  risk_severe: string;
  
  // Crops
  crop_cotton: string;
  crop_soybean: string;
  crop_paddy: string;
  crop_sugarcane: string;
  stage_vegetative: string;
  stage_flowering: string;
  stage_maturity: string;
  
  // Chatbot
  assistant_title: string;
  assistant_subtitle: string;
  ask_placeholder: string;
  quick_questions: string;

  // Screen Subheadings & Summaries
  hero_map_badge: string;
  damu_approval_badge: string;
  quality_badge: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    system_title: "MausamMesh",
    system_subtitle: "Panchayat Weather Intelligence",
    portal_title: "MausamMesh Panchayat Weather Portal",
    portal_subtitle: "Hyperlocal weather intelligence platform downscaling block forecasts to panchayat resolution",
    hero_headline: "Weather Intelligence for Every Panchayat.",
    hero_subhead: "From Block forecasts to hyperlocal insights for better farming decisions.",
    
    tab_dashboard: "Home / Dashboard",
    tab_map: "Block → Panchayat Map",
    tab_analysis: "Forecast Analysis",
    tab_advisory: "Agricultural Advisory",
    tab_reliability: "Forecast Reliability",
    
    country: "India",
    state: "State",
    district: "District",
    block: "Block",
    panchayat: "Panchayat",
    select_state: "Select State",
    select_district: "Select District",
    select_block: "Select Block",
    select_panchayat: "Select Panchayat",
    search_panchayat_placeholder: "Search Panchayat, Village or District...",
    location_drilldown: "Location Hierarchy:",
    
    mint_coherent: "MinT Coherent",
    conformal_90: "Conformal 90%",
    winds_connected: "WINDS Telemetry",
    demo_data: "Demo Data",
    
    download_report: "Download Report",
    download_pdf: "MausamMesh Agromet Bulletin (PDF)",
    downloading: "Generating PDF...",
    explore_map: "Explore GIS Map →",
    view_analysis: "Analyze Forecast Skill Metrics →",
    review_advisory: "Review DAMU Crop Advisory →",
    verify_reliability: "Inspect Statistical Reliability →",
    approve_dispatches: "Approve & Dispatch Channel Advisories",
    
    lead_day: "Lead Day",
    block_baseline: "Block Baseline",
    panchayat_downscaled: "Panchayat Downscaled",
    conformal_range: "90% Conformal Range",
    temp: "Temperature",
    humidity: "Humidity",
    wind: "Wind Speed",
    rainfall: "Rainfall",
    risk_level: "Risk Level",
    confidence_tier: "Confidence Tier",
    heavy_rain_prob: "Heavy Rain Probability",
    
    risk_low: "Low",
    risk_moderate: "Moderate",
    risk_high: "High",
    risk_severe: "Severe",
    
    crop_cotton: "Cotton (कपास)",
    crop_soybean: "Soybean (सोयाबीन)",
    crop_paddy: "Paddy / Rice (धान)",
    crop_sugarcane: "Sugarcane (गन्ना)",
    stage_vegetative: "Vegetative Growth",
    stage_flowering: "Flowering & Podging",
    stage_maturity: "Maturation & Harvest",
    
    assistant_title: "MausamMesh Assistant",
    assistant_subtitle: "Agrometeorological Helper & FAQ",
    ask_placeholder: "Ask about forecast downscaling, MinT, or CSI...",
    quick_questions: "Suggested Questions:",
    
    hero_map_badge: "GIS Layer",
    damu_approval_badge: "DAMU Workflow",
    quality_badge: "Statistical Skill"
  },
  
  hi: {
    system_title: "मौसममेश (MausamMesh)",
    system_subtitle: "पंचायत मौसम बुद्धिमत्ता",
    portal_title: "मौसममेश पंचायत मौसम पोर्टल",
    portal_subtitle: "सटीक खेती के लिए ब्लॉक पूर्वानुमान से पंचायत स्तर तक हाइपरलोकल मौसम अंतर्दृष्टि",
    hero_headline: "हर पंचायत के लिए मौसम बुद्धिमत्ता।",
    hero_subhead: "बेहतर कृषि निर्णयों के लिए ब्लॉक पूर्वानुमानों से हाइपरलोकल अंतर्दृष्टि तक।",
    
    tab_dashboard: "मुख्य डैशबोर्ड",
    tab_map: "ब्लॉक → पंचायत नक्शा",
    tab_analysis: "पूर्वानुमान विश्लेषण",
    tab_advisory: "कृषि सलाह",
    tab_reliability: "पूर्वानुमान विश्वसनीयता",
    
    country: "भारत (India)",
    state: "राज्य",
    district: "ज़िला",
    block: "ब्लॉक",
    panchayat: "ग्राम पंचायत",
    select_state: "राज्य चुनें",
    select_district: "ज़िला चुनें",
    select_block: "ब्लॉक चुनें",
    select_panchayat: "पंचायत चुनें",
    search_panchayat_placeholder: "पंचायत, गांव या ज़िला खोजें...",
    location_drilldown: "स्थान पदानुक्रम:",
    
    mint_coherent: "MinT सुसंगत",
    conformal_90: "90% कन्फ़र्मल सीमा",
    winds_connected: "WINDS टेलीमेट्री",
    demo_data: "डेमो डेटा",
    
    download_report: "रिपोर्ट डाउनलोड करें",
    download_pdf: "मौसममेश एग्रोमेट बुलेटिन (PDF)",
    downloading: "PDF बनाई जा रही है...",
    explore_map: "जीआईएस नक्शा देखें →",
    view_analysis: "पूर्वानुमान कौशल का विश्लेषण करें →",
    review_advisory: "DAMU फसल सलाह की समीक्षा करें →",
    verify_reliability: "विश्वसनीयता का निरीक्षण करें →",
    approve_dispatches: "सलाह स्वीकृत व प्रेषित करें",
    
    lead_day: "पूर्वानुमान दिन",
    block_baseline: "ब्लॉक बेसलाइन",
    panchayat_downscaled: "पंचायत डाउनस्केल्ड",
    conformal_range: "90% कन्फ़र्मल रेंज",
    temp: "तापमान",
    humidity: "आर्द्रता",
    wind: "हवा की गति",
    rainfall: "वर्षा",
    risk_level: "जोखिम स्तर",
    confidence_tier: "विश्वास स्तर",
    heavy_rain_prob: "भारी बारिश की संभावना",
    
    risk_low: "कम (Low)",
    risk_moderate: "मध्यम (Moderate)",
    risk_high: "उच्च (High)",
    risk_severe: "गंभीर (Severe)",
    
    crop_cotton: "कपास (Cotton)",
    crop_soybean: "सोयाबीन (Soybean)",
    crop_paddy: "धान (Paddy/Rice)",
    crop_sugarcane: "गन्ना (Sugarcane)",
    stage_vegetative: "वानस्पतिक वृद्धि",
    stage_flowering: "फूल और फली आना",
    stage_maturity: "परिपक्वता व कटाई",
    
    assistant_title: "मौसममेश सहायक",
    assistant_subtitle: "कृषि-मौसम मार्गदर्शन व सहायता",
    ask_placeholder: "पूर्वानुमान, MinT या CSI के बारे में पूछें...",
    quick_questions: "सुझाए गए प्रश्न:",
    
    hero_map_badge: "जीआईएस परत",
    damu_approval_badge: "DAMU स्वीकृति",
    quality_badge: "सांख्यिकीय गुणवत्ता"
  },
  
  mr: {
    system_title: "मौसममेश (MausamMesh)",
    system_subtitle: "पंचायत हवामान बुद्धिमत्ता",
    portal_title: "मौसममेश पंचायत हवामान पोर्टल",
    portal_subtitle: "अचूक शेतीसाठी ब्लॉक अंदाजापासून ग्रामपंचायत पातळीपर्यंत अचूक हवामान माहिती",
    hero_headline: "प्रत्येक पंचायतीसाठी हवामान बुद्धिमत्ता.",
    hero_subhead: "उत्तम शेती निर्णयांसाठी ब्लॉक अंदाजांमधून सूक्ष्म हवामान माहिती.",
    
    tab_dashboard: "मुख्य डॅशबोर्ड",
    tab_map: "ब्लॉक → पंचायत नकाशा",
    tab_analysis: "अंदाज विश्लेषण",
    tab_advisory: "कृषी सल्ला",
    tab_reliability: "अंदाज विश्वासार्हता",
    
    country: "भारत (India)",
    state: "राज्य",
    district: "जिल्हा",
    block: "तालुका / ब्लॉक",
    panchayat: "ग्रामपंचायत",
    select_state: "राज्य निवडा",
    select_district: "जिल्हा निवडा",
    select_block: "तालुका निवडा",
    select_panchayat: "ग्रामपंचायत निवडा",
    search_panchayat_placeholder: "पंचायत, गाव किंवा जिल्हा शोधा...",
    location_drilldown: "स्थान रचना:",
    
    mint_coherent: "MinT सुसंगत",
    conformal_90: "९०% कॉन्फॉर्मल मर्यादा",
    winds_connected: "WINDS टेलीमेट्री",
    demo_data: "डेमो डेटा",
    
    download_report: "अहवाल डाउनलोड करा",
    download_pdf: "मौसममेश हवामान अहवाल (PDF)",
    downloading: "PDF तयार होत आहे...",
    explore_map: "GIS नकाशा पहा →",
    view_analysis: "अंदाज अचूकतेचे विश्लेषण करा →",
    review_advisory: "DAMU पीक सल्ल्याचे पुनरावलोकन करा →",
    verify_reliability: "संख्याशास्त्र पाहणी करा →",
    approve_dispatches: "सल्ला मंजूर करा आणि पाठवा",
    
    lead_day: "अंदाज दिवस",
    block_baseline: "ब्लॉक बेसलाइन",
    panchayat_downscaled: "पंचायत डाउनस्केल पाऊस",
    conformal_range: "९०% कॉन्फॉर्मल श्रेणी",
    temp: "तापमान",
    humidity: "आर्द्रता",
    wind: "वाऱ्याचा वेग",
    rainfall: "पाऊस",
    risk_level: "धोका पातळी",
    confidence_tier: "विश्वास पातळी",
    heavy_rain_prob: "मुसळधार पावसाची शक्यता",
    
    risk_low: "कमी (Low)",
    risk_moderate: "मध्यम (Moderate)",
    risk_high: "जास्त (High)",
    risk_severe: "अतिधोकादायक (Severe)",
    
    crop_cotton: "कापूस (Cotton)",
    crop_soybean: "सोयाबीन (Soybean)",
    crop_paddy: "भात / धान (Paddy)",
    crop_sugarcane: "ऊस (Sugarcane)",
    stage_vegetative: "शाकीय वाढीची अवस्था",
    stage_flowering: "फुलोरा व शेंगा धरणे",
    stage_maturity: "पक्वता व काढणी",
    
    assistant_title: "मौसममेश सहाय्यक",
    assistant_subtitle: "कृषी-हवामान मदत",
    ask_placeholder: "हवामान अंदाज, MinT बद्दल विचारा...",
    quick_questions: "सुचवलेले प्रश्न:",
    
    hero_map_badge: "GIS नकाशा",
    damu_approval_badge: "DAMU मंजुरी",
    quality_badge: "गुणवत्ता क्षमता"
  }
};
