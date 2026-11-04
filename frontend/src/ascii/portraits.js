import sunset from './assets/portrait-sunset.webp';
import blazer from './assets/portrait-blazer.webp';

// The photos the ASCII design can draw. Keys match the CMS setting (backend/models/Settings.js).
export const PORTRAITS = {
    sunset: { url: sunset, label: 'Sunset', note: 'Arms crossed, at dusk' },
    blazer: { url: blazer, label: 'Blazer', note: 'Checked blazer, in daylight' },
};

export const portraitUrl = (key) => (PORTRAITS[key] || PORTRAITS.sunset).url;
