// Ink-wash paintings drawn with the 2D canvas API. Nothing here is shown directly:
// each painting is sampled and re-drawn as ASCII by asciiPainting.js.

const INK = '13,11,11';
const CRIMSON = '#c0142e';
const PINK = '#f08aa6';

const rng = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const hash1 = (n) => {
    const s = Math.sin(n * 91.345 + 47.853) * 43758.5453;
    return s - Math.floor(s);
};
const noise1 = (x) => {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return hash1(i) * (1 - u) + hash1(i + 1) * u;
};
const fbm = (x, oct = 4) => {
    let s = 0;
    let a = 0.5;
    let f = 1;
    for (let i = 0; i < oct; i++) {
        s += a * noise1(x * f + i * 17.3);
        a *= 0.5;
        f *= 2.1;
    }
    return s;
};
const ridged = (x) => {
    let s = 0;
    let a = 0.55;
    let f = 1;
    for (let i = 0; i < 4; i++) {
        s += a * (1 - Math.abs(2 * noise1(x * f + i * 7.1) - 1));
        a *= 0.48;
        f *= 2.05;
    }
    return s;
};

const ink = (a) => `rgba(${INK},${Math.max(0, Math.min(1, a))})`;

// One mountain range: paper-white body that hides what is behind it, ink darkest at
// the ridge and fading into mist further down, plus brush-stroke texture.
const range = (o, W, H, { base, amp, freq, seed, dark, depth, lit = false, texture = 1, sharp = 1 }) => {
    // Mountains as overlapping peaks (like a brush laying down each summit), roughened
    // with a little noise so the slopes are not perfectly straight.
    const pr = rng(Math.floor(seed * 977) + 1);
    // Fewer, broader peaks on narrow canvases so phones do not get needle mountains.
    const count = Math.max(2, Math.round(freq * 2.2 * Math.min(1, W / H / 2)));
    const peaks = Array.from({ length: count + 2 }, (_, i) => ({
        x: ((i - 1 + 0.15 + pr() * 0.7) / count) * W,
        h: 0.35 + pr() * 0.65,
        k: (1.1 + pr() * 1.6) * (count / W),
    }));
    const shape = (x) => {
        let m = 0;
        for (const p of peaks) m = Math.max(m, p.h - Math.abs(x - p.x) * p.k * (sharp > 0.5 ? 1 : 0.8));
        const detail = (ridged(x / W * freq * 6 + seed) - 0.5) * 0.12;
        return Math.max(0, m + detail);
    };
    const ridge = (x) => H * (base - amp * shape(x));
    const D = depth * H;
    for (let x = -2; x < W + 2; x += 1) {
        const y = ridge(x);
        o.fillStyle = '#fff';
        o.fillRect(x, y, 1.5, H - y + 2);
        let a = dark;
        if (lit) {
            // Snowy ranges: one side catches the light, the other stays in shadow.
            const slope = (ridge(x + 10) - ridge(x - 10)) / 20;
            const k = Math.max(0, Math.min(1, 0.5 + slope * 3));
            a = dark * (0.12 + 0.88 * k);
        }
        const g = o.createLinearGradient(0, y, 0, y + D);
        g.addColorStop(0, ink(a));
        g.addColorStop(0.35, ink(a * 0.55));
        g.addColorStop(1, ink(0));
        o.fillStyle = g;
        o.fillRect(x, y, 1.5, D + 2);
    }
    // Brush texture: short strokes falling down the slopes.
    const r = rng(Math.floor(seed * 1000) + 3);
    o.lineCap = 'round';
    const strokes = Math.floor((W / 3) * texture);
    for (let i = 0; i < strokes; i++) {
        const x = r() * W;
        const y0 = ridge(x);
        const y = y0 + Math.pow(r(), 1.8) * D * 0.8;
        const slope = (ridge(x + 4) - ridge(x - 4)) / 8;
        const len = 3 + r() * 9;
        const fade = 1 - (y - y0) / D;
        o.strokeStyle = ink(dark * (lit ? (slope > 0 ? 0.6 : 0.15) : 0.5) * fade);
        o.lineWidth = 0.6 + r() * 1.2;
        o.beginPath();
        o.moveTo(x, y);
        o.lineTo(x + (slope > 0 ? -1 : 1) * len * 0.5, y + len);
        o.stroke();
    }
    return ridge;
};

