// Builds "frames": a target character for every cell of the grid.
// A frame is { g: glyph per cell, t: tone (opacity) per cell, o: write order 0..1, count }.

import { POSTER, RN, RX, RY, SUB, SUBX, SUBY, glyphIndex } from './glyphs';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

const emptyFrame = (n) => ({ g: new Uint8Array(n), t: new Float32Array(n), o: new Float32Array(n), count: 0 });

// Average SUB x SUB sub-pixels into RX x RY regions for one cell.
const regionVector = (ink, W, cx, cy, out) => {
    const x0 = cx * SUBX;
    const y0 = cy * SUBY;
    let total = 0;
    for (let ry = 0; ry < RY; ry++) {
        for (let rx = 0; rx < RX; rx++) {
            let s = 0;
            for (let y = 0; y < SUB; y++) {
                const row = (y0 + ry * SUB + y) * W + x0 + rx * SUB;
                for (let x = 0; x < SUB; x++) s += ink[row + x];
            }
            const v = s / (SUB * SUB);
            out[ry * RX + rx] = v;
            total += v;
        }
    }
    return total / RN;
};

const canvas2d = (w, h) => {
    const c = document.createElement('canvas');
    c.width = Math.max(1, w);
    c.height = Math.max(1, h);
    return [c, c.getContext('2d', { willReadFrequently: true })];
};

/*
 * The portrait. The image is fitted into the grid (bottom-anchored so the
 * crop at the arms sits on the edge), sampled per cell, and every cell gets
 * the glyph whose shape best matches that patch of the photo.
 */
export const portraitFrame = (geo, image, opt = {}) => {
    const { cols, rows, cellW, cellH, dark, match } = geo;
    const N = cols * rows;
    const frame = emptyFrame(N);
    if (!image || !image.naturalWidth || !image.naturalHeight) return frame;

    const mx = opt.marginX ?? 1;
    const mTop = opt.marginTop ?? 1;
    const mBottom = opt.marginBottom ?? 0;
    const availW = Math.max(1, cols - mx * 2) * cellW;
    const availH = Math.max(1, rows - mTop - mBottom) * cellH;
    const aspect = image.naturalWidth / image.naturalHeight;
    let pw = availW;
    let ph = pw / aspect;
    if (ph > availH) {
        ph = availH;
        pw = ph * aspect;
    }
    const wc = Math.max(2, Math.round(pw / cellW));
    const hc = Math.max(2, Math.round(ph / cellH));
    const align = opt.align ?? 0.5;
    const c0 = clamp(Math.round((cols - wc) * align), 0, cols - wc);
    const r0 = opt.anchor === 'center' ? Math.floor((rows - hc) / 2) : rows - mBottom - hc;

    const W = wc * SUBX;
    const H = hc * SUBY;
    const [, ctx] = canvas2d(W, H);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, W, H);
    const px = ctx.getImageData(0, 0, W, H).data;

    const gamma = opt.gamma ?? (dark ? 1.15 : 1.0);
    const floor = opt.floor ?? (dark ? 0.06 : 0.05);
    const edgeGain = opt.edge ?? (dark ? 0.9 : 1.4);
    const alpha = new Float32Array(W * H);
    const ink = new Float32Array(W * H);
    for (let i = 0, p = 0; i < W * H; i++, p += 4) {
        const a = px[p + 3] / 255;
        alpha[i] = a;
        const l = px[p] / 255;
        const v = Math.pow(dark ? l : 1 - l, gamma);
        ink[i] = a * (floor + (1 - floor) * v);
    }
    // Trace the silhouette so the outline survives where the tone matches the background.
    if (edgeGain > 0) {
        for (let y = 1; y < H - 1; y++) {
            for (let x = 1; x < W - 1; x++) {
                const i = y * W + x;
                const e = Math.abs(alpha[i + 1] - alpha[i - 1]) + Math.abs(alpha[i + W] - alpha[i - W]);
                if (e > 0.05) ink[i] = Math.max(ink[i], Math.min(1, e * edgeGain));
            }
        }
    }

    const v = new Float32Array(RN);
    // Opacity follows the local ink too, so tone separates skin from hair from glasses.
    const toneMin = opt.toneMin ?? 0.24;
    const toneRef = opt.toneRef ?? 0.62;
    const toneExp = opt.toneExp ?? 0.85;
    let count = 0;
    for (let cy = 0; cy < hc; cy++) {
        const r = r0 + cy;
        if (r < 0 || r >= rows) continue;
        for (let cx = 0; cx < wc; cx++) {
            const c = c0 + cx;
            const mean = regionVector(ink, W, cx, cy, v);
            const g = match(v);
            if (!g) continue;
            const i = r * cols + c;
            frame.g[i] = g;
            frame.t[i] = Math.round((toneMin + (1 - toneMin) * Math.pow(clamp(mean / toneRef, 0, 1), toneExp)) * 24) / 24;
            frame.o[i] = clamp((0.84 * cy) / hc + 0.16 * Math.random(), 0, 1);
            count++;
        }
    }
    frame.count = count;
    frame.box = { c0, r0, wc, hc };
    frame.sweep = opt.sweep ?? 1300;
    return frame;
};

