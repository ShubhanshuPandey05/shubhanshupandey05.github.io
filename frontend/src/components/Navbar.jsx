import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const navLinks = [
    { label: 'About', href: 'about', type: 'scroll' },
    { label: 'Work', href: '/work', type: 'route' },
    { label: 'Blog', href: '/blog', type: 'route' },
    { label: 'Contact', href: 'contact', type: 'scroll' },
];

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (sectionId, attempts = 0) => {
        const el = document.getElementById(sectionId);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        if (attempts < 25) {
            setTimeout(() => scrollToSection(sectionId, attempts + 1), 100);
        }
    };

    const handleNavClick = (link) => {
        if (link.type === 'route') {
            navigate(link.href);
            return;
        }

        if (location.pathname !== '/') {
            navigate('/');
        }
        scrollToSection(link.href);
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? 'bg-bg-primary/90 backdrop-blur-md border-b border-border'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
                {/* Logo */}
                <Link
                    to="/"
                    className="font-serif text-xl md:text-2xl font-bold tracking-tight text-text-primary hover:text-accent transition-colors duration-300"
                >
                    SP<span className="text-accent">.</span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-10">
                    {navLinks.map((link) => (
                        <button
                            key={link.label}
                            onClick={() => handleNavClick(link)}
                            className="text-caption text-text-muted hover:text-text-primary transition-colors duration-300"
                        >
                            {link.label}
                        </button>
                    ))}
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-text-muted hover:text-text-primary transition-colors duration-300"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
                    </button>
                </div>

                {/* Mobile buttons */}
                <div className="flex md:hidden items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-text-muted hover:text-text-primary transition-colors"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
                    </button>
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="text-text-primary"
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="md:hidden bg-bg-primary border-b border-border overflow-hidden"
                    >
                        <div className="px-6 py-6 flex flex-col gap-5">
                            {navLinks.map((link) => (
                                <button
                                    key={link.label}
                                    onClick={() => {
                                        handleNavClick(link);
                                        setMobileOpen(false);
                                    }}
                                    className="text-caption text-text-muted hover:text-text-primary transition-colors text-left"
                                >
                                    {link.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
