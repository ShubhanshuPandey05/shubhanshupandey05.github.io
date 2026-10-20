// Renders a painted scene as dense ASCII, like a photo printed in characters.
//
// 1. A "painter" draws an ink-wash scene onto a hidden canvas with ordinary 2D drawing.
// 2. Each character cell samples that painting: darker areas get denser characters,
//    red areas are drawn in crimson or pink.
// 3. Every frame, drifting mist, falling petals and the cursor are layered on top.

const DEFAULT_RAMP = " .'`,:;-~=+*ricxzvunoaeswmXZUO0Q8%#&@$";
const PETALS = ['✿', '*', "'", '❀', '.', ','];

const hash = (n) => {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
};

// Tileable-ish value noise texture, sampled every frame for the mist.
const makeNoise = (size = 256) => {
    const base = new Float32Array(size * size);
    for (let i = 0; i < base.length; i++) base[i] = hash(i * 0.731);
    const smooth = (x, y) => {
        const xi = Math.floor(x);
        const yi = Math.floor(y);
        const xf = x - xi;
        const yf = y - yi;
        const at = (a, b) => base[((b % size + size) % size) * size + ((a % size + size) % size)];
        const u = xf * xf * (3 - 2 * xf);
        const v = yf * yf * (3 - 2 * yf);
        return (at(xi, yi) * (1 - u) + at(xi + 1, yi) * u) * (1 - v) + (at(xi, yi + 1) * (1 - u) + at(xi + 1, yi + 1) * u) * v;
    };
    const tex = new Float32Array(size * size);
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            tex[y * size + x] = smooth(x / 16, y / 8) * 0.55 + smooth(x / 7, y / 4) * 0.3 + smooth(x / 3, y / 2) * 0.15;
        }
    }
    return (x, y) => tex[((Math.floor(y) % size + size) % size) * size + ((Math.floor(x) % size + size) % size)];
};
const noise = makeNoise();

