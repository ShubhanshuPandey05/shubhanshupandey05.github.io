import { useEffect, useState } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import CursorGlow from '../components/CursorGlow';

const Home = () => {
    const [about, setAbout] = useState(null);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [socialLinks, setSocialLinks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aboutRes, projectsRes, skillsRes, socialsRes] = await Promise.all([
                    api.get('/about'),
                    api.get('/projects'),
                    api.get('/skills'),
                    api.get('/social-links'),
                ]);
                setAbout(aboutRes.data);
                setProjects(projectsRes.data);
                setSkills(skillsRes.data);
                setSocialLinks(socialsRes.data);
            } catch (err) {
                console.error('Error loading portfolio data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-text-muted font-mono text-sm">Loading portfolio...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-900">
            <CursorGlow />
            <Navbar />
            <Hero about={about} />
            <About about={about} />
            <Skills skills={skills} />
            <Projects projects={projects} />
            <Contact about={about} socialLinks={socialLinks} />
            <Footer />
        </div>
    );
};

export default Home;
