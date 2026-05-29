import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Footer from '../components/Footer';
import CursorGlow from '../components/CursorGlow';

const WorkPage = () => {
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projectsRes, skillsRes] = await Promise.allSettled([
                    api.get('/projects'),
                    api.get('/skills'),
                ]);
                if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.data);
                if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value.data);
            } catch (err) {
                console.error('Error loading work data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-bg-primary flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-xs text-text-muted tracking-widest uppercase">Loading</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-primary">
            <CursorGlow />
            <Navbar />

            {/* Page header */}
            <div className="pt-32 pb-8 px-6 md:px-12 max-w-7xl mx-auto">
                <motion.a
                    href="/"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="inline-flex items-center gap-2 text-caption text-text-muted hover:text-text-primary transition-colors mb-12"
                >
                    <FiArrowLeft size={14} /> Back to Home
                </motion.a>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                >
                    <span className="text-caption text-accent block mb-4">Portfolio</span>
                    <h1 className="text-display">
                        Work<span className="text-accent">.</span>
                    </h1>
                </motion.div>
            </div>

            <Skills skills={skills} />
            <Projects projects={projects} />
            <Footer />
        </div>
    );
};

export default WorkPage;
