import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
// The design's stylesheet loads with its navigation, which every page of this design renders.
import './ascii.css';

export const CHAPTERS = [
    { id: 'about', label: 'About' },
    { id: 'work', label: 'Work' },
    { id: 'experience', label: 'Experience' },
    { id: 'stack', label: 'Stack' },
    { id: 'contact', label: 'Contact' },
];

export const ThemeToggle = ({ className = '' }) => {
    const { theme, toggleTheme } = useTheme();
    const light = theme === 'light';
    return (
        <button
            type="button"
            className={`ax-theme ${className}`}
            onClick={toggleTheme}
            aria-label={light ? 'Switch to dark theme' : 'Switch to light theme'}
        >
            <span className={light ? 'is-on' : ''}>light</span>
            <i aria-hidden="true">/</i>
            <span className={light ? '' : 'is-on'}>dark</span>
        </button>
    );
};

// A fixed top bar. On the home page the current section is marked as you scroll.
const Navbar = () => {
    const { pathname, hash } = useLocation();
    const onHome = pathname === '/';
    const [active, setActive] = useState('');
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!onHome) return undefined;
        let raf = 0;
        const update = () => {
            raf = 0;
            let cur = '';
            CHAPTERS.forEach((c) => {
                const el = document.getElementById(c.id);
                if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) cur = c.id;
            });
            const notes = document.getElementById('notes');
            if (notes && notes.getBoundingClientRect().top < window.innerHeight * 0.5) {
                const contact = document.getElementById('contact');
                if (!contact || contact.getBoundingClientRect().top >= window.innerHeight * 0.5) cur = 'notes';
            }
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
    }, [onHome]);

    // Close the menu whenever the location changes (adjusted during render, not in an effect).
    const here = `${pathname}${hash}`;
    const [lastHere, setLastHere] = useState(here);
    if (here !== lastHere) {
        setLastHere(here);
        setOpen(false);
    }

    useEffect(() => {
        document.documentElement.classList.toggle('ax-menu-open', open);
        if (!open) return undefined;
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        window.addEventListener('keydown', onKey);
        return () => {
            window.removeEventListener('keydown', onKey);
            document.documentElement.classList.remove('ax-menu-open');
        };
    }, [open]);

    const to = (id) => ({ pathname: '/', hash: `#${id}` });
    const isActive = (id) => onHome && active === id;
    const notesActive = pathname.startsWith('/blog') || (onHome && active === 'notes');

    return (
        <>
            <a href="#main" className="ax-skip">
                Skip to content
            </a>
            <header className="ax-bar">
                <Link to="/" className="ax-bar__mark" aria-label="Shubhanshu Pandey, home">
                    SP<span className="ax-caret" aria-hidden="true" />
                </Link>
                <span className="ax-bar__who">
                    Shubhanshu Pandey <i aria-hidden="true">/</i> backend engineer
                </span>
                <nav className="ax-bar__nav" aria-label="Sections">
                    {CHAPTERS.map((c) => (
                        <Link key={c.id} to={to(c.id)} className={isActive(c.id) ? 'is-active' : ''} aria-current={isActive(c.id) ? 'true' : undefined}>
                            {c.label}
                        </Link>
                    ))}
                    <Link to="/blog" className={notesActive ? 'is-active' : ''}>
                        Notes
                    </Link>
                </nav>
                <ThemeToggle className="ax-bar__theme" />
                <Link to="/resume" className="ax-bar__cv">
                    Résumé <span aria-hidden="true">↗</span>
                </Link>
                <button
                    type="button"
                    className="ax-burger"
                    onClick={() => setOpen((v) => !v)}
                    aria-expanded={open}
                    aria-controls="ax-menu"
                >
                    {open ? '[ close ]' : '[ menu ]'}
                </button>
            </header>

            <div id="ax-menu" className={`ax-menu ${open ? 'is-open' : ''}`} inert={!open}>
                <nav aria-label="Menu">
                    {CHAPTERS.map((c, i) => (
                        <Link key={c.id} to={to(c.id)} style={{ '--i': i }}>
                            <span>{String(i + 1).padStart(2, '0')}</span>
                            {c.label}
                        </Link>
                    ))}
                    <Link to="/blog" style={{ '--i': CHAPTERS.length }}>
                        <span>{String(CHAPTERS.length + 1).padStart(2, '0')}</span>
                        Notes
                    </Link>
                    <Link to="/resume" style={{ '--i': CHAPTERS.length + 1 }}>
                        <span>cv</span>
                        Résumé
                    </Link>
                </nav>
                <ThemeToggle className="ax-menu__theme" />
            </div>
        </>
    );
};

export default Navbar;
