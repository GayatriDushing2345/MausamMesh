const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

// Helper to deep clone
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// 1. Hindi (hi)
const hi = clone(en);
hi.system.title = "मौसमसेतु";
hi.system.subtitle = "पंचायत मौसम बुद्धिमत्ता";
hi.system.portal_title = "मौसमसेतु एग्रोमेट कंट्रोल रूम";
hi.system.portal_subtitle = "आईएमडी पूर्वानुमान से सत्यापित पंचायत कार्रवाई तक";
hi.system.tagline = "आईएमडी पूर्वानुमान से सत्यापित पंचायत कार्रवाई तक।";
hi.system.slogan = "व्यापक पूर्वानुमान → स्थानीय बुद्धिमत्ता → सत्यापित अधिकारी कार्रवाई";
hi.system.demo_data_badge = "डेमो टेलीमेट्री";
hi.system.live_data_badge = "विंड्स लाइव";
hi.system.changed_dot = "अद्यतित";

hi.nav.dashboard = "मुख्य सारांश";
hi.nav.map = "प्राथमिकता नक्शा";
hi.nav.analysis = "पूर्वानुमान विश्लेषण";
hi.nav.advisory = "फसल सलाह";
hi.nav.reliability = "मॉडल अंतर्दृष्टि";
hi.nav.settings = "सेटिंग्स";
hi.nav.more = "अधिक";
hi.nav.control_navigation = "नियंत्रण नेविगेशन";

hi.key_insight.label = "मुख्य अंतर्दृष्टि";
hi.key_insight.home_heavy_rain = "कल {panchayat} में भारी बारिश (ऊपरी सीमा {rain_mm} मिमी) की संभावना। जलभराव रोकने हेतु खेत की जल निकासी नाली तुरंत साफ करें।";
hi.key_insight.home_moderate_rain = "कल {panchayat} में मध्यम बारिश ({rain_mm} मिमी) की संभावना। शुष्क मौसम तक कीटनाशक छिड़काव स्थगित रखें।";
hi.key_insight.home_light_rain = "{panchayat} में हल्की वर्षा ({rain_mm} मिमी) का अनुमान। सामान्य कृषि कार्य जारी रह सकते हैं।";
hi.key_insight.home_no_rain = "{panchayat} में शुष्क मौसम रहेगा। आवश्यकतानुसार ड्रिप सिंचाई जारी रखें।";
hi.key_insight.map_priority = "पंचायत प्राथमिकता सूची: {very_high} पंचायतों को तत्काल दामू अधिकारी निरीक्षण की आवश्यकता (शीर्ष: {top_panchayat}, स्कोर {top_score})।";
hi.key_insight.analysis_downscaling = "स्थानिक XGBoost {block} ब्लॉक के जटिल भूभाग में बेसलाइन MAE को {mae_reduction}% घटाता है।";
hi.key_insight.advisory_status = "{pending_count} कृषि मौसम बुलेटिन निर्धारित एसएमएस प्रसारण से पूर्व अधिकारी अनुमोदन हेतु लंबित।";
hi.key_insight.reliability_gate = "लीव-वन-स्टेशन-आउट (LOSO) स्किल गेट सक्रिय: 100% स्टेशन बेसलाइन सटीकता पार कर रहे हैं।";

hi.glossary.conformal_range = "९०% कॉन्फॉर्मल श्रेणी";
hi.glossary.conformal_range_desc = "स्प्लिट-कॉन्फॉर्मल प्रतिगमन द्वारा सांख्यिकीय रूप से गारंटीकृत ९०% विश्वास अंतराल।";
hi.glossary.mint = "MinT सुसंगतता";
hi.glossary.mint_desc = "न्यूनतम ट्रेस पदानुक्रमिक पूर्वानुमान सामंजस्य जो यह सुनिश्चित करता है कि पंचायतों का योग आधिकारिक ब्लॉक पूर्वानुमान के बराबर हो।";
hi.glossary.csi = "क्रिटिकल सक्सेस इंडेक्स (CSI)";
hi.glossary.csi_desc = "भारी वर्षा पूर्वानुमान क्षमता का मापक। ०.९२ स्कोर उच्च सटीकता और कम त्रुटि दर्शाता है।";
hi.glossary.mae = "माध्य निरपेक्ष त्रुटि (MAE)";
hi.glossary.mae_desc = "पूर्वानुमान त्रुटियों का औसत परिमाण। MAE में कमी बेहतर सटीकता दर्शाती है।";
hi.glossary.residual = "रेसिड्यूअल डेल्टा";
hi.glossary.residual_desc = "स्थानीय सूक्ष्म-भूभाग (ऊंचाई, ढलान) द्वारा ब्लॉक बेसलाइन में जोड़ा गया वर्षा संशोधन।";
hi.glossary.downscaling = "स्थानिक डाउनस्केलिंग";
hi.glossary.downscaling_desc = "१०-२५ किमी ब्लॉक पूर्वानुमान को ३० मीटर डिजिटल एलिवेशन मॉडल द्वारा १ वर्ग किमी पंचायत स्तर पर परिष्कृत करना।";

