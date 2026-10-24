import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SoundToggle, ThemeToggle } from '../site/Toggles';

export const CHAPTERS = [
    { id: 'about', label: 'About' },
    { id: 'work', label: 'Work' },
    { id: 'system', label: 'System' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Toolbox' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'notes', label: 'Notes' },
    { id: 'contact', label: 'Contact' },
];

// Desktop: a fixed chapter rail on the left with reading progress.
// Mobile: a slim top bar and a full-screen menu.
const Navbar = () => {
    const { pathname, hash } = useLocation();
    const onHome = pathname === '/';
    const [active, setActive] = useState('');
    const [progress, setProgress] = useState(0);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        document.documentElement.classList.add('sp-has-rail');
        return () => document.documentElement.classList.remove('sp-has-rail');
    }, []);

    useEffect(() => {
        let raf = 0;
        const update = () => {
            raf = 0;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(max > 0 ? window.scrollY / max : 0);
            let cur = '';
            CHAPTERS.forEach((c) => {
                const el = document.getElementById(c.id);
                if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) cur = c.id;
            });
            setActive(cur);
        };
        const onScroll = () => {
            if (!raf) raf = requestAnimationFrame(update);
        };
        update();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
        };
    }, [pathname]);

    useEffect(() => setOpen(false), [pathname, hash]);
    useEffect(() => {
        document.documentElement.classList.toggle('sp-menu-open', open);
        return () => document.documentElement.classList.remove('sp-menu-open');
    }, [open]);

    const to = (id) => ({ pathname: '/', hash: `#${id}` });
    const isActive = (id) => (id === 'notes' && pathname.startsWith('/blog')) || (onHome && active === id);

    return (
        <>
            <aside className="sp-rail" aria-label="Chapters">
                <Link to="/" className="sp-rail__logo" data-cursor="home" aria-label="Home">
                    S<span>P</span>
                </Link>
                <nav className="sp-rail__nav">
                    {CHAPTERS.map((c, i) => (
                        <Link key={c.id} to={to(c.id)} className={isActive(c.id) ? 'is-active' : ''}>
                            <span className="sp-rail__num">{String(i + 1).padStart(2, '0')}</span>
                            <span className="sp-rail__label">{c.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="sp-rail__progress" aria-hidden="true">
                    <span style={{ transform: `scaleY(${progress})` }} />
                </div>
                <div className="sp-rail__tools">
                    <SoundToggle />
                    <ThemeToggle />
                </div>
                <Link to="/resume" className="sp-rail__cv" data-cursor="read">
                    Résumé
                </Link>
            </aside>

            <header className="sp-topbar">
                <Link to="/" className="sp-topbar__logo" aria-label="Home">
                    S<span>P</span>
                </Link>
                <span className="sp-topbar__name">Shubhanshu Pandey</span>
                <SoundToggle />
                <ThemeToggle />
                <button
                    type="button"
                    className={`sp-burger ${open ? 'is-open' : ''}`}
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                >
                    <span />
                    <span />
                </button>
                <span className="sp-topbar__progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
            </header>

            <Link to={to('contact')} className="sp-talk" data-cursor="say hi">
                <span className="sp-live" /> Let’s talk
            </Link>

            <div className={`sp-menu ${open ? 'is-open' : ''}`} aria-hidden={!open}>
                <nav>
                    {CHAPTERS.map((c, i) => (
                        <Link key={c.id} to={to(c.id)} tabIndex={open ? 0 : -1} style={{ '--i': i }}>
                            <span className="sp-mono">{String(i + 1).padStart(2, '0')}</span>
                            {c.label}
                        </Link>
                    ))}
                    <Link to="/resume" tabIndex={open ? 0 : -1} style={{ '--i': CHAPTERS.length }}>
                        <span className="sp-mono">CV</span>
                        Résumé
                    </Link>
                </nav>
            </div>
        </>
    );
};

export default Navbar;
