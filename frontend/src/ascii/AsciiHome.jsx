import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import Navbar from './Navbar';
import Footer from './Footer';
import AsciiStage from './Stage';
import { buildScenes, sectionNumbers } from './scenes';
import Hero from './sections/Hero';
import About from './sections/About';
import Work from './sections/Work';
import Experience from './sections/Experience';
import Stack from './sections/Stack';
import Notes from './sections/Notes';
import Contact from './sections/Contact';
import * as content from '../data/content';
import { curate, experienceFrom, prefaceFrom } from '../data/live';
import { useSettings } from '../context/SettingsContext';
import { portraitUrl } from './portraits';

const AsciiHome = () => {
    const location = useLocation();
    const [remote, setRemote] = useState({ about: null, socials: [], blogs: [], projects: [], skills: [], experience: [] });
    const [portraitChars, setPortraitChars] = useState(0);
    const { portrait } = useSettings();

    useEffect(() => {
        document.title = 'Shubhanshu Pandey · Backend Engineer';
    }, []);

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

    const scenes = useMemo(
        () =>
            buildScenes({
                profile: data.profile,
                preface: data.preface,
                projects: data.projects,
                experience: data.experience,
                skills: data.skills,
                blogs: data.blogs,
                socials: data.socials,
            }),
        [data]
    );
    const n = sectionNumbers(data.blogs.length > 0);

    const onStageInfo = useCallback((info) => {
        if (info.scene === 'hero' && info.count) setPortraitChars(info.count);
    }, []);

    // Support /#work style links from other pages and the nav.
    useEffect(() => {
        if (!location.hash) return undefined;
        const id = decodeURIComponent(location.hash.slice(1));
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
        <div className="ax ax-home">
            <Navbar />
            <AsciiStage scenes={scenes} portrait={portraitUrl(portrait)} onInfo={onStageInfo} />
            <main className="ax-main" id="main">
                <Hero profile={data.profile} count={portraitChars} />
                <About copy={data.preface} stats={data.profile.stats} education={content.education} n={n.about} />
                <Work projects={data.projects} githubUrl={data.github} n={n.work} />
                <Experience experience={data.experience} n={n.experience} />
                <Stack skills={data.skills} groups={content.skillGroups} n={n.stack} />
                {data.blogs.length > 0 && <Notes blogs={data.blogs} n={n.notes} />}
                <Contact email={data.profile.email} socials={data.socials} n={n.contact} />
                <Footer />
            </main>
        </div>
    );
};

export default AsciiHome;
