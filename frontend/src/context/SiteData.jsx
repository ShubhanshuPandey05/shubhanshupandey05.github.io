import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const SiteDataContext = createContext(null);

const endpoints = {
    about: '/about',
    projects: '/projects',
    skills: '/skills',
    socialLinks: '/social-links',
    blogs: '/blogs',
};

const empty = { about: null, projects: [], skills: [], socialLinks: [], blogs: [] };

export const useSiteData = () => {
    const context = useContext(SiteDataContext);
    if (!context) throw new Error('useSiteData must be used within SiteDataProvider');
    return context;
};

// The public pages share one fetch of the CMS content, so moving between routes
// never shows a loader twice. `failed` lists the collections that did not load.
export const SiteDataProvider = ({ children }) => {
    const [data, setData] = useState(empty);
    const [status, setStatus] = useState('loading');
    const [failed, setFailed] = useState([]);

    const load = useCallback(async () => {
        setStatus('loading');
        const keys = Object.keys(endpoints);
        const results = await Promise.allSettled(keys.map((key) => api.get(endpoints[key])));
        const next = { ...empty };
        const missing = [];
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') next[keys[index]] = result.value.data;
            else missing.push(keys[index]);
        });
        setData(next);
        setFailed(missing);
        setStatus('ready');
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return (
        <SiteDataContext.Provider value={{ ...data, status, failed, reload: load }}>
            {children}
        </SiteDataContext.Provider>
    );
};
