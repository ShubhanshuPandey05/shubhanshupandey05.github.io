import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SoundToggle from './ink/SoundToggle';

const links = [
    { label: 'About', hash: 'about' },
    { label: 'Experience', hash: 'experience' },
    { label: 'Work', hash: 'work' },
    { label: 'Skills', hash: 'skills' },
    { label: 'Notes', to: '/blog' },
    { label: 'Contact', hash: 'contact' },
];

// A plain top bar: name on the left, chapters in the middle, sound and résumé on the right.
const Navbar = () => {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState('');

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 24);
            let current = '';
            links.forEach((l) => {
                const el = l.hash && document.getElementById(l.hash);
                if (el && el.getBoundingClientRect().top < window.innerHeight * 0.4) current = l.hash;
            });
            setActive(current);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [location.pathname]);

    useEffect(() => setOpen(false), [location.pathname, location.hash]);

    useEffect(() => {
        document.documentElement.classList.toggle('ik-menu-open', open);
        return () => document.documentElement.classList.remove('ik-menu-open');
    }, [open]);

    return (
        <header className={`ik-nav ${scrolled ? 'is-scrolled' : ''} ${open ? 'is-open' : ''}`}>
            <Link to="/" className="ik-nav__logo" data-cursor="home">
                <span className="ik-nav__mark" aria-hidden="true">山</span>
                <span>Shubhanshu Pandey</span>
            </Link>
            <nav className="ik-nav__links" aria-label="Main">
                {links.map((l, i) => {
                    const isActive = l.to ? location.pathname.startsWith(l.to) : location.pathname === '/' && active === l.hash;
                    return (
                        <Link
                            key={l.label}
                            to={l.to || { pathname: '/', hash: `#${l.hash}` }}
                            className={isActive ? 'is-active' : ''}
                            style={{ '--i': i }}
                        >
                            {l.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="ik-nav__tools">
                <SoundToggle />
                <Link to="/resume" className="ik-btn ik-btn--small" data-cursor="read">
                    Résumé
                </Link>
                <button
                    type="button"
                    className="ik-nav__burger"
                    aria-expanded={open}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    onClick={() => setOpen((v) => !v)}
                >
                    <span />
                    <span />
                </button>
            </div>
        </header>
    );
};

export default Navbar;
