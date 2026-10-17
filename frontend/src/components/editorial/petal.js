// Shared petal drawing used by the falling-petal field and the cursor trail.
export const PETAL_COLORS = ['#9b0d23', '#c21a36', '#e48a99', '#f1c9cf', '#5e0614'];

export const drawPetal = (ctx, x, y, size, angle, color, alpha = 1, flip = 1) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(1, flip);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    // Teardrop with a small notch at the tip, the classic sakura petal.
    ctx.moveTo(0, size);
    ctx.bezierCurveTo(-size * 0.9, size * 0.4, -size * 0.7, -size * 0.7, -size * 0.18, -size);
    ctx.lineTo(0, -size * 0.72);
    ctx.lineTo(size * 0.18, -size);
    ctx.bezierCurveTo(size * 0.7, -size * 0.7, size * 0.9, size * 0.4, 0, size);
    ctx.fill();
    ctx.restore();
};

export const prefersReducedMotion = () =>
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
