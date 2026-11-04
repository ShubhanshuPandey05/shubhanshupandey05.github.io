import { useEffect, useRef, useState } from 'react';
import { coarsePointer } from './lib';

// A dot that follows the pointer exactly and a ring that trails behind it.
// Over links and buttons the ring grows; elements with data-cursor show a label.
const Cursor = () => {
    const dot = useRef(null);
    const ring = useRef(null);
    const [enabled] = useState(() => typeof window !== 'undefined' && !coarsePointer());

    useEffect(() => {
        if (!enabled) return undefined;
        document.documentElement.classList.add('sp-has-cursor');
        let x = -100;
        let y = -100;
        let rx = x;
        let ry = y;
        let raf = 0;
        let label = '';

        const setState = (target) => {
            const el = target?.closest?.('a, button, [data-cursor], input, textarea, label, [role="button"]');
            const text = el?.closest('[data-cursor]')?.getAttribute('data-cursor') || '';
            const typing = el && /^(INPUT|TEXTAREA)$/.test(el.tagName);
            const r = ring.current;
            if (!r) return;
            r.classList.toggle('is-hover', !!el && !typing);
            r.classList.toggle('is-text', !!typing);
            r.classList.toggle('is-label', !!text && !typing);
            if (text !== label) {
                label = text;
                r.dataset.label = text;
            }
        };
        const onMove = (e) => {
            x = e.clientX;
            y = e.clientY;
            dot.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            setState(e.target);
            document.documentElement.style.setProperty('--mx', `${x}px`);
            document.documentElement.style.setProperty('--my', `${y}px`);
        };
        const onDown = () => ring.current?.classList.add('is-down');
        const onUp = () => ring.current?.classList.remove('is-down');
        const onLeave = () => {
            x = -100;
            y = -100;
        };
        const tick = () => {
            rx += (x - rx) * 0.18;
            ry += (y - ry) * 0.18;
            if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
            raf = requestAnimationFrame(tick);
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onDown);
        window.addEventListener('pointerup', onUp);
        document.addEventListener('pointerleave', onLeave);
        raf = requestAnimationFrame(tick);
        return () => {
            document.documentElement.classList.remove('sp-has-cursor');
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerdown', onDown);
            window.removeEventListener('pointerup', onUp);
            document.removeEventListener('pointerleave', onLeave);
            cancelAnimationFrame(raf);
        };
    }, [enabled]);

    if (!enabled) return null;
    return (
        <>
            <div className="sp-cursor-ring" ref={ring} aria-hidden="true" />
            <div className="sp-cursor-dot" ref={dot} aria-hidden="true" />
        </>
    );
};

export default Cursor;
