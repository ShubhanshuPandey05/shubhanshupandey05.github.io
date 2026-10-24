import { useEffect, useSyncExternalStore } from 'react';

// A lamp is lit only if the project's URL answers the visitor's own browser.
// One check per URL per visit, shared by every lamp that shows that project.
const checks = new Map();
const listeners = new Set();

// Free hosting tiers can take a while to wake, so the wait is generous.
const WAIT_MS = 25000;

const subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

const settle = (url, status) => {
    checks.set(url, status);
    listeners.forEach((listener) => listener());
};

const check = (url) => {
    if (checks.has(url)) return;
    checks.set(url, 'checking');
    // The response is opaque, but receiving one at all proves a server answered.
    fetch(url, { mode: 'no-cors', cache: 'no-store', signal: AbortSignal.timeout(WAIT_MS) })
        .then(() => settle(url, 'live'))
        .catch(() => settle(url, 'silent'));
};

const statusOf = (url) => (url ? checks.get(url) ?? 'checking' : 'none');

// 'none' (no live URL) | 'checking' | 'live' | 'silent'
export const useLive = (url) => {
    const status = useSyncExternalStore(subscribe, () => statusOf(url));
    useEffect(() => {
        if (url) check(url);
    }, [url]);
    return status;
};

// Counts across several URLs, for the sign that hangs under the lanterns.
export const useLiveCount = (urls) => {
    const key = urls.filter(Boolean).join('\n');
    const snapshot = useSyncExternalStore(subscribe, () => key.split('\n').filter(Boolean).map(statusOf).join(','));
    useEffect(() => {
        key.split('\n').filter(Boolean).forEach(check);
    }, [key]);
    const statuses = snapshot ? snapshot.split(',') : [];
    return {
        total: statuses.length,
        live: statuses.filter((status) => status === 'live').length,
        checking: statuses.filter((status) => status === 'checking').length,
    };
};
