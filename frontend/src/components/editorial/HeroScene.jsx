import { memo } from 'react';

// Tiny deterministic PRNG so the blossoms land in the same place every render.
const rng = (seed) => () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
};

const BLOSSOM_COLORS = ['#9b0d23', '#c21a36', '#f1c9cf', '#ffffff', '#e48a99', '#5e0614'];

const branches = [
    { d: 'M150 1010 C170 900 118 822 190 742 C250 672 232 612 300 542', w: 46 },
    { d: 'M300 542 C380 472 470 452 560 402 C650 352 720 332 820 302', w: 26 },
    { d: 'M560 402 C600 332 640 292 700 232', w: 14 },
    { d: 'M820 302 C880 292 930 262 990 252', w: 10 },
    { d: 'M700 232 C730 192 780 172 840 150', w: 8 },
    { d: 'M300 542 C290 462 250 402 230 322 C215 262 240 202 220 140', w: 20 },
    { d: 'M230 322 C170 282 120 272 50 232', w: 12 },
    { d: 'M238 205 C300 165 350 150 412 112', w: 9 },
    { d: 'M190 742 C120 702 70 692 -10 662', w: 16 },
    { d: 'M440 457 C462 522 522 562 602 582', w: 9 },
    { d: 'M650 352 C700 382 760 420 822 432', w: 8 },
    { d: 'M110 690 C90 640 60 610 20 590', w: 6 },
];

const clusters = [
    [990, 252, 1.1], [840, 150, 1], [700, 232, 1.2], [820, 302, 1.1], [822, 432, 0.9],
    [602, 582, 1], [560, 402, 0.9], [412, 112, 1], [220, 140, 1.2], [50, 232, 1.1],
    [-10, 662, 1], [480, 445, 0.8], [650, 330, 0.9], [905, 272, 0.8], [130, 700, 0.8],
    [262, 262, 0.8], [350, 150, 0.8], [20, 590, 0.7], [760, 180, 0.7], [380, 500, 0.6],
];

const buildBlossoms = () => {
    const r = rng(7);
    const blobs = [];
    const flowers = [];
    clusters.forEach(([cx, cy, s], i) => {
        for (let b = 0; b < 6; b++) {
            blobs.push({
                key: `${i}-${b}`,
                cx: cx + (r() - 0.5) * 120 * s,
                cy: cy + (r() - 0.5) * 80 * s,
                rad: (24 + r() * 34) * s,
                fill: r() > 0.5 ? '#f6dade' : '#efc2c9',
            });
        }
        const n = Math.round(14 * s + r() * 6);
        for (let f = 0; f < n; f++) {
            const a = r() * Math.PI * 2;
            const d = Math.sqrt(r()) * 78 * s;
            flowers.push({
                key: `${i}-f${f}`,
                x: cx + Math.cos(a) * d,
                y: cy + Math.sin(a) * d * 0.75,
                sc: 0.55 + r() * 0.8,
                rot: r() * 72,
                color: BLOSSOM_COLORS[Math.floor(r() * BLOSSOM_COLORS.length)],
            });
        }
    });
    return { blobs, flowers };
};

const { blobs, flowers } = buildBlossoms();

