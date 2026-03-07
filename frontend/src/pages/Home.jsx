import { useEffect, useState } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Projects from '../components/Projects';
import Blog from '../components/Blog';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import CursorGlow from '../components/CursorGlow';

const Home = () => {
    const [about, setAbout] = useState(null);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [socialLinks, setSocialLinks] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aboutRes, projectsRes, skillsRes, socialsRes, blogsRes] = await Promise.allSettled([
                    api.get('/about'),
                    api.get('/projects'),
                    api.get('/skills'),
                    api.get('/social-links'),
                    api.get('/blogs'),
                ]);
                if (aboutRes.status === 'fulfilled') setAbout(aboutRes.value.data);
                if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.data);
                if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value.data);
                if (socialsRes.status === 'fulfilled') setSocialLinks(socialsRes.value.data);
                if (blogsRes.status === 'fulfilled') setBlogs(blogsRes.value.data);
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
            <Hero about={about} />
            <About about={about} />
            <Skills skills={skills} />
            <Projects projects={projects} />
            <Blog blogs={blogs} />
            <Contact about={about} socialLinks={socialLinks} />
            <Footer />
        </div>
    );
};

export default Home;
