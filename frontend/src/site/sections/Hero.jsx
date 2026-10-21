import { useEffect, useState } from 'react';
import { clamp, fontReady, reducedMotion, useCanvasScene } from '../lib';
import { unlock } from '../secrets';

const FG = [242, 239, 233];
const ACC = [255, 91, 46];
const rgb = (c) => `rgb(${c[0]},${c[1]},${c[2]})`;

const fontFor = (kind, size) =>
    kind === 'sans' ? `900 ${size}px "Inter Tight", Inter, system-ui, sans-serif` : `italic 400 ${size}px "Instrument Serif", Georgia, serif`;

// Render the name to an offscreen canvas and return the filled pixels as particle targets.
const sampleName = (W, H) => {
    const portrait = W < 700 || W / H < 0.9;
    const lines = portrait
        ? [
              { text: 'SHUBH', kind: 'sans', align: 'left' },
              { text: 'ANSHU', kind: 'sans', align: 'left' },
              { text: 'Pandey', kind: 'serif', align: 'right' },
          ]
        : [
              { text: 'SHUBHANSHU', kind: 'sans', align: 'left' },
              { text: 'Pandey', kind: 'serif', align: 'right' },
          ];
    const off = document.createElement('canvas');
    off.width = Math.max(1, Math.floor(W));
    off.height = Math.max(1, Math.floor(H));
    const o = off.getContext('2d', { willReadFrequently: true });

    const measure = (l, fs) => {
        o.font = fontFor(l.kind, fs);
        const m = o.measureText(l.text);
        return { w: m.width, asc: m.actualBoundingBoxAscent || fs * 0.72, desc: m.actualBoundingBoxDescent || fs * 0.05 };
    };
    const availW = W * (portrait ? 0.86 : 0.9);
    const availH = H * (portrait ? 0.42 : 0.5);
    const maxW = Math.max(...lines.map((l) => measure(l, 100).w));
    let fs = (availW / maxW) * 100;
    const gap = (l) => (l.kind === 'serif' ? -0.12 : 0.04);
    const blockH = (size) => lines.reduce((s, l) => {
        const m = measure(l, size);
        return s + m.asc + m.desc + gap(l) * size;
    }, 0);
    const bh = blockH(fs);
    if (bh > availH) fs *= availH / bh;
    fs = Math.floor(fs);

    const metrics = lines.map((l) => measure(l, fs));
    const blockW = Math.max(...metrics.map((m) => m.w));
    const total = blockH(fs);
    const left = (W - blockW) / 2;
    let y = H * (portrait ? 0.47 : 0.5) - total / 2;
    o.fillStyle = '#fff';
    const bands = [];
    lines.forEach((l, i) => {
        const m = metrics[i];
        y += m.asc + (i ? gap(l) * fs : 0);
        o.font = fontFor(l.kind, fs);
        const x = l.align === 'right' ? left + blockW - m.w : left;
        o.fillText(l.text, x, y);
        bands.push({ top: y - m.asc, bottom: y + m.desc, kind: l.kind });
        y += m.desc;
    });

    const data = o.getImageData(0, 0, off.width, off.height).data;
    let filled = 0;
    for (let i = 3; i < data.length; i += 16) if (data[i] > 128) filled += 4;
    const target = W < 700 ? 2600 : 5200;
    const step = clamp(Math.round(Math.sqrt(filled / target)), 3, 9);
    const pts = [];
    for (let py = 0; py < off.height; py += step) {
        for (let px = 0; px < off.width; px += step) {
            if (data[(py * off.width + px) * 4 + 3] > 128) {
                const band = bands.find((b) => py >= b.top - 2 && py <= b.bottom + 2) || bands[0];
                pts.push({ x: px + (Math.random() - 0.5) * step * 0.4, y: py + (Math.random() - 0.5) * step * 0.4, serif: band.kind === 'serif' });
            }
        }
    }
    return { pts, step, fs };
};

