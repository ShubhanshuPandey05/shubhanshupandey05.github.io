import { useEffect, useRef } from 'react';
import { drawPetal, PETAL_COLORS, prefersReducedMotion } from './petal';

// Petals drifting down across the parent element. Moving the mouse quickly
// stirs up a gust that pushes them sideways.
const PetalField = ({ count = 32, className = '', colors = PETAL_COLORS }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return undefined;
        const ctx = canvas.getContext('2d');
        const reduced = prefersReducedMotion();
        let w = 0;
        let h = 0;
        let raf = 0;
        let running = true;
        let gust = 0;
        let lastX = null;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        const resize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            w = rect.width;
            h = rect.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };
        resize();

        const make = (fresh) => ({
            x: Math.random() * w,
            y: fresh ? Math.random() * h : -20 - Math.random() * 80,
            size: 4 + Math.random() * 6,
            vy: 0.35 + Math.random() * 0.8,
            vx: -0.2 + Math.random() * 0.6,
            angle: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.04,
            phase: Math.random() * Math.PI * 2,
            color: colors[Math.floor(Math.random() * colors.length)],
        });
        const petals = Array.from({ length: count }, () => make(true));

        const onMove = (e) => {
            if (lastX !== null) gust += (e.clientX - lastX) * 0.02;
            gust = Math.max(-6, Math.min(6, gust));
            lastX = e.clientX;
        };

        const frame = (t) => {
            ctx.clearRect(0, 0, w, h);
            gust *= 0.96;
            petals.forEach((p, i) => {
                if (!reduced) {
                    p.y += p.vy;
                    p.x += p.vx + Math.sin(t / 900 + p.phase) * 0.4 + gust * (0.4 + p.size / 12);
                    p.angle += p.spin + gust * 0.004;
                }
                if (p.y > h + 20 || p.x < -40 || p.x > w + 40) {
                    petals[i] = make(false);
                    if (p.x < -40) petals[i].x = w + 10;
                    if (p.x > w + 40) petals[i].x = -10;
                }
                const flip = Math.cos(t / 600 + p.phase);
                drawPetal(ctx, p.x, p.y, p.size, p.angle, p.color, 0.9, flip);
            });
            if (running && !reduced) raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);

        // Pause when off-screen to save battery.
        const io = new IntersectionObserver(([entry]) => {
            const visible = entry.isIntersecting;
            if (visible && !running) {
                running = true;
                raf = requestAnimationFrame(frame);
            } else if (!visible) {
                running = false;
                cancelAnimationFrame(raf);
            }
        });
        io.observe(canvas);

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', onMove);
        return () => {
            running = false;
            cancelAnimationFrame(raf);
            io.disconnect();
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMove);
        };
    }, [count]);

    return <canvas ref={canvasRef} className={`ed-petals ${className}`} aria-hidden="true" />;
};

export default PetalField;
