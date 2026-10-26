export type Language = 'en' | 'hi' | 'gu';

export const LANGUAGE_STORAGE_KEY = 'moms_rasoi_language';

export const LANGUAGES: { code: Language; label: string; nativeName: string; short: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English', short: 'EN' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', short: 'हि' },
  { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', short: 'ગુ' },
];

export const TRANSLATIONS = {
  // Brand & Header
  appTitle: {
    en: "Mom's Rasoi",
    hi: 'माँ की रसोई',
    gu: 'મમ્મીનું રસોડું',
  },
  consoleBadge: {
    en: "Mom's Rasoi Studio Console",
    hi: 'माँ की रसोई स्टूडियो कंसोल',
    gu: 'મમ્મીનું રસોડું સ્ટુડિયો કન્સોલ',
  },
  algorithmicMatcher: {
    en: '100% Algorithmic Kitchen Matcher',
    hi: '१००% स्थानीय रसोई मिलान प्रणाली',
    gu: '૧૦૦% સ્માર્ટ રસોડું મેચિંગ સિસ્ટમ',
  },
  heroQuestion: {
    en: 'What should Mom cook',
    hi: 'माँ आज क्या बनाएँ',
    gu: 'મમ્મી આજે શું બનાવશે',
  },
  heroRightNow: {
    en: 'right now?',
    hi: 'अभी के लिए?',
    gu: 'અત્યાર માટે?',
  },
  heroSubtitle: {
    en: 'Filtered strictly by what is in your kitchen stock, your current meal window, the weather, and your energy meter.',
    hi: 'आपकी रसोई की सामग्री, समय, मौसम और ऊर्जा के अनुसार सटीक व्यंजन सुझाव।',
    gu: 'તમારા રસોડાની સામગ્રી, સમય, હવામાન અને મૂડ મુજબ તાજી વાનગીઓની યાદી.',
  },

  // Metrics
  readyNow: {
    en: 'Ready Now',
    hi: 'तैयार है',
    gu: 'તૈયાર છે',
  },
  missingFew: {
    en: 'Missing 1-2',
    hi: '१-२ कम',
    gu: '૧-૨ ખૂટે છે',
  },
  inStock: {
    en: 'In Stock',
    hi: 'सामग्री मौजूद',
    gu: 'સ્ટોકમાં છે',
  },

  // Navbar
  pantryStock: {
    en: 'Pantry',
    hi: 'रसोई स्टॉक',
    gu: 'રસોડું સ્ટોક',
  },
  stockLabel: {
    en: 'Stock',
    hi: 'स्टॉक',
    gu: 'સ્ટોક',
  },
  stoveFlow: {
    en: 'Stove Flow',
    hi: 'चूल्हा फ्लो',
    gu: 'ચૂલો ફ્લો',
  },
  threeBurner: {
    en: '3-Burner',
    hi: '३ बर्नर',
    gu: '૩ બર્નર',
  },
  videoStudio: {
    en: 'Video Studio',
    hi: 'वीडियो स्टूडियो',
    gu: 'વિડિઓ સ્ટુડિયો',
  },
  mealLog: {
    en: 'Meal Log',
    hi: 'भोजन डायरी',
    gu: 'ભોજન ડાયરી',
  },

  // Context Engine
  selectMealSlot: {
    en: '1. SELECT MEAL SLOT:',
    hi: '१. भोजन का समय चुनें:',
    gu: '૧. ભોજનનો સમય પસંદ કરો:',
  },
  weatherSensor: {
    en: '2. KITCHEN WEATHER SENSOR:',
    hi: '२. रसोई का मौसम चुनें:',
    gu: '૨. રસોડાનું હવામાન પસંદ કરો:',
  },
  momEnergy: {
    en: "3. MOM'S ENERGY & CULINARY MOOD:",
    hi: '३. माँ की ऊर्जा व मूड:',
    gu: '૩. મમ્મીની ઊર્જા અને મૂડ:',
  },
  syncClock: {
    en: 'Sync with Clock',
    hi: 'घड़ी से मिलाएं',
    gu: 'ઘડિયાળ સાથે મેળવો',
  },

  // Meal Slots
  breakfast: {
    en: 'Breakfast',
    hi: 'नाश्ता',
    gu: 'સવારનો નાસ્તો',
  },
  breakfastSub: {
    en: '6 AM - 11 AM',
    hi: 'सुबह ६ - ११ बजे',
    gu: 'સવારે ૬ - ૧૧ વાગ્યે',
  },
  lunch: {
    en: 'Lunch',
    hi: 'दोपहर का खाना',
    gu: 'બપોરનું ભોજન',
  },
  lunchSub: {
    en: '11 AM - 3 PM',
    hi: 'दोपहर ११ - ३ बजे',
    gu: 'બપોરે ૧૧ - ૩ વાગ્યે',
  },
  snacks: {
    en: 'Snacks / Chai',
    hi: 'शाम की चाय व नाश्ता',
    gu: 'સાંજનો નાસ્તો / ચા',
  },
  snacksSub: {
    en: '3 PM - 6 PM',
    hi: 'शाम ३ - ६ बजे',
    gu: 'સાંજે ૩ - ૬ વાગ્યે',
  },
  dinner: {
    en: 'Dinner',
    hi: 'रात का खाना',
    gu: 'રાતનું વાળુ / ભોજન',
  },
  dinnerSub: {
    en: '6 PM - 11 PM',
    hi: 'रात ६ - ११ बजे',
    gu: 'રાત્રે ૬ - ૧૧ વાગ્યે',
  },

  // Weather
  sunny: {
    en: 'Sunny / Hot',
    hi: 'धूप / गरमी',
    gu: 'તડકો / ગરમી',
  },
  sunnyDesc: {
    en: 'Refreshing, cooling, light meals',
    hi: 'हल्का, सुपाच्य व ताज़ा भोजन',
    gu: 'હળવું, પાચક અને ઠંડક આપતું ભોજન',
  },
  rainy: {
    en: 'Rainy / Cool',
    hi: 'बारिश / सुहाना',
    gu: 'વરસાદ / ઠંડક',
  },
  rainyDesc: {
    en: 'Crispy snacks, pakoras, steaming soups',
    hi: 'कुरकुरे पकौड़े, समोसे, गरमागरम सूप',
    gu: 'ગરમાગરમ ભજીયાં, ચા અને ક્રિસ્પી નાસ્તો',
  },
  chilly: {
    en: 'Chilly / Winter',
    hi: 'सर्दियाँ / ठंड',
    gu: 'શિયાળો / ઠંડી',
  },
  chillyDesc: {
    en: 'Hearty ghee flatbreads, rich curries',
    hi: 'देसी घी के पराठे, गरमागरम दाल व हलवा',
    gu: 'શુદ્ધ ઘીના પરોઠા, ગરમ શાક અને શીરો',
  },

  // Moods
  quick: {
    en: 'Quick & Easy',
    hi: 'झटपट व आसान',
    gu: 'ઝટપટ અને સરળ',
  },
  quickDesc: {
    en: '< 20 mins, one-pot or minimal pans',
    hi: '< २० मिनट, कम बर्तनों में झटपट',
    gu: '< ૨૦ મિનિટ, ઓછા વાસણમાં ઝડપી',
  },
  comfort: {
    en: 'Comfort Food',
    hi: 'पारंपरिक व सादा',
    gu: 'હૂંફાળું સાદું ભોજન',
  },
  comfortDesc: {
    en: 'Warm, homely, soul-satisfying staples',
    hi: 'मन को तृप्त करने वाला घरेलू स्वाद',
    gu: 'મનને સંતોષ આપતું પરંપરાગત ભોજન',
  },
  healthy: {
    en: 'Light & Healthy',
    hi: 'हल्का व पौष्टिक',
    gu: 'હલકું અને પૌષ્ટિક',
  },
  healthyDesc: {
    en: 'Low oil, iron-packed, nutritious',
    hi: 'कम तेल, स्वास्थ्यवर्धक व पौष्टिक',
    gu: 'ઓછા તેલવાળું અને સ્વાસ્થ્યપ્રદ',
  },
  leisurely: {
    en: 'Weekend Special',
    hi: 'शाही दावत',
    gu: 'રવિવાર સ્પેશ્યલ દાવત',
  },
  leisurelyDesc: {
    en: 'Multi-course elaborate royal feast',
    hi: 'फुर्सत से बना स्वादिष्ट खास खाना',
    gu: 'નિરાંતે બનાવેલ સ્વાદિષ્ટ ભોજન',
  },

  // Ask Chef Mom
  askChefMomTitle: {
    en: 'Ask Chef Mom (Unlimited Gemini Recipes)',
    hi: 'शेफ माँ से पूछें (असीमित रेसिपी)',
    gu: 'શેફ મમ્મીને પૂછો (અમર્યાદિત રેસિપી)',
  },
  askChefMomSubtitle: {
    en: 'Have a specific craving? Gemini creates tailor-made dishes using your exact pantry stock.',
    hi: 'कोई खास इच्छा है? आपकी रसोई की सामग्री से नई डिश तैयार करें।',
    gu: 'કોઈ ચોક્કસ ઈચ્છા છે? તમારા રસોડાની સામગ્રીમાંથી નવી વાનગી બનાવો.',
  },
  generateButton: {
    en: 'Generate Custom Dishes',
    hi: 'खास व्यंजन तैयार करें',
    gu: 'નવી વાનગીઓ બનાવો',
  },
  portions: {
    en: 'Portions:',
    hi: 'सदस्य:',
    gu: 'માણસો:',
  },
  person: {
    en: 'person',
    hi: 'लोग',
    gu: 'વ્યક્તિ',
  },
  people: {
    en: 'people',
    hi: 'लोग',
    gu: 'માણસો',
  },

  // Quick Kitchen Tap Rack
  quickTapTitle: {
    en: 'Quick Kitchen Tap Rack',
    hi: 'रसोई की खास सामग्री रैक',
    gu: 'ઝડપી રસોડું સામગ્રી રેક',
  },
  quickTapSubtitle: {
    en: 'Tap staples to toggle in/out of stock. Dishes update in real time!',
    hi: 'सामग्री पर टैप करके चुनें कि क्या मौजूद है। रेसिपी अपने आप बदलेंगी!',
    gu: 'સામગ્રી પર ટેપ કરી હાજર/ગેરહાજર કરો. વાનગીઓ તરત જ અપડેટ થશે!',
  },
  viewAllStock: {
    en: 'View All Stock 👉',
    hi: 'पूरी रसोई देखें 👉',
    gu: 'આખું રસોડું જુઓ 👉',
  },

  // Recipe Feed Sections
  readyToCookSection: {
    en: '🟢 Ready to Cook Right Now!',
    hi: '🟢 पकाने के लिए तैयार!',
    gu: '🟢 બનાવવા માટે તૈયાર!',
  },
  readyToCookSub: {
    en: 'All ingredients in your pantry right now — start cooking immediately!',
    hi: 'सारी सामग्री घर में उपलब्ध है — तुरंत पकाना शुरू करें!',
    gu: 'બધી સામગ્રી રસોડામાં હાજર છે — તરત જ રાંધવાનું શરૂ કરો!',
  },
  missingFewSection: {
    en: '🟡 Missing Only 1-2 Items',
    hi: '🟡 सिर्फ १-२ चीजें कम',
    gu: '🟡 ફક્ત ૧-૨ વસ્તુઓ ખૂટે છે',
  },
  missingFewSub: {
    en: 'Almost ready! Each card shows instant home substitutes.',
    hi: 'लगभग तैयार! घरेलू विकल्पों की मदद से तुरंत बनाएं।',
    gu: 'લગભગ તૈયાર! ઘરેલું વિકલ્પો સાથે બનાવી શકાય છે.',
  },
  moreIdeasSection: {
    en: '⚪ More Recipe Ideas',
    hi: '⚪ अन्य व्यंजन सुझाव',
    gu: '⚪ અન્ય વાનગીઓના વિચાર',
  },
  moreIdeasSub: {
    en: 'Requires shopping or additional pantry staples.',
    hi: 'अतिरिक्त सामग्री बाज़ार से लानी होगी।',
    gu: 'બહારથી વધુ સામગ્રી લાવવી પડશે.',
  },

  // Filter Buttons
  allDishes: {
    en: 'All Dishes',
    hi: 'सभी व्यंजन',
    gu: 'બધી વાનગીઓ',
  },
  readyFilter: {
    en: '🟢 Ready to Cook!',
    hi: '🟢 तुरंत तैयार!',
    gu: '🟢 તરત જ તૈયાર!',
  },
  missingFilter: {
    en: '🟡 Missing 1-2 Items',
    hi: '🟡 १-२ चीजें कम',
    gu: '🟡 ૧-૨ ખૂટે છે',
  },
  exploreFilter: {
    en: '⚪ Explore Others',
    hi: '⚪ अन्य देखें',
    gu: '⚪ બીજી વાનગીઓ',
  },
  searchPlaceholder: {
    en: 'Search khichdi, paneer, paratha...',
    hi: 'खिचड़ी, पनीर, पराठा खोजें...',
    gu: 'ખીચડી, પનીર, પરોઠા શોધો...',
  },

  // Card Actions
  cookNow: {
    en: 'Start Cooking',
    hi: 'पकाना शुरू करें',
    gu: 'રાંધવાનું શરૂ કરો',
  },
  cookThisNow: {
    en: 'Cook This Now',
    hi: 'अभी पकाएं',
    gu: 'હમણાં બનાવો',
  },
  watchTechnique: {
    en: 'Watch Technique',
    hi: 'तरीका देखें',
    gu: 'રીત જુઓ',
  },
  substitutesAvailable: {
    en: 'Home Substitutes',
    hi: 'घरेलू विकल्प',
    gu: 'ઘરેલું વિકલ્પો',
  },
  topMatchBadge: {
    en: 'Top Recommendation',
    hi: 'सर्वश्रेष्ठ पसंद',
    gu: 'શ્રેષ્ઠ પસંદગી',
  },
  freshlyCreatedBadge: {
    en: '✨ Freshly Created for You',
    hi: '✨ खास आपके लिए ताज़ा',
    gu: '✨ ખાસ તમારા માટે તાજી',
  },

  // Live Context Bar
  liveKitchenTuning: {
    en: 'Live Kitchen Tuning',
    hi: 'सक्रिय रसोई मोड',
    gu: 'લાઈવ રસોડું મોડ',
  },
  filteredToSlot: {
    en: 'Dishes Only',
    hi: 'व्यंजन केवल',
    gu: 'વાનગીઓ જ',
  },
  showingAllSlots: {
    en: 'Showing All Slots',
    hi: 'सभी समय के व्यंजन',
    gu: 'બધા સમયની વાનગીઓ',
  },
} as const;

export type TranslationKey = keyof typeof TRANSLATIONS;

export function getTranslation(key: TranslationKey, lang: Language): string {
  const item = TRANSLATIONS[key];
  if (!item) return key;
  return item[lang] || item['en'] || key;
}

export function loadSavedLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'gu')) {
      return saved;
    }
  } catch {}
  return 'en';
}

export function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (err) {
    console.error('Failed to save language', err);
  }
}