hi.imd.categories_title = "आधिकारिक आईएमडी दैनिक वर्षा श्रेणी सीमाएं";
hi.imd.no_rain = "कोई वर्षा नहीं";
hi.imd.very_light = "बहुत हल्की वर्षा";
hi.imd.light = "हल्की वर्षा";
hi.imd.moderate = "मध्यम वर्षा";
hi.imd.heavy = "भारी वर्षा";
hi.imd.very_heavy = "बहुत भारी वर्षा";
hi.imd.extremely_heavy = "अत्यधिक भारी वर्षा";
hi.imd.threshold_link = "आईएमडी वर्षा श्रेणियां";

hi.priority.title = "पंचायत प्राथमिकता कतार";
hi.priority.subtitle = "तत्काल ध्यान योग्य पंचायतें (मुख्य यूएसपी)";
hi.priority.open_queue = "प्राथमिकता कतार खोलें →";
hi.priority.score = "प्राथमिकता स्कोर";
hi.priority.rank = "रैंक";
hi.priority.tier = "प्राथमिकता स्तर";
hi.priority.very_high = "अति उच्च";
hi.priority.high = "उच्च";
hi.priority.medium = "मध्यम";
hi.priority.low = "निम्न";
hi.priority.tune_weights = "घटक भार समायोजित करें";
hi.priority.export_csv = "सीएसवी निर्यात";
hi.priority.download_csv = "प्राथमिकता सूची डाउनलोड करें";
hi.priority.verify_before_dispatch = "प्रेषण से पहले सत्यापन";
hi.priority.verify_before_dispatch_desc = "पूर्वानुमान अनिश्चितता अधिक है (>६ मिमी)। स्वचालित संदेश भेजने से पहले जमीनी सत्यापन अनुशंसित।";
hi.priority.partial_data = "आंशिक डेटा";
hi.priority.partial_data_desc = "जनगणना प्रोफाइल उपलब्ध नहीं; घटक भार स्वतः पुनर्संतुलित।";
hi.priority.why_this_rank = "यह रैंक क्यों (घटक योगदान)";
hi.priority.factors.weather_severity = "मौसम की तीव्रता (३५%)";
hi.priority.factors.crop_vulnerability = "फसल संवेदनशीलता (२५%)";
hi.priority.factors.potential_impact = "संभावित प्रभाव (१५%)";
hi.priority.factors.exposed_area = "कृषि क्षेत्र (१५%)";
hi.priority.factors.farm_households = "कृषक परिवार (१०%)";
hi.priority.reasons.heavy_rain = "भारी बारिश की संभावना (ऊपरी सीमा {rain_mm} मिमी)";
hi.priority.reasons.moderate_rain = "मध्यम बारिश की संभावना ({rain_mm} मिमी)";
hi.priority.reasons.mature_crop_sensitive = "{crop} संवेदनशील {stage} अवस्था में";
hi.priority.reasons.poor_drainage = "खराब जल निकासी वाला निचला इलाका";
hi.priority.reasons.steep_slope_runoff = "तेज ढलान वाला जल बहाव क्षेत्र";
hi.priority.reasons.high_cumulative_risk = "मौसम और फसल कारकों का उच्च संयुक्त जोखिम";
hi.priority.reasons.routine = "कम जोखिम; सामान्य कृषि कार्य उपयुक्त";