// Text for the inside of the letters: upper case, spaces shown as soft dots.
const fillStream = (text) => {
    const clean = (text || '').toUpperCase().replace(/\s+/g, ' ').trim();
    const src = `${clean} · `;
    let i = 0;
    return () => {
        const ch = src[i % src.length];
        i++;
        return ch === ' ' ? '·' : ch;
    };
};

/*
 * A word scene: the lines are set in a heavy display face, rasterised into the
 * grid, and the cells inside the letters are filled, in reading order, with the
 * section's own text. Edge cells get shape-matched glyphs so the outline is crisp.
 */
export const wordsFrame = (geo, spec) => {
    const { cols, rows, cellW, cellH, match } = geo;
    const N = cols * rows;
    const frame = emptyFrame(N);
    const lines = (spec.lines || []).filter(Boolean);
    if (!lines.length) return frame;

    const mx = spec.marginX ?? Math.max(2, Math.round(cols * 0.06));
    const myTop = spec.marginTop ?? Math.max(2, Math.round(rows * 0.08));
    const myBottom = spec.marginBottom ?? Math.max(2, Math.round(rows * 0.08));
    const wc = Math.max(4, cols - mx * 2);
    const hc = Math.max(4, rows - myTop - myBottom);
    const boxW = wc * cellW;
    const boxH = hc * cellH;

    const W = wc * SUBX;
    const H = hc * SUBY;
    const [, ctx] = canvas2d(W, H);
    ctx.setTransform(SUBX / cellW, 0, 0, SUBY / cellH, 0, 0);
    const weight = spec.weight ?? 400;
    const face = spec.font ?? POSTER;
    ctx.font = `${weight} 100px ${face}`;
    const widths = lines.map((l) => ctx.measureText(l).width);
    const capM = ctx.measureText('HXE');
    const cap = (capM.actualBoundingBoxAscent || 72) / 100;
    const gap = spec.gap ?? 0.13;
    const n = lines.length;
    const maxW = Math.max(...widths);
    const fitW = ((boxW * (spec.fillWidth ?? 0.96)) / maxW) * 100;
    const fitH = (boxH * (spec.fillHeight ?? 0.62)) / (n * cap + (n - 1) * gap);
    const size = Math.max(8, Math.min(fitW, fitH));
    ctx.font = `${weight} ${size}px ${face}`;
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'alphabetic';
    const blockH = n * cap * size + (n - 1) * gap * size;
    const blockW = (maxW * size) / 100;
    const vAlign = spec.vAlign ?? 0.5;
    let y = (boxH - blockH) * vAlign + cap * size;
    const left = (boxW - blockW) * (spec.align ?? 0);
    lines.forEach((line, k) => {
        const w = (widths[k] * size) / 100;
        const x = spec.align === 0.5 ? (boxW - w) / 2 : left;
        ctx.fillText(line, x, y);
        y += (cap + gap) * size;
    });
    const px = ctx.getImageData(0, 0, W, H).data;
    const ink = new Float32Array(W * H);
    for (let i = 0, p = 3; i < W * H; i++, p += 4) ink[i] = px[p] / 255;

    const next = fillStream(spec.fill || lines.join(' '));
    const v = new Float32Array(RN);
    const blockTop = Math.floor(((boxH - blockH) * vAlign) / cellH);
    const blockRows = Math.ceil(blockH / cellH);
    let count = 0;
    for (let cy = 0; cy < hc; cy++) {
        const r = myTop + cy;
        for (let cx = 0; cx < wc; cx++) {
            const c = mx + cx;
            const cov = regionVector(ink, W, cx, cy, v);
            if (cov < 0.1) continue;
            const i = r * cols + c;
            let g;
            let tone;
            if (cov >= 0.5) {
                const ch = next();
                g = glyphIndex(ch);
                tone = ch === '·' ? 0.5 : 1;
            } else {
                g = (geo.edgeMatch || match)(v);
                tone = 0.9;
            }
            if (!g) continue;
            frame.g[i] = g;
            frame.t[i] = tone;
            frame.o[i] = clamp(0.8 * (cx / wc) + 0.2 * ((cy - blockTop) / Math.max(1, blockRows)) + (Math.random() - 0.5) * 0.06, 0, 1);
            count++;
        }
    }

    // Small captions above and below the word, typed first.
    const blockLeft = mx + Math.floor(left / cellW);
    const caption = (text, r, delay) => {
        if (!text || r < 0 || r >= rows) return;
        const s = text.slice(0, Math.max(0, cols - blockLeft - 1));
        for (let k = 0; k < s.length; k++) {
            const ch = s[k];
            if (ch === ' ') continue;
            const i = r * cols + blockLeft + k;
            frame.g[i] = glyphIndex(ch);
            frame.t[i] = 0.78;
            frame.o[i] = clamp(delay + (k / Math.max(12, s.length)) * 0.35, 0, 1);
            count++;
        }
    };
    if (spec.captions !== false && cellH >= 8.5) {
        caption(spec.top, myTop + blockTop - 3, 0);
        caption(spec.bottom, myTop + blockTop + blockRows + 2, 0.55);
    }

    frame.count = count;
    frame.sweep = spec.sweep ?? 1250;
    return frame;
};
