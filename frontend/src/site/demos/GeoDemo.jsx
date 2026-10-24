import { canvasPalette, clamp, useCanvasScene } from '../lib';
import { unlock } from '../secrets';

const ROLES = ['Backend Engineer', 'Node.js Developer', 'Data Analyst', 'DevOps Intern', 'React Developer', 'QA Engineer', 'Python Developer', 'Product Designer', 'SRE', 'ML Engineer', 'Support Engineer', 'Go Developer'];
const COMPANIES = ['Acme', 'Nimbus', 'Kite', 'Orbit Labs', 'Pixel & Co', 'Vertex', 'Lumen', 'Tapti Tech', 'Saffron', 'Diamond Works'];
const MAX_PINS = 24;
const KM_ACROSS = 9;

const rng = (seed) => () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
};
const pick = (a) => a[(Math.random() * a.length) | 0];
const bounce = (x) => {
    const n = 7.5625;
    const d = 2.75;
    if (x < 1 / d) return n * x * x;
    if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75;
    if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375;
    return n * (x -= 2.625 / d) * x + 0.984375;
};

// A procedural city with job pins dropping in live. Click to search a radius.
const geoScene = ({ canvas, ctx }) => {
    let W = 0;
    let H = 0;
    let base = null;
    let baseLight = null;
    let pal = canvasPalette();
    let pins = [];
    let last = 0;
    let search = null;
    const mouse = { x: -999, y: -999 };

    const paintBase = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        base = document.createElement('canvas');
        base.width = W * dpr;
        base.height = H * dpr;
        const b = base.getContext('2d');
        b.scale(dpr, dpr);
        const r = rng(7);
        pal = canvasPalette();
        baseLight = pal.light;
        b.fillStyle = pal.bg;
        b.fillRect(0, 0, W, H);
        // Parks
        for (let i = 0; i < 6; i++) {
            b.fillStyle = `rgba(${pal.park},${pal.light ? 0.1 : 0.05})`;
            b.beginPath();
            b.roundRect(r() * W, r() * H, 40 + r() * 90, 30 + r() * 60, 10);
            b.fill();
        }
        // Street grid, slightly rotated so it feels like a real city
        b.save();
        b.translate(W / 2, H / 2);
        b.rotate(-0.18);
        b.strokeStyle = `rgba(${pal.fg},${pal.light ? 0.07 : 0.05})`;
        b.lineWidth = 1;
        const span = Math.max(W, H) * 1.3;
        for (let x = -span; x < span; x += 22 + r() * 18) {
            b.beginPath();
            b.moveTo(x, -span);
            b.lineTo(x + (r() - 0.5) * 30, span);
            b.stroke();
        }
        for (let y = -span; y < span; y += 22 + r() * 18) {
            b.beginPath();
            b.moveTo(-span, y);
            b.lineTo(span, y + (r() - 0.5) * 30);
            b.stroke();
        }
        b.restore();
        // Arterial roads
        b.strokeStyle = `rgba(${pal.fg},${pal.light ? 0.16 : 0.13})`;
        b.lineWidth = 2.5;
        for (let i = 0; i < 4; i++) {
            b.beginPath();
            b.moveTo(r() * W, 0);
            b.bezierCurveTo(r() * W, H * 0.3, r() * W, H * 0.7, r() * W, H);
            b.stroke();
        }
        b.beginPath();
        b.ellipse(W * 0.55, H * 0.5, W * 0.32, H * 0.36, 0.2, 0, Math.PI * 2);
        b.stroke();
        // River
        b.strokeStyle = `rgba(${pal.blue},${pal.light ? 0.2 : 0.16})`;
        b.lineWidth = 16;
        b.lineCap = 'round';
        b.beginPath();
        b.moveTo(-20, H * 0.25);
        b.bezierCurveTo(W * 0.3, H * 0.05, W * 0.45, H * 0.75, W * 0.7, H * 0.55);
        b.bezierCurveTo(W * 0.85, H * 0.45, W * 0.95, H * 0.9, W + 20, H * 0.85);
        b.stroke();
    };

    const addPin = (t) => {
        const m = 24;
        pins.push({
            x: m + Math.random() * (W - m * 2),
            y: m + 30 + Math.random() * (H - m * 2 - 50),
            born: t,
            role: pick(ROLES),
            company: pick(COMPANIES),
        });
    };

    const local = (e) => {
        const r = canvas.getBoundingClientRect();
        return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e) => Object.assign(mouse, local(e));
    const onLeave = () => Object.assign(mouse, { x: -999, y: -999 });
    const onClick = (e) => {
        const p = local(e);
        search = { ...p, r: Math.min(W, H) * 0.26, t0: performance.now() };
        unlock('project');
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('click', onClick);

    return {
        resize(w, h) {
            W = w;
            H = h;
            paintBase();
            pins = pins.filter((p) => p.x < W && p.y < H);
        },
        frame(t) {
            if (!base) return;
            if (canvasPalette().light !== baseLight) paintBase();
            ctx.drawImage(base, 0, 0, W, H);
            if (!last || t - last > (pins.length < MAX_PINS ? 380 : 1500)) {
                last = t;
                if (pins.length >= MAX_PINS) pins.shift();
                addPin(t);
            }
            const kmPerPx = KM_ACROSS / W;
            let inside = 0;
            if (search) {
                const grow = clamp((t - search.t0) / 400, 0, 1);
                const rr = search.r * (1 - Math.pow(1 - grow, 3));
                ctx.fillStyle = `rgba(${pal.acc},0.08)`;
                ctx.strokeStyle = `rgba(${pal.acc},0.8)`;
                ctx.setLineDash([5, 5]);
                ctx.lineDashOffset = -t / 60;
                ctx.lineWidth = 1.2;
                ctx.beginPath();
                ctx.arc(search.x, search.y, rr, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
                ctx.setLineDash([]);
                ctx.fillStyle = `rgb(${pal.acc})`;
                ctx.beginPath();
                ctx.arc(search.x, search.y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
            let hover = null;
            let best = 18;
            pins.forEach((p) => {
                const age = Math.max(0, (t - p.born) / 650);
                const drop = age < 1 ? (1 - bounce(Math.max(0, age))) * -40 : 0;
                const fade = Math.min(1, age * 3);
                const inS = search && Math.hypot(p.x - search.x, p.y - search.y) <= search.r;
                if (inS) inside++;
                const color = inS ? pal.acc : pal.fg;
                const alpha = (search && !inS ? 0.35 : 1) * fade;
                if (age < 1.6) {
                    const ra = age / 1.6;
                    ctx.strokeStyle = `rgba(${color},${(1 - ra) * 0.6})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 4 + ra * 22, 0, Math.PI * 2);
                    ctx.stroke();
                }
                const y = p.y + drop;
                ctx.fillStyle = `rgba(${color},${alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, y - 9, 5.5, Math.PI * 0.85, Math.PI * 2.15);
                ctx.lineTo(p.x, y);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = pal.bg;
                ctx.beginPath();
                ctx.arc(p.x, y - 9, 2, 0, Math.PI * 2);
                ctx.fill();
                const d = Math.hypot(mouse.x - p.x, mouse.y - (p.y - 8));
                if (d < best) {
                    best = d;
                    hover = p;
                }
            });

            ctx.font = '600 11px "JetBrains Mono", monospace';
            ctx.textBaseline = 'middle';
            const hud = search
                ? `${inside} roles within ${(search.r * kmPerPx).toFixed(1)} km`
                : `${pins.length} roles indexed · live`;
            const hw = ctx.measureText(hud).width + 34;
            ctx.fillStyle = pal.light ? 'rgba(250,248,243,0.92)' : 'rgba(11,11,13,0.85)';
            ctx.beginPath();
            ctx.roundRect(12, 12, hw, 26, 13);
            ctx.fill();
            ctx.fillStyle = `rgba(${pal.ok},${Math.sin(t / 300) > 0 ? 1 : 0.35})`;
            ctx.beginPath();
            ctx.arc(25, 25, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgb(${pal.fg})`;
            ctx.fillText(hud, 34, 25.5);

            if (hover) {
                const km = (Math.hypot(hover.x - (search?.x ?? W / 2), hover.y - (search?.y ?? H / 2)) * kmPerPx).toFixed(1);
                const l1 = hover.role;
                const l2 = `${hover.company} · ${km} km away`;
                ctx.font = '600 12px Inter, sans-serif';
                const w1 = ctx.measureText(l1).width;
                ctx.font = '500 11px "JetBrains Mono", monospace';
                const w2 = ctx.measureText(l2).width;
                const bw = Math.max(w1, w2) + 22;
                const bx = Math.min(W - bw - 8, Math.max(8, hover.x - bw / 2));
                const by = hover.y - 66 < 8 ? hover.y + 8 : hover.y - 66;
                ctx.fillStyle = `rgb(${pal.fg})`;
                ctx.beginPath();
                ctx.roundRect(bx, by, bw, 46, 10);
                ctx.fill();
                ctx.fillStyle = pal.light ? '#f4f1ea' : '#0b0b0d';
                ctx.font = '600 12px Inter, sans-serif';
                ctx.fillText(l1, bx + 11, by + 16);
                ctx.fillStyle = pal.light ? '#b5afa4' : '#5b5852';
                ctx.font = '500 11px "JetBrains Mono", monospace';
                ctx.fillText(l2, bx + 11, by + 32);
            }
        },
        destroy() {
            canvas.removeEventListener('pointermove', onMove);
            canvas.removeEventListener('pointerleave', onLeave);
            canvas.removeEventListener('click', onClick);
        },
    };
};

const GeoDemo = () => {
    const ref = useCanvasScene(geoScene);
    return (
        <div className="sp-demo sp-demo--geo">
            <canvas ref={ref} data-cursor="search here" aria-label="Interactive map: job pins appear across a city; click to search a radius" role="img" />
            <p className="sp-demo__hint">Hover a pin · click anywhere to search a radius</p>
        </div>
    );
};

export default GeoDemo;
