import { useEffect, useRef, useState } from 'react';

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;

export const reducedMotion = () =>
    typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const coarsePointer = () =>
    typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;

// Storage can throw (private mode, blocked cookies), so every access is guarded.
export const storage = {
    get(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw == null ? fallback : JSON.parse(raw);
        } catch {
            return fallback;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            /* ignore */
        }
    },
};

// True once the element has entered the viewport (stays true).
export const useInView = (rootMargin = '0px 0px -12% 0px') => {
    const ref = useRef(null);
    const [seen, setSeen] = useState(false);
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

/*
 * Runs a canvas scene: handles device pixel ratio, resizing, and pauses the
 * animation loop while the canvas is off screen or the tab is hidden.
 * factory({ canvas, ctx }) returns { resize(w, h), frame(t), destroy() }.
 */
export const useCanvasScene = (factory) => {
    const ref = useRef(null);
    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return undefined;
        const ctx = canvas.getContext('2d');
        const scene = factory({ canvas, ctx });
        let raf = 0;
        let running = false;
        let onScreen = false;

        const size = () => {
            const r = canvas.getBoundingClientRect();
            if (!r.width || !r.height) return;
            const dpr = Math.min(2, window.devicePixelRatio || 1);
            canvas.width = Math.round(r.width * dpr);
            canvas.height = Math.round(r.height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            scene.resize?.(r.width, r.height);
            if (!running) scene.frame?.(performance.now());
        };
        // Use performance.now() everywhere so scenes can compare times from events and frames.
        const loop = () => {
            raf = requestAnimationFrame(loop);
            scene.frame?.(performance.now());
        };
        const start = () => {
            if (running || document.hidden) return;
            running = true;
            raf = requestAnimationFrame(loop);
        };
        const stop = () => {
            running = false;
            cancelAnimationFrame(raf);
        };

        size();
        const ro = new ResizeObserver(size);
        ro.observe(canvas);
        const io = new IntersectionObserver(([e]) => {
            onScreen = e.isIntersecting;
            if (onScreen) start();
            else stop();
        });
        io.observe(canvas);
        const onVis = () => (document.hidden ? stop() : onScreen && start());
        document.addEventListener('visibilitychange', onVis);

        return () => {
            stop();
            ro.disconnect();
            io.disconnect();
            document.removeEventListener('visibilitychange', onVis);
            scene.destroy?.();
        };
        // The factory is fixed for the lifetime of the canvas.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return ref;
};

export const cssVar = (name, fallback) => {
    if (typeof window === 'undefined') return fallback;
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
};

// Wait for a web font, but never longer than `ms`.
export const fontReady = (spec, ms = 1500) => {
    const load = document.fonts?.load ? document.fonts.load(spec).catch(() => null) : Promise.resolve();
    return Promise.race([load, new Promise((r) => setTimeout(r, ms))]);
};
