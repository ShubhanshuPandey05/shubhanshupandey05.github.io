import { useEffect, useRef } from 'react';
import { Stage } from '../../ascii/engine/stage';
import { LINE } from '../../ascii/engine/glyphs';
import { portraitFrame } from '../../ascii/engine/raster';
import { prepareGlyphs } from '../../ascii/engine/setup';
import { clamp, reducedMotion } from '../../ascii/lib';

const PALETTE = {
    ink: '#ecebe6',
    heat: ['#8ea2ff', '#9ba3f6', '#ada3ec', '#c1a2df', '#d39ecf', '#e29cbd', '#ec9cab', '#f2a29e'],
};

// A live ASCII rendering of one portrait, drawn exactly the way the site's stage draws it.
const PortraitPreview = ({ url, rows = 72, className = 'cms-ascii' }) => {
    const ref = useRef(null);

    useEffect(() => {
        const canvas = ref.current;
        const engine = new Stage(canvas);
        engine.setReduced(reducedMotion());
        let alive = true;
        let matchers = null;
        let image = null;
        let lastW = 0;
        let lastH = 0;
        engine.define('portrait', (geo) => portraitFrame(geo, image, { marginTop: 1 }));

        const configure = () => {
            const r = canvas.getBoundingClientRect();
            if (!r.width || !r.height || !matchers) return;
            if (Math.abs(r.width - lastW) < 1 && Math.abs(r.height - lastH) < 1) return;
            lastW = r.width;
            lastH = r.height;
            engine.configure({
                width: r.width,
                height: r.height,
                dpr: Math.min(window.devicePixelRatio || 1, 2),
                fontSize: clamp(r.height / (rows * LINE), 3.2, 9),
                palette: PALETTE,
                dark: true,
                ...matchers,
            });
        };

        (async () => {
            const m = await prepareGlyphs();
            const img = new Image();
            img.src = url;
            await img.decode().catch(() => {});
            if (!alive) return;
            matchers = m;
            image = img;
            configure();
            engine.current = null;
            engine.show('portrait');
        })();

        const ro = new ResizeObserver(configure);
        ro.observe(canvas);
        const local = (e) => {
            const r = canvas.getBoundingClientRect();
            return [e.clientX - r.left, e.clientY - r.top];
        };
        const onMove = (e) => e.pointerType !== 'touch' && engine.pointer(...local(e));
        canvas.addEventListener('pointermove', onMove);

        return () => {
            alive = false;
            ro.disconnect();
            canvas.removeEventListener('pointermove', onMove);
            engine.destroy();
        };
    }, [url, rows]);

    return <canvas ref={ref} className={className} aria-hidden="true" />;
};

export default PortraitPreview;
