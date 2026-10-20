import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import SoundToggle from './zen/SoundToggle';

// A vertical rail down the left edge (a bar along the bottom on phones),
// with the chapters numbered in kanji like the spine of a scroll.
const chapters = [
    { kanji: '一', label: 'Haiku', hash: 'haiku' },
    { kanji: '二', label: 'Path', hash: 'path' },
    { kanji: '三', label: 'Works', hash: 'works' },
    { kanji: '四', label: 'Garden', hash: 'garden' },
    { kanji: '五', label: 'Notes', to: '/blog' },
    { kanji: '六', label: 'Hello', hash: 'hello' },
];

const useClock = () => {
    const fmt = () =>
        new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
    const [time, setTime] = useState(fmt);
    useEffect(() => {
        const id = setInterval(() => setTime(fmt()), 30000);
        return () => clearInterval(id);
    }, []);
    return time;
};

const Navbar = () => {
    const location = useLocation();
    const time = useClock();
    const [active, setActive] = useState('');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const onScroll = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(max > 0 ? window.scrollY / max : 0);
            let current = '';
            chapters.forEach((c) => {
                const el = c.hash && document.getElementById(c.hash);
                if (el && el.getBoundingClientRect().top < window.innerHeight * 0.45) current = c.hash;
            });
            setActive(current);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [location.pathname]);

    return (
        <nav className="zn-rail" aria-label="Chapters">
            <Link to="/" className="zn-rail__seal" data-cursor="home" aria-label="Home">
                桜
            </Link>
            <div className="zn-rail__progress" aria-hidden="true">
                <span style={{ transform: `scaleY(${progress})`, '--p': progress }} />
            </div>
            <ul className="zn-rail__list">
                {chapters.map((c) => {
                    const isActive = c.to ? location.pathname.startsWith(c.to) : active === c.hash && location.pathname === '/';
                    return (
                        <li key={c.label}>
                            <Link
                                to={c.to || { pathname: '/', hash: `#${c.hash}` }}
                                className={isActive ? 'is-active' : ''}
                                aria-label={c.label}
                            >
                                <span className="zn-rail__kanji" aria-hidden="true">{c.kanji}</span>
                                <span className="zn-rail__label">{c.label}</span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
            <div className="zn-rail__foot">
                <SoundToggle label={false} />
                <span className="zn-rail__time" title="Time in Surat">{time}</span>
            </div>
        </nav>
    );
};

export default Navbar;
