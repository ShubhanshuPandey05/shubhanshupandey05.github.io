import { useEffect, useRef, useState } from 'react';

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export const reducedMotion = () =>
    typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const MOBILE_QUERY = '(max-width: 1023px)';
export const isMobile = () => typeof window !== 'undefined' && !!window.matchMedia?.(MOBILE_QUERY).matches;

// True once the element has entered the viewport (stays true).
export const useInView = (rootMargin = '0px 0px -10% 0px') => {
    const ref = useRef(null);
    // Without IntersectionObserver everything counts as seen.
    const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined');
    useEffect(() => {
        const el = ref.current;
        if (!el || seen) return undefined;
        const io = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setSeen(true);
                    io.disconnect();
                }
            },
            { rootMargin }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [rootMargin, seen]);
    return [ref, seen];
};

export const useTitle = (title) => {
    useEffect(() => {
        document.title = title ? `${title} · Shubhanshu Pandey` : 'Shubhanshu Pandey · Backend Developer';
    }, [title]);
};

// Lower-case slug for file names shown in the stage window: "GeoJobs" -> "geojobs".
export const slug = (s) =>
    (s || 'untitled')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'untitled';

export const host = (url) => {
    try {
        return new URL(url).host.replace(/^www\./, '');
    } catch {
        return '';
    }
};
