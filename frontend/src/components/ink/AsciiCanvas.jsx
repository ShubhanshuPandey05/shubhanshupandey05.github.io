import { useEffect, useRef } from 'react';
import { createAsciiPainting } from './asciiPainting';
import { prefersReducedMotion } from './motion';

// A canvas that shows one of the painted scenes as dense ASCII.
// It only animates while on screen, redraws on resize, and lets the cursor part the mist.
const AsciiCanvas = ({ scene, mist, petals, transparent = false, fontSize, className = '', label }) => {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        if (!canvas) return undefined;
        let painting = null;
        let io = null;
        let ro = null;
        let timer = 0;
        let cancelled = false;
        let lastW = 0;

        const onMove = (e) => {
            if (!painting) return;
            const r = canvas.getBoundingClientRect();
            painting.setPointer(e.clientX - r.left, e.clientY - r.top);
        };

        const init = () => {
            if (cancelled) return;
            painting = createAsciiPainting(canvas, {
                paint: scene,
                mist,
                petals,
                transparent,
                fontSize,
                reducedMotion: prefersReducedMotion(),
            });
            lastW = canvas.getBoundingClientRect().width;
            io = new IntersectionObserver(([entry]) => {
                if (entry.isIntersecting) painting.start();
                else painting.stop();
            });
            io.observe(canvas);
            ro = new ResizeObserver(() => {
                const w = canvas.getBoundingClientRect().width;
                // Ignore height-only jitter (mobile address bar) to avoid repainting while scrolling.
                if (Math.abs(w - lastW) < 2) return;
                lastW = w;
                clearTimeout(timer);
                timer = setTimeout(() => painting.resize(), 150);
            });
            ro.observe(canvas);
            window.addEventListener('pointermove', onMove, { passive: true });
        };

        // Wait for the monospace font so the character grid measures correctly.
        const fonts = document.fonts?.load ? document.fonts.load('9px "JetBrains Mono"').catch(() => null) : Promise.resolve();
        Promise.race([fonts, new Promise((r) => setTimeout(r, 1200))]).then(init);

        return () => {
            cancelled = true;
            clearTimeout(timer);
            painting?.stop();
            io?.disconnect();
            ro?.disconnect();
            window.removeEventListener('pointermove', onMove);
        };
        // Scenes are static functions; options are fixed per mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <canvas ref={ref} className={`ik-canvas ${className}`} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
};

export default AsciiCanvas;