hi.weather.precipitation = "वर्षा / वर्षण";
hi.weather.temp = "तापमान";
hi.weather.humidity = "आर्द्रता";
hi.weather.wind = "हवा की गति";
hi.weather.lead_day = "दिन {day}";
hi.weather.block_baseline = "ब्लॉक बेसलाइन";
hi.weather.panchayat_downscaled = "पंचायत डाउनस्केल वर्षा";
hi.weather.units.mm = "मिमी";
hi.weather.units.celsius = "°से";
hi.weather.units.percent = "%";
hi.weather.units.kmh = "किमी/घंटा";

hi.crops.cotton = "कपास";
hi.crops.soybean = "सोयाबीन";
hi.crops.tomato = "टमाटर";
hi.crops.paddy = "धान / चावल";
hi.crops.sugarcane = "गन्ना";
hi.crops.stages.vegetative = "शाकीय वृद्धि";
hi.crops.stages.flowering = "फूल आना";
hi.crops.stages.maturity = "परिपक्वता व कटाई";
hi.crops.stages.pod_formation = "फलियां बनना";

hi.voice.mic_button_label = "आवाज सहायक (बोलने के लिए क्लिक करें)";
hi.voice.listening = "सुन रहा हूँ... अपना प्रश्न बोलें";
hi.voice.interim_label = "आवाज पहचान प्रगति पर:";
hi.voice.cancel = "रद्द करें";
hi.voice.read_aloud = "सुनें";
hi.voice.stop_reading = "रोकें";
hi.voice.unsupported = "इस ब्राउज़र में आवाज इनपुट समर्थित नहीं है। कृपया टाइप करें।";
hi.voice.permission_denied = "माइक्रोफ़ोन अनुमति अस्वीकृत। ब्राउज़र सेटिंग्स में अनुमति दें।";
hi.voice.intents.weather_query = "{panchayat} में कल {rain_mm} मिमी बारिश और लगभग {temp}°से तापमान का अनुमान है।";
hi.voice.intents.priority_query = "शीर्ष ३ प्राथमिकता पंचायतें {top1}, {top2} और {top3} हैं। वाघोली का स्कोर सबसे अधिक {score} है।";
hi.voice.intents.advisory_query = "{stage} अवस्था में {crop} हेतु बारिश से पूर्व जल निकासी सुनिश्चित करें और कीटनाशक छिड़काव टालें।";
hi.voice.intents.reliability_query = "पूर्वानुमान उच्च विश्वसनीयता के साथ ±१.४ मिमी कॉन्फॉर्मल अंतराल और ९२% सीएसआई दर्शाता है।";
hi.voice.intents.nav_map = "प्राथमिकता नक्शा खोला जा रहा है।";
hi.voice.intents.nav_forecast = "पूर्वानुमान विश्लेषण खोला जा रहा है।";
hi.voice.intents.nav_advisory = "फसल सलाह खोली जा रही है।";
hi.voice.intents.nav_settings = "सेटिंग्स खोली जा रही हैं।";
hi.voice.intents.report_download = "मौसमसेतु पीडीएफ बुलेटिन डाउनलोड शुरू किया जा रहा है।";
hi.voice.intents.fallback = "मैं समझ नहीं पाया। आप पूछ सकते हैं: 'कल मौसम कैसा रहेगा?', 'कौन सी पंचायतें प्राथमिकता पर हैं?', या 'किसान क्या करें?'";

hi.actions.download_report = "पीडीएफ रिपोर्ट डाउनलोड करें";
hi.actions.downloading = "पीडीएफ बन रहा है...";
hi.actions.explore_map = "प्राथमिकता नक्शा देखें →";
hi.actions.view_analysis = "सटीकता विश्लेषण →";
hi.actions.review_advisory = "सलाह विवरण देखें →";
hi.actions.verify_reliability = "विश्वसनीयता जांचें →";
hi.actions.approve_dispatch = "सलाह अनुमोदित करें और भेजें";
hi.actions.search_placeholder = "पंचायत, गांव या जिला खोजें... (Ctrl+K)";
hi.actions.close = "बंद करें";
hi.actions.more = "अधिक";
hi.actions.tune_sliders = "कस्टम भार स्लाइडर";
hi.actions.reset_weights = "डिफ़ॉल्ट रीसेट करें";
hi.actions.apply_weights = "भार लागू करें";

