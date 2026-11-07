import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCpu, FiEdit3, FiExternalLink, FiFileText, FiFolder, FiLayout, FiLink, FiPlus, FiUser } from 'react-icons/fi';
import api from '../../utils/api';
import { useSettings } from '../../context/SettingsContext';
import { PORTRAITS } from '../../ascii/portraits';
import PortraitPreview from '../../components/admin/PortraitPreview';
import { Card, PageHeader, Spinner, errorText, useToast } from '../../components/admin/ui';
import classicThumb from './assets/design-classic.webp';

const greeting = () => {
    const h = new Date().getHours();
    return h < 5 ? 'Working late' : h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const Stat = ({ to, icon: Icon, label, value, note }) => (
    <Link to={to} className="cms-stat">
        <span className="cms-stat__top">
            {label}
            <Icon aria-hidden="true" />
        </span>
        <span className="cms-stat__value">{value ?? '–'}</span>
        <span className="cms-stat__note">{note}</span>
    </Link>
);

const Dashboard = () => {
    const settings = useSettings();
    const toast = useToast();
    const [data, setData] = useState(null);
    const [fixing, setFixing] = useState(false);

    useEffect(() => {
        document.title = 'Dashboard · Studio';
        let alive = true;
        Promise.allSettled([api.get('/projects'), api.get('/skills'), api.get('/social-links'), api.get('/blogs/all'), api.get('/about')]).then(
            ([projects, skills, socials, blogs, about]) => {
                if (!alive) return;
                const list = (r) => (r.status === 'fulfilled' && Array.isArray(r.value.data) ? r.value.data : null);
                setData({
                    projects: list(projects),
                    skills: list(skills),
                    socials: list(socials),
                    blogs: list(blogs),
                    about: about.status === 'fulfilled' ? about.value.data : null,
                });
            }
        );
        return () => {
            alive = false;
        };
    }, []);

    const blogs = data?.blogs || [];
    const published = blogs.filter((b) => b.published).length;
    const title = data?.about?.title || '';
    const suggested = title.replace(/developer/gi, (m) => (m[0] === 'D' ? 'Engineer' : 'engineer'));

    // One click to switch the profile title from "Developer" to "Engineer".
    const fixTitle = async () => {
        setFixing(true);
        try {
            const { data: about } = await api.put('/about', { title: suggested });
            setData((d) => ({ ...d, about }));
            toast(`Profile title is now “${about.title}”`);
        } catch (error) {
            toast(`Couldn’t update the title: ${errorText(error)}`, 'err');
        } finally {
            setFixing(false);
        }
    };

    const design = settings.saved.design;
    const portrait = PORTRAITS[settings.saved.portrait];

    return (
        <div>
            <PageHeader
                eyebrow="Overview"
                title={`${greeting()}, Shubhanshu`}
                description="Everything on the public site is managed from here."
                actions={
                    <a className="cms-btn" href="/" target="_blank" rel="noreferrer">
                        <FiExternalLink /> View site
                    </a>
                }
            />

            {/developer/i.test(title) && (
                <div className="cms-alert" role="status">
                    <FiUser />
                    <div style={{ flex: 1 }}>
                        <strong>Your profile title still says “{title}”.</strong>
                        The site shows this title in the hero. Switch it to “{suggested}”?
                    </div>
                    <button type="button" className="cms-btn cms-btn--sm" onClick={fixTitle} disabled={fixing}>
                        {fixing && <Spinner />}
                        Use “{suggested}”
                    </button>
                </div>
            )}

            <section className="cms-hero">
                <div className="cms-hero__text">
                    <h2>Your site</h2>
                    <p>
                        {design === 'ascii'
                            ? 'The ASCII design is live: your portrait in characters, rewritten by scrolling.'
                            : 'The classic design is live: particle name, playable demos and the terminal.'}
                    </p>
                    <div className="cms-hero__live">
                        <span className="cms-badge cms-badge--live">{design === 'ascii' ? 'ASCII design' : 'Classic design'}</span>
                        {design === 'ascii' && <span className="cms-badge">{portrait.label} portrait</span>}
                        {!settings.available && <span className="cms-badge cms-badge--warn">Settings API not deployed</span>}
                    </div>
                    <Link to="/admin/appearance" className="cms-btn cms-btn--primary">
                        <FiLayout /> Change appearance
                    </Link>
                </div>
                <div className="cms-hero__art">
                    {design === 'ascii' ? (
                        <PortraitPreview url={portrait.url} rows={64} />
                    ) : (
                        <img src={classicThumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    )}
                </div>
            </section>

            <div className="cms-grid cms-grid--4" style={{ marginBottom: 18 }}>
                <Stat to="/admin/projects" icon={FiFolder} label="Projects" value={data?.projects?.length} note="Shown in the Work section" />
                <Stat to="/admin/skills" icon={FiCpu} label="Skills" value={data?.skills?.length} note="Grouped into the stack" />
                <Stat to="/admin/socials" icon={FiLink} label="Social links" value={data?.socials?.length} note="In the contact section" />
                <Stat
                    to="/admin/blogs"
                    icon={FiEdit3}
                    label="Notes"
                    value={data ? published : null}
                    note={data ? `${blogs.length - published} draft${blogs.length - published === 1 ? '' : 's'}` : 'Loading…'}
                />
            </div>

            <Card title="Quick actions">
                <div className="cms-quick">
                    <Link to="/admin/projects?new=1">
                        <FiPlus />
                        <span>
                            Add a project<small>Title, links, tech stack</small>
                        </span>
                    </Link>
                    <Link to="/admin/blogs?new=1">
                        <FiEdit3 />
                        <span>
                            Write a note<small>Markdown with live preview</small>
                        </span>
                    </Link>
                    <Link to="/admin/about">
                        <FiFileText />
                        <span>
                            Update résumé<small>Upload a new PDF</small>
                        </span>
                    </Link>
                    <Link to="/admin/appearance">
                        <FiLayout />
                        <span>
                            Switch design<small>ASCII or classic</small>
                        </span>
                    </Link>
                    <Link to="/admin/about">
                        <FiUser />
                        <span>
                            Edit profile<small>Title, email, stats</small>
                        </span>
                    </Link>
                    <a href="/" target="_blank" rel="noreferrer">
                        <FiArrowRight />
                        <span>
                            Open the site<small>In a new tab</small>
                        </span>
                    </a>
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;
