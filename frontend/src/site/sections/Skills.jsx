import { useEffect, useRef, useState } from 'react';
import { clamp } from '../lib';
import { unlock } from '../secrets';

const slug = (s) => (s || 'other').toLowerCase().replace(/[^a-z]/g, '');

// A tiny physics box: skill bubbles fall in, bump into each other and can be thrown.
const SkillPit = ({ skills, filter }) => {
    const box = useRef(null);
    const els = useRef([]);
    const api = useRef(null);

    useEffect(() => {
        const el = box.current;
        if (!el) return undefined;
        let W = 0;
        let H = 0;
        let raf = 0;
        let started = false;
        let visible = false;
        let drag = null;
        const ptr = { x: -999, y: -999, inside: false };
        const B = skills.map((s) => ({ name: s.name, cat: s.category, r: 40, x: 0, y: 0, vx: 0, vy: 0, entered: false }));

        const measure = () => {
            W = el.clientWidth;
            H = el.clientHeight;
            const k = W < 560 ? 0.74 : 1;
            B.forEach((b, i) => {
                b.r = clamp(28 + b.name.length * 2.6, 36, 60) * k;
                const node = els.current[i];
                if (node) {
                    node.style.width = `${b.r * 2}px`;
                    node.style.height = `${b.r * 2}px`;
                }
                b.x = clamp(b.x, b.r, W - b.r);
            });
        };
        const spawn = () => {
            B.forEach((b, i) => {
                b.x = b.r + Math.random() * (W - b.r * 2);
                b.y = -b.r - i * 38 - Math.random() * 40;
                b.vx = (Math.random() - 0.5) * 3;
                b.vy = 0;
                b.entered = false;
            });
        };

        const step = () => {
            const G = 0.42;
            B.forEach((b, i) => {
                if (drag && drag.i === i) {
                    const nvx = (drag.x - b.x) * 0.4;
                    const nvy = (drag.y - b.y) * 0.4;
                    b.vx = nvx;
                    b.vy = nvy;
                    b.x += nvx;
                    b.y += nvy;
                } else {
                    b.vy += G;
                    b.vx *= 0.996;
                    b.x += b.vx;
                    b.y += b.vy;
                }
                if (ptr.inside && !drag) {
                    const dx = b.x - ptr.x;
                    const dy = b.y - ptr.y;
                    const d = Math.hypot(dx, dy) || 1;
                    const reach = b.r + 34;
                    if (d < reach) {
                        b.vx += (dx / d) * (1 - d / reach) * 2.2;
                        b.vy += (dy / d) * (1 - d / reach) * 2.2;
                    }
                }
                if (b.x < b.r) {
                    b.x = b.r;
                    b.vx = Math.abs(b.vx) * 0.6;
                } else if (b.x > W - b.r) {
                    b.x = W - b.r;
                    b.vx = -Math.abs(b.vx) * 0.6;
                }
                if (b.y > H - b.r) {
                    b.y = H - b.r;
                    b.vy = -Math.abs(b.vy) * 0.42;
                    b.vx *= 0.95;
                    if (Math.abs(b.vy) < 0.6) b.vy = 0;
                }
                if (b.y > b.r) b.entered = true;
                if (b.entered && b.y < b.r) {
                    b.y = b.r;
                    b.vy = Math.abs(b.vy) * 0.5;
                }
            });
            for (let it = 0; it < 3; it++) {
                for (let i = 0; i < B.length; i++) {
                    for (let j = i + 1; j < B.length; j++) {
                        const a = B[i];
                        const b = B[j];
                        const dx = b.x - a.x;
                        const dy = b.y - a.y;
                        const min = a.r + b.r;
                        const d2 = dx * dx + dy * dy;
                        if (d2 >= min * min || d2 === 0) continue;
                        const d = Math.sqrt(d2);
                        const nx = dx / d;
                        const ny = dy / d;
                        const over = min - d;
                        const aFixed = drag && drag.i === i;
                        const bFixed = drag && drag.i === j;
                        const ka = aFixed ? 0 : bFixed ? 1 : 0.5;
                        const kb = bFixed ? 0 : aFixed ? 1 : 0.5;
                        a.x -= nx * over * ka;
                        a.y -= ny * over * ka;
                        b.x += nx * over * kb;
                        b.y += ny * over * kb;
                        const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
                        if (rv < 0) {
                            const imp = (-(1 + 0.35) * rv) / 2;
                            if (!aFixed) {
                                a.vx -= imp * nx;
                                a.vy -= imp * ny;
                            }
                            if (!bFixed) {
                                b.vx += imp * nx;
                                b.vy += imp * ny;
                            }
                        }
                    }
                }
            }
            B.forEach((b, i) => {
                const node = els.current[i];
                b.rot = (b.rot || 0) + (clamp(b.vx * 2.5, -28, 28) - (b.rot || 0)) * 0.15;
                if (node) node.style.transform = `translate3d(${b.x - b.r}px, ${b.y - b.r}px, 0) rotate(${b.rot}deg)`;
            });
        };

        const loop = () => {
            step();
            raf = requestAnimationFrame(loop);
        };
        const start = () => {
            cancelAnimationFrame(raf);
            if (visible && started) raf = requestAnimationFrame(loop);
        };

        const local = (e) => {
            const r = el.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        };
        const onDown = (e) => {
            const node = e.target.closest('.sp-bub');
            if (!node) return;
            const i = els.current.indexOf(node);
            if (i < 0) return;
            e.preventDefault();
            node.setPointerCapture?.(e.pointerId);
            node.classList.add('is-grab');
            drag = { i, ...local(e) };
        };
        const onMove = (e) => {
            const p = local(e);
            ptr.x = p.x;
            ptr.y = p.y;
            ptr.inside = e.pointerType === 'mouse';
            if (drag) {
                drag.x = p.x;
                drag.y = p.y;
            }
        };
        const onUp = () => {
            if (!drag) return;
            const b = B[drag.i];
            const sp = Math.hypot(b.vx, b.vy);
            if (sp > 30) {
                b.vx *= 30 / sp;
                b.vy *= 30 / sp;
            }
            if (sp > 7) unlock('fling');
            els.current[drag.i]?.classList.remove('is-grab');
            drag = null;
        };
        const onLeave = () => {
            ptr.inside = false;
        };

        measure();
        B.forEach((b, i) => {
            b.x = b.r + ((i * 97) % Math.max(1, W - b.r * 2));
            b.y = -200;
        });
        step();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        const io = new IntersectionObserver(
            ([e]) => {
                visible = e.isIntersecting;
                if (visible && !started) {
                    started = true;
                    spawn();
                }
                start();
            },
            { threshold: 0.25 }
        );
        io.observe(el);
        el.addEventListener('pointerdown', onDown);
        el.addEventListener('pointermove', onMove);
        el.addEventListener('pointerup', onUp);
        el.addEventListener('pointercancel', onUp);
        el.addEventListener('pointerleave', onLeave);

        api.current = {
            kick(cat) {
                B.forEach((b) => {
                    if (cat && b.cat !== cat) return;
                    b.vy = -(9 + Math.random() * 9);
                    b.vx += (Math.random() - 0.5) * 8;
                });
            },
            shake() {
                started = true;
                B.forEach((b) => {
                    b.vy = -(6 + Math.random() * 14);
                    b.vx = (Math.random() - 0.5) * 22;
                });
            },
        };

        return () => {
            cancelAnimationFrame(raf);
            ro.disconnect();
            io.disconnect();
            el.removeEventListener('pointerdown', onDown);
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('pointerup', onUp);
            el.removeEventListener('pointercancel', onUp);
            el.removeEventListener('pointerleave', onLeave);
        };
    }, [skills]);

    useEffect(() => {
        if (filter) api.current?.kick(filter);
    }, [filter]);

    return (
        <div className="sp-pit" ref={box} data-cursor="grab">
            {skills.map((s, i) => (
                <span
                    key={s.name}
                    ref={(n) => (els.current[i] = n)}
                    className={`sp-bub is-${slug(s.category)} ${filter && filter !== s.category ? 'is-dim' : ''}`}
                >
                    {s.name}
                </span>
            ))}
            <button type="button" className="sp-pit__shake sp-mono" onClick={() => api.current?.shake()} data-cursor="shake">
                shake ⟳
            </button>
        </div>
    );
};

const Skills = ({ skills, groups }) => {
    const [filter, setFilter] = useState(null);
    const grouped = groups
        .map((g) => ({ ...g, items: skills.filter((s) => (s.category || 'Other') === g.key) }))
        .filter((g) => g.items.length);

    return (
        <section className="sp-section sp-skills" id="skills">
            <div className="sp-skills__head">
                <p className="sp-label">
                    <span>05</span> Toolbox
                </p>
                <h2 className="sp-h2">
                    The tools I reach for. <em>Throw them around.</em>
                </h2>
            </div>
            <div className="sp-skills__grid">
                <SkillPit skills={skills} filter={filter} />
                <div className="sp-skills__groups">
                    {grouped.map((g) => (
                        <button
                            type="button"
                            key={g.key}
                            className={`sp-group is-${slug(g.key)} ${filter === g.key ? 'is-active' : ''}`}
                            onClick={() => setFilter(filter === g.key ? null : g.key)}
                            aria-pressed={filter === g.key}
                            data-cursor="filter"
                        >
                            <span className="sp-group__head">
                                <strong>{g.label}</strong>
                                <small>{g.note}</small>
                            </span>
                            <span className="sp-group__items">{g.items.map((s) => s.name).join(' · ')}</span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Skills;
