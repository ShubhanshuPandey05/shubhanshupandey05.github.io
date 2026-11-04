import { useEffect, useRef } from 'react';
import { reducedMotion, useInView } from './lib';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/\\<>[]{}?!$@';
const pick = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

// Runs the scramble-then-write effect on an element's text. Monospace text keeps its width.
export const scrambleInto = (el, text, { delay = 0, stagger = 16, settle = 260 } = {}) => {
    if (!el) return () => {};
    if (reducedMotion()) {
        el.textContent = text;
        return () => {};
    }
    const chars = [...text];
    const start = performance.now() + delay;
    const ends = chars.map((_, i) => start + 90 + i * stagger + Math.random() * settle);
    let raf = 0;
    const tick = (t) => {
        let out = '';
        let done = true;
        for (let i = 0; i < chars.length; i++) {
            const ch = chars[i];
            if (ch === ' ' || ch === '\n' || t >= ends[i]) out += ch;
            else {
                done = false;
                out += t < start ? ch : pick();
            }
        }
        el.textContent = out;
        if (!done) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
        cancelAnimationFrame(raf);
        el.textContent = text;
    };
};

/*
 * Text that scrambles and writes itself when it first scrolls into view, and again
 * whenever `text` or `replay` changes. Screen readers get the plain text.
 */
const Scramble = ({ text, as: Tag = 'span', className, delay = 0, stagger, replay, onView = true, ...rest }) => {
    const [ref, seen] = useInView('0px 0px -8% 0px');
    const inner = useRef(null);
    const value = String(text ?? '');
    const play = onView ? seen : true;
    useEffect(() => {
        if (!play) return undefined;
        return scrambleInto(inner.current, value, { delay, stagger });
    }, [play, value, delay, stagger, replay]);
    return (
        <Tag ref={ref} className={className} {...rest}>
            <span className="ax-sr">{value}</span>
            <span ref={inner} aria-hidden="true">
                {value}
            </span>
        </Tag>
    );
};

export default Scramble;
