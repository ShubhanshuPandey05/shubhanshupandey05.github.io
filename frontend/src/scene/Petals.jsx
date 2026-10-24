import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useStillness } from '../context/Stillness';

const TONES = ['#fbe4e4', '#f1bcc6', '#e39aab'];

const petal = (width, height, anywhere) => ({
    // Petals come off the tree at the upper right and ride the wind down and left.
    x: anywhere ? Math.random() * width : width * (0.5 + Math.random() * 0.6),
    y: anywhere ? Math.random() * height : -20 - Math.random() * height * 0.3,
    vx: -(14 + Math.random() * 34),
    vy: 16 + Math.random() * 30,
    size: 3.2 + Math.random() * 4.2,
    turn: Math.random() * 6.3,
    spin: (Math.random() - 0.5) * 2.4,
    flip: Math.random() * 6.3,
    flutter: 1.4 + Math.random() * 2.2,
    tone: TONES[Math.floor(Math.random() * TONES.length)],
});

const firefly = (width, height) => ({
    x: Math.random() * width,
    y: height * (0.45 + Math.random() * 0.5),
    heading: Math.random() * 6.3,
    speed: 6 + Math.random() * 12,
    phase: Math.random() * 6.3,
    rate: 0.8 + Math.random() * 0.9,
    size: 9 + Math.random() * 9,
});

const drawPetal = (ctx, p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.turn);
    ctx.scale(1, 0.25 + Math.abs(Math.cos(p.flip)) * 0.75);
    ctx.fillStyle = p.tone;
    ctx.beginPath();
    ctx.moveTo(0, -p.size);
    ctx.quadraticCurveTo(p.size * 0.95, -p.size * 0.2, 0, p.size);
    ctx.quadraticCurveTo(-p.size * 0.95, -p.size * 0.2, 0, -p.size);
    ctx.fill();
    ctx.restore();
};

// Falling blossom at dusk, fireflies after dark. One small canvas, paused
// whenever it is off screen, and a single still frame under reduced motion or
// when the visitor has stopped the scene.
const Petals = ({ kind = 'petals', className = '' }) => {
    const ref = useRef(null);
    const reduce = useReducedMotion();
    const [still] = useStillness();
    const frozen = reduce || still;

    useEffect(() => {
        const canvas = ref.current;
        const ctx = canvas.getContext('2d');
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        let width = 0;
        let height = 0;
        let items = [];
        let frame = 0;
        let last = 0;

        const glow = document.createElement('canvas');
        glow.width = glow.height = 64;
        const glowCtx = glow.getContext('2d');
        const halo = glowCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
        halo.addColorStop(0, 'rgba(236, 246, 150, 1)');
        halo.addColorStop(0.25, 'rgba(214, 232, 110, 0.55)');
        halo.addColorStop(1, 'rgba(214, 232, 110, 0)');
        glowCtx.fillStyle = halo;
        glowCtx.fillRect(0, 0, 64, 64);

        const populate = () => {
            const count = kind === 'petals' ? Math.round(Math.min(46, 12 + width / 34)) : Math.round(Math.min(26, 8 + width / 70));
            items = Array.from({ length: count }, () => (kind === 'petals' ? petal(width, height, true) : firefly(width, height)));
        };

        const draw = (seconds) => {
            ctx.clearRect(0, 0, width, height);
            if (kind === 'petals') {
                items.forEach((p) => drawPetal(ctx, p));
                return;
            }
            items.forEach((f) => {
                const pulse = Math.max(0, Math.sin(seconds * f.rate + f.phase));
                ctx.globalAlpha = pulse * pulse * pulse;
                ctx.drawImage(glow, f.x - f.size, f.y - f.size, f.size * 2, f.size * 2);
            });
            ctx.globalAlpha = 1;
        };

        const step = (now) => {
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            if (kind === 'petals') {
                items.forEach((p, index) => {
                    p.flip += p.flutter * dt;
                    p.turn += p.spin * dt;
                    p.x += (p.vx + Math.sin(p.flip) * 14) * dt;
                    p.y += (p.vy + Math.cos(p.flip * 0.7) * 6) * dt;
                    if (p.y > height + 24 || p.x < -24) items[index] = petal(width, height, false);
                });
            } else {
                items.forEach((f) => {
                    f.heading += (Math.random() - 0.5) * 1.6 * dt;
                    f.x += Math.cos(f.heading) * f.speed * dt;
                    f.y += Math.sin(f.heading) * f.speed * 0.6 * dt;
                    if (f.x < -20) f.x = width + 20;
                    if (f.x > width + 20) f.x = -20;
                    if (f.y < height * 0.4 || f.y > height) f.heading = -f.heading;
                });
            }
            draw(now / 1000);
            frame = requestAnimationFrame(step);
        };

        const resize = () => {
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = Math.round(width * ratio);
            canvas.height = Math.round(height * ratio);
            ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
            populate();
            draw(1.2);
        };

        const sized = new ResizeObserver(resize);
        sized.observe(canvas);

        const seen = new IntersectionObserver(([entry]) => {
            cancelAnimationFrame(frame);
            if (entry.isIntersecting && !frozen) {
                last = performance.now();
                frame = requestAnimationFrame(step);
            }
        });
        seen.observe(canvas);

        return () => {
            cancelAnimationFrame(frame);
            sized.disconnect();
            seen.disconnect();
        };
    }, [kind, frozen]);

    return <canvas ref={ref} aria-hidden="true" className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} />;
};

export default Petals;
