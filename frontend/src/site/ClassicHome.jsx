import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import Navbar from './ClassicNavbar';
import Footer from './ClassicFooter';
import Hero from './sections/Hero';
import About, { Marquee } from './sections/About';
import Work from './sections/Work';
import SystemMap from './sections/SystemMap';
import Experience from './sections/Experience';
import Skills from './sections/Skills';
import Terminal from './sections/Terminal';
import Notes from './sections/Notes';
import Contact from './sections/Contact';
import SecretsTracker from './SecretsTracker';
import Preloader from './Preloader';
import { confetti, unlock } from './secrets';
import * as content from '../data/content';
import { curate, experienceFrom, prefaceFrom } from '../data/live';
import './site.css';

const ClassicHome = () => {
    const location = useLocation();

    useEffect(() => {
        document.title = 'Shubhanshu Pandey · Backend Engineer';
    }, []);
    const [remote, setRemote] = useState({ about: null, socials: [], blogs: [], projects: [], skills: [], experience: [] });

    // Render the curated copy immediately, then layer in live data from the CMS when it arrives.
    useEffect(() => {
        let alive = true;
        Promise.allSettled([
            api.get('/about'),
            api.get('/social-links'),
            api.get('/blogs'),
            api.get('/projects'),
            api.get('/skills'),
            api.get('/experience'),
        ]).then(([about, socials, blogs, projects, skills, experience]) => {
            if (!alive) return;
            const ok = (r) => (r.status === 'fulfilled' ? r.value.data : null);
            setRemote({
                about: ok(about),
                socials: Array.isArray(ok(socials)) ? ok(socials) : [],
                blogs: Array.isArray(ok(blogs)) ? ok(blogs) : [],
                projects: Array.isArray(ok(projects)) ? ok(projects) : [],
                skills: Array.isArray(ok(skills)) ? ok(skills) : [],
                experience: Array.isArray(ok(experience)) ? ok(experience) : [],
            });
        });
        return () => {
            alive = false;
        };
    }, []);

    const data = useMemo(() => {
        const about = remote.about || {};
        const profile = {
            ...content.profile,
            title: about.title || content.profile.title,
            email: about.email || content.profile.email,
            stats: { ...content.profile.stats, ...(about.stats || {}) },
        };
        const projects = remote.projects.length
            ? [...remote.projects].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map(curate)
            : content.projects;
        const skills = remote.skills.length
            ? [...remote.skills].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            : content.skills;
        const socials = remote.socials.length
            ? [...remote.socials].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
            : content.socials;
        const blogs = remote.blogs.filter((b) => b.published !== false);
        const github = socials.find((s) => /github/i.test(s.platform))?.url || content.socials[0].url;
        const experience = experienceFrom(remote.experience);
        const preface = prefaceFrom(remote.about);
        return { profile, projects, skills, socials, blogs, github, experience, preface };
    }, [remote]);

    // Konami code anywhere on the page unlocks a secret.
    useEffect(() => {
        const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let pos = 0;
        const onKey = (e) => {
            const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
            pos = k === code[pos] ? pos + 1 : k === code[0] ? 1 : 0;
            if (pos === code.length) {
                pos = 0;
                unlock('hire');
                confetti(window.innerWidth / 2, window.innerHeight / 2, 220);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // Support /#works style links from other pages and the nav.
    useEffect(() => {
        if (!location.hash) return undefined;
        const id = location.hash.slice(1);
        let tries = 0;
        const timer = setInterval(() => {
            const el = document.getElementById(id);
            if (el || tries++ > 20) {
                clearInterval(timer);
                el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 60);
        return () => clearInterval(timer);
    }, [location.hash, location.key]);

    const tech = ['Node.js', 'Python', 'PostgreSQL', 'Redis', 'BullMQ', 'WebSockets', 'Playwright', 'Docker', 'AWS', 'Nginx', 'MongoDB', 'Twilio'];

    return (
        <div className="sp">
            <Preloader />
            <Navbar />
            <main>
                <Hero profile={data.profile} />
                <Marquee items={tech} />
                <About copy={data.preface} stats={data.profile.stats} education={content.education} />
                <Work projects={data.projects} githubUrl={data.github} />
                <SystemMap />
                <Experience experience={data.experience} />
                <Skills skills={data.skills} groups={content.skillGroups} />
                <Terminal data={data} />
                <Notes blogs={data.blogs} index="07" />
                <Contact email={data.profile.email} socials={data.socials} index="08" />
            </main>
            <Footer />
            <SecretsTracker />
        </div>
    );
};

export default ClassicHome;
