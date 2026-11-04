import { useEffect, useState } from 'react';
import { reducedMotion } from './lib';

const LINES = [
    'booting api ............ ok',
    'connecting postgres .... ok',
    'warming redis cache .... ok',
    'starting workers [4] ... ok',
    'ready.',
];

const seen = () => {
    try {
        return sessionStorage.getItem('sp_booted') === '1';
    } catch {
        return false;
    }
};

// A one-second "server boot" the first time someone opens the site in a session.
const Preloader = () => {
    const [show, setShow] = useState(() => !seen() && !reducedMotion());
    const [pct, setPct] = useState(0);
    const [leaving, setLeaving] = useState(false);

    useEffect(() => {
        if (!show) return undefined;
        try {
            sessionStorage.setItem('sp_booted', '1');
        } catch {
            /* ignore */
        }
        document.documentElement.classList.add('sp-booting');
        const t0 = performance.now();
        const DURATION = 1300;
        let raf = 0;
        const tick = (t) => {
            const p = Math.min(1, (t - t0) / DURATION);
            setPct(Math.round((1 - Math.pow(1 - p, 3)) * 100));
            if (p < 1) raf = requestAnimationFrame(tick);
            else {
                setLeaving(true);
                document.documentElement.classList.remove('sp-booting');
                setTimeout(() => setShow(false), 700);
            }
        };
        raf = requestAnimationFrame(tick);
        return () => {
            cancelAnimationFrame(raf);
            document.documentElement.classList.remove('sp-booting');
        };
    }, [show]);

    if (!show) return null;
    const visible = Math.min(LINES.length, Math.floor((pct / 100) * (LINES.length + 0.5)));
    return (
        <div className={`sp-boot ${leaving ? 'is-leaving' : ''}`} aria-hidden="true">
            <div className="sp-boot__log">
                {LINES.slice(0, visible).map((l) => (
                    <p key={l}>
                        <span>$</span> {l}
                    </p>
                ))}
            </div>
            <div className="sp-boot__count">
                {String(pct).padStart(3, '0')}
                <span>%</span>
            </div>
            <div className="sp-boot__bar" style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
    );
};

export default Preloader;
