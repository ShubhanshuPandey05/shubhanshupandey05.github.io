// A whole landscape drawn with text characters on one canvas:
// sky, a crimson sun setting behind a snow-capped peak, layered ranges, drifting mist,
// a rippling lake, a swaying cherry tree, falling petals, and the name spelled out in
// characters that scatter away from the cursor and drift back home.

const INK = '#141010';
const PAPER = '#f7f3ee';
const PINKS = ['#f7b6c8', '#ef8fab', '#e46a8c', '#ffd1dc', '#c21a36', '#f2a1b6'];
const PETAL_CHARS = ['*', '✿', "'", '.', '❀', '`', ','];

// Deterministic hash noise so the landscape is identical on every load.
const hash = (n) => {
    const s = Math.sin(n * 127.1) * 43758.5453;
    return s - Math.floor(s);
};
const noise = (x) => {
    const i = Math.floor(x);
    const f = x - i;
    const u = f * f * (3 - 2 * f);
    return hash(i) * (1 - u) + hash(i + 1) * u;
};
const pick = (arr, r) => arr[Math.floor(r * arr.length) % arr.length];

// Cherry tree in a 1600x1000 design space (mirrored so it reaches in from the right).
const BRANCHES = [
    [[150, 1010], [170, 900], [118, 822], [190, 742], 44],
    [[190, 742], [250, 672], [232, 612], [300, 542], 34],
    [[300, 542], [380, 472], [470, 452], [560, 402], 22],
    [[560, 402], [650, 352], [720, 332], [820, 302], 15],
    [[560, 402], [600, 332], [640, 292], [700, 232], 11],
    [[820, 302], [880, 292], [930, 262], [990, 252], 8],
    [[700, 232], [730, 192], [780, 172], [840, 150], 7],
    [[300, 542], [290, 462], [250, 402], [230, 322], 18],
    [[230, 322], [215, 262], [240, 202], [220, 140], 12],
    [[230, 322], [170, 282], [120, 272], [50, 232], 10],
    [[238, 205], [300, 165], [350, 150], [412, 112], 7],
    [[190, 742], [120, 702], [70, 692], [-10, 662], 14],
    [[440, 457], [462, 522], [522, 562], [602, 582], 7],
    [[650, 352], [700, 382], [760, 420], [822, 432], 7],
];
const CLUSTERS = [
    [990, 252, 1.1], [840, 150, 1], [700, 232, 1.2], [820, 302, 1.1], [822, 432, 0.9],
    [602, 582, 1], [560, 402, 0.9], [412, 112, 1], [220, 140, 1.2], [50, 232, 1.1],
    [-10, 662, 1], [480, 445, 0.8], [650, 330, 0.9], [905, 272, 0.8], [130, 700, 0.8],
    [262, 262, 0.8], [350, 150, 0.8], [760, 180, 0.7], [380, 500, 0.6],
];

const bezier = (p0, p1, p2, p3, t) => {
    const m = 1 - t;
    return [
        m * m * m * p0[0] + 3 * m * m * t * p1[0] + 3 * m * t * t * p2[0] + t * t * t * p3[0],
        m * m * m * p0[1] + 3 * m * m * t * p1[1] + 3 * m * t * t * p2[1] + t * t * t * p3[1],
    ];
};