// Layered woodblock-style landscape: crimson sun, three mountain ranges,
// a snow-capped peak, mist, and a cherry tree reaching in from the left.
// Each layer reads --mx / --my from the parent for mouse parallax.
const HeroScene = () => (
    <svg
        className="ed-scene"
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMax slice"
        aria-hidden="true"
    >
        <defs>
            <symbol id="ed-flower" viewBox="-12 -12 24 24" overflow="visible">
                {[0, 72, 144, 216, 288].map((a) => (
                    <path
                        key={a}
                        d="M0 0 C-5 -4 -5 -9 -2 -11 L0 -9 L2 -11 C5 -9 5 -4 0 0Z"
                        fill="currentColor"
                        transform={`rotate(${a})`}
                    />
                ))}
                <circle r="1.8" fill="#5e0614" />
            </symbol>
            <mask id="ed-sun-mask">
                <rect x="0" y="0" width="1600" height="1000" fill="white" />
                {[470, 505, 535, 562, 586, 607].map((y, i) => (
                    <rect key={y} x="0" y={y} width="1600" height={4 + i * 2} fill="black" />
                ))}
            </mask>
            <linearGradient id="ed-mist" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#f7f3ee" stopOpacity="0" />
                <stop offset="0.5" stopColor="#f7f3ee" stopOpacity="0.95" />
                <stop offset="1" stopColor="#f7f3ee" stopOpacity="0" />
            </linearGradient>
            <pattern id="ed-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
                <line x1="0" y1="0" x2="0" y2="6" stroke="#0d0b0b" strokeWidth="1" opacity="0.18" />
            </pattern>
        </defs>

        {/* Sun */}
        <g className="ed-layer" style={{ '--depth': 6 }}>
            <circle cx="1130" cy="400" r="230" fill="#9b0d23" mask="url(#ed-sun-mask)" />
            <circle cx="1130" cy="400" r="262" fill="none" stroke="#9b0d23" strokeWidth="1.5" strokeDasharray="2 10" />
        </g>

        {/* Distant range */}
        <g className="ed-layer" style={{ '--depth': 12 }}>
            <path
                d="M-40 640 L120 540 L210 585 L360 470 L470 560 L560 520 L700 610 L860 520 L940 560 L1010 500 L1240 610 L1400 470 L1520 540 L1660 500 L1660 1000 L-40 1000Z"
                fill="#e2d9d1"
            />
        </g>

        {/* Middle range */}
        <g className="ed-layer" style={{ '--depth': 20 }}>
            <path
                d="M-40 760 L80 690 L200 730 L330 620 L450 700 L540 660 L640 740 L720 700 L1280 740 L1380 650 L1480 700 L1660 620 L1660 1000 L-40 1000Z"
                fill="#b9aea7"
            />
            <path
                d="M-40 760 L80 690 L200 730 L330 620 L450 700 L540 660 L640 740 L720 700 L1280 740 L1380 650 L1480 700 L1660 620 L1660 1000 L-40 1000Z"
                fill="url(#ed-hatch)"
            />
        </g>

        {/* The great peak */}
        <g className="ed-layer" style={{ '--depth': 30 }}>
            <path d="M480 1000 L955 508 Q1050 486 1145 508 L1680 1000Z" fill="#0d0b0b" />
            <path
                d="M955 508 Q1050 486 1145 508 L1282 645 L1242 618 L1206 664 L1172 612 L1124 656 L1080 602 L1036 660 L996 606 L948 652 L902 612 L824 645Z"
                fill="#f7f3ee"
            />
            <path d="M1050 497 L1050 500" stroke="#9b0d23" strokeWidth="2" />
        </g>

        {/* Mist */}
        <g className="ed-layer ed-mist" style={{ '--depth': 36 }}>
            <rect x="-60" y="760" width="1720" height="90" fill="url(#ed-mist)" opacity="0.8" />
        </g>

        {/* Foreground hills */}
        <g className="ed-layer" style={{ '--depth': 44 }}>
            <path d="M-40 900 Q220 820 470 880 T980 910 Q1240 860 1660 900 L1660 1000 L-40 1000Z" fill="#0d0b0b" />
            <path d="M-40 940 Q300 900 700 950 T1660 935 L1660 1000 L-40 1000Z" fill="#9b0d23" />
        </g>

        {/* Cherry tree, mirrored so it reaches in from the right */}
        <g className="ed-layer" style={{ '--depth': 56 }}>
            <g transform="translate(1720 110) scale(-0.89 0.89)">
            <g className="ed-tree">
                {blobs.map((b) => (
                    <circle key={b.key} cx={b.cx} cy={b.cy} r={b.rad} fill={b.fill} opacity="0.85" />
                ))}
                {branches.map((b, i) => (
                    <path
                        key={i}
                        d={b.d}
                        fill="none"
                        stroke="#0d0b0b"
                        strokeWidth={b.w}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                ))}
                {flowers.map((f) => (
                    <use
                        key={f.key}
                        href="#ed-flower"
                        x={-12}
                        y={-12}
                        width={24}
                        height={24}
                        transform={`translate(${f.x} ${f.y}) rotate(${f.rot}) scale(${f.sc})`}
                        style={{ color: f.color }}
                    />
                ))}
            </g>
            </g>
        </g>
    </svg>
);

export default memo(HeroScene);
