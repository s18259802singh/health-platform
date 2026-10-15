// Small translation-string helper. Only English is provided - the app is
// English-only by design - but pages still call t('key') so any wording
// only has to be edited in one place.

import { createContext, useContext } from 'react';

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
    liveDemo: 'Live Demo', help: 'Help',
  },
};

const LangContext = createContext({ lang: 'en', t: (k) => DICT.en[k] ?? k });

export function LanguageProvider({ children }) {
  const t = (key) => DICT.en[key] ?? key;
  return <LangContext.Provider value={{ lang: 'en', t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);
