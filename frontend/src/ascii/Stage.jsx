import { useEffect, useRef, useState } from 'react';
import { Stage as Engine } from './engine/stage';
import { LINE } from './engine/glyphs';
import { portraitFrame, wordsFrame } from './engine/raster';
import { prepareGlyphs } from './engine/setup';
import { MOBILE_QUERY, clamp, reducedMotion } from './lib';
import Scramble from './Scramble';

// The stage is always a dark screen, in both themes: the portrait reads best as light on dark.
const PALETTE = {
    ink: '#ecebe6',
    heat: ['#8ea2ff', '#9ba3f6', '#ada3ec', '#c1a2df', '#d39ecf', '#e29cbd', '#ec9cab', '#f2a29e'],
};
const ruler = (p) => (p <= 0.002 ? 'Top' : p >= 0.998 ? 'Bot' : `${Math.round(p * 100)}%`);

// Which scene is in charge: the last one whose top has crossed the trigger line.
const activeScene = (panel) => {
    const mobile = window.matchMedia(MOBILE_QUERY).matches;
    const line = mobile ? panel.getBoundingClientRect().bottom - 6 : window.innerHeight * 0.52;
    let active = null;
    document.querySelectorAll('[data-scene]').forEach((el) => {
        if (mobile && el.dataset.sub) return;
        if (!active) active = el.dataset.scene;
        if (el.getBoundingClientRect().top <= line) active = el.dataset.scene;
    });
    return active;
};

