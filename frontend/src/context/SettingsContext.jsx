import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../utils/api';

// Choices made in the CMS (Appearance page). Must match backend/models/Settings.js.
export const DESIGNS = ['ascii', 'classic'];
export const PORTRAITS = ['sunset', 'blazer'];
export const DEFAULT_SETTINGS = { design: 'ascii', portrait: 'sunset' };

const KEY = 'portfolio_settings_v1';

const clean = (raw) => ({
    design: DESIGNS.includes(raw?.design) ? raw.design : DEFAULT_SETTINGS.design,
    portrait: PORTRAITS.includes(raw?.portrait) ? raw.portrait : DEFAULT_SETTINGS.portrait,
});

// The last known choice is kept in the browser so a returning visitor never sees the other design flash.
const readCache = () => {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? clean(JSON.parse(raw)) : null;
    } catch {
        return null;
    }
};

const writeCache = (value) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(value));
    } catch {
        /* storage blocked: the site still works, it just asks the server every time */
    }
};

// ?design=classic&portrait=blazer previews a choice for this visit only; nothing is saved.
const readPreview = () => {
    if (typeof window === 'undefined') return {};
    const q = new URLSearchParams(window.location.search);
    const out = {};
    if (DESIGNS.includes(q.get('design'))) out.design = q.get('design');
    if (PORTRAITS.includes(q.get('portrait'))) out.portrait = q.get('portrait');
    return out;
};

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const [saved, setSaved] = useState(readCache);
    const [ready, setReady] = useState(() => readCache() !== null);
    // False when the server answers 404: the backend has not been deployed with /api/settings yet.
    const [available, setAvailable] = useState(true);
    const [preview] = useState(readPreview);

    const reload = useCallback(async () => {
        try {
            const { data } = await api.get('/settings');
            const next = clean(data);
            setSaved(next);
            setAvailable(true);
            writeCache(next);
            return next;
        } catch (error) {
            if (error?.response?.status === 404) setAvailable(false);
            throw error;
        } finally {
            setReady(true);
        }
    }, []);

    useEffect(() => {
        reload().catch(() => {});
        // Never hold the page for long: after this, render with the defaults.
        const timer = setTimeout(() => setReady(true), 1500);
        return () => clearTimeout(timer);
    }, [reload]);

    const update = useCallback(async (patch) => {
        const { data } = await api.put('/settings', patch);
        const next = clean(data);
        setSaved(next);
        setAvailable(true);
        writeCache(next);
        return next;
    }, []);

    const value = useMemo(() => {
        const base = saved || DEFAULT_SETTINGS;
        return { ...base, ...preview, saved: base, preview, ready, available, update, reload };
    }, [saved, preview, ready, available, update, reload]);

    return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within SettingsProvider');
    return context;
};