export const createAsciiPainting = (canvas, opts) => {
    const {
        paint,
        fontSize = (w) => (w < 700 ? 7 : 9),
        mist = [],
        petals = null,
        transparent = false,
        background = '#f7f3ee',
        ink = '#1b1515',
        inkMid = '#6b6060',
        inkSoft = '#ada3a0',
        crimson = '#a3122a',
        pink = '#e8829d',
        reducedMotion = false,
        cursorMist = true,
        fps = 20,
        ramp: RAMP = DEFAULT_RAMP,
        edgeThreshold = 0.9,
    } = opts;

    const ctx = canvas.getContext('2d');
    let w = 0;
    let h = 0;
    let dpr = 1;
    let fs = 9;
    let cw = 5.4;
    let ch = 10;
    let cols = 0;
    let rows = 0;
    let dark = new Float32Array(0);
    let tone = new Uint8Array(0);
    let jitter = new Float32Array(0);
    let edge = new Uint8Array(0);
    let backing = [];
    let flying = [];
    let raf = 0;
    let running = false;
    let last = 0;
    const pointer = { x: -1e4, y: -1e4 };
    const t0 = performance.now();

    const resize = () => {
        const rect = canvas.getBoundingClientRect();
        w = Math.max(1, Math.round(rect.width));
        h = Math.max(1, Math.round(rect.height));
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fs = fontSize(w);
        ctx.font = `500 ${fs}px "JetBrains Mono", ui-monospace, monospace`;
        cw = ctx.measureText('M').width;
        ch = Math.round(fs * 1.12);
        cols = Math.ceil(w / cw);
        rows = Math.ceil(h / ch);

        // Paint at half resolution, then sample one point per character cell.
        const pw = Math.max(1, Math.round(w / 2));
        const ph = Math.max(1, Math.round(h / 2));
        const off = document.createElement('canvas');
        off.width = pw;
        off.height = ph;
        const o = off.getContext('2d');
        if (!transparent) {
            o.fillStyle = '#fff';
            o.fillRect(0, 0, pw, ph);
        }
        paint(o, pw, ph);
        const data = o.getImageData(0, 0, pw, ph).data;

        const solid = new Uint8Array(cols * rows);
        dark = new Float32Array(cols * rows);
        tone = new Uint8Array(cols * rows);
        jitter = new Float32Array(cols * rows);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const i = r * cols + c;
                let R = 0;
                let G = 0;
                let B = 0;
                let A = 0;
                // Average two samples per cell for smoother tones.
                for (let s = 0; s < 2; s++) {
                    const x = Math.min(pw - 1, Math.floor(((c + 0.3 + s * 0.4) * cw) / 2));
                    const y = Math.min(ph - 1, Math.floor(((r + 0.3 + s * 0.4) * ch) / 2));
                    const k = (y * pw + x) * 4;
                    R += data[k];
                    G += data[k + 1];
                    B += data[k + 2];
                    A += data[k + 3];
                }
                R /= 2;
                G /= 2;
                B /= 2;
                A /= 2 * 255;
                const lum = (0.3 * R + 0.59 * G + 0.11 * B) / 255;
                const raw = transparent ? A * (1 - lum * 0.85) : 1 - lum;
                // Characters cover far less of their cell than their ramp position suggests,
                // so lift the mid-tones and drop near-white paper to keep shapes readable.
                const d = Math.max(0, Math.min(1, (raw - 0.035) / 0.8));
                dark[i] = d > 0 ? Math.pow(d, 0.8) : 0;
                if (transparent && A > 0.6) solid[i] = 1;
                const red = R - (G + B) / 2;
                tone[i] = red > 50 && A > 0.1 ? (lum < 0.55 ? 1 : 2) : 0;
                jitter[i] = (hash(i * 1.37) - 0.5) * 0.06;
            }
        }
        // On a transparent layer, opaque shapes get a paper backing so they hide what is behind
        // them (the hiker standing in front of the name). Stored as row runs.
        backing = [];
        if (transparent) {
            for (let r = 0; r < rows; r++) {
                let run = -1;
                for (let c = 0; c <= cols; c++) {
                    const on = c < cols && solid[r * cols + c];
                    if (on && run < 0) run = c;
                    if (!on && run >= 0) {
                        backing.push(run * cw, r * ch, (c - run) * cw, ch);
                        run = -1;
                    }
                }
            }
        }

        // Outline silhouettes: where the tone changes sharply, swap in a line character
        // that follows the edge, the way hand-made ASCII art draws ridgelines.
        edge = new Uint8Array(cols * rows);
        const at = (c, r) => dark[Math.max(0, Math.min(rows - 1, r)) * cols + Math.max(0, Math.min(cols - 1, c))];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const i = r * cols + c;
                if (dark[i] < 0.12) continue;
                const gx = at(c + 1, r - 1) + 2 * at(c + 1, r) + at(c + 1, r + 1) - at(c - 1, r - 1) - 2 * at(c - 1, r) - at(c - 1, r + 1);
                const gy = at(c - 1, r + 1) + 2 * at(c, r + 1) + at(c + 1, r + 1) - at(c - 1, r - 1) - 2 * at(c, r - 1) - at(c + 1, r - 1);
                const mag = Math.hypot(gx, gy);
                if (mag < edgeThreshold) continue;
                // Only the darker side of the edge gets the line.
                const nx = gx / mag;
                const ny = gy / mag;
                if (at(Math.round(c + nx), Math.round(r + ny)) > dark[i] + 0.02) continue;
                let a = (Math.atan2(gy, gx) * 180) / Math.PI;
                if (a < 0) a += 180;
                edge[i] = a < 22.5 || a >= 157.5 ? 124 : a < 67.5 ? 47 : a < 112.5 ? 95 : 92; // | / _ \
            }
        }
        flying = [];
    };

    const spawnPetal = (initial) => {
        const p = petals;
        return {
            x: (p.x0 + Math.random() * (p.x1 - p.x0)) * w,
            y: initial ? Math.random() * h : (p.y0 + Math.random() * (p.y1 - p.y0)) * h,
            vx: -0.25 - Math.random() * 0.5,
            vy: 0.35 + Math.random() * 0.6,
            ph: Math.random() * 10,
            ch: PETALS[Math.floor(Math.random() * PETALS.length)],
            color: Math.random() > 0.4 ? pink : crimson,
            size: fs * (1.1 + Math.random() * 0.8),
        };
    };

    const draw = (now) => {
        const t = (now - t0) / 1000;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (transparent) {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = background;
            for (let j = 0; j < backing.length; j += 4) ctx.fillRect(backing[j], backing[j + 1], backing[j + 2] + 0.5, backing[j + 3] + 0.5);
        } else {
            ctx.fillStyle = background;
            ctx.fillRect(0, 0, w, h);
        }
        ctx.font = `500 ${fs}px "JetBrains Mono", ui-monospace, monospace`;
        ctx.textBaseline = 'top';

        // Ink characters are split into three greys so far hills stay pale and near rocks read black.
        const buckets = [[], [], [], [], []];
        const n = RAMP.length - 1;
        const mistAt = mist.map((m) => ({ ...m, y0: m.y * rows, hh: m.h * rows }));
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const i = r * cols + c;
                let d = dark[i] + jitter[i];
                if (mistAt.length) {
                    let m = 0;
                    for (let k = 0; k < mistAt.length; k++) {
                        const band = mistAt[k];
                        const dy = (r - band.y0) / band.hh;
                        if (dy > -1.5 && dy < 1.5) {
                            const env = Math.exp(-dy * dy * 2);
                            m += env * band.a * Math.min(1, Math.max(0, noise(c * 0.5 + t * band.speed * 40, r + k * 37) * 1.6 - 0.25));
                        }
                    }
                    if (cursorMist && m > 0) {
                        const dx = c * cw - pointer.x;
                        const dyp = r * ch - pointer.y;
                        const dist2 = dx * dx + dyp * dyp;
                        if (dist2 < 140 * 140) m *= Math.sqrt(dist2) / 140;
                    }
                    d = d * (1 - Math.min(0.95, m));
                }
                if (d < 0.07) continue;
                const idx = edge[i] ? -edge[i] : Math.max(1, Math.min(n, Math.round(d * n)));
                const b = tone[i] ? tone[i] + 2 : edge[i] ? 2 : d < 0.34 ? 0 : d < 0.62 ? 1 : 2;
                buckets[b].push(c, r, idx);
            }
        }
        const paintBucket = (list, color) => {
            ctx.fillStyle = color;
            for (let j = 0; j < list.length; j += 3) {
                const k = list[j + 2];
                ctx.fillText(k < 0 ? String.fromCharCode(-k) : RAMP[k], list[j] * cw, list[j + 1] * ch);
            }
        };
        paintBucket(buckets[0], inkSoft);
        paintBucket(buckets[1], inkMid);
        paintBucket(buckets[2], ink);
        paintBucket(buckets[3], crimson);
        paintBucket(buckets[4], pink);

        if (petals) {
            while (flying.length < petals.count) flying.push(spawnPetal(flying.length < petals.count && last === 0));
            for (let j = 0; j < flying.length; j++) {
                const p = flying[j];
                if (!reducedMotion) {
                    p.x += p.vx + Math.sin(t * 1.3 + p.ph) * 0.4;
                    p.y += p.vy;
                }
                if (p.y > h + 10 || p.x < -20) flying[j] = spawnPetal(false);
                ctx.fillStyle = p.color;
                ctx.font = `${p.size}px "JetBrains Mono", monospace`;
                ctx.fillText(p.ch, p.x, p.y);
            }
        }
    };

    const frame = (now) => {
        if (!running) return;
        raf = requestAnimationFrame(frame);
        if (now - last < 1000 / fps) return;
        draw(now);
        last = now;
    };

    const start = () => {
        if (running) return;
        if (reducedMotion) {
            draw(performance.now());
            return;
        }
        running = true;
        raf = requestAnimationFrame(frame);
    };
    const stop = () => {
        running = false;
        cancelAnimationFrame(raf);
    };
    const setPointer = (x, y) => {
        pointer.x = x;
        pointer.y = y;
    };

    resize();
    return { start, stop, resize: () => { resize(); draw(performance.now()); }, setPointer };
};
