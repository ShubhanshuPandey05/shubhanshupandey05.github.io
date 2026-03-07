import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    FiHome,
    FiUser,
    FiFolder,
    FiCpu,
    FiLink,
    FiEdit,
    FiLogOut,
    FiMenu,
    FiX,
} from 'react-icons/fi';
import { useState } from 'react';

const sidebarLinks = [
    { to: '/admin', label: 'Dashboard', icon: FiHome, end: true },
    { to: '/admin/about', label: 'About', icon: FiUser },
    { to: '/admin/projects', label: 'Projects', icon: FiFolder },
    { to: '/admin/skills', label: 'Skills', icon: FiCpu },
    { to: '/admin/socials', label: 'Socials', icon: FiLink },
    { to: '/admin/blogs', label: 'Blog', icon: FiEdit },
];

const AdminLayout = () => {
    const { isAuthenticated, loading, logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return (
        <div className="min-h-screen bg-dark-900 flex">
            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-dark-800 border-r border-glass-border transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6">
                    {/* Logo */}
                    <div className="flex items-center justify-between mb-8">
                        <a href="/" className="text-xl font-bold font-mono">
                            <span className="text-primary">&lt;</span>
                            Dev
                            <span className="text-primary">/&gt;</span>
                        </a>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-text-muted hover:text-text-primary"
                        >
                            <FiX className="text-xl" />
                        </button>
                    </div>

                    <span className="text-[10px] uppercase tracking-widest text-text-muted font-semibold mb-4 block">
                        Management
                    </span>

                    {/* Nav Links */}
                    <nav className="flex flex-col gap-1">
                        {sidebarLinks.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                onClick={() => setSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-text-secondary hover:bg-dark-700 hover:text-text-primary'
                                    }`
                                }
                            >
                                <link.icon className="text-lg" />
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* Logout */}
                <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-glass-border">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200"
                    >
                        <FiLogOut className="text-lg" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                />
            )}

            {/* Main Content */}
            <main className="flex-1 min-h-screen">
                {/* Top bar */}
                <div className="sticky top-0 z-20 bg-dark-900/80 backdrop-blur-xl border-b border-glass-border px-6 py-4 flex items-center gap-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-text-primary text-xl"
                    >
                        <FiMenu />
                    </button>
                    <h1 className="text-sm font-medium text-text-secondary font-mono">
                        Admin Panel
                    </h1>
                </div>

                <div className="p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