const mistBand = (o, W, H, y, h, a = 0.9) => {
    const g = o.createLinearGradient(0, H * (y - h), 0, H * (y + h));
    g.addColorStop(0, 'rgba(255,255,255,0)');
    g.addColorStop(0.5, `rgba(255,255,255,${a})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    o.fillStyle = g;
    o.fillRect(0, H * (y - h), W, H * h * 2);
};

const sun = (o, x, y, r) => {
    const g = o.createRadialGradient(x, y, r * 0.2, x, y, r);
    g.addColorStop(0, CRIMSON);
    g.addColorStop(0.92, CRIMSON);
    g.addColorStop(1, 'rgba(192,20,46,0)');
    o.fillStyle = g;
    o.beginPath();
    o.arc(x, y, r, 0, Math.PI * 2);
    o.fill();
};

const birds = (o, x, y, s, n, seed) => {
    const r = rng(seed);
    o.strokeStyle = ink(0.75);
    o.lineWidth = Math.max(1, s * 0.12);
    for (let i = 0; i < n; i++) {
        const bx = x + (r() - 0.5) * s * 14;
        const by = y + (r() - 0.5) * s * 6;
        const k = s * (0.6 + r() * 0.6);
        o.beginPath();
        o.moveTo(bx - k, by - k * 0.4);
        o.quadraticCurveTo(bx - k * 0.4, by - k * 0.5, bx, by);
        o.quadraticCurveTo(bx + k * 0.4, by - k * 0.5, bx + k, by - k * 0.4);
        o.stroke();
    }
};

const pagoda = (o, x, y, s) => {
    o.fillStyle = ink(0.95);
    const tiers = 4;
    let cy = y;
    for (let i = 0; i < tiers; i++) {
        const wRoof = s * (1 - i * 0.17);
        const wBody = wRoof * 0.55;
        o.fillRect(x - wBody / 2, cy - s * 0.18, wBody, s * 0.18);
        o.beginPath();
        o.moveTo(x - wRoof / 2 - s * 0.08, cy - s * 0.16);
        o.quadraticCurveTo(x - wRoof * 0.25, cy - s * 0.2, x, cy - s * 0.32);
        o.quadraticCurveTo(x + wRoof * 0.25, cy - s * 0.2, x + wRoof / 2 + s * 0.08, cy - s * 0.16);
        o.closePath();
        o.fill();
        cy -= s * 0.32;
    }
    o.fillRect(x - s * 0.02, cy - s * 0.25, s * 0.04, s * 0.27);
};

// Recursive tree. Leaves are dark tufts (pine) or red/pink blossom clusters (cherry).
const tree = (o, x, y, len, angle, depth, r, kind) => {
    const x2 = x + Math.cos(angle) * len;
    const y2 = y + Math.sin(angle) * len;
    o.strokeStyle = ink(0.95);
    o.lineWidth = Math.max(0.8, depth * 1.6);
    o.lineCap = 'round';
    o.beginPath();
    o.moveTo(x, y);
    o.quadraticCurveTo((x + x2) / 2 + (r() - 0.5) * len * 0.3, (y + y2) / 2, x2, y2);
    o.stroke();
    if (kind === 'cherry' && depth === 2) {
        for (let i = 0; i < 6; i++) {
            o.fillStyle = r() > 0.5 ? CRIMSON : PINK;
            o.beginPath();
            o.arc(x2 + (r() - 0.5) * len * 1.4, y2 + (r() - 0.5) * len, len * (0.1 + r() * 0.18), 0, Math.PI * 2);
            o.fill();
        }
    }
    if (depth <= 1) {
        if (kind === 'pine') {
            o.fillStyle = ink(0.85);
            o.beginPath();
            o.ellipse(x2, y2, len * 1.6, len * 0.45, 0, 0, Math.PI * 2);
            o.fill();
        } else {
            for (let i = 0; i < 14; i++) {
                o.fillStyle = r() > 0.45 ? CRIMSON : PINK;
                o.beginPath();
                o.arc(x2 + (r() - 0.5) * len * 2.2, y2 + (r() - 0.5) * len * 1.6, len * (0.18 + r() * 0.3), 0, Math.PI * 2);
                o.fill();
            }
        }
        return;
    }
    const spread = kind === 'pine' ? 0.9 : 0.75;
    const kids = kind === 'pine' ? 2 : depth > 3 ? 2 + Math.round(r()) : 3;
    for (let i = 0; i < kids; i++) {
        const a = angle + (i - (kids - 1) / 2) * spread * (0.6 + r() * 0.6) + (r() - 0.5) * 0.3;
        tree(o, x2, y2, len * (0.68 + r() * 0.18), kind === 'pine' ? a * 0.6 + angle * 0.4 + (i ? 0.5 : -0.5) : a, depth - 1, r, kind);
    }
};

const water = (o, W, H, top, sunX, seed) => {
    const r = rng(seed);
    o.fillStyle = '#fff';
    o.fillRect(0, H * top, W, H * (1 - top));
    if (sunX !== null) {
        for (let y = H * top + 2; y < H; y += 3.5) {
            const t = (y - H * top) / (H * (1 - top));
            const half = W * (0.05 - t * 0.02) * (0.6 + r() * 0.6);
            o.fillStyle = `rgba(192,20,46,${0.85 - t * 0.6})`;
            o.fillRect(sunX - half + (r() - 0.5) * 6, y, half * 2, 1.6);
        }
    }
    for (let i = 0; i < W / 4; i++) {
        const y = H * top + Math.pow(r(), 0.8) * H * (1 - top);
        const x = r() * W;
        const len = 8 + r() * 40;
        const near = sunX !== null && Math.abs(x - sunX) < W * 0.06;
        o.strokeStyle = near ? 'rgba(192,20,46,0.9)' : ink(0.2 + r() * 0.35);
        o.lineWidth = 1.6;
        o.beginPath();
        o.moveTo(x, y);
        o.lineTo(x + len, y);
        o.stroke();
    }
};

// ---------------------------------------------------------------- scenes

export const heroBackground = (o, W, H) => {
    const portrait = H > W;
    sun(o, W * (portrait ? 0.72 : 0.78), H * (portrait ? 0.16 : 0.2), Math.max(W * 0.075, H * 0.1));
    birds(o, W * 0.64, H * 0.16, Math.max(3, W * 0.006), 7, 4);
    range(o, W, H, { base: 0.56, amp: 0.3, freq: 1.5, seed: 1.3, dark: 0.32, depth: 0.3, texture: 0.3 });
    mistBand(o, W, H, 0.55, 0.07, 0.8);
    range(o, W, H, { base: 0.68, amp: 0.24, freq: 2.1, seed: 4.7, dark: 0.55, depth: 0.26, texture: 0.3 });
    mistBand(o, W, H, 0.68, 0.06, 0.9);
    range(o, W, H, { base: 0.8, amp: 0.14, freq: 3, seed: 9.1, dark: 0.8, depth: 0.2, texture: 0.3 });

    // Pagoda cliff on the right.
    o.fillStyle = '#fff';
    o.beginPath();
    o.moveTo(W * 0.66, H);
    o.lineTo(W * 0.74, H * 0.68);
    o.lineTo(W * 0.8, H * 0.57);
    o.lineTo(W * 0.86, H * 0.55);
    o.lineTo(W * 0.92, H * 0.6);
    o.lineTo(W * 1.02, H * 0.64);
    o.lineTo(W * 1.02, H);
    o.fill();
    const cg = o.createLinearGradient(0, H * 0.55, 0, H * 0.95);
    cg.addColorStop(0, ink(0.9));
    cg.addColorStop(1, ink(0.15));
    o.fillStyle = cg;
    o.fill();
    pagoda(o, W * 0.85, H * 0.56, Math.max(W, H) * 0.075);

    // Pine on a cliff to the left.
    o.fillStyle = '#fff';
    o.beginPath();
    o.moveTo(-2, H * 0.66);
    o.lineTo(W * 0.1, H * 0.68);
    o.lineTo(W * 0.2, H * 0.8);
    o.lineTo(W * 0.26, H);
    o.lineTo(-2, H);
    o.fill();
    const lg = o.createLinearGradient(0, H * 0.66, 0, H);
    lg.addColorStop(0, ink(0.85));
    lg.addColorStop(1, ink(0.2));
    o.fillStyle = lg;
    o.fill();
    tree(o, W * 0.08, H * 0.68, Math.max(W, H) * 0.045, -1.2, 5, rng(11), 'pine');

    mistBand(o, W, H, 0.84, 0.05, 0.9);
    water(o, W, H, 0.88, W * 0.78, 21);
    // A small red cherry tree by the water.
    tree(o, W * 0.62, H * 0.9, Math.max(W, H) * 0.03, -1.7, 4, rng(5), 'cherry');
};

// Rock and hiker, drawn on a transparent layer that sits in front of the headline.
export const heroForeground = (o, W, H) => {
    const portrait = H > W;
    const cx = W * 0.5;
    const top = H * (portrait ? 0.84 : 0.86);
    // A rock outcrop the hiker stands on.
    o.fillStyle = ink(0.9);
    o.beginPath();
    o.moveTo(cx - W * 0.3, H + 2);
    o.quadraticCurveTo(cx - W * 0.16, H * 0.94, cx - W * 0.06, top + H * 0.02);
    o.lineTo(cx - W * 0.02, top);
    o.lineTo(cx + W * 0.03, top + H * 0.004);
    o.quadraticCurveTo(cx + W * 0.12, H * 0.92, cx + W * 0.32, H + 2);
    o.closePath();
    o.fill();
    const fade = o.createLinearGradient(0, top, 0, H);
    fade.addColorStop(0, 'rgba(255,255,255,0)');
    fade.addColorStop(1, 'rgba(255,255,255,0.75)');
    o.globalCompositeOperation = 'destination-out';
    o.fillStyle = fade;
    o.fillRect(0, top, W, H - top);
    o.globalCompositeOperation = 'source-over';

    // Hiker seen from behind, like the reference posters: tall enough to cross the name.
    const s = Math.min(H * (portrait ? 0.44 : 0.5), W * (portrait ? 0.85 : 0.4));
    const fx = cx;
    const fy = top + 1;
    const P = (pts, fill) => {
        o.fillStyle = fill;
        o.beginPath();
        pts.forEach(([x, y], i) => (i ? o.lineTo(fx + x * s, fy - y * s) : o.moveTo(fx + x * s, fy - y * s)));
        o.closePath();
        o.fill();
    };
    // Trekking poles.
    o.strokeStyle = ink(0.95);
    o.lineWidth = Math.max(1.2, s * 0.012);
    o.beginPath();
    o.moveTo(fx - s * 0.17, fy - s * 0.47);
    o.lineTo(fx - s * 0.27, fy);
    o.moveTo(fx + s * 0.17, fy - s * 0.47);
    o.lineTo(fx + s * 0.26, fy);
    o.stroke();
    // Legs and boots.
    P([[-0.11, 0.46], [-0.015, 0.46], [-0.03, 0.03], [-0.1, 0.03]], ink(0.85));
    P([[0.015, 0.46], [0.11, 0.46], [0.1, 0.03], [0.03, 0.03]], ink(0.85));
    P([[-0.11, 0.045], [-0.025, 0.045], [-0.02, 0], [-0.13, 0]], ink(1));
    P([[0.025, 0.045], [0.11, 0.045], [0.13, 0], [0.02, 0]], ink(1));
    // Jacket, shoulders and arms.
    P([[-0.13, 0.48], [0.13, 0.48], [0.15, 0.7], [0.1, 0.78], [-0.1, 0.78], [-0.15, 0.7]], ink(0.72));
    P([[-0.15, 0.72], [-0.12, 0.74], [-0.15, 0.5], [-0.19, 0.48]], ink(0.8));
    P([[0.15, 0.72], [0.12, 0.74], [0.15, 0.5], [0.19, 0.48]], ink(0.8));
    // Backpack with a rolled mat on top.
    o.fillStyle = CRIMSON;
    o.beginPath();
    o.roundRect(fx - s * 0.12, fy - s * 0.79, s * 0.24, s * 0.36, s * 0.04);
    o.fill();
    o.fillStyle = '#7a0a1c';
    o.beginPath();
    o.roundRect(fx - s * 0.09, fy - s * 0.58, s * 0.18, s * 0.12, s * 0.03);
    o.fill();
    o.fillStyle = PINK;
    o.beginPath();
    o.roundRect(fx - s * 0.14, fy - s * 0.86, s * 0.28, s * 0.07, s * 0.035);
    o.fill();
    // Head with a beanie.
    o.fillStyle = ink(0.95);
    o.beginPath();
    o.arc(fx, fy - s * 0.92, s * 0.065, 0, Math.PI * 2);
    o.fill();
    o.fillStyle = ink(1);
    o.beginPath();
    o.arc(fx, fy - s * 0.94, s * 0.068, Math.PI, 0);
    o.fill();
};

export const blossomTree = (o, W, H) => {
    // Pale moon behind a cherry tree.
    o.strokeStyle = ink(0.25);
    o.lineWidth = Math.max(2, W * 0.01);
    o.beginPath();
    o.arc(W * 0.6, H * 0.3, Math.min(W, H) * 0.28, 0, Math.PI * 2);
    o.stroke();
    o.fillStyle = 'rgba(13,11,11,0.06)';
    o.fill();
    range(o, W, H, { base: 0.9, amp: 0.12, freq: 1.6, seed: 2.2, dark: 0.35, depth: 0.15, sharp: 0.4 });
    mistBand(o, W, H, 0.93, 0.05, 0.9);
    // Two leaning trunks, so the crown spreads wide and low like a real old cherry.
    tree(o, W * 0.42, H * 1.02, H * 0.17, -1.85, 6, rng(17), 'cherry');
    tree(o, W * 0.44, H * 1.02, H * 0.15, -1.2, 6, rng(23), 'cherry');
};

export const snowRange = (o, W, H) => {
    range(o, W, H, { base: 0.5, amp: 0.38, freq: 2.4, seed: 3.3, dark: 0.55, depth: 0.5, lit: true, texture: 0.6, sharp: 0.6 });
    mistBand(o, W, H, 0.72, 0.08, 0.75);
    range(o, W, H, { base: 0.75, amp: 0.32, freq: 3.2, seed: 6.6, dark: 0.85, depth: 0.45, lit: true, texture: 0.8, sharp: 0.6 });
    mistBand(o, W, H, 0.95, 0.08, 0.9);
    // A small climber with a red pack on the lower ridge.
    const s = H * 0.12;
    const x = W * 0.66;
    const y = H * 0.86;
    o.fillStyle = ink(0.95);
    o.fillRect(x - s * 0.06, y - s * 0.4, s * 0.05, s * 0.4);
    o.fillRect(x + s * 0.02, y - s * 0.38, s * 0.05, s * 0.38);
    o.fillRect(x - s * 0.1, y - s * 0.78, s * 0.2, s * 0.4);
    o.fillStyle = '#b0142c';
    o.fillRect(x - s * 0.09, y - s * 0.75, s * 0.18, s * 0.28);
    o.fillStyle = ink(0.95);
    o.beginPath();
    o.arc(x, y - s * 0.86, s * 0.07, 0, Math.PI * 2);
    o.fill();
};

export const mapPins = (o, W, H) => {
    const r = rng(8);
    // Contour lines around two hills, like a topographic map.
    [[0.32, 0.42, 9], [0.72, 0.6, 7]].forEach(([hx, hy, rings]) => {
        for (let i = 1; i <= rings; i++) {
            o.strokeStyle = ink(0.15 + i * 0.05);
            o.lineWidth = 1.2;
            o.beginPath();
            for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.05) {
                const rad = i * Math.min(W, H) * 0.045 * (1 + 0.25 * Math.sin(a * 3 + i) + 0.1 * Math.cos(a * 5));
                const px = W * hx + Math.cos(a) * rad * 1.4;
                const py = H * hy + Math.sin(a) * rad;
                if (a === 0) o.moveTo(px, py);
                else o.lineTo(px, py);
            }
            o.stroke();
        }
    });
    o.strokeStyle = 'rgba(240,138,166,0.9)';
    o.lineWidth = Math.max(4, W * 0.02);
    o.beginPath();
    o.moveTo(0, H * 0.85);
    o.bezierCurveTo(W * 0.3, H * 0.7, W * 0.5, H * 0.98, W, H * 0.8);
    o.stroke();
    for (let i = 0; i < 9; i++) {
        const x = W * (0.1 + r() * 0.8);
        const y = H * (0.15 + r() * 0.6);
        const s = Math.min(W, H) * 0.05;
        o.fillStyle = i % 4 === 0 ? ink(0.95) : CRIMSON;
        o.beginPath();
        o.moveTo(x, y);
        o.bezierCurveTo(x - s, y - s * 1.2, x - s * 0.7, y - s * 2.2, x, y - s * 2.2);
        o.bezierCurveTo(x + s * 0.7, y - s * 2.2, x + s, y - s * 1.2, x, y);
        o.fill();
    }
};

export const moonSea = (o, W, H) => {
    const g = o.createLinearGradient(0, 0, 0, H * 0.55);
    g.addColorStop(0, ink(0.7));
    g.addColorStop(1, ink(0.18));
    o.fillStyle = g;
    o.fillRect(0, 0, W, H * 0.55);
    o.fillStyle = '#fff';
    o.beginPath();
    o.arc(W * 0.5, H * 0.3, Math.min(W, H) * 0.16, 0, Math.PI * 2);
    o.fill();
    const sea = o.createLinearGradient(0, H * 0.55, 0, H);
    sea.addColorStop(0, ink(0.25));
    sea.addColorStop(1, ink(0.75));
    o.fillStyle = sea;
    o.fillRect(0, H * 0.55, W, H * 0.45);
    // Moonlight path on the water.
    o.fillStyle = 'rgba(255,255,255,0.9)';
    for (let y = H * 0.56; y < H; y += 4) o.fillRect(W * 0.5 - W * 0.06 * (0.5 + Math.sin(y) * 0.5), y, W * 0.12 * (0.5 + Math.cos(y * 1.7) * 0.5), 2);
    // Ripples spreading from one point, like a voice on water.
    for (let i = 1; i < 9; i++) {
        o.strokeStyle = i % 3 === 0 ? 'rgba(192,20,46,0.95)' : 'rgba(255,255,255,0.85)';
        o.lineWidth = 3;
        o.beginPath();
        o.ellipse(W * 0.5, H * 0.75, i * W * 0.06, i * H * 0.022, 0, 0, Math.PI * 2);
        o.stroke();
    }
    birds(o, W * 0.25, H * 0.2, Math.max(3, W * 0.012), 4, 9);
};

export const toriiWater = (o, W, H) => {
    range(o, W, H, { base: 0.45, amp: 0.2, freq: 2, seed: 7.7, dark: 0.35, depth: 0.25 });
    mistBand(o, W, H, 0.5, 0.08, 0.85);
    water(o, W, H, 0.6, null, 4);
    const cx = W * 0.5;
    const base = H * 0.86;
    const s = Math.min(W * 0.55, H * 0.75);
    o.fillStyle = CRIMSON;
    o.fillRect(cx - s * 0.32, base - s * 0.7, s * 0.06, s * 0.7);
    o.fillRect(cx + s * 0.26, base - s * 0.7, s * 0.06, s * 0.7);
    o.fillRect(cx - s * 0.4, base - s * 0.6, s * 0.8, s * 0.05);
    o.beginPath();
    o.moveTo(cx - s * 0.52, base - s * 0.78);
    o.quadraticCurveTo(cx, base - s * 0.7, cx + s * 0.52, base - s * 0.78);
    o.lineTo(cx + s * 0.48, base - s * 0.7);
    o.quadraticCurveTo(cx, base - s * 0.64, cx - s * 0.48, base - s * 0.7);
    o.closePath();
    o.fill();
    o.fillStyle = ink(0.95);
    o.fillRect(cx - s * 0.5, base - s * 0.83, s, s * 0.05);
    // Reflection.
    o.fillStyle = 'rgba(192,20,46,0.35)';
    o.fillRect(cx - s * 0.32, base, s * 0.06, s * 0.3);
    o.fillRect(cx + s * 0.26, base, s * 0.06, s * 0.3);
};

export const bamboo = (o, W, H) => {
    const r = rng(31);
    for (let i = 0; i < 9; i++) {
        const x = W * (0.05 + r() * 0.9);
        const wdt = W * (0.03 + r() * 0.03);
        const a = 0.25 + r() * 0.65;
        const lean = (r() - 0.5) * W * 0.08;
        o.fillStyle = ink(a);
        let y = H;
        while (y > -20) {
            const seg = H * (0.08 + r() * 0.06);
            const t = 1 - y / H;
            o.fillRect(x + lean * t, y - seg, wdt, seg - 3);
            y -= seg;
        }
        for (let k = 0; k < 6; k++) {
            const ly = H * r();
            const t = 1 - ly / H;
            const dir = r() > 0.5 ? 1 : -1;
            o.beginPath();
            o.moveTo(x + lean * t + wdt / 2, ly);
            o.quadraticCurveTo(x + lean * t + dir * W * 0.08, ly - H * 0.02, x + lean * t + dir * W * 0.15, ly + H * 0.03);
            o.quadraticCurveTo(x + lean * t + dir * W * 0.08, ly + H * 0.01, x + lean * t + wdt / 2, ly);
            o.fill();
        }
    }
    mistBand(o, W, H, 0.7, 0.15, 0.6);
};

export const sunsetWater = (o, W, H) => {
    const portrait = H > W;
    sun(o, W * (portrait ? 0.62 : 0.7), H * 0.55, Math.max(W * 0.13, H * 0.2));
    birds(o, W * 0.55, H * 0.25, Math.max(3, W * 0.006), 9, 13);
    range(o, W, H, { base: 0.62, amp: 0.16, freq: 2.6, seed: 5.5, dark: 0.35, depth: 0.15, sharp: 0.6 });
    mistBand(o, W, H, 0.64, 0.04, 0.8);
    range(o, W, H, { base: 0.72, amp: 0.1, freq: 3.4, seed: 8.2, dark: 0.7, depth: 0.08, sharp: 0.5 });
    water(o, W, H, 0.76, W * (portrait ? 0.62 : 0.7), 12);
    // Small boat with a figure.
    const bx = W * 0.3;
    const by = H * 0.86;
    const s = Math.max(W, H) * 0.04;
    o.fillStyle = ink(0.95);
    o.beginPath();
    o.moveTo(bx - s, by);
    o.quadraticCurveTo(bx, by + s * 0.35, bx + s, by);
    o.lineTo(bx + s * 1.2, by - s * 0.15);
    o.quadraticCurveTo(bx, by + s * 0.1, bx - s * 1.2, by - s * 0.15);
    o.fill();
    o.fillRect(bx + s * 0.2, by - s * 0.7, s * 0.12, s * 0.62);
    o.beginPath();
    o.arc(bx + s * 0.26, by - s * 0.8, s * 0.1, 0, Math.PI * 2);
    o.fill();
    o.strokeStyle = ink(0.9);
    o.lineWidth = 1.5;
    o.beginPath();
    o.moveTo(bx + s * 0.3, by - s * 0.6);
    o.lineTo(bx - s * 0.6, by + s * 0.3);
    o.stroke();
};
