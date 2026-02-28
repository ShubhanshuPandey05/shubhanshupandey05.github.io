import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FiFolder, FiCpu, FiLink, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, count, color, to }) => (
    <Link
        to={to}
        className="glass rounded-xl p-6 hover:border-primary/30 transition-all duration-300 glow-hover group"
    >
        <div className={`inline-flex p-3 rounded-lg ${color} mb-4`}>
            <Icon className="text-xl" />
        </div>
        <h3 className="text-3xl font-bold text-text-primary mb-1">{count}</h3>
        <p className="text-sm text-text-muted group-hover:text-text-secondary transition-colors">
            {label}
        </p>
    </Link>
);

const Dashboard = () => {
    const [stats, setStats] = useState({ projects: 0, skills: 0, socials: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [projects, skills, socials] = await Promise.all([
                    api.get('/projects'),
                    api.get('/skills'),
                    api.get('/social-links'),
                ]);
                setStats({
                    projects: projects.data.length,
                    skills: skills.data.length,
                    socials: socials.data.length,
                });
            } catch (err) {
                console.error('Error fetching stats:', err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
                <p className="text-text-muted text-sm mt-1">
                    Manage your portfolio content from here.
                </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={FiUser}
                    label="About Info"
                    count="1"
                    color="bg-cyan-500/10 text-cyan-400"
                    to="/admin/about"
                />
                <StatCard
                    icon={FiFolder}
                    label="Projects"
                    count={stats.projects}
                    color="bg-emerald-500/10 text-emerald-400"
                    to="/admin/projects"
                />
                <StatCard
                    icon={FiCpu}
                    label="Skills"
                    count={stats.skills}
                    color="bg-violet-500/10 text-violet-400"
                    to="/admin/skills"
                />
                <StatCard
                    icon={FiLink}
                    label="Social Links"
                    count={stats.socials}
                    color="bg-orange-500/10 text-orange-400"
                    to="/admin/socials"
                />
            </div>

            <div className="mt-10 glass rounded-xl p-6">
                <h2 className="text-lg font-semibold text-text-primary mb-3">Quick Actions</h2>
                <div className="flex flex-wrap gap-3">
                    <Link
                        to="/admin/projects"
                        className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-dark-900 text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all"
                    >
                        + Add Project
                    </Link>
                    <Link
                        to="/admin/skills"
                        className="px-4 py-2 glass text-text-secondary text-sm font-medium rounded-lg hover:text-text-primary transition-all"
                    >
                        + Add Skill
                    </Link>
                    <a
                        href="/"
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 glass text-text-secondary text-sm font-medium rounded-lg hover:text-text-primary transition-all"
                    >
                        View Portfolio →
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
