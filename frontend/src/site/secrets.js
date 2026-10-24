import { useEffect, useState } from 'react';
import { storage } from './lib';

// Small things to find on the site. Unlocking one shows a toast and fills the tracker.
export const SECRETS = [
    { id: 'scatter', title: 'Particle physicist', hint: 'Click the hero to scatter my name.' },
    { id: 'request', title: 'First request', hint: 'Send a request through the system map.' },
    { id: 'project', title: 'Hands on', hint: 'Play with one of the project demos.' },
    { id: 'fling', title: 'Skill thrower', hint: 'Grab a skill bubble and throw it.' },
    { id: 'terminal', title: 'Shell access', hint: 'Run any command in the terminal.' },
    { id: 'hire', title: 'Insider', hint: 'Find the command that hires me. Or try the Konami code.' },
    { id: 'end', title: 'Scrolled to the end', hint: 'Reach the contact section.' },
];

const KEY = 'sp_secrets_v1';
const listeners = new Set();
let found = new Set(storage.get(KEY, []).filter((id) => SECRETS.some((s) => s.id === id)));

const emit = (fresh) => listeners.forEach((fn) => fn([...found], fresh));

export const unlock = (id) => {
    if (found.has(id) || !SECRETS.some((s) => s.id === id)) return false;
    found = new Set(found).add(id);
    storage.set(KEY, [...found]);
    emit(SECRETS.find((s) => s.id === id));
    return true;
};

export const resetSecrets = () => {
    found = new Set();
    storage.set(KEY, []);
    emit(null);
};

export const subscribeSecrets = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
};

export const useSecrets = () => {
    const [list, setList] = useState(() => [...found]);
    useEffect(() => subscribeSecrets((l) => setList(l)), []);
    return list;
};

// Confetti from a screen point, drawn on a temporary full-screen canvas.
const COLORS = ['#ff5b2e', '#ffb199', '#5cf2b5', '#f2efe9', '#ffd166', '#8ab4ff'];
export const confetti = (x = window.innerWidth / 2, y = window.innerHeight / 2, count = 120) => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const c = document.createElement('canvas');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    c.width = window.innerWidth * dpr;
    c.height = window.innerHeight * dpr;
    c.className = 'sp-confetti';
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    const parts = Array.from({ length: count }, () => {
        const a = Math.random() * Math.PI * 2;
        const v = 4 + Math.random() * 9;
        return {
            x,
            y,
            vx: Math.cos(a) * v,
            vy: Math.sin(a) * v - 6,
            r: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.4,
            w: 5 + Math.random() * 6,
            h: 3 + Math.random() * 4,
            c: COLORS[(Math.random() * COLORS.length) | 0],
        };
    });
    const t0 = performance.now();
    const tick = (t) => {
        const age = t - t0;
        ctx.clearRect(0, 0, c.width, c.height);
        parts.forEach((p) => {
            p.vy += 0.32;
            p.vx *= 0.985;
            p.x += p.vx;
            p.y += p.vy;
            p.r += p.vr;
            ctx.save();
            ctx.globalAlpha = Math.max(0, 1 - age / 1800);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.r);
            ctx.fillStyle = p.c;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
            ctx.restore();
        });
        if (age < 1800) requestAnimationFrame(tick);
        else c.remove();
    };
    requestAnimationFrame(tick);
};
