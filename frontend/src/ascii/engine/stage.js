// The character stage: one grid of glyphs on a canvas that moves between
// frames (the portrait, then each section's text). Every change is the same
// animation: the old characters scramble, then the new ones are written in.

import { SCRAMBLE, buildAtlas } from './glyphs';

const COOL = 560; // ms a freshly written glyph keeps its sunset colour
const STEP = 52; // ms between flickers while a cell scrambles
const WRITE_DELAY = 360;
const PAST = -1e9; // a time long ago: the cell is settled and has cooled
const COOL_STEPS = 3; // cooling colours baked into the sprite sheet, so every cell is one draw

const rand = Math.random;

const rgb = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const mix = (a, b, t) => {
    const x = rgb(a);
    const y = rgb(b);
    return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * t)).join(',')})`;
};

// Sprite rows: ink, each heat colour, then each heat colour part-way cooled back to ink.
const spriteColors = (palette) => {
    const rows = [palette.ink, ...palette.heat];
    for (let l = 1; l <= COOL_STEPS; l++) palette.heat.forEach((h) => rows.push(mix(h, palette.ink, l / (COOL_STEPS + 1))));
    return rows;
};

export class Stage {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.builders = new Map();
        this.frames = new Map();
        this.current = null;
        this.geo = null;
        this.atlas = null;
        this.raf = 0;
        this.idle = 0;
        this.busyUntil = 0;
        this.reduced = false;
        this.visible = true;
        this.lastPointer = 0;
        this.warmGen = 0;
        this.fullUntil = 0;
        this.fullPending = false;
        this.live = new Set(); // cells animating on their own (idle flicker, pointer lens)
        this.tone = 0;
        this.listeners = new Set();
        this.loop = this.loop.bind(this);
    }

    onChange(fn) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    emit() {
        const f = this.current && this.frames.get(this.current);
        const info = { scene: this.current, cols: this.geo?.cols || 0, rows: this.geo?.rows || 0, count: f?.count || 0 };
        this.listeners.forEach((fn) => fn(info));
    }

    define(id, builder) {
        this.builders.set(id, builder);
        this.frames.delete(id);
    }

    // Throw away a scene's frame (its source changed) and redraw it if it is on screen.
    invalidate(id) {
        this.frames.delete(id);
        if (this.geo && this.current === id) this.show(id);
        this.prewarm();
    }

    frame(id) {
        if (!this.geo) return null;
        let f = this.frames.get(id);
        if (!f) {
            const build = this.builders.get(id);
            if (!build) return null;
            f = build(this.geo);
            this.frames.set(id, f);
        }
        return f;
    }

    // Build every scene's frame ahead of time, one per idle moment, so a scroll never waits on it.
    prewarm() {
        const gen = ++this.warmGen;
        const ids = [...this.builders.keys()].filter((id) => !this.frames.has(id));
        const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 120));
        const step = () => {
            if (gen !== this.warmGen || !this.geo) return;
            const id = ids.shift();
            if (id && this.builders.has(id)) this.frame(id);
            if (ids.length) idle(step, { timeout: 1500 });
        };
        if (ids.length) idle(step, { timeout: 1500 });
    }

    // Grid size, device scale and colours. Rebuilds everything; the current scene is redrawn at once.
    configure({ width, height, dpr, fontSize, palette, dark, match, edgeMatch }) {
        const atlas = buildAtlas({ size: fontSize, dpr, colors: spriteColors(palette) });
        const cols = Math.max(1, Math.floor(width / atlas.cellW));
        const rows = Math.max(1, Math.floor(height / atlas.cellH));
        this.canvas.width = Math.round(width * dpr);
        this.canvas.height = Math.round(height * dpr);
        this.atlas = atlas;
        this.heatRows = palette.heat.length;
        this.geo = { cols, rows, cellW: atlas.cellW, cellH: atlas.cellH, dark, match, edgeMatch, fontSize, width, height };
        const N = cols * rows;
        this.N = N;
        this.tg = new Uint8Array(N);
        this.tt = new Float32Array(N);
        this.pg = new Uint8Array(N);
        this.pt = new Float32Array(N);
        this.t0 = new Float64Array(N).fill(PAST);
        this.t1 = new Float64Array(N).fill(PAST);
        this.ph = new Float32Array(N);
        for (let i = 0; i < N; i++) this.ph[i] = rand();
        this.xs = new Int32Array(cols);
        this.ys = new Int32Array(rows);
        this.heatOf = new Uint8Array(rows);
        for (let c = 0; c < cols; c++) this.xs[c] = Math.round(c * atlas.cellW * dpr) - atlas.padX;
        for (let r = 0; r < rows; r++) {
            this.ys[r] = Math.round(r * atlas.cellH * dpr) - atlas.pad;
            this.heatOf[r] = Math.min(this.heatRows - 1, Math.floor((r / rows) * this.heatRows));
        }
        this.frames.clear();
        this.live.clear();
        this.fullUntil = 0;
        if (this.current) this.show(this.current, { instant: true });
        else this.draw(performance.now());
        this.prewarm();
    }

    // New colours (theme switch): the scene re-renders with the usual scramble.
    recolor({ palette, dark, match, edgeMatch }) {
        if (!this.geo) return;
        const { fontSize, width } = this.geo;
        const dpr = this.canvas.width / width;
        this.atlas = buildAtlas({ size: fontSize, dpr, colors: spriteColors(palette) });
        this.heatRows = palette.heat.length;
        this.geo = { ...this.geo, dark, match, edgeMatch };
        this.frames.clear();
        if (this.current) this.show(this.current);
        this.prewarm();
    }

    setReduced(v) {
        this.reduced = v;
    }

    setVisible(v) {
        this.visible = v;
        if (!v) {
            cancelAnimationFrame(this.raf);
            this.raf = 0;
            clearTimeout(this.idle);
        } else {
            this.kick(performance.now() + 30);
        }
    }

    // Move to a scene. Old glyphs scramble; new ones resolve in the frame's write order.
    show(id, { instant = false } = {}) {
        this.current = id;
        const f = this.frame(id);
        if (!f) return;
        const now = performance.now();
        const { tg, tt, pg, pt, t0, t1, N } = this;
        const fast = instant || this.reduced;
        const sweep = f.sweep || 1000;
        let until = now;
        for (let i = 0; i < N; i++) {
            const g = f.g[i];
            const tone = f.t[i];
            if (fast) {
                tg[i] = g;
                tt[i] = tone;
                pg[i] = g;
                pt[i] = tone;
                t0[i] = PAST;
                t1[i] = PAST;
                continue;
            }
            const pending = now < t0[i];
            const scrambling = !pending && now < t1[i];
            const shownG = pending ? pg[i] : tg[i];
            const shownT = pending ? pt[i] : tt[i];
            if (!scrambling && shownG === g) {
                tg[i] = g;
                tt[i] = tone;
                pg[i] = g;
                pt[i] = tone;
                if (pending) {
                    t0[i] = PAST;
                    t1[i] = PAST;
                }
                continue;
            }
            if (!scrambling) {
                pg[i] = shownG;
                pt[i] = shownT;
            }
            tg[i] = g;
            tt[i] = tone;
            const write = now + WRITE_DELAY + f.o[i] * sweep + rand() * 140;
            if (scrambling) {
                t1[i] = g ? write : now + 80 + rand() * 520;
            } else if (shownG) {
                t0[i] = now + rand() * 280;
                t1[i] = g ? Math.max(write, t0[i] + 140) : t0[i] + 160 + rand() * 560;
            } else {
                t1[i] = write;
                t0[i] = Math.max(now, write - (150 + rand() * 320));
            }
            if (t1[i] > until) until = t1[i];
        }
        this.emit();
        if (fast) {
            this.draw(now);
            return;
        }
        this.fullUntil = Math.max(this.fullUntil, until + COOL);
        this.fullPending = true;
        this.kick(until + COOL);
    }

    // A lens of scrambling glyphs that follows the pointer (canvas CSS px).
    pointer(x, y) {
        if (this.reduced || !this.geo) return;
        const now = performance.now();
        if (now - this.lastPointer < 24) return;
        this.lastPointer = now;
        const { cols, rows, cellW, cellH } = this.geo;
        const R = Math.max(34, cellW * 7);
        const c = x / cellW;
        const r = y / cellH;
        const rc = Math.ceil(R / cellW);
        const rr = Math.ceil(R / cellH);
        const { tg, tt, pg, pt, t0, t1 } = this;
        let touched = false;
        for (let yy = Math.max(0, Math.floor(r - rr)); yy <= Math.min(rows - 1, Math.ceil(r + rr)); yy++) {
            for (let xx = Math.max(0, Math.floor(c - rc)); xx <= Math.min(cols - 1, Math.ceil(c + rc)); xx++) {
                const d = Math.hypot((xx + 0.5 - c) * cellW, (yy + 0.5 - r) * cellH) / R;
                if (d > 1) continue;
                const i = yy * cols + xx;
                if (now < t1[i] + 60) continue;
                if (!tg[i] && rand() > 0.22 * (1 - d)) continue;
                pg[i] = tg[i];
                pt[i] = tt[i];
                t0[i] = now;
                t1[i] = now + 90 + rand() * 240 + d * 140;
                this.live.add(i);
                touched = true;
            }
        }
        if (touched) this.kick(now + 520 + COOL);
    }

    // A ring of scrambling glyphs spreading from a click.
    ripple(x, y) {
        if (this.reduced || !this.geo) return;
        const now = performance.now();
        const { cols, rows, cellW, cellH } = this.geo;
        const { tg, tt, pg, pt, t0, t1 } = this;
        let until = now;
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const i = r * cols + c;
                if (!tg[i] && rand() > 0.04) continue;
                if (now < t1[i]) continue;
                const d = Math.hypot((c + 0.5) * cellW - x, (r + 0.5) * cellH - y);
                pg[i] = tg[i];
                pt[i] = tt[i];
                t0[i] = now + d * 1.15;
                t1[i] = t0[i] + 110 + rand() * 170;
                if (t1[i] > until) until = t1[i];
            }
        }
        this.fullUntil = Math.max(this.fullUntil, until + COOL);
        this.fullPending = true;
        this.kick(until + COOL);
    }

    // Now and then a few glyphs flicker, so the picture never looks like a screenshot.
    scheduleIdle() {
        clearTimeout(this.idle);
        if (this.reduced || !this.visible || !this.geo) return;
        this.idle = setTimeout(() => {
            const now = performance.now();
            const { tg, tt, pg, pt, t0, t1, N } = this;
            let hits = 0;
            for (let tries = 0; tries < 60 && hits < 7; tries++) {
                const i = (rand() * N) | 0;
                if (!tg[i] || now < t1[i]) continue;
                pg[i] = tg[i];
                pt[i] = tt[i];
                t0[i] = now + rand() * 200;
                t1[i] = t0[i] + 70 + rand() * 220;
                this.live.add(i);
                hits++;
            }
            this.kick(now + 520 + COOL);
        }, 900 + rand() * 1600);
    }

    kick(until) {
        if (until > this.busyUntil) this.busyUntil = until;
        if (!this.raf && this.visible) this.raf = requestAnimationFrame(this.loop);
    }

    loop() {
        this.raf = 0;
        const now = performance.now();
        if (now < this.fullUntil || this.fullPending) {
            // A scene change or ripple touches most cells: redraw everything (and once more after it ends).
            this.fullPending = now < this.fullUntil;
            this.draw(now);
        } else if (this.live.size) {
            this.drawLive(now);
        }
        if (now < this.busyUntil) this.raf = requestAnimationFrame(this.loop);
        else this.scheduleIdle();
    }

    // What cell i shows at `now`: returns glyph | (sprite row << 8), and leaves its opacity in this.tone.
    look(i, r, now) {
        const a = this.t0[i];
        const b = this.t1[i];
        if (now < a) {
            this.tone = this.pt[i];
            return this.pg[i];
        }
        if (now < b) {
            const tick = ((now + this.ph[i] * 5000) / STEP) | 0;
            this.tone = 0.92;
            const g = SCRAMBLE[((Math.imul(tick, 2654435761) ^ Math.imul(i + 1, 40503)) >>> 0) % SCRAMBLE.length];
            return g | ((1 + this.heatOf[r]) << 8);
        }
        this.tone = this.tt[i];
        const k = (now - b) / COOL;
        if (k >= 1) return this.tg[i];
        // Cooling: from the sunset colour back to ink in a few steps.
        const level = Math.round(k * (COOL_STEPS + 1));
        const K = this.heatRows;
        let row = 0;
        if (level === 0) row = 1 + this.heatOf[r];
        else if (level <= COOL_STEPS) row = 1 + K + (level - 1) * K + this.heatOf[r];
        return this.tg[i] | (row << 8);
    }

    draw(now) {
        const { ctx, atlas, geo } = this;
        if (!atlas || !geo) return;
        const { canvas: img, gw, gh } = atlas;
        const { cols } = geo;
        const { xs, ys, N } = this;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let alpha = -1;
        let r = 0;
        let c = -1;
        for (let i = 0; i < N; i++) {
            if (++c === cols) {
                c = 0;
                r++;
            }
            const v = this.look(i, r, now);
            const g = v & 255;
            const tone = this.tone;
            if (!g || tone <= 0) continue;
            if (tone !== alpha) {
                ctx.globalAlpha = tone;
                alpha = tone;
            }
            ctx.drawImage(img, g * gw, (v >> 8) * gh, gw, gh, xs[c], ys[r], gw, gh);
        }
        ctx.globalAlpha = 1;
    }

    // Redraw only the cells in this.live: clear each one's sprite box and repaint the
    // 3x3 neighbourhood inside it, since neighbouring glyphs overhang into it.
    drawLive(now) {
        const { ctx, atlas, geo, live, t1, xs, ys } = this;
        if (!atlas || !geo) return;
        const { canvas: img, gw, gh } = atlas;
        const { cols, rows } = geo;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        for (const i of live) {
            const r = (i / cols) | 0;
            const c = i - r * cols;
            ctx.save();
            ctx.beginPath();
            ctx.rect(xs[c], ys[r], gw, gh);
            ctx.clip();
            ctx.clearRect(xs[c], ys[r], gw, gh);
            for (let rr = Math.max(0, r - 1); rr <= Math.min(rows - 1, r + 1); rr++) {
                for (let cc = Math.max(0, c - 1); cc <= Math.min(cols - 1, c + 1); cc++) {
                    const v = this.look(rr * cols + cc, rr, now);
                    const g = v & 255;
                    if (!g || this.tone <= 0) continue;
                    ctx.globalAlpha = this.tone;
                    ctx.drawImage(img, g * gw, (v >> 8) * gh, gw, gh, xs[cc], ys[rr], gw, gh);
                }
            }
            ctx.restore();
            if (now >= t1[i] + COOL) live.delete(i);
        }
        ctx.globalAlpha = 1;
    }

    destroy() {
        this.warmGen++;
        cancelAnimationFrame(this.raf);
        clearTimeout(this.idle);
        this.listeners.clear();
    }
}
