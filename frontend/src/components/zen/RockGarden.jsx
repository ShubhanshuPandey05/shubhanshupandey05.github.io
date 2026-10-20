import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from './motion';

// A karesansui (dry rock garden) drawn in characters. The skill groups are the rocks;
// raked rings ripple out from each one, and your cursor is a pebble that disturbs the sand.
const RockGarden = ({ skills, groups }) => {
    const wrapRef = useRef(null);
    const canvasRef = useRef(null);

    const filled = groups
        .map((g) => ({ ...g, items: skills.filter((s) => (s.category || 'Other') === g.key) }))
        .filter((g) => g.items.length);

    useEffect(() => {
        const wrap = wrapRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const reduced = prefersReducedMotion();
        let w = 0;
        let h = 0;
        let cols = 0;
        let rows = 0;
        let cw = 7.2;
        const ch = 15;
        let stones = [];
        let raf = 0;
        let running = false;
        let last = 0;
        const trail = [];
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const measure = () => {
            const r = wrap.getBoundingClientRect();
            w = r.width;
            h = r.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.font = '12px "JetBrains Mono", monospace';
            cw = ctx.measureText('M').width;
            cols = Math.ceil(w / cw);
            rows = Math.ceil(h / ch);
            stones = [...wrap.querySelectorAll('.zn-stone')].map((el) => {
                const s = el.getBoundingClientRect();
                return {
                    x: s.left - r.left + s.width / 2,
                    y: s.top - r.top + s.height / 2,
                    rx: s.width / 2 + 6,
                    ry: s.height / 2 + 6,
                };
            });
        };

        const draw = (now) => {
            if (!running) return;
            raf = requestAnimationFrame(draw);
            if (now - last < 50) return;
            last = now;
            const t = now / 1000;
            ctx.clearRect(0, 0, w, h);
            ctx.font = '12px "JetBrains Mono", monospace';
            ctx.textBaseline = 'top';
            const life = 2600;
            while (trail.length && now - trail[0].at > life) trail.shift();

            const dim = [];
            const mid = [];
            const hot = [];
            for (let r = 0; r < rows; r++) {
                const y = r * ch + ch / 2;
                for (let c = 0; c < cols; c++) {
                    const x = c * cw + cw / 2;
                    let best = Infinity;
                    let inside = false;
                    for (let i = 0; i < stones.length; i++) {
                        const s = stones[i];
                        const nx = (x - s.x) / s.rx;
                        const ny = (y - s.y) / s.ry;
                        const e = Math.sqrt(nx * nx + ny * ny);
                        if (e < 1) inside = true;
                        const d = (e - 1) * Math.min(s.rx, s.ry);
                        if (d < best) best = d;
                    }
                    if (inside) continue;
                    // Pebble ripples from the cursor trail.
                    let ripple = 0;
                    for (let i = 0; i < trail.length; i++) {
                        const p = trail[i];
                        const age = (now - p.at) / life;
                        const d = Math.hypot(x - p.x, y - p.y);
                        const front = age * 150;
                        if (Math.abs(d - front) < 9) ripple = Math.max(ripple, 1 - age);
                    }
                    if (ripple > 0.15) {
                        hot.push([c, r, ripple > 0.6 ? 'o' : '°']);
                        continue;
                    }
                    if (best < 120) {
                        const v = Math.sin(best * 0.21 - (reduced ? 0 : t * 0.8));
                        if (v > 0.55) mid.push([c, r, best < 40 ? '~' : '-']);
                        else if (v > 0.2 && (r + c) % 3 === 0) dim.push([c, r, '.']);
                    } else {
                        const v = Math.sin(y * 0.4 + Math.sin(x * 0.01 + 1.3) * 2);
                        if (v > 0.7) dim.push([c, r, '-']);
                    }
                }
            }
            const paint = (list, color) => {
                ctx.fillStyle = color;
                list.forEach(([c, r, s]) => ctx.fillText(s, c * cw, r * ch));
            };
            paint(dim, 'rgba(13,11,11,0.22)');
            paint(mid, 'rgba(13,11,11,0.5)');
            paint(hot, '#c21a36');
            if (reduced) running = false;
        };

        const start = () => {
            if (running) return;
            running = true;
            raf = requestAnimationFrame(draw);
        };
        const stop = () => {
            running = false;
            cancelAnimationFrame(raf);
        };

        const onMove = (e) => {
            const r = wrap.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            const lastPt = trail[trail.length - 1];
            if (!lastPt || Math.hypot(x - lastPt.x, y - lastPt.y) > 40) trail.push({ x, y, at: performance.now() });
        };

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(wrap);
        const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()));
        io.observe(wrap);
        wrap.addEventListener('mousemove', onMove);
        document.fonts?.ready.then(measure);
        return () => {
            stop();
            ro.disconnect();
            io.disconnect();
            wrap.removeEventListener('mousemove', onMove);
        };
    }, [filled.length]);

    let n = 0;
    return (
        <section className="zn-section zn-garden" id="garden">
            <div className="zn-chapter" aria-hidden="true">
                <span>四</span> the rock garden
            </div>
            <div className="zn-garden__head">
                <h2 className="zn-h2">
                    The toolkit, <em>raked into sand.</em>
                </h2>
                <p>Each stone holds a family of tools. Drag your cursor through the sand.</p>
            </div>
            <div ref={wrapRef} className="zn-garden__bed">
                <canvas ref={canvasRef} className="zn-garden__sand" aria-hidden="true" />
                {filled.map((g, i) => (
                    <div key={g.key} className={`zn-stone zn-stone--${i % 4}`}>
                        <p className="zn-stone__label">{g.label}</p>
                        <p className="zn-stone__note">{g.note}</p>
                        <ul>
                            {g.items.map((s) => {
                                n += 1;
                                return (
                                    <li key={s.name}>
                                        <span>{s.name}</span>
                                        <i>{String(n).padStart(2, '0')}</i>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RockGarden;
