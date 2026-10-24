import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useInView } from 'framer-motion';
import { owner } from '../content/site';

export const useTitle = (title) => {
    useEffect(() => {
        document.title = title ? `${title} | ${owner.name}` : `${owner.name} | ${owner.title}`;
    }, [title]);
};

// Brings /#about style links to their section, including after a route change
// and after content that arrives late has changed the page height. A page
// opened without a hash starts at the top, once, and is never pulled back there.
export const useHashScroll = (ready) => {
    const { hash, key } = useLocation();
    useEffect(() => {
        if (!window.location.hash) window.scrollTo(0, 0);
    }, [key]);
    useEffect(() => {
        if (!hash) return;
        document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    }, [hash, key, ready]);
};

// True once the element has come into view. Drives the one-time room reveals.
export const useOpened = (margin = '-12% 0px') => {
    const ref = useRef(null);
    const opened = useInView(ref, { once: true, margin });
    return [ref, opened];
};

// The section crossing the upper part of the viewport, for the beam's current-room
// mark. `signal` is anything that changes when sections mount or unmount.
export const useCurrentRoom = (ids, signal) => {
    const [current, setCurrent] = useState(null);
    const key = ids.join(',');
    useEffect(() => {
        const elements = key.split(',').map((id) => document.getElementById(id)).filter(Boolean);
        if (elements.length === 0) return undefined;
        const visible = new Map();
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => visible.set(entry.target.id, entry.isIntersecting));
                const first = elements.find((element) => visible.get(element.id));
                setCurrent(first ? first.id : null);
            },
            { rootMargin: '-30% 0px -55% 0px' }
        );
        elements.forEach((element) => observer.observe(element));
        return () => observer.disconnect();
    }, [key, signal]);
    return current;
};
