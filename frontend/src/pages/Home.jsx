import { useEffect, useState } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Blog from '../components/Blog';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import CursorGlow from '../components/CursorGlow';
import Projects from '../components/Projects';
import Skills from '../components/Skills';

const Home = () => {
    const [about, setAbout] = useState(null);
    const [socialLinks, setSocialLinks] = useState([]);
    const [blogs, setBlogs] = useState([]);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aboutRes, socialsRes, blogsRes, projectsRes, skillsRes] = await Promise.allSettled([
                    api.get('/about'),
                    api.get('/social-links'),
                    api.get('/blogs'),
                    api.get('/projects'),
                    api.get('/skills'),
                ]);
                if (aboutRes.status === 'fulfilled') setAbout(aboutRes.value.data);
                if (socialsRes.status === 'fulfilled') setSocialLinks(socialsRes.value.data);
                if (blogsRes.status === 'fulfilled') setBlogs(blogsRes.value.data);
                if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.data);
                if (skillsRes.status === 'fulfilled') setSkills(skillsRes.value.data);
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
            {blogs.length > 0 ? (
                <Blog blogs={blogs} />
            ) : (
                <>
                    <Skills skills={skills} />
                    <Projects projects={projects} />
                </>
            )}
            <Contact about={about} socialLinks={socialLinks} />
            <Footer />
        </div>
    );
};

export default Home;
