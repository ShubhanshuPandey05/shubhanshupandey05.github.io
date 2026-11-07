import { useState } from 'react';
import { Link, Navigate, NavLink, Outlet, useLocation } from 'react-router-dom';
import { FiCpu, FiEdit3, FiExternalLink, FiFolder, FiGrid, FiLayout, FiLink, FiLogOut, FiMenu, FiMoon, FiSun, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ConfirmProvider, Spinner, ToastProvider } from './ui';
import './cms.css';

const NAV = [
    { group: 'Overview', items: [{ to: '/admin', label: 'Dashboard', icon: FiGrid, end: true }] },
    { group: 'Site', items: [{ to: '/admin/appearance', label: 'Appearance', icon: FiLayout }] },
    {
        group: 'Content',
        items: [
            { to: '/admin/about', label: 'Profile', icon: FiUser },
            { to: '/admin/projects', label: 'Projects', icon: FiFolder },
            { to: '/admin/skills', label: 'Skills', icon: FiCpu },
            { to: '/admin/socials', label: 'Social links', icon: FiLink },
            { to: '/admin/blogs', label: 'Notes', icon: FiEdit3 },
        ],
    },
];

const titleFor = (pathname) => NAV.flatMap((g) => g.items).find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to)))?.label || 'Studio';

const AdminLayout = () => {
    const { isAuthenticated, loading, logout, email } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { pathname } = useLocation();
    const [navOpen, setNavOpen] = useState(false);

    // Close the mobile menu whenever the page changes (adjusted during render).
    const [lastPath, setLastPath] = useState(pathname);
    if (pathname !== lastPath) {
        setLastPath(pathname);
        setNavOpen(false);
    }

    if (loading) {
        return (
            <div className="cms">
                <div className="cms-loading">
                    <Spinner />
                </div>
            </div>
        );
    }
    if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

    const light = theme === 'light';

    return (
        <div className="cms">
            <ToastProvider>
                <ConfirmProvider>
                    <div className={`cms-shell ${navOpen ? 'is-nav-open' : ''}`}>
                        <aside className="cms-side" aria-label="Studio">
                            <Link to="/admin" className="cms-brand">
                                <span className="cms-brand__mark">SP</span>
                                <span className="cms-brand__name">
                                    <strong>Studio</strong>
                                    <span>shubhanshu.pandey</span>
                                </span>
                            </Link>
                            <nav className="cms-nav" aria-label="Sections">
                                {NAV.map((group) => (
                                    <div key={group.group}>
                                        <p className="cms-nav__group">{group.group}</p>
                                        {group.items.map((item) => (
                                            <NavLink key={item.to} to={item.to} end={item.end}>
                                                <item.icon aria-hidden="true" />
                                                {item.label}
                                            </NavLink>
                                        ))}
                                    </div>
                                ))}
                            </nav>
                            <div className="cms-side__foot">
                                <a href="/" target="_blank" rel="noreferrer">
                                    <FiExternalLink aria-hidden="true" />
                                    View site
                                </a>
                                <button type="button" onClick={toggleTheme}>
                                    {light ? <FiMoon aria-hidden="true" /> : <FiSun aria-hidden="true" />}
                                    {light ? 'Dark theme' : 'Light theme'}
                                </button>
                                <button type="button" onClick={logout}>
                                    <FiLogOut aria-hidden="true" />
                                    Sign out
                                </button>
                                {email && <p className="cms-side__who">{email}</p>}
                            </div>
                        </aside>
                        <div className="cms-scrim" onClick={() => setNavOpen(false)} />
                        <div className="cms-main">
                            <header className="cms-top">
                                <button
                                    type="button"
                                    className="cms-btn cms-btn--ghost cms-btn--icon"
                                    onClick={() => setNavOpen(true)}
                                    aria-label="Open menu"
                                    aria-expanded={navOpen}
                                >
                                    <FiMenu />
                                </button>
                                <strong>{titleFor(pathname)}</strong>
                            </header>
                            <main className="cms-page" id="cms-main">
                                <Outlet />
                            </main>
                        </div>
                    </div>
                </ConfirmProvider>
            </ToastProvider>
        </div>
    );
};

export default AdminLayout;