const AsciiStage = ({ scenes, portrait, onInfo }) => {
    const panelRef = useRef(null);
    const canvasRef = useRef(null);
    const engineRef = useRef(null);
    const scenesRef = useRef(scenes);
    const signatures = useRef(new Map());
    const [info, setInfo] = useState({ scene: null, cols: 0, rows: 0, count: 0 });
    const [progress, setProgress] = useState(0);
    const onInfoRef = useRef(onInfo);
    useEffect(() => {
        onInfoRef.current = onInfo;
    }, [onInfo]);

    // (Re)define the frame builders whenever the scene list changes.
    const defineAll = (engine, list) => {
        const seen = new Set();
        let currentChanged = false;
        list.forEach((s) => {
            seen.add(s.id);
            const sig = JSON.stringify(s);
            if (signatures.current.get(s.id) === sig) return;
            signatures.current.set(s.id, sig);
            engine.define(s.id, (geo) =>
                s.type === 'portrait' ? portraitFrame(geo, engine.image, s.options) : wordsFrame(geo, s)
            );
            if (s.id === engine.current) currentChanged = true;
        });
        signatures.current.forEach((_, id) => {
            if (!seen.has(id)) signatures.current.delete(id);
        });
        return currentChanged;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const panel = panelRef.current;
        const engine = new Engine(canvas);
        engineRef.current = engine;
        engine.setReduced(reducedMotion());
        let alive = true;
        let ready = false;
        let lastW = 0;
        let lastH = 0;
        let resizeTimer = 0;

        const off = engine.onChange((next) => {
            setInfo(next);
            onInfoRef.current?.(next);
        });

        const configure = () => {
            const r = canvas.getBoundingClientRect();
            if (!r.width || !r.height || !engine.matchers) return;
            // Mobile browsers resize the viewport while scrolling; ignore small height changes.
            if (Math.abs(r.width - lastW) < 1 && Math.abs(r.height - lastH) < 1) return;
            lastW = r.width;
            lastH = r.height;
            const mobile = window.matchMedia(MOBILE_QUERY).matches;
            const rows = mobile ? 80 : 98;
            const fontSize = clamp(r.height / (rows * LINE), mobile ? 4.6 : 6.2, mobile ? 8 : 10.5);
            const area = r.width * r.height;
            const dpr = Math.min(window.devicePixelRatio || 1, area < 450000 ? 3 : 2);
            engine.configure({
                width: r.width,
                height: r.height,
                dpr,
                fontSize,
                palette: PALETTE,
                dark: true,
                match: engine.matchers.match,
                edgeMatch: engine.matchers.edgeMatch,
            });
        };

        const pickScene = () => {
            if (!ready) return;
            const id = activeScene(panel);
            if (id && id !== engine.current) engine.show(id);
            const max = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(max > 0 ? window.scrollY / max : 0);
        };

        (async () => {
            const matchers = await prepareGlyphs();
            if (!alive) return;
            engine.matchers = matchers;
            defineAll(engine, scenesRef.current);
            configure();
            ready = true;
            // First paint: the current scene writes itself in.
            const first = activeScene(panel) || scenesRef.current[0]?.id;
            engine.current = null;
            if (first) engine.show(first);
            pickScene();
        })();

        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                configure();
                pickScene();
            }, 120);
        };
        const ro = new ResizeObserver(onResize);
        ro.observe(canvas);

        let raf = 0;
        const onScroll = () => {
            if (!raf)
                raf = requestAnimationFrame(() => {
                    raf = 0;
                    pickScene();
                });
        };
        window.addEventListener('scroll', onScroll, { passive: true });

        const onVis = () => engine.setVisible(!document.hidden);
        document.addEventListener('visibilitychange', onVis);

        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const onMotion = () => engine.setReduced(motion.matches);
        motion.addEventListener?.('change', onMotion);

        const local = (e) => {
            const r = canvas.getBoundingClientRect();
            return [e.clientX - r.left, e.clientY - r.top];
        };
        const onMove = (e) => {
            if (e.pointerType === 'touch') return;
            engine.pointer(...local(e));
        };
        const onDown = (e) => engine.ripple(...local(e));
        canvas.addEventListener('pointermove', onMove);
        canvas.addEventListener('pointerdown', onDown);

        return () => {
            alive = false;
            off();
            ro.disconnect();
            clearTimeout(resizeTimer);
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            document.removeEventListener('visibilitychange', onVis);
            motion.removeEventListener?.('change', onMotion);
            canvas.removeEventListener('pointermove', onMove);
            canvas.removeEventListener('pointerdown', onDown);
            engine.destroy();
            engineRef.current = null;
        };
    }, []);

    // The portrait photo (chosen in the CMS). When it changes, the hero re-draws with the usual scramble.
    useEffect(() => {
        if (!portrait) return undefined;
        let alive = true;
        const img = new Image();
        img.decoding = 'async';
        img.src = portrait;
        img.decode()
            .catch(() => {})
            .then(() => {
                const engine = engineRef.current;
                if (!alive || !engine) return;
                engine.image = img;
                engine.invalidate('hero');
            });
        return () => {
            alive = false;
        };
    }, [portrait]);

    // New content from the CMS: rebuild the affected frames and redraw if the visible one changed.
    useEffect(() => {
        scenesRef.current = scenes;
        const engine = engineRef.current;
        if (!engine || !engine.matchers) return;
        const changed = defineAll(engine, scenes);
        if (changed && engine.current) engine.show(engine.current);
        engine.prewarm();
        const id = panelRef.current && activeScene(panelRef.current);
        if (id && id !== engine.current) engine.show(id);
    }, [scenes]);

    const scene = scenes.find((s) => s.id === info.scene) || scenes[0];
    const index = Math.max(0, scenes.findIndex((s) => s.id === scene?.id));
    const file = scene?.file || 'untitled.txt';

    return (
        <div className="ax-screen" ref={panelRef} aria-hidden="true">
            <div className="ax-screen__bar">
                <Scramble className="ax-screen__file" text={`~/shubhanshu/${file}`} onView={false} />
                <span className="ax-screen__dims">
                    {info.cols}×{info.rows}
                </span>
            </div>
            <div className="ax-screen__view">
                <canvas ref={canvasRef} className="ax-screen__canvas" />
            </div>
            <div className="ax-screen__status">
                <Scramble text={`"${file}" [readonly] ${info.count.toLocaleString('en-US')}C`} onView={false} />
                <span>
                    {String(index + 1).padStart(2, '0')}/{String(scenes.length).padStart(2, '0')} <i>·</i> {ruler(progress)}
                </span>
            </div>
        </div>
    );
};

export default AsciiStage;
