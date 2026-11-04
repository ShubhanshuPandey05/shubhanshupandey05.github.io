// Everything that depends on the grid font: cell metrics, the shape of each
// character (used to pick the character that best matches a patch of image),
// and pre-rendered glyph sprites (used to draw thousands of cells quickly).

export const MONO = '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
// Tall condensed poster face for the stage's big words: tall letters, thick strokes.
export const POSTER = '"Anton", Impact, "Arial Narrow", sans-serif';

// Cell height as a multiple of the font size. Glyph ink may overhang a little.
export const LINE = 1.12;

// Printable ASCII (index 0 is the space). Only these are used to draw the portrait.
const ASCII = (() => {
    let s = ' ';
    for (let c = 33; c < 127; c++) s += String.fromCharCode(c);
    return s;
})();
export const MATCH_COUNT = ASCII.length;

// A few extra glyphs that only appear inside written text.
export const CHARS = ASCII + '·—→↗×';
export const glyphIndex = (() => {
    const map = new Map();
    [...CHARS].forEach((ch, i) => map.set(ch, i));
    return (ch) => map.get(ch) ?? map.get('?');
})();

// Glyphs that flicker through a cell while it scrambles.
export const SCRAMBLE = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=/\\<>[]{}?!$@'].map(glyphIndex);

// Each cell is split into RX x RY regions; a character's "shape" is how much
// ink it puts in each region. Images are sampled the same way.
export const RX = 2;
export const RY = 3;
export const RN = RX * RY;
export const SUB = 3; // image sub-pixels per region side
export const SUBX = RX * SUB;
export const SUBY = RY * SUB;

const probe = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;

// Advance width and where to put the baseline so glyphs sit centred in a cell.
export const fontMetrics = (size, family = MONO) => {
    probe.font = `400 ${size}px ${family}`;
    const adv = probe.measureText('M').width || size * 0.6;
    const tall = probe.measureText('|[]{}()');
    const deep = probe.measureText('gjpqy|[]()');
    const up = tall.actualBoundingBoxAscent || size * 0.82;
    const down = deep.actualBoundingBoxDescent || size * 0.24;
    const cellH = size * LINE;
    const base = (cellH - (up + down)) / 2 + up;
    return { adv, cellH, base, up, down };
};

// Coverage of every glyph in every region, normalised per region so the
// densest glyph reaches 1 (the scale images are sampled on).
let shapeCache = null;
export const glyphShapes = (family = MONO) => {
    if (shapeCache && shapeCache.family === family) return shapeCache.data;
    const S = 64;
    const m = fontMetrics(S, family);
    const w = Math.round(m.adv);
    const h = Math.round(m.cellH);
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    const data = new Float32Array(MATCH_COUNT * RN);
    for (let g = 1; g < MATCH_COUNT; g++) {
        ctx.clearRect(0, 0, w, h);
        ctx.font = `400 ${S}px ${family}`;
        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(ASCII[g], (w - m.adv) / 2, m.base);
        const px = ctx.getImageData(0, 0, w, h).data;
        for (let ry = 0; ry < RY; ry++) {
            const y0 = Math.round((ry * h) / RY);
            const y1 = Math.round(((ry + 1) * h) / RY);
            for (let rx = 0; rx < RX; rx++) {
                const x0 = Math.round((rx * w) / RX);
                const x1 = Math.round(((rx + 1) * w) / RX);
                let sum = 0;
                for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) sum += px[(y * w + x) * 4 + 3];
                data[g * RN + ry * RX + rx] = sum / (255 * (x1 - x0) * (y1 - y0));
            }
        }
    }
    for (let k = 0; k < RN; k++) {
        let max = 0;
        for (let g = 0; g < MATCH_COUNT; g++) max = Math.max(max, data[g * RN + k]);
        if (max > 0) for (let g = 0; g < MATCH_COUNT; g++) data[g * RN + k] /= max;
    }
    shapeCache = { family, data };
    return data;
};

// Finds the glyph whose shape is closest to a sampled region vector.
// `gamma` exaggerates the contrast inside a cell so edges come out crisp.
export const makeMatcher = (shapes, { gamma = 1.8, levels = 12, exclude = '', only = '' } = {}) => {
    const cache = new Map();
    const q = new Float32Array(RN);
    const skip = new Set([...exclude].map((ch) => ASCII.indexOf(ch)).filter((i) => i > 0));
    if (only) {
        for (let g = 1; g < MATCH_COUNT; g++) if (!only.includes(ASCII[g])) skip.add(g);
    }
    return (v) => {
        let max = 0;
        for (let k = 0; k < RN; k++) if (v[k] > max) max = v[k];
        if (max < 0.035) return 0;
        let key = 0;
        for (let k = 0; k < RN; k++) {
            const e = Math.pow(v[k] / max, gamma) * max;
            const b = Math.min(levels - 1, Math.floor(e * levels));
            key = key * levels + b;
            q[k] = (b + 0.5) / levels;
        }
        const hit = cache.get(key);
        if (hit !== undefined) return hit;
        let best = 0;
        let bestD = Infinity;
        for (let g = 0; g < MATCH_COUNT; g++) {
            if (skip.has(g)) continue;
            let d = 0;
            for (let k = 0; k < RN; k++) {
                const diff = q[k] - shapes[g * RN + k];
                d += diff * diff;
            }
            if (d < bestD) {
                bestD = d;
                best = g;
            }
        }
        cache.set(key, best);
        return best;
    };
};

// One sprite per glyph per colour, drawn at device resolution.
export const buildAtlas = ({ size, dpr, colors, family = MONO }) => {
    const m = fontMetrics(size, family);
    const pad = Math.ceil(size * 0.3 * dpr);
    const padX = Math.ceil(size * 0.1 * dpr);
    const gw = Math.ceil(m.adv * dpr) + padX * 2;
    const gh = Math.ceil(m.cellH * dpr) + pad * 2;
    const canvas = document.createElement('canvas');
    canvas.width = gw * CHARS.length;
    canvas.height = gh * colors.length;
    const ctx = canvas.getContext('2d');
    ctx.font = `400 ${size * dpr}px ${family}`;
    ctx.textBaseline = 'alphabetic';
    colors.forEach((color, ci) => {
        ctx.fillStyle = color;
        for (let g = 1; g < CHARS.length; g++) ctx.fillText(CHARS[g], g * gw + padX, ci * gh + pad + m.base * dpr);
    });
    return { canvas, gw, gh, pad, padX, cellW: m.adv, cellH: m.cellH };
};
