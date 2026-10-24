import { useId, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import glyphs from './glyphs.json';

// Stroke data is drawn on a 1024-unit square, y down.
const UNIT = 1024;

const medianLength = (d) => {
    const points = d.match(/-?\d+(\.\d+)?/g).map(Number);
    let length = 0;
    for (let i = 2; i < points.length; i += 2) {
        length += Math.hypot(points[i] - points[i - 2], points[i + 1] - points[i - 1]);
    }
    return length;
};

// Each stroke takes as long as its length suggests, and the next one starts
// just before the last has finished, the way a hand moves on without stopping.
const schedule = (strokes, wordSeconds) => {
    const raw = strokes.map(({ m }) => Math.min(0.5, Math.max(0.16, (medianLength(m) / UNIT) * 0.42)));
    const scale = Math.min(1, wordSeconds / raw.reduce((sum, seconds) => sum + seconds * 0.82, 0));
    let at = 0;
    return raw.map((seconds) => {
        const stroke = { dur: seconds * scale, at };
        at += seconds * scale * 0.82;
        return stroke;
    });
};

// Kanji written with a brush, one stroke at a time and in true stroke order.
// `writing` starts the hand; until then the paper is blank.
const BrushKanji = ({ text, writing = true, vertical = true, seconds = 2.6, delay = 0, className = '', label }) => {
    const id = useId().replace(/[^a-zA-Z0-9]/g, '');
    const reduce = useReducedMotion();
    const [written, setWritten] = useState(false);

    const chars = useMemo(() => [...text].filter((char) => glyphs[char]), [text]);
    const timing = useMemo(
        () => schedule(chars.flatMap((char) => glyphs[char]), seconds),
        [chars, seconds]
    );

    const finished = reduce || written;
    const span = chars.length * UNIT;
    let strokeIndex = 0;

    return (
        <svg
            viewBox={vertical ? `0 0 ${UNIT} ${span}` : `0 0 ${span} ${UNIT}`}
            className={className}
            role="img"
            aria-label={label ?? text}
        >
            <filter id={`${id}-ink`} x="-4%" y="-4%" width="108%" height="108%">
                <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="5" result="grain" />
                <feDisplacementMap in="SourceGraphic" in2="grain" scale="15" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <g filter={`url(#${id}-ink)`}>
                {chars.map((char, charIndex) => (
                    <g
                        key={`${char}-${charIndex}`}
                        transform={vertical ? `translate(0 ${charIndex * UNIT})` : `translate(${charIndex * UNIT} 0)`}
                    >
                        {glyphs[char].map((stroke, index) => {
                            const order = strokeIndex++;
                            if (finished) return <path key={index} d={stroke.o} fill="currentColor" />;
                            const clip = `${id}-${charIndex}-${index}`;
                            const last = order === timing.length - 1;
                            return (
                                <g key={index}>
                                    <clipPath id={clip}>
                                        <path d={stroke.o} />
                                    </clipPath>
                                    <path
                                        d={stroke.m}
                                        pathLength="1"
                                        clipPath={`url(#${clip})`}
                                        className="brush-stroke"
                                        data-writing={writing}
                                        style={{ '--dur': `${timing[order].dur}s`, '--at': `${delay + timing[order].at}s` }}
                                        onAnimationEnd={last ? () => setWritten(true) : undefined}
                                    />
                                </g>
                            );
                        })}
                    </g>
                ))}
            </g>
        </svg>
    );
};

export default BrushKanji;
