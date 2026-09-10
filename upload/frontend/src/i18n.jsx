// LIGHTWEIGHT TRILINGUAL SYSTEM - English / Hindi / Gujarati.
// No library needed: a dictionary + React context + a t() function.
// The choice is remembered in localStorage and applies everywhere,
// including the public emergency page - a scared family member scanning
// a QR should read it in their own language.

import { createContext, useContext, useEffect, useState } from 'react';

const DICT = {
  en: {
    // nav
    dashboard: 'Dashboard', findDonors: 'Find Donors', hospitals: 'Hospitals',
    appointments: 'Appointments', bloodRequests: 'Blood Requests', blog: 'Blog',
    myProfile: 'My Profile', logout: 'Logout', login: 'Login', register: 'Register',
    home: 'Home', donors: 'Donors', profile: 'Profile',
    // dashboard
    signedIn: 'Signed in', giveBlood: 'Give blood',
    heroLine: "Fifteen minutes of your day can save someone's life.",
    bookAppointment: 'Book an appointment', liveSupply: 'Live Blood Supply',
    supplyCaption: 'Willing donors registered per blood group, live from the database. A pulsing bag means open requests outnumber donors - a shortage.',
    ourImpact: 'Our Impact', quickLinks: 'Quick Links',
    registeredDonors: 'Registered Donors', livesSaved: 'Lives Saved', partnerHospitals: 'Partner Hospitals',
    findDonor: 'Find a donor', bookDoctor: 'Book a doctor', hospitalsBanks: 'Hospitals & blood banks',
    healthBlog: 'Health blog', profileQr: 'My profile & QR', needed: 'needed',
    // emergency
    emTitle: 'Emergency Medical Information', emSub: 'Scanned from a LifeLink emergency QR code',
    name: 'Name', bloodGroup: 'Blood Group', allergies: 'Allergies', conditions: 'Conditions',
    medications: 'Medications', heightWeight: 'Height / Weight',
    emContact: 'Emergency Contact', callContact: 'Call Emergency Contact',
    beacon: 'Beacon Mode - attract help', needsHelp: 'NEEDS HELP', tapExit: 'tap anywhere to exit',
    // common
    searchCity: 'Search by city / location...', anyGroup: 'Any Blood Group',
    email: 'Email', password: 'Password', phone: 'Phone',
    loginTitle: 'Login to LifeLink', registerTitle: 'Create your account',
    findBloodDonors: 'Find Blood Donors', hospitalsTitle: 'Hospitals & Blood Banks',
    requestsTitle: 'Blood Donation Requests', blogTitle: 'Health Blog',
    apptTitle: 'Book a Doctor Appointment', profileTitle: 'My Profile',
    canDonate: 'I can donate', poster: 'Poster', markFulfilled: 'Mark Fulfilled',
    directions: 'Directions →', show: 'Show', hide: 'Hide',
  },
  hi: {
    dashboard: 'डैशबोर्ड', findDonors: 'रक्तदाता खोजें', hospitals: 'अस्पताल',
    appointments: 'अपॉइंटमेंट', bloodRequests: 'रक्त अनुरोध', blog: 'ब्लॉग',
    myProfile: 'मेरी प्रोफ़ाइल', logout: 'लॉगआउट', login: 'लॉगिन', register: 'पंजीकरण',
    home: 'होम', donors: 'रक्तदाता', profile: 'प्रोफ़ाइल',
    signedIn: 'लॉग इन', giveBlood: 'रक्तदान करें',
    heroLine: 'आपके दिन के पंद्रह मिनट किसी की जान बचा सकते हैं।',
    bookAppointment: 'अपॉइंटमेंट बुक करें', liveSupply: 'लाइव रक्त उपलब्धता',
    supplyCaption: 'हर रक्त समूह के इच्छुक रक्तदाता, सीधे डेटाबेस से। धड़कती थैली का मतलब है ज़रूरत रक्तदाताओं से ज़्यादा है - कमी।',
    ourImpact: 'हमारा प्रभाव', quickLinks: 'त्वरित लिंक',
    registeredDonors: 'पंजीकृत रक्तदाता', livesSaved: 'बचाई गई जानें', partnerHospitals: 'साझेदार अस्पताल',
    findDonor: 'रक्तदाता खोजें', bookDoctor: 'डॉक्टर बुक करें', hospitalsBanks: 'अस्पताल और ब्लड बैंक',
    healthBlog: 'स्वास्थ्य ब्लॉग', profileQr: 'प्रोफ़ाइल और QR', needed: 'ज़रूरत',
    emTitle: 'आपातकालीन चिकित्सा जानकारी', emSub: 'LifeLink आपातकालीन QR कोड से स्कैन किया गया',
    name: 'नाम', bloodGroup: 'रक्त समूह', allergies: 'एलर्जी', conditions: 'बीमारियाँ',
    medications: 'दवाइयाँ', heightWeight: 'कद / वज़न',
    emContact: 'आपातकालीन संपर्क', callContact: 'आपातकालीन संपर्क को कॉल करें',
    beacon: 'बीकन मोड - मदद बुलाएँ', needsHelp: 'मदद चाहिए', tapExit: 'बाहर निकलने के लिए कहीं भी टैप करें',
    searchCity: 'शहर / स्थान से खोजें...', anyGroup: 'कोई भी रक्त समूह',
    email: 'ईमेल', password: 'पासवर्ड', phone: 'फ़ोन',
    loginTitle: 'LifeLink में लॉगिन करें', registerTitle: 'अपना खाता बनाएँ',
    findBloodDonors: 'रक्तदाता खोजें', hospitalsTitle: 'अस्पताल और ब्लड बैंक',
    requestsTitle: 'रक्तदान अनुरोध', blogTitle: 'स्वास्थ्य ब्लॉग',
    apptTitle: 'डॉक्टर अपॉइंटमेंट बुक करें', profileTitle: 'मेरी प्रोफ़ाइल',
    canDonate: 'मैं रक्तदान कर सकता/सकती हूँ', poster: 'पोस्टर', markFulfilled: 'पूर्ण करें',
    directions: 'रास्ता →', show: 'दिखाएँ', hide: 'छिपाएँ',
  },
  gu: {
    dashboard: 'ડેશબોર્ડ', findDonors: 'રક્તદાતા શોધો', hospitals: 'હોસ્પિટલો',
    appointments: 'એપોઇન્ટમેન્ટ', bloodRequests: 'રક્ત વિનંતીઓ', blog: 'બ્લોગ',
    myProfile: 'મારી પ્રોફાઇલ', logout: 'લૉગઆઉટ', login: 'લૉગિન', register: 'નોંધણી',
    home: 'હોમ', donors: 'રક્તદાતા', profile: 'પ્રોફાઇલ',
    signedIn: 'લૉગ ઇન', giveBlood: 'રક્તદાન કરો',
    heroLine: 'તમારા દિવસની પંદર મિનિટ કોઈનો જીવ બચાવી શકે છે.',
    bookAppointment: 'એપોઇન્ટમેન્ટ બુક કરો', liveSupply: 'લાઇવ રક્ત ઉપલબ્ધતા',
    supplyCaption: 'દરેક રક્ત જૂથના ઇચ્છુક રક્તદાતા, સીધા ડેટાબેઝમાંથી. ધબકતી થેલી એટલે માંગ રક્તદાતાઓ કરતાં વધુ છે - અછત.',
    ourImpact: 'અમારો પ્રભાવ', quickLinks: 'ઝડપી લિંક્સ',
    registeredDonors: 'નોંધાયેલા રક્તદાતા', livesSaved: 'બચાવેલા જીવન', partnerHospitals: 'ભાગીદાર હોસ્પિટલો',
    findDonor: 'રક્તદાતા શોધો', bookDoctor: 'ડૉક્ટર બુક કરો', hospitalsBanks: 'હોસ્પિટલો અને બ્લડ બેંક',
    healthBlog: 'આરોગ્ય બ્લોગ', profileQr: 'પ્રોફાઇલ અને QR', needed: 'જરૂર',
    emTitle: 'કટોકટી તબીબી માહિતી', emSub: 'LifeLink કટોકટી QR કોડમાંથી સ્કેન કરેલ',
    name: 'નામ', bloodGroup: 'રક્ત જૂથ', allergies: 'એલર્જી', conditions: 'બીમારીઓ',
    medications: 'દવાઓ', heightWeight: 'ઊંચાઈ / વજન',
    emContact: 'કટોકટી સંપર્ક', callContact: 'કટોકટી સંપર્કને કૉલ કરો',
    beacon: 'બીકન મોડ - મદદ બોલાવો', needsHelp: 'મદદ જોઈએ છે', tapExit: 'બહાર નીકળવા ગમે ત્યાં ટૅપ કરો',
    searchCity: 'શહેર / સ્થળથી શોધો...', anyGroup: 'કોઈપણ રક્ત જૂથ',
    email: 'ઈમેલ', password: 'પાસવર્ડ', phone: 'ફોન',
    loginTitle: 'LifeLink માં લૉગિન કરો', registerTitle: 'તમારું ખાતું બનાવો',
    findBloodDonors: 'રક્તદાતા શોધો', hospitalsTitle: 'હોસ્પિટલો અને બ્લડ બેંક',
    requestsTitle: 'રક્તદાન વિનંતીઓ', blogTitle: 'આરોગ્ય બ્લોગ',
    apptTitle: 'ડૉક્ટર એપોઇન્ટમેન્ટ બુક કરો', profileTitle: 'મારી પ્રોફાઇલ',
    canDonate: 'હું રક્તદાન કરી શકું છું', poster: 'પોસ્ટર', markFulfilled: 'પૂર્ણ કરો',
    directions: 'રસ્તો →', show: 'બતાવો', hide: 'છુપાવો',
  },
};

const LangContext = createContext({ lang: 'en', setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem('lifelink-lang') || 'en');
  const setLang = (l) => { setLangState(l); localStorage.setItem('lifelink-lang', l); };
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const t = (key) => DICT[lang]?.[key] ?? DICT.en[key] ?? key;
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

export function LanguageToggle() {
  const { lang, setLang } = useLang();
  const options = [['en', 'EN'], ['hi', 'हिं'], ['gu', 'ગુ']];
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      {options.map(([code, label]) => (
        <button
          key={code}
          type="button"
          className={lang === code ? 'active' : ''}
          onClick={() => setLang(code)}
        >{label}</button>
      ))}
    </div>
  );
}
