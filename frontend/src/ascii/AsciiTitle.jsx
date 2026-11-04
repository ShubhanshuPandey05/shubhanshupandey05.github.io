import { useEffect, useRef } from 'react';
import { Stage as Engine } from './engine/stage';
import { LINE } from './engine/glyphs';
import { wordsFrame } from './engine/raster';
import { pagePalette, prepareGlyphs } from './engine/setup';
import { clamp, reducedMotion } from './lib';

/*
 * A page title drawn in characters, straight onto the page: the same
 * scramble-then-write as the home page stage. `text` uses "|" for line breaks.
 */
const AsciiTitle = ({ text, fill, label, className = '' }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const engine = new Engine(canvas);
        engine.setReduced(reducedMotion());
        let alive = true;
        let matchers = null;
        let lastW = 0;
        let lastH = 0;
        const dark = () => !document.documentElement.classList.contains('light');
        engine.define('title', (geo) =>
            wordsFrame(geo, {
                lines: text.split('|'),
                fill,
                marginX: 0,
                marginTop: 0,
                marginBottom: 0,
                fillWidth: 1,
                fillHeight: 0.98,
                align: 0,
                captions: false,
                sweep: 1100,
            })
        );

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
                fontSize: clamp(r.height / (30 * LINE), 4.6, 9),
                palette: pagePalette(),
                dark: dark(),
                ...matchers,
            });
        };

        prepareGlyphs().then((m) => {
            if (!alive) return;
            matchers = m;
            configure();
            engine.current = null;
            engine.show('title');
        });

        const ro = new ResizeObserver(configure);
        ro.observe(canvas);
        const mo = new MutationObserver(() => {
            if (matchers) engine.recolor({ palette: pagePalette(), dark: dark(), ...matchers });
        });
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        const onVis = () => engine.setVisible(!document.hidden);
        document.addEventListener('visibilitychange', onVis);

        const local = (e) => {
            const r = canvas.getBoundingClientRect();
            return [e.clientX - r.left, e.clientY - r.top];
        };
        const onMove = (e) => e.pointerType !== 'touch' && engine.pointer(...local(e));
        const onDown = (e) => engine.ripple(...local(e));
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerdown', onDown);

        return () => {
            alive = false;
            ro.disconnect();
            mo.disconnect();
            document.removeEventListener('visibilitychange', onVis);
            canvas.removeEventListener('pointermove', onMove);
            canvas.removeEventListener('pointerdown', onDown);
            engine.destroy();
        };
    }, [text, fill]);

    return (
        <div className={`ax-title ${className}`} role="img" aria-label={label || text.replace(/\|/g, ' ')}>
            <canvas ref={canvasRef} />
        </div>
    );
};

export default AsciiTitle;