hi.settings.title = "सिस्टम सेटिंग्स";
hi.settings.theme_title = "रंग थीम";
hi.settings.day_mode = "दिन का मोड (हल्का पेपर)";
hi.settings.night_mode = "रात्रि ऑप्स (गहरा स्याही)";
hi.settings.language_title = "पोर्टल भाषा";
hi.settings.digits_title = "भारतीय अंक";
hi.settings.digits_desc = "संख्याएं देवनागरी लिपि में प्रदर्शित करें (०, १, २, ३)";
hi.settings.cache_clear = "लोकल कैश साफ़ करें";
hi.settings.cache_cleared = "कैश सफलतापूर्वक साफ़ किया गया";

// 2. Marathi (mr)
const mr = clone(hi);
mr.system.title = "मौसमसेतु";
mr.system.subtitle = "पंचायत हवामान बुद्धिमत्ता";
mr.system.portal_title = "मौसमसेतु कृषी-हवामान नियंत्रण कक्ष";
mr.system.portal_subtitle = "आयएमडी अंदाजापासून प्रत्यक्ष पंचायत कृतीपर्यंत";
mr.system.tagline = "आयएमडी अंदाजापासून प्रत्यक्ष पंचायत कृतीपर्यंत.";
mr.system.slogan = "व्यापक अंदाज → स्थानिक बुद्धिमत्ता → सत्यापित अधिकारी कृती";
mr.nav.dashboard = "मुख्य सारांश";
mr.nav.map = "प्राथमिकता नकाशा";
mr.nav.analysis = "हवामान विश्लेषण";
mr.nav.advisory = "पीक सल्ला";
mr.nav.reliability = "मॉडेल अचूकता";
mr.nav.settings = "सेटिंग्ज";
mr.nav.more = "अधिक";
mr.key_insight.home_heavy_rain = "उद्या {panchayat} मध्ये मुसळधार पावसाची (अंदाजे {rain_mm} मिमी) शक्यता. शेतातील पाण्याचा निचरा त्वरित करा.";
mr.key_insight.home_moderate_rain = "उद्या {panchayat} मध्ये मध्यम पाऊस ({rain_mm} मिमी). औषध फवारणी काही दिवस पुढे ढकलावी.";
mr.key_insight.home_light_rain = "{panchayat} मध्ये हलका पाऊस ({rain_mm} मिमी). नियमित शेतीकामे सुरू ठेवावीत.";
mr.key_insight.home_no_rain = "{panchayat} मध्ये कोरडे हवामान राहील. आवश्यकतेनुसार ठिबक सिंचन सुरू ठेवा.";
mr.crops.cotton = "कापूस";
mr.crops.soybean = "सोयाबीन";
mr.crops.tomato = "टोमॅटो";
mr.crops.paddy = "भात / धान";
mr.crops.sugarcane = "ऊस";

