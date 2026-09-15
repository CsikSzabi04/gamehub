/**
 * Operator (service provider / data controller) details, shown on the Legal notice,
 * Terms, Privacy and Cookie pages. Required by the Hungarian E-commerce Act
 * (2001. évi CVIII. tv. 4. §), the GDPR (Art. 13) and the DSA (Art. 11-12).
 *
 * Fill in every value that is null before publishing. While a value is null
 * the pages show a clearly marked "to be completed" line instead of it.
 */
export const OPERATOR = {
    name: 'Csík Szabolcs Alex',          // natural person or company name
    legalForm: null,                     // e.g. 'magánszemély', 'egyéni vállalkozó', 'Kft.'
    address: null,                       // postal address / registered seat (REQUIRED)
    registrationNumber: null,            // company reg. no. or sole-trader reg. no., if any
    taxNumber: null,                     // tax number, if any
    email: 'helpdesk.gamehub@gmail.com', // general, privacy and DSA contact point
    website: 'https://gamedatahub.netlify.app',
    siteName: 'Game Data Hub',
};

/** Hosting providers and data processors (Legal notice, Privacy Policy). */
export const PROVIDERS = [
    { id: 'netlify', name: 'Netlify, Inc.', role: 'hosting', location: 'USA', url: 'https://www.netlify.com/privacy/' },
    { id: 'render', name: 'Render Services, Inc.', role: 'backend', location: 'USA', url: 'https://render.com/privacy' },
    { id: 'google', name: 'Google Ireland Limited (Firebase Authentication, Cloud Firestore)', role: 'database', location: 'EU / USA', url: 'https://firebase.google.com/support/privacy' },
];

/** Hungarian data protection authority (complaints, GDPR Art. 77). */
export const AUTHORITY = {
    name: 'Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)',
    address: '1055 Budapest, Falk Miksa utca 9-11.',
    email: 'ugyfelszolgalat@naih.hu',
    url: 'https://naih.hu',
};

/** Bump when the Terms / Privacy / Cookie texts change materially; shown as the effective date. */
export const LEGAL_VERSION = '2026-09-15';
