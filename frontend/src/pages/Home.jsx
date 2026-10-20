import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AsciiHero from '../components/zen/AsciiHero';
import Haiku from '../components/zen/Haiku';
import Path from '../components/zen/Path';
import Emaki from '../components/zen/Emaki';
import RockGarden from '../components/zen/RockGarden';
import Notes from '../components/zen/Notes';
import Terminal from '../components/zen/Terminal';
import * as content from '../data/content';

// Pair an API project with its curated, rewritten copy (matched by repo URL or title).
const curate = (apiProject) => {
    const haystack = `${apiProject.githubUrl || ''} ${apiProject.title || ''}`.toLowerCase();
    const curated = content.projects.find((c) => c.match.some((m) => haystack.includes(m)));
    if (curated) {
        return {
            ...curated,
            githubUrl: apiProject.githubUrl || curated.githubUrl,
            liveUrl: apiProject.liveUrl || curated.liveUrl,
        };
    }
    return {
        key: null,
        title: apiProject.title,
        kicker: apiProject.category || 'Project',
        year: apiProject.createdAt ? String(new Date(apiProject.createdAt).getFullYear()) : '',
        deck: apiProject.description,
        body: apiProject.longDescription ? [apiProject.longDescription] : [],
        techStack: apiProject.techStack || [],
        githubUrl: apiProject.githubUrl,
        liveUrl: apiProject.liveUrl,
    };
};

const Home = () => {
    const location = useLocation();
    const [remote, setRemote] = useState({ about: null, socials: [], blogs: [], projects: [], skills: [] });

    // Render the curated copy immediately, then layer in live data from the CMS when it arrives.
    useEffect(() => {
        let alive = true;
        Promise.allSettled([
            api.get('/about'),
            api.get('/social-links'),
            api.get('/blogs'),
            api.get('/projects'),
            api.get('/skills'),
        ]).then(([about, socials, blogs, projects, skills]) => {
            if (!alive) return;
            const ok = (r) => (r.status === 'fulfilled' ? r.value.data : null);
            setRemote({
                about: ok(about),
                socials: Array.isArray(ok(socials)) ? ok(socials) : [],
                blogs: Array.isArray(ok(blogs)) ? ok(blogs) : [],
                projects: Array.isArray(ok(projects)) ? ok(projects) : [],
                skills: Array.isArray(ok(skills)) ? ok(skills) : [],
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
        return { profile, projects, skills, socials, blogs, github };
    }, [remote]);

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

    return (
        <div className="zn">
            <Navbar />
            <main className="zn-main">
                <AsciiHero profile={data.profile} />
                <Haiku copy={content.preface} stats={data.profile.stats} />
                <Path experience={content.experience} education={content.education} />
                <Emaki projects={data.projects} githubUrl={data.github} />
                <RockGarden skills={data.skills} groups={content.skillGroups} />
                <Notes blogs={data.blogs} />
                <Terminal email={data.profile.email} socials={data.socials} />
            </main>
            <Footer />
        </div>
    );
};

export default Home;
