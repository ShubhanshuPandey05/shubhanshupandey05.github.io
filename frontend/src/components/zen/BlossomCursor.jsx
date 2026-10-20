import { useEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from './motion';

const PETAL_COLORS = ['#9b0d23', '#c21a36', '#e46a8c', '#ef8fab', '#f7b6c8'];
const PETAL_CHARS = ['*', '✿', '❀', "'", '.', '`'];

const HOVER_SELECTOR = 'a, button, [data-cursor], input, textarea, select, label';

// Playful custom cursor: a crimson dot, a lagging ring that swells and shows a label
// over links, a trail of falling text-character petals, and a burst of them on click.
// Only runs on devices with a fine pointer (mouse / trackpad).
const BlossomCursor = () => {
    const dotRef = useRef(null);
    const ringRef = useRef(null);
    const canvasRef = useRef(null);
    const [enabled] = useState(
        () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches
    );

    useEffect(() => {
        if (!enabled) return undefined;
        const reduced = prefersReducedMotion();
        const dot = dotRef.current;
        const ring = ringRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        document.documentElement.classList.add('zn-has-cursor');

        const resize = () => {
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        const mouse = { x: -100, y: -100 };
        const ringPos = { x: -100, y: -100 };
        const lastSpawn = { x: 0, y: 0 };
        const petals = [];
        let raf = 0;
        let visible = false;

        const spawn = (x, y, burst = false) => {
            const a = burst ? Math.random() * Math.PI * 2 : 0;
            const speed = burst ? 2 + Math.random() * 3.5 : 0;
            petals.push({
                x,
                y,
                vx: burst ? Math.cos(a) * speed : (Math.random() - 0.5) * 0.6,
                vy: burst ? Math.sin(a) * speed - 1.5 : 0.4 + Math.random() * 0.5,
                size: burst ? 5 + Math.random() * 5 : 3 + Math.random() * 4,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.15,
                life: 1,
                decay: burst ? 0.012 : 0.018 + Math.random() * 0.01,
                color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
                ch: PETAL_CHARS[Math.floor(Math.random() * PETAL_CHARS.length)],
            });
            if (petals.length > 140) petals.shift();
        };

        const onMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
            if (!visible) {
                visible = true;
                ringPos.x = mouse.x;
                ringPos.y = mouse.y;
                document.documentElement.classList.add('zn-cursor-visible');
            }
            const dx = mouse.x - lastSpawn.x;
            const dy = mouse.y - lastSpawn.y;
            if (!reduced && dx * dx + dy * dy > 38 * 38) {
                spawn(mouse.x, mouse.y);
                lastSpawn.x = mouse.x;
                lastSpawn.y = mouse.y;
            }
        };

        const onLeave = () => {
            visible = false;
            document.documentElement.classList.remove('zn-cursor-visible');
        };

        const onOver = (e) => {
            const target = e.target.closest ? e.target.closest(HOVER_SELECTOR) : null;
            if (target) {
                ring.classList.add('is-hover');
                const label = target.getAttribute('data-cursor') || '';
                ring.setAttribute('data-label', label);
                ring.classList.toggle('has-label', Boolean(label));
            } else {
                ring.classList.remove('is-hover', 'has-label');
                ring.setAttribute('data-label', '');
            }
        };

        const onDown = (e) => {
            ring.classList.add('is-down');
            if (!reduced) for (let i = 0; i < 12; i++) spawn(e.clientX, e.clientY, true);
        };
        const onUp = () => ring.classList.remove('is-down');

        const frame = () => {
            ringPos.x += (mouse.x - ringPos.x) * 0.16;
            ringPos.y += (mouse.y - ringPos.y) * 0.16;
            dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
            ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;

            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
            for (let i = petals.length - 1; i >= 0; i--) {
                const p = petals[i];
                p.vy += 0.05;
                p.vx *= 0.97;
                p.vy = Math.min(p.vy, 2.2);
                p.x += p.vx;
                p.y += p.vy;
                p.angle += p.spin;
                p.life -= p.decay;
                if (p.life <= 0) {
                    petals.splice(i, 1);
                    continue;
                }
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.globalAlpha = Math.min(1, p.life * 1.4);
                ctx.fillStyle = p.color;
                ctx.font = `${Math.round(p.size * 2.4)}px "JetBrains Mono", monospace`;
                ctx.fillText(p.ch, 0, 0);
                ctx.restore();
            }
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);

        window.addEventListener('mousemove', onMove, { passive: true });
        window.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('resize', resize);
        document.addEventListener('mouseover', onOver);
        document.addEventListener('mouseleave', onLeave);

        return () => {
            cancelAnimationFrame(raf);
            document.documentElement.classList.remove('zn-has-cursor', 'zn-cursor-visible');
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mousedown', onDown);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('resize', resize);
            document.removeEventListener('mouseover', onOver);
            document.removeEventListener('mouseleave', onLeave);
        };
    }, [enabled]);

    if (!enabled) return null;

    return (
        <>
            <canvas ref={canvasRef} className="zn-cursor-trail" aria-hidden="true" />
            <div ref={ringRef} className="zn-cursor-ring" aria-hidden="true" data-label="" />
            <div ref={dotRef} className="zn-cursor-dot" aria-hidden="true" />
        </>
    );
};

export default BlossomCursor;
