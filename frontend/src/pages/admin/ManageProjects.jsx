import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiEdit2, FiExternalLink, FiFolder, FiGithub, FiPlus, FiSearch, FiStar, FiTrash2 } from 'react-icons/fi';
import api from '../../utils/api';
import {
    Card,
    Drawer,
    EmptyState,
    Field,
    FileField,
    PageHeader,
    Skeleton,
    Spinner,
    Switch,
    TagInput,
    errorText,
    useConfirm,
    useToast,
} from '../../components/admin/ui';

const CATEGORIES = ['API', 'Full-Stack', 'Backend', 'DevOps', 'CLI', 'Other'];

const emptyProject = {
    title: '',
    description: '',
    longDescription: '',
    techStack: [],
    githubUrl: '',
    liveUrl: '',
    imageUrl: '',
    featured: false,
    category: 'Backend',
    order: 0,
};

const ManageProjects = () => {
    const toast = useToast();
    const confirm = useConfirm();
    const [params, setParams] = useSearchParams();
    const [projects, setProjects] = useState(null);
    const [query, setQuery] = useState('');
    const [editing, setEditing] = useState(null); // null, 'new' or the project being edited
    const [form, setForm] = useState(emptyProject);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            const { data } = await api.get('/projects');
            setProjects(data);
        } catch (error) {
            setProjects([]);
            toast(`Couldn’t load projects: ${errorText(error)}`, 'err');
        }
    }, [toast]);

    useEffect(() => {
        document.title = 'Projects · Studio';
        load();
    }, [load]);

    const openNew = () => {
        setForm({ ...emptyProject, order: projects?.length || 0 });
        setEditing('new');
    };

    // /admin/projects?new=1 (from the dashboard) opens a blank form once the list has loaded.
    const wantsNew = params.get('new') === '1';
    const [handledNew, setHandledNew] = useState(false);
    if (wantsNew && projects && !handledNew) {
        setHandledNew(true);
        setForm({ ...emptyProject, order: projects.length });
        setEditing('new');
    }
    useEffect(() => {
        if (handledNew && wantsNew) setParams({}, { replace: true });
    }, [handledNew, wantsNew, setParams]);

    const openEdit = (project) => {
        setForm({ ...emptyProject, ...project, techStack: project.techStack || [] });
        setEditing(project);
    };
    const close = useCallback(() => setEditing(null), []);
    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const save = async () => {
        setSaving(true);
        const payload = { ...form, order: Number(form.order) || 0 };
        try {
            if (editing === 'new') await api.post('/projects', payload);
            else await api.put(`/projects/${editing._id}`, payload);
            await load();
            toast(editing === 'new' ? 'Project added' : 'Project saved');
            close();
        } catch (error) {
            toast(`Couldn’t save: ${errorText(error)}`, 'err');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (project) => {
        const ok = await confirm({ title: `Delete “${project.title}”?`, body: 'It disappears from the site immediately. This can’t be undone.' });
        if (!ok) return;
        try {
            await api.delete(`/projects/${project._id}`);
            await load();
            toast('Project deleted');
        } catch (error) {
            toast(`Couldn’t delete: ${errorText(error)}`, 'err');
        }
    };

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!projects) return [];
        if (!q) return projects;
        return projects.filter((p) => `${p.title} ${p.description} ${(p.techStack || []).join(' ')}`.toLowerCase().includes(q));
    }, [projects, query]);

    return (
        <div>
            <PageHeader
                eyebrow="Content"
                title="Projects"
                description="Shown in the Work section, in this order. Featured projects are marked in the list."
                actions={
                    <button type="button" className="cms-btn cms-btn--primary" onClick={openNew}>
                        <FiPlus /> Add project
                    </button>
                }
            />

            {projects === null ? (
                <Skeleton />
            ) : projects.length === 0 ? (
                <EmptyState
                    icon={FiFolder}
                    title="No projects yet"
                    body="Add the first thing you’ve built and shipped."
                    action={
                        <button type="button" className="cms-btn cms-btn--primary" onClick={openNew}>
                            <FiPlus /> Add project
                        </button>
                    }
                />
            ) : (
                <>
                    <div className="cms-toolbar">
                        <div className="cms-input-wrap cms-search">
                            <FiSearch />
                            <input
                                className="cms-input"
                                placeholder="Search projects"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                aria-label="Search projects"
                            />
                        </div>
                        <span className="cms-muted cms-mono">
                            {shown.length} of {projects.length}
                        </span>
                    </div>
                    <Card bodyClass="">
                        <ul className="cms-list">
                            {shown.map((p) => (
                                <li className="cms-row" key={p._id}>
                                    <div className="cms-row__media">{p.imageUrl ? <img src={p.imageUrl} alt="" /> : (p.title || '?').slice(0, 1)}</div>
                                    <div className="cms-row__main">
                                        <div className="cms-row__title">
                                            <span>{p.title}</span>
                                            {p.featured && (
                                                <span className="cms-badge cms-badge--ok">
                                                    <FiStar size={11} /> Featured
                                                </span>
                                            )}
                                            <span className="cms-badge">{p.category}</span>
                                            <span className="cms-badge">#{p.order ?? 0}</span>
                                        </div>
                                        <div className="cms-row__sub">{p.description}</div>
                                        <div className="cms-row__meta">
                                            {(p.techStack || []).slice(0, 6).map((t) => (
                                                <span className="cms-chip" key={t}>
                                                    {t}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="cms-row__actions">
                                        {p.liveUrl && (
                                            <a className="cms-btn cms-btn--ghost cms-btn--icon" href={p.liveUrl} target="_blank" rel="noreferrer" aria-label={`Open ${p.title} live site`}>
                                                <FiExternalLink />
                                            </a>
                                        )}
                                        {p.githubUrl && (
                                            <a className="cms-btn cms-btn--ghost cms-btn--icon" href={p.githubUrl} target="_blank" rel="noreferrer" aria-label={`Open ${p.title} source`}>
                                                <FiGithub />
                                            </a>
                                        )}
                                        <button type="button" className="cms-btn cms-btn--ghost cms-btn--icon" onClick={() => openEdit(p)} aria-label={`Edit ${p.title}`}>
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            type="button"
                                            className="cms-btn cms-btn--ghost cms-btn--icon cms-btn--danger-ghost"
                                            onClick={() => remove(p)}
                                            aria-label={`Delete ${p.title}`}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {shown.length === 0 && <p className="cms-muted" style={{ padding: 16, margin: 0 }}>No project matches “{query}”.</p>}
                    </Card>
                </>
            )}

            <Drawer
                open={editing !== null}
                title={editing === 'new' ? 'Add project' : 'Edit project'}
                onClose={close}
                onSubmit={save}
                footer={
                    <>
                        <button type="button" className="cms-btn" onClick={close}>
                            Cancel
                        </button>
                        <button type="submit" className="cms-btn cms-btn--primary" disabled={saving}>
                            {saving && <Spinner />}
                            {editing === 'new' ? 'Add project' : 'Save changes'}
                        </button>
                    </>
                }
            >
                <div className="cms-grid cms-grid--2">
                    <Field label="Title *" htmlFor="pr-title">
                        <input id="pr-title" className="cms-input" required value={form.title} onChange={set('title')} />
                    </Field>
                    <Field label="Category" htmlFor="pr-category">
                        <select id="pr-category" className="cms-select" value={form.category} onChange={set('category')}>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Short description *" htmlFor="pr-desc" className="cms-span-2" hint="One or two sentences.">
                        <textarea id="pr-desc" className="cms-textarea" rows={3} required value={form.description} onChange={set('description')} />
                    </Field>
                    <Field label="Long description" htmlFor="pr-long" className="cms-span-2">
                        <textarea id="pr-long" className="cms-textarea" rows={5} value={form.longDescription} onChange={set('longDescription')} />
                    </Field>
                    <Field label="Tech stack" htmlFor="pr-tech" className="cms-span-2" hint="Press Enter or comma after each one.">
                        <TagInput id="pr-tech" value={form.techStack} onChange={(techStack) => setForm((f) => ({ ...f, techStack }))} placeholder="Node.js, PostgreSQL…" />
                    </Field>
                    <Field label="Live URL" htmlFor="pr-live">
                        <input id="pr-live" type="url" className="cms-input" placeholder="https://" value={form.liveUrl} onChange={set('liveUrl')} />
                    </Field>
                    <Field label="Source URL" htmlFor="pr-github">
                        <input id="pr-github" type="url" className="cms-input" placeholder="https://github.com/…" value={form.githubUrl} onChange={set('githubUrl')} />
                    </Field>
                    <Field label="Image" className="cms-span-2">
                        <FileField value={form.imageUrl} onChange={(imageUrl) => setForm((f) => ({ ...f, imageUrl }))} accept="image/*" folder="portfolio/projects" />
                    </Field>
                    <Field label="Order" htmlFor="pr-order" hint="Lower numbers come first.">
                        <input id="pr-order" type="number" className="cms-input" value={form.order} onChange={set('order')} />
                    </Field>
                    <div className="cms-field" style={{ justifyContent: 'flex-end' }}>
                        <Switch
                            checked={!!form.featured}
                            onChange={(featured) => setForm((f) => ({ ...f, featured }))}
                            label="Featured"
                            note="Highlight this project"
                        />
                    </div>
                </div>
            </Drawer>
        </div>
    );
};

export default ManageProjects;