// Function to generate the other 8 Indic languages with authentic vocabulary
function createIndicLocales() {
  const languages = [
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'or', name: 'ଓଡ଼ିଆ' }
  ];

  // Specific overrides for Gujarati (gu)
  const gu = clone(hi);
  gu.system.title = "મૌસમસેતુ";
  gu.system.subtitle = "પંચાયત હવામાન બુદ્ધિમત્તા";
  gu.system.portal_title = "મૌસમસેતુ એગ્રોમેટ કંટ્રોલ રૂમ";
  gu.system.portal_subtitle = "IMD આગાહીથી પ્રમાણિત પંચાયત કાર્યવાહી સુધી";
  gu.system.tagline = "IMD આગાહીથી પ્રમાણિત પંચાયત કાર્યવાહી સુધી.";
  gu.nav.dashboard = "મુખ્ય સારાંશ";
  gu.nav.map = "પ્રાથમિકતા નકશો";
  gu.nav.analysis = "આગાહી વિશ્લેષણ";
  gu.nav.advisory = "પાક સલાહ";
  gu.nav.reliability = "મોડેલ ક્ષમતા";
  gu.nav.settings = "સેટિંગ્સ";
  gu.nav.more = "વધુ";
  gu.crops.cotton = "કપાસ";
  gu.crops.soybean = "સોયાબીન";
  gu.crops.paddy = "ડાંગર";
  gu.crops.sugarcane = "શેરડી";

  // Specific overrides for Bengali (bn)
  const bn = clone(hi);
  bn.system.title = "মৌসমসেতু";
  bn.system.subtitle = "পঞ্চায়েত আবহাওয়া বুদ্ধিমত্তা";
  bn.system.portal_title = "মৌসমসেতু এগ্রোমেট কন্ট্রোল রুম";
  bn.system.portal_subtitle = "IMD পূর্বাভাস থেকে যাচাইকৃত পঞ্চায়েত পদক্ষেপ";
  bn.nav.dashboard = "হোম";
  bn.nav.map = "অগ্রাধিকার মানচিত্র";
  bn.nav.analysis = "পূর্বাভাস বিশ্লেষণ";
  bn.nav.advisory = "কৃষি পরামর্শ";
  bn.nav.reliability = "মডেল অন্তর্দৃষ্টি";
  bn.nav.settings = "সেটিংস";
  bn.nav.more = "আরও";
  bn.crops.cotton = "তুলা";
  bn.crops.soybean = "সয়াবিন";
  bn.crops.paddy = "ধান";
  bn.crops.sugarcane = "আখ";

  // Specific overrides for Tamil (ta)
  const ta = clone(en);
  ta.system.title = "மௌசம்சேது";
  ta.system.subtitle = "பஞ்சாயத்து வானிலை நுண்ணறிவு";
  ta.system.portal_title = "மௌசம்சேது வேளாண் வானிலை கட்டுப்பாட்டு அறை";
  ta.system.portal_subtitle = "IMD முன்னறிவிப்பிலிருந்து சரிபார்க்கப்பட்ட பஞ்சாயத்து நடவடிக்கை வரை";
  ta.system.tagline = "IMD முன்னறிவிப்பிலிருந்து சரிபார்க்கப்பட்ட பஞ்சாயத்து நடவடிக்கை வரை.";
  ta.system.slogan = "பரந்த முன்னறிவிப்பு → உள்ளூர் நுண்ணறிவு → சரிபார்க்கப்பட்ட நடவடிக்கை";
  ta.nav.dashboard = "முகப்பு";
  ta.nav.map = "முன்னுரிமை வரைபடம்";
  ta.nav.analysis = "வானிலை பகுப்பாய்வு";
  ta.nav.advisory = "பயிர் ஆலோசனை";
  ta.nav.reliability = "மாதிரி நுண்ணறிவு";
  ta.nav.settings = "அமைப்புகள்";
  ta.nav.more = "மேலும்";
  ta.key_insight.label = "முக்கிய செய்தி";
  ta.key_insight.home_heavy_rain = "நாளை {panchayat} பகுதியில் கனமழை ({rain_mm} மி.மீ) எதிர்பார்க்கப்படுகிறது. வடிகால் வசதியை உடனடியாக சரிசெய்யவும்.";
  ta.key_insight.home_moderate_rain = "நாளை {panchayat} பகுதியில் மிதமான மழை ({rain_mm} மி.மீ). பூச்சிக்கொல்லி தெளிப்பதை ஒத்திவைக்கவும்.";
  ta.key_insight.home_light_rain = "{panchayat} பகுதியில் லேசான மழை ({rain_mm} மி.மீ). வழக்கமான விவசாய பணிகளை தொடரலாம்.";
  ta.crops.cotton = "பருத்தி";
  ta.crops.soybean = "சோயாபீன்";
  ta.crops.paddy = "நெல்";
  ta.crops.sugarcane = "கரும்பு";
  ta.crops.tomato = "தக்காளி";
  ta.priority.very_high = "மிக அதிகம்";
  ta.priority.high = "அதிகம்";
  ta.priority.medium = "நடுத்தரம்";
  ta.priority.low = "குறைவு";

  // Specific overrides for Telugu (te)
  const te = clone(ta);
  te.system.title = "మౌసమ్‌సేతు";
  te.system.subtitle = "పంచాయతీ వాతావరణ సమాచారం";
  te.system.portal_title = "మౌసమ్‌సేతు ఆగ్రోమెట్ కంట్రోల్ రూమ్";
  te.nav.dashboard = "హోమ్";
  te.nav.map = "ప్రాధాన్యత మ్యాప్";
  te.nav.analysis = "వాతావరణ విశ్లేషణ";
  te.nav.advisory = "పంట సలహా";
  te.nav.reliability = "మోడల్ ఖచ్చితత్వం";
  te.nav.settings = "సెట్టింగ్‌లు";
  te.crops.cotton = "ప్రత్తి";
  te.crops.soybean = "సోయాబీన్";
  te.crops.paddy = "వరి";
  te.crops.sugarcane = "చెరకు";

  // Specific overrides for Kannada (kn)
  const kn = clone(ta);
  kn.system.title = "ಮೌಸಮ್‌ಸೇತು";
  kn.system.subtitle = "ಪಂಚಾಯತ್ ಹವಾಮಾನ ಮಾಹಿತಿ";
  kn.nav.dashboard = "ಮುಖಪುಟ";
  kn.nav.map = "ಆದ್ಯತೆ ನಕ್ಷೆ";
  kn.nav.analysis = "ಹವಾಮಾನ ವಿಶ್ಲೇಷಣೆ";
  kn.nav.advisory = "ಬೆಳೆ ಸಲಹೆ";
  kn.nav.reliability = "ಮಾದರಿ ನಿಖರತೆ";
  kn.nav.settings = "ಸೆಟ್ಟಿಂಗ್ಸ್";
  kn.crops.cotton = "ಹತ್ತಿ";
  kn.crops.paddy = "ಭತ್ತ";
  kn.crops.sugarcane = "ಕಬ್ಬು";

  // Specific overrides for Malayalam (ml)
  const ml = clone(ta);
  ml.system.title = "മൗസംസേതു";
  ml.system.subtitle = "പഞ്ചായത്ത് കാലാവസ്ഥാ മുന്നറിയിപ്പ്";
  ml.nav.dashboard = "ഹോം";
  ml.nav.map = "മുൻഗണനാ ഭൂപടം";
  ml.nav.analysis = "കാലാവസ്ഥാ വിശകലനം";
  ml.nav.advisory = "വിള നിർദ്ദേശം";
  ml.nav.reliability = "വിശ്വാസ്യത";
  ml.nav.settings = "ക്രമീകരണങ്ങൾ";
  ml.crops.paddy = "നെല്ല്";
  ml.crops.sugarcane = "കരിമ്പ്";

  // Specific overrides for Punjabi (pa)
  const pa = clone(hi);
  pa.system.title = "ਮੌਸਮਸੇਤੂ";
  pa.system.subtitle = "ਪੰਚਾਇਤ ਮੌਸਮ ਜਾਣਕਾਰੀ";
  pa.nav.dashboard = "ਮੁੱਖ ਪੰਨਾ";
  pa.nav.map = "ਤਰਜੀਹੀ ਨਕਸ਼ਾ";
  pa.nav.analysis = "ਮੌਸਮ ਵਿਸ਼ਲੇਸ਼ਣ";
  pa.nav.advisory = "ਫ਼ਸਲ ਸਲਾਹ";
  pa.nav.reliability = "ਮਾਡਲ ਸਥਿਰਤਾ";
  pa.nav.settings = "ਸੈਟਿੰਗਾਂ";
  pa.crops.cotton = "ਕਪਾਹ";
  pa.crops.paddy = "ਝੋਨਾ / ਚੌਲ";
  pa.crops.sugarcane = "ਗੰਨਾ";

  // Specific overrides for Odia (or)
  const od = clone(bn);
  od.system.title = "ମୌସମସେତୁ";
  od.system.subtitle = "ପଞ୍ଚାୟତ ପାଣିପାଗ ସୂଚନା";
  od.nav.dashboard = "ମୁଖ୍ୟ ପୃଷ୍ଠା";
  od.nav.map = "ପ୍ରାଥମିକତା ମାନଚିତ୍ର";
  od.nav.analysis = "ପାଣିପାଗ ବିଶ୍ଳେଷଣ";
  od.nav.advisory = "ଫସଲ ପରାମର୍ଶ";
  od.nav.reliability = "ମଡେଲ ବିଶ୍ୱସନୀୟତା";
  od.nav.settings = "ସେଟିଙ୍ଗ୍ସ";
  od.crops.paddy = "ଧାନ";
  od.crops.sugarcane = "ଆଖୁ";

  return { gu, bn, ta, te, kn, ml, pa, or: od };
}

fs.writeFileSync(path.join(localesDir, 'hi.json'), JSON.stringify(hi, null, 2), 'utf8');
fs.writeFileSync(path.join(localesDir, 'mr.json'), JSON.stringify(mr, null, 2), 'utf8');

const indic = createIndicLocales();
for (const [code, data] of Object.entries(indic)) {
  fs.writeFileSync(path.join(localesDir, `${code}.json`), JSON.stringify(data, null, 2), 'utf8');
}

console.log("Successfully generated all 11 locale files in src/locales/");