const nameScene = ({ canvas, ctx }) => {
    const host = canvas.parentElement;
    const still = reducedMotion();
    let W = 0;
    let H = 0;
    let P = [];
    let size = 2;
    let ready = false;
    let builtW = 0;
    let builtH = 0;
    const mouse = { x: -9999, y: -9999 };
    const waves = [];
    let R = 110;

    const build = () => {
        const { pts, step } = sampleName(W, H);
        size = Math.max(1.6, step * 0.52);
        R = clamp(W * 0.085, 70, 150);
        builtW = W;
        builtH = H;
        const old = P;
        P = pts.map((t, i) => {
            const prev = old[i];
            const fresh = !prev;
            return {
                x: prev ? prev.x : still ? t.x : Math.random() * W,
                y: prev ? prev.y : still ? t.y : Math.random() * H,
                vx: fresh && !still ? (Math.random() - 0.5) * 8 : prev?.vx || 0,
                vy: fresh && !still ? (Math.random() - 0.5) * 8 : prev?.vy || 0,
                tx: t.x,
                ty: t.y,
                serif: t.serif,
                s: Math.random() * 6.28,
            };
        });
        ready = true;
    };

    fontReady('900 100px "Inter Tight"').then(() => fontReady('italic 100px "Instrument Serif"')).then(() => {
        if (W && H) build();
    });

    const local = (e) => {
        const r = canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e) => {
        const p = local(e);
        mouse.x = p.x;
        mouse.y = p.y;
    };
    const onLeave = () => {
        mouse.x = -9999;
        mouse.y = -9999;
    };
    const onDown = (e) => {
        if (e.target.closest('a, button')) return;
        const p = local(e);
        waves.push({ x: p.x, y: p.y, t0: performance.now() });
        const reach = Math.max(W, H) * 0.6;
        P.forEach((q) => {
            const dx = q.x - p.x;
            const dy = q.y - p.y;
            const d = Math.hypot(dx, dy) || 1;
            const f = Math.max(0, 1 - d / reach) * 38 + 2;
            q.vx += (dx / d) * f * (0.6 + Math.random() * 0.8);
            q.vy += (dy / d) * f * (0.6 + Math.random() * 0.8);
        });
        unlock('scatter');
    };
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
    host.addEventListener('pointerdown', onDown);

    return {
        resize(w, h) {
            W = w;
            H = h;
            if (ready && (Math.abs(w - builtW) > 2 || Math.abs(h - builtH) > 120)) build();
            else if (!ready && document.fonts?.status === 'loaded') build();
        },
        frame(t) {
            ctx.clearRect(0, 0, W, H);
            if (!ready) return;
            const hold = document.documentElement.classList.contains('sp-booting');
            const R2 = R * R;
            const calm = [];
            const hot = [];
            for (let i = 0; i < P.length; i++) {
                const p = P[i];
                if (!hold) {
                    p.vx += (p.tx - p.x) * 0.045;
                    p.vy += (p.ty - p.y) * 0.045;
                }
                const mx = p.x - mouse.x;
                const my = p.y - mouse.y;
                const d2 = mx * mx + my * my;
                if (d2 < R2) {
                    const d = Math.sqrt(d2) || 1;
                    const f = (1 - d / R) ** 2 * 7;
                    p.vx += (mx / d) * f;
                    p.vy += (my / d) * f;
                }
                p.vx *= 0.85;
                p.vy *= 0.85;
                p.x += p.vx;
                p.y += p.vy;
                const energy = Math.abs(p.vx) + Math.abs(p.vy);
                (energy > 1.6 !== p.serif ? hot : calm).push(p);
            }
            const wob = still ? 0 : 0.5;
            const draw = (list, color) => {
                ctx.fillStyle = color;
                for (let i = 0; i < list.length; i++) {
                    const p = list[i];
                    ctx.fillRect(p.x + Math.sin(t * 0.0016 + p.s) * wob, p.y + Math.cos(t * 0.0013 + p.s) * wob, size, size);
                }
            };
            draw(calm, rgb(FG));
            draw(hot, rgb(ACC));

            for (let i = waves.length - 1; i >= 0; i--) {
                const w = waves[i];
                const age = (t - w.t0) / 700;
                if (age > 1) {
                    waves.splice(i, 1);
                    continue;
                }
                ctx.strokeStyle = `rgba(${ACC.join(',')},${(1 - age) * 0.7})`;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(w.x, w.y, 10 + age * Math.max(W, H) * 0.45, 0, Math.PI * 2);
                ctx.stroke();
            }
        },
        destroy() {
            host.removeEventListener('pointermove', onMove);
            host.removeEventListener('pointerleave', onLeave);
            host.removeEventListener('pointerdown', onDown);
        },
    };
};

const useClock = () => {
    const fmt = () =>
        new Date().toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const [time, setTime] = useState(fmt);
    useEffect(() => {
        const id = setInterval(() => setTime(fmt()), 1000);
        return () => clearInterval(id);
    }, []);
    return time;
};

const Hero = ({ profile }) => {
    const canvasRef = useCanvasScene(nameScene);
    const time = useClock();
    return (
        <section className="sp-hero" id="top" aria-label="Introduction">
            <canvas ref={canvasRef} className="sp-hero__canvas" aria-hidden="true" />
            <h1 className="sp-sr">
                {profile.name}, {profile.title}
            </h1>
            <div className="sp-hero__top">
                <p className="sp-pill">
                    <span className="sp-live" /> Available for backend work
                </p>
                <p className="sp-hero__lede">
                    I build the quiet parts of software: <em>APIs, queues, scrapers and real-time pipes</em>, and the servers
                    they run on.
                </p>
            </div>
            <div className="sp-hero__bottom">
                <div className="sp-hero__ctas">
                    <a href="#work" className="sp-btn sp-btn--solid" data-cursor="go">
                        See the work <span aria-hidden="true">↓</span>
                    </a>
                    <a href="#terminal" className="sp-btn" data-cursor="type">
                        Try the terminal
                    </a>
                </div>
                <p className="sp-hero__hint" aria-hidden="true">
                    <span className="sp-kbd">move</span> through my name · <span className="sp-kbd">click</span> to scatter it
                </p>
                <p className="sp-hero__meta">
                    {profile.title} · {profile.location}
                    <br />
                    <span className="sp-mono">{time} IST</span>
                </p>
            </div>
        </section>
    );
};

export default Hero;