export const createAsciiScene = (canvas, { firstName, lastName, reducedMotion }) => {
    const ctx = canvas.getContext('2d');
    const bg = document.createElement('canvas');
    const bgx = bg.getContext('2d');

    let w = 0;
    let h = 0;
    let dpr = 1;
    let fs = 13;
    let cw = 8;
    let chh = 15;
    let cols = 0;
    let rows = 0;
    let font = '';
    let tree = [];
    let lcw = 8;
    let lch = 15;
    let letters = [];
    let petals = [];
    let lakeTop = 0;
    let mistRows = [];
    let sun = { x: 0, y: 0, r: 0 };
    const pointer = { x: -9999, y: -9999, vx: 0, active: false };
    let gust = 0;
    let raf = 0;
    let running = false;
    let last = 0;
    let t0 = performance.now();

    // ---------- geometry helpers (u, v are 0..1 across the canvas) ----------
    const fujiTop = () => (w < 700 ? 0.52 : 0.5);
    const fujiK = () => Math.max(0.32, Math.min(1.1, (0.78 * w) / h));
    const fuji = (u) => {
        const d = Math.max(0, Math.abs(u - 0.5) - 0.025);
        return fujiTop() + d * fujiK() + 0.006 * Math.sin(u * 80);
    };
    const backRange = (u) => 0.6 - 0.1 * noise(u * 4 + 1) - 0.05 * noise(u * 11 + 7);
    const midRange = (u) => 0.71 - 0.08 * noise(u * 5 + 13) - 0.03 * noise(u * 17 + 2);
    const hills = (u) => 0.86 - 0.035 * noise(u * 3 + 21) - 0.015 * noise(u * 13);

    const ridgeChar = (f, u, du) => {
        const a = f(u - du);
        const b = f(u + du);
        const c = f(u);
        if (c < a && c < b) return '^';
        const slope = (b - a) / (2 * du);
        if (slope < -0.25) return '/';
        if (slope > 0.25) return '\\';
        return slope < 0 ? '_' : '-';
    };

    // ---------- static layers: drawn once per resize ----------
    const drawBackground = () => {
        bg.width = w * dpr;
        bg.height = h * dpr;
        bgx.setTransform(dpr, 0, 0, dpr, 0, 0);
        bgx.fillStyle = PAPER;
        bgx.fillRect(0, 0, w, h);
        bgx.font = font;
        bgx.textBaseline = 'top';

        const put = (c, r, ch, color) => {
            bgx.fillStyle = color;
            bgx.fillText(ch, c * cw, r * chh);
        };
        const du = 1 / cols;

        sun = { x: w * 0.5, y: h * (fujiTop() - 0.01), r: Math.min(w, h) * (w < 700 ? 0.24 : 0.15) };
        lakeTop = Math.floor(rows * 0.9);

        for (let r = 0; r < rows; r++) {
            const v = r / rows;
            for (let c = 0; c < cols; c++) {
                const u = c / cols;
                const px = c * cw + cw / 2;
                const py = r * chh + chh / 2;
                const rnd = hash(c * 7.13 + r * 91.7);

                if (r >= lakeTop) continue; // the lake is animated
                const hv = hills(u);
                if (v >= hv) {
                    const edge = v - hv < 1.2 / rows;
                    put(c, r, edge ? ridgeChar(hills, u, du) : pick(['#', '%', '&', '@', '#'], rnd), INK);
                    continue;
                }
                const fv = fuji(u);
                if (v >= fv) {
                    const depth = v - fv;
                    const cap = 0.085 + 0.03 * Math.sin(u * 70) + 0.02 * noise(u * 30);
                    const edge = depth < 1.2 / rows;
                    if (edge) put(c, r, ridgeChar(fuji, u, du), INK);
                    else if (v < fujiTop() + cap) put(c, r, pick(["'", '.', '*', ':', ' ', '.'], rnd), '#b9aea8');
                    else {
                        // Woodcut hatching: diagonal strokes that follow each flank.
                        const left = u < 0.5;
                        const onLine = (left ? c + r : c - r + 999) % 3 === 0;
                        const dense = depth > 0.22;
                        if (onLine) put(c, r, left ? '/' : '\\', INK);
                        else if (dense && rnd > 0.45) put(c, r, pick([':', '.', '#'], rnd), '#3a2e2e');
                        else if (rnd > 0.8) put(c, r, '.', '#6b5f5c');
                    }
                    continue;
                }
                const mv = midRange(u);
                if (v >= mv) {
                    const edge = v - mv < 1.2 / rows;
                    if (edge) put(c, r, ridgeChar(midRange, u, du), '#5f5352');
                    else if (rnd > 0.35) put(c, r, pick([':', '.', '+', ':'], rnd), '#a39791');
                    continue;
                }
                const dx = px - sun.x;
                const dy = py - sun.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < sun.r) {
                    // Horizontal gaps across the lower half, like a woodblock sun.
                    const k = (py - sun.y) / sun.r;
                    const band = k > 0.05 && Math.sin(k * k * 30) > 0.55;
                    if (!band) put(c, r, pick(['@', '#', '%', '8', '&'], rnd), dist > sun.r * 0.92 ? '#c21a36' : '#9b0d23');
                    continue;
                }
                const bvv = backRange(u);
                if (v >= bvv) {
                    const edge = v - bvv < 1.2 / rows;
                    put(c, r, edge ? ridgeChar(backRange, u, du) : pick(['.', ':', '.', "'", ' '], rnd), edge ? '#a89c96' : '#cbbfb8');
                    continue;
                }
                if (Math.abs(dist - sun.r * 1.18) < cw * 0.6 && rnd > 0.55) {
                    put(c, r, '.', '#c21a36');
                    continue;
                }
                // Sparse sky texture and a couple of long cloud streaks.
                const cloud = noise(u * 6 + Math.floor(v * 40) * 3.1) > 0.82 && v < 0.35 && rnd > 0.35;
                if (cloud) put(c, r, rnd > 0.7 ? '~' : '-', '#d8cdc6');
                else if (rnd > 0.985) put(c, r, '.', '#cfc4bd');
            }
        }

        mistRows = [];
        const m0 = Math.floor(rows * 0.74);
        for (let r = m0; r < m0 + Math.max(3, Math.floor(rows * 0.06)); r++) mistRows.push(r);
    };

    // ---------- cherry tree ----------
    const buildTree = () => {
        tree = [];
        const occupied = new Map();
        const s = Math.min(w / 1600, h / 1000) * (w < 700 ? 0.85 : 0.62);
        const ox = w + (w < 700 ? 30 : 40);
        const oy = h * 1.0 - 1000 * s;
        const map = ([x, y]) => [ox - x * s, oy + y * s];

        BRANCHES.forEach(([p0, p1, p2, p3, width]) => {
            const P = [p0, p1, p2, p3].map(map);
            const steps = 90;
            let prev = bezier(...P, 0);
            for (let i = 1; i <= steps; i++) {
                const pt = bezier(...P, i / steps);
                const dx = pt[0] - prev[0];
                const dy = pt[1] - prev[1];
                const ang = Math.atan2(dy, dx);
                const a = Math.abs(Math.cos(ang));
                let ch = '|';
                if (a > 0.85) ch = '_';
                else if (a > 0.35) ch = dx * dy > 0 ? '\\' : '/';
                const rad = Math.max(cw * 0.6, ((width * s) / 2) * (1 - (i / steps) * 0.35));
                for (let yy = -rad; yy <= rad; yy += chh * 0.8) {
                    for (let xx = -rad; xx <= rad; xx += cw * 0.8) {
                        if (xx * xx + yy * yy > rad * rad) continue;
                        const c = Math.floor((pt[0] + xx) / cw);
                        const r = Math.floor((pt[1] + yy) / chh);
                        if (c < 0 || c >= cols || r < 0 || r >= rows) continue;
                        const key = r * 10000 + c;
                        const inner = xx * xx + yy * yy < rad * rad * 0.35 && rad > cw * 1.5;
                        occupied.set(key, { c, r, ch: inner ? pick(['#', '%', '|'], hash(key)) : ch, color: INK, kind: 0 });
                    }
                }
                prev = pt;
            }
        });

        CLUSTERS.forEach(([x, y, sc], ci) => {
            const [cx, cy] = map([x, y]);
            const R = 85 * sc * s;
            for (let yy = -R; yy <= R; yy += chh) {
                for (let xx = -R * 1.3; xx <= R * 1.3; xx += cw) {
                    const d = Math.sqrt((xx / 1.3) ** 2 + yy ** 2) / R;
                    const c = Math.floor((cx + xx) / cw);
                    const r = Math.floor((cy + yy) / chh);
                    if (c < 0 || c >= cols || r < 0 || r >= rows) continue;
                    const key = r * 10000 + c;
                    const rnd = hash(key * 1.7 + ci);
                    const n = noise((cx + xx) * 0.04 + ci) * 0.5;
                    if (d + n * 0.6 > 1 || rnd < d * 0.55) continue;
                    occupied.set(key, {
                        c,
                        r,
                        ch: pick(['@', '*', 'o', '%', '&', '✿', '8', '*', '@'], rnd),
                        color: pick(PINKS, hash(key + 3.3)),
                        kind: 1,
                    });
                }
            }
        });

        occupied.forEach((cell) => {
            // Cells higher up and further from the trunk sway more.
            const reach = Math.max(0, (w - cell.c * cw) / (w * 0.6));
            cell.sway = Math.min(1, reach) * (1 - cell.r / rows) * 1.4 + 0.1;
            tree.push(cell);
        });
    };

    // ---------- the name, made of characters ----------
    const buildLetters = () => {
        const off = document.createElement('canvas');
        off.width = w;
        off.height = h;
        const o = off.getContext('2d');
        const maxW = w * (w < 700 ? 0.88 : 0.7);
        let size = 200;
        o.font = `900 ${size}px Fraunces, Georgia, serif`;
        const m1 = o.measureText(firstName.toUpperCase()).width;
        size = Math.min(size * (maxW / m1), h * (w < 700 ? 0.13 : 0.21));
        const top = h * (w < 700 ? 0.07 : 0.04);
        o.textAlign = 'center';
        o.textBaseline = 'top';
        o.fillStyle = '#000';
        o.font = `900 ${size}px Fraunces, Georgia, serif`;
        o.fillText(firstName.toUpperCase(), w / 2, top);
        const line1Bottom = top + size * 0.9;
        o.font = `italic 900 ${size * 0.9}px Fraunces, Georgia, serif`;
        o.fillText(lastName.toUpperCase(), w / 2 + size * 0.4, line1Bottom);

        const data = o.getImageData(0, 0, w, h).data;
        letters = [];
        // On small screens the name uses a finer mosaic than the rest of the scene.
        lcw = w < 700 ? cw * 0.6 : cw;
        lch = w < 700 ? chh * 0.6 : chh;
        const lcols = Math.ceil(w / lcw);
        const lrows = Math.ceil(h / lch);
        for (let r = 0; r < lrows; r++) {
            for (let c = 0; c < lcols; c++) {
                const x = Math.floor(c * lcw + lcw / 2);
                const y = Math.floor(r * lch + lch / 2);
                if (x >= w || y >= h) continue;
                const hit = (xx, yy) => xx >= 0 && yy >= 0 && xx < w && yy < h && data[(yy * w + xx) * 4 + 3] > 110;
                const qy = Math.floor(lch / 3);
                const qx = Math.floor(lcw / 4);
                if (!hit(x, y) && !hit(x, y - qy) && !hit(x, y + qy) && !hit(x - qx, y) && !hit(x + qx, y)) continue;
                const second = y > line1Bottom;
                const rnd = hash(r * 3001 + c);
                const hx = c * lcw;
                const hy = r * lch;
                letters.push({
                    hx,
                    hy,
                    x: reducedMotion ? hx : Math.random() * w,
                    y: reducedMotion ? hy : -Math.random() * h * 0.6,
                    vx: 0,
                    vy: 0,
                    ch: second ? pick(['%', '@', '&', '#', '%', '@'], rnd) : pick(['#', '@', '#', '&', '$', '#'], rnd),
                    color: second ? '#9b0d23' : INK,
                    glyph: second ? (rnd > 0.8 ? '#f7b6c8' : '#d9475f') : rnd > 0.9 ? '#c21a36' : '#5a4c4c',
                });
            }
        }
    };

    // ---------- petals ----------
    const makePetal = (x, y, burst = false) => {
        const a = Math.random() * Math.PI * 2;
        const sp = burst ? 1.5 + Math.random() * 3 : 0;
        return {
            x: x ?? Math.random() * w,
            y: y ?? -20 - Math.random() * h * 0.3,
            vx: burst ? Math.cos(a) * sp : -0.2 + Math.random() * 0.5,
            vy: burst ? Math.sin(a) * sp - 1 : 0.3 + Math.random() * 0.6,
            rot: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.05,
            phase: Math.random() * 10,
            ch: pick(PETAL_CHARS, Math.random()),
            color: pick(PINKS, Math.random()),
            size: fs * (0.9 + Math.random() * 0.7),
            life: burst ? 1 : Infinity,
        };
    };

    const resize = () => {
        const rect = canvas.getBoundingClientRect();
        w = Math.max(1, Math.floor(rect.width));
        h = Math.max(1, Math.floor(rect.height));
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fs = w < 700 ? 9 : w < 1200 ? 11 : 12;
        font = `${fs}px "JetBrains Mono", ui-monospace, monospace`;
        ctx.font = font;
        cw = ctx.measureText('M').width;
        chh = Math.round(fs * 1.12);
        cols = Math.ceil(w / cw);
        rows = Math.ceil(h / chh);
        drawBackground();
        buildTree();
        buildLetters();
        petals = Array.from({ length: w < 700 ? 26 : 48 }, () => {
            const p = makePetal();
            p.y = Math.random() * h;
            return p;
        });
    };

    // ---------- per-frame drawing ----------
    const groupDraw = (items, getX, getY) => {
        const byColor = new Map();
        items.forEach((it) => {
            if (!byColor.has(it.color)) byColor.set(it.color, []);
            byColor.get(it.color).push(it);
        });
        byColor.forEach((list, color) => {
            ctx.fillStyle = color;
            list.forEach((it) => ctx.fillText(it.ch, getX(it), getY(it)));
        });
    };

    const frame = (now) => {
        if (!running) return;
        raf = requestAnimationFrame(frame);
        if (now - last < 33) return; // ~30fps is plenty for a calm scene
        last = now;
        const t = (now - t0) / 1000;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.drawImage(bg, 0, 0, w, h);
        ctx.font = font;
        ctx.textBaseline = 'top';

        // Mist drifting slowly across the foot of the mountains.
        mistRows.forEach((r, i) => {
            for (let c = 0; c < cols; c++) {
                const n = noise(c * 0.08 + t * (0.15 + i * 0.05) + i * 10);
                if (n < 0.5) continue;
                ctx.fillStyle = `rgba(247,243,238,${Math.min(0.92, (n - 0.5) * 2.6)})`;
                ctx.fillRect(c * cw, r * chh, cw + 0.5, chh + 0.5);
                if (n > 0.62) {
                    ctx.fillStyle = '#c9bdb6';
                    ctx.fillText(n > 0.75 ? '~' : '-', c * cw, r * chh);
                }
            }
        });

        // Lake: crimson ripples with the sun's reflection.
        for (let r = lakeTop; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * cw;
                const wave = Math.sin(c * 0.35 + t * 1.2 + r * 1.7) + Math.sin(c * 0.11 - t * 0.7);
                const nearSun = Math.abs(x - sun.x) < sun.r * (0.9 - (r - lakeTop) * 0.06);
                ctx.fillStyle = nearSun && wave > 0 ? '#ef8fab' : wave > 0.6 ? '#c21a36' : '#7d0a1c';
                ctx.fillText(wave > 1 ? '~' : wave > -0.2 ? '=' : '-', x, r * chh);
            }
        }

        // Tree: blossoms twinkle and every cell sways a little.
        const sway = (it) => it.c * cw + Math.sin(t * 0.7 + it.r * 0.04) * it.sway * 4 + Math.sin(t * 1.9 + it.c * 0.1) * it.sway * 0.8;
        if (!reducedMotion && Math.random() < 0.9) {
            for (let i = 0; i < 6; i++) {
                const cell = tree[Math.floor(Math.random() * tree.length)];
                if (cell && cell.kind === 1) {
                    cell.ch = pick(['@', '*', 'o', '%', '&', '✿', '8'], Math.random());
                    cell.color = pick(PINKS, Math.random());
                }
            }
        }
        groupDraw(tree, sway, (it) => it.r * chh);

        // The name: each character springs home and flees the cursor.
        letters.forEach((p) => {
            if (!reducedMotion) {
                const dx = p.x - pointer.x;
                const dy = p.y - pointer.y;
                const d2 = dx * dx + dy * dy;
                const R = w < 700 ? 60 : 110;
                if (pointer.active && d2 < R * R) {
                    const d = Math.sqrt(d2) || 1;
                    const f = (1 - d / R) * 6;
                    p.vx += (dx / d) * f + pointer.vx * 0.05;
                    p.vy += (dy / d) * f;
                }
                p.vx += (p.hx - p.x) * 0.045;
                p.vy += (p.hy - p.y) * 0.045;
                p.vx *= 0.82;
                p.vy *= 0.82;
                p.x += p.vx;
                p.y += p.vy;
            }
        });
        // Each letter cell is a small solid tile with a light character punched into it,
        // so the name reads clearly while still being made of text.
        const tiles = new Map();
        letters.forEach((p) => {
            if (!tiles.has(p.color)) tiles.set(p.color, []);
            tiles.get(p.color).push(p);
        });
        tiles.forEach((list, color) => {
            ctx.fillStyle = color;
            list.forEach((p) => ctx.fillRect(p.x, p.y, lcw + 0.6, lch + 0.6));
        });
        if (lcw >= cw) groupDraw(letters.map((p) => ({ ...p, color: p.glyph })), (p) => p.x, (p) => p.y);

        // Petals.
        gust *= 0.97;
        for (let i = petals.length - 1; i >= 0; i--) {
            const p = petals[i];
            if (!reducedMotion) {
                p.vy += p.life === Infinity ? 0 : 0.04;
                p.x += p.vx + Math.sin(t * 1.1 + p.phase) * 0.5 + gust;
                p.y += p.vy;
                p.rot += p.spin + gust * 0.01;
                if (p.life !== Infinity) {
                    p.vx *= 0.98;
                    p.life -= 0.012;
                    if (p.life <= 0 || p.y > h) {
                        petals.splice(i, 1);
                        continue;
                    }
                }
            }
            if (p.life === Infinity && (p.y > lakeTop * chh || p.x < -30 || p.x > w + 30)) {
                Object.assign(p, makePetal(), { x: gust < 0 ? w + 10 : Math.random() * w });
            }
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.globalAlpha = Math.min(1, p.life);
            ctx.fillStyle = p.color;
            ctx.font = `${p.size}px "JetBrains Mono", monospace`;
            ctx.fillText(p.ch, 0, 0);
            ctx.restore();
        }
        ctx.font = font;

        if (reducedMotion) {
            running = false;
        }
    };

    const start = () => {
        if (running) return;
        running = true;
        last = 0;
        raf = requestAnimationFrame(frame);
    };
    const stop = () => {
        running = false;
        cancelAnimationFrame(raf);
    };

    const setPointer = (x, y, active) => {
        pointer.vx = active && pointer.active ? x - pointer.x : 0;
        gust = Math.max(-3, Math.min(3, gust + pointer.vx * 0.01));
        pointer.x = x;
        pointer.y = y;
        pointer.active = active;
    };

    const burst = (x, y, n = 14) => {
        for (let i = 0; i < n; i++) petals.push(makePetal(x, y, true));
    };

    // Drop a few petals from the canopy (used when a note plays).
    const shake = () => {
        const blossoms = tree.filter((c) => c.kind === 1);
        for (let i = 0; i < 3; i++) {
            const c = blossoms[Math.floor(Math.random() * blossoms.length)];
            if (c) petals.push(Object.assign(makePetal(c.c * cw, c.r * chh, false), { life: 3 }));
        }
    };

    resize();
    return { start, stop, resize, setPointer, burst, shake };
};
