import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

const navLinks = [
    { no: '01', label: 'Preface', hash: 'preface' },
    { no: '02', label: 'Experience', hash: 'experience' },
    { no: '03', label: 'Works', hash: 'works' },
    { no: '04', label: 'Toolkit', hash: 'toolkit' },
    { no: '05', label: 'Notes', to: '/blog' },
    { no: '06', label: 'Contact', hash: 'contact' },
];

const useSuratClock = () => {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(id);
    }, []);
    const time = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
    });
    const date = now.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
    });
    return { time, date, month: now.getMonth() + 1 };
};

const Navbar = () => {
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const [progress, setProgress] = useState(0);
    const { time, date, month } = useSuratClock();

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 40);
            const max = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(max > 0 ? window.scrollY / max : 0);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    const target = (link) => (link.to ? link.to : { pathname: '/', hash: `#${link.hash}` });

    return (
        <header className={`ed-nav ${scrolled || location.pathname !== '/' ? 'is-scrolled' : ''}`}>
            <div className="ed-nav__strip">
                <span>Vol. III &middot; No. {String(month).padStart(2, '0')}</span>
                <span className="ed-hide-sm">{date}</span>
                <span>
                    Surat <b>{time}</b> IST
                </span>
            </div>
            <div className="ed-nav__bar">
                <Link to="/" className="ed-nav__logo" data-cursor="home" onClick={() => setOpen(false)}>
                    <span className="ed-seal">桜</span>
                    <span>
                        Shubhanshu<em>Pandey</em>
                    </span>
                </Link>
                <nav className="ed-nav__links" aria-label="Primary">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            to={target(link)}
                            className={location.pathname.startsWith('/blog') && link.to === '/blog' ? 'is-active' : ''}
                        >
                            <sup>{link.no}</sup>
                            {link.label}
                        </Link>
                    ))}
                </nav>
                <a className="ed-nav__cta" href="mailto:shubhanshu855@gmail.com" data-cursor="say hi">
                    <span className="ed-pulse" /> Open to work
                </a>
                <button
                    className={`ed-nav__burger ${open ? 'is-open' : ''}`}
                    onClick={() => setOpen((v) => !v)}
                    aria-label={open ? 'Close menu' : 'Open menu'}
                    aria-expanded={open}
                >
                    <span />
                    <span />
                </button>
            </div>
            <div className="ed-nav__progress" style={{ transform: `scaleX(${progress})` }} />

            <AnimatePresence>
                {open && (
                    <motion.div
                        className="ed-menu"
                        initial={{ clipPath: 'circle(0% at 100% 0%)' }}
                        animate={{ clipPath: 'circle(150% at 100% 0%)' }}
                        exit={{ clipPath: 'circle(0% at 100% 0%)' }}
                        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
                    >
                        <div className="ed-menu__links">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.label}
                                    initial={{ y: 40, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.15 + i * 0.05 }}
                                >
                                    <Link to={target(link)} onClick={() => setOpen(false)}>
                                        <sup>{link.no}</sup>
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                        <div className="ed-menu__foot">
                            <span>Surat {time} IST</span>
                            <a href="mailto:shubhanshu855@gmail.com">shubhanshu855@gmail.com</a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;
