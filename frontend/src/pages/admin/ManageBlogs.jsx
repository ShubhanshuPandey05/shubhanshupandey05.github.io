import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiEdit2, FiEdit3, FiExternalLink, FiEye, FiEyeOff, FiPlus, FiSearch, FiTrash2 } from 'react-icons/fi';
import api from '../../utils/api';
import { renderMarkdown } from '../../utils/markdown';
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

const slugify = (title) =>
    title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

// While typing in the slug field: spaces become hyphens, nothing is trimmed away mid-word.
const slugInput = (value) =>
    value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
        .replace(/-+/g, '-');

const emptyPost = { title: '', slug: '', content: '', excerpt: '', coverImage: '', tags: [], published: false };
const date = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '');

const ManageBlogs = () => {
    const toast = useToast();
    const confirm = useConfirm();
    const [params, setParams] = useSearchParams();
    const [posts, setPosts] = useState(null);
    const [filter, setFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyPost);
    const [slugTouched, setSlugTouched] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            const { data } = await api.get('/blogs/all');
            setPosts(data);
        } catch (error) {
            setPosts([]);
            toast(`Couldn’t load notes: ${errorText(error)}`, 'err');
        }
    }, [toast]);

    useEffect(() => {
        document.title = 'Notes · Studio';
        load();
    }, [load]);

    const openNew = () => {
        setForm(emptyPost);
        setSlugTouched(false);
        setEditing('new');
    };

    // /admin/blogs?new=1 (from the dashboard) opens a blank note once the list has loaded.
    const wantsNew = params.get('new') === '1';
    const [handledNew, setHandledNew] = useState(false);
    if (wantsNew && posts && !handledNew) {
        setHandledNew(true);
        setForm(emptyPost);
        setSlugTouched(false);
        setEditing('new');
    }
    useEffect(() => {
        if (handledNew && wantsNew) setParams({}, { replace: true });
    }, [handledNew, wantsNew, setParams]);

    const openEdit = (post) => {
        setForm({
            title: post.title,
            slug: post.slug,
            content: post.content || '',
            excerpt: post.excerpt || '',
            coverImage: post.coverImage || '',
            tags: post.tags || [],
            published: !!post.published,
        });
        setSlugTouched(true);
        setEditing(post);
    };
    const close = useCallback(() => setEditing(null), []);

    const setTitle = (e) => {
        const title = e.target.value;
        setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
    };

    const save = async () => {
        setSaving(true);
        try {
            if (editing === 'new') await api.post('/blogs', form);
            else await api.put(`/blogs/${editing._id}`, form);
            await load();
            toast(form.published ? 'Note saved and published' : 'Draft saved');
            close();
        } catch (error) {
            toast(`Couldn’t save: ${errorText(error)}`, 'err');
        } finally {
            setSaving(false);
        }
    };

    const togglePublish = async (post) => {
        try {
            await api.put(`/blogs/${post._id}`, { ...post, published: !post.published });
            await load();
            toast(post.published ? `“${post.title}” moved to drafts` : `“${post.title}” is published`);
        } catch (error) {
            toast(`Couldn’t update: ${errorText(error)}`, 'err');
        }
    };

    const remove = async (post) => {
        if (!(await confirm({ title: `Delete “${post.title}”?`, body: 'This can’t be undone.' }))) return;
        try {
            await api.delete(`/blogs/${post._id}`);
            await load();
            toast('Note deleted');
        } catch (error) {
            toast(`Couldn’t delete: ${errorText(error)}`, 'err');
        }
    };

    const counts = useMemo(() => {
        const list = posts || [];
        return { all: list.length, published: list.filter((p) => p.published).length, drafts: list.filter((p) => !p.published).length };
    }, [posts]);

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        return (posts || [])
            .filter((p) => (filter === 'all' ? true : filter === 'published' ? p.published : !p.published))
            .filter((p) => !q || `${p.title} ${p.slug} ${(p.tags || []).join(' ')}`.toLowerCase().includes(q));
    }, [posts, filter, query]);

    return (
        <div>
            <PageHeader
                eyebrow="Content"
                title="Notes"
                description="Write-ups for the blog. Only published notes appear on the site."
                actions={
                    <button type="button" className="cms-btn cms-btn--primary" onClick={openNew}>
                        <FiPlus /> New note
                    </button>
                }
            />

            {posts === null ? (
                <Skeleton />
            ) : posts.length === 0 ? (
                <EmptyState
                    icon={FiEdit3}
                    title="No notes yet"
                    body="Write the first one. Markdown works, with a live preview."
                    action={
                        <button type="button" className="cms-btn cms-btn--primary" onClick={openNew}>
                            <FiPlus /> New note
                        </button>
                    }
                />
            ) : (
                <>
                    <div className="cms-toolbar">
                        <div className="cms-tabs" role="tablist" aria-label="Filter notes">
                            {[
                                ['all', 'All'],
                                ['published', 'Published'],
                                ['drafts', 'Drafts'],
                            ].map(([id, label]) => (
                                <button key={id} type="button" role="tab" aria-selected={filter === id} onClick={() => setFilter(id)}>
                                    {label}
                                    <span>{counts[id]}</span>
                                </button>
                            ))}
                        </div>
                        <div className="cms-input-wrap cms-search">
                            <FiSearch />
                            <input className="cms-input" placeholder="Search notes" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search notes" />
                        </div>
                    </div>
                    <Card bodyClass="">
                        <ul className="cms-list">
                            {shown.map((p) => (
                                <li className="cms-row" key={p._id}>
                                    <div className="cms-row__media">{p.coverImage ? <img src={p.coverImage} alt="" /> : <FiEdit3 />}</div>
                                    <div className="cms-row__main">
                                        <div className="cms-row__title">
                                            <span>{p.title}</span>
                                            <span className={`cms-badge ${p.published ? 'cms-badge--ok' : 'cms-badge--warn'}`}>
                                                <span className="cms-dot" /> {p.published ? 'Published' : 'Draft'}
                                            </span>
                                        </div>
                                        <div className="cms-row__sub cms-mono">
                                            /blog/{p.slug} · {date(p.createdAt)}
                                        </div>
                                        {(p.tags || []).length > 0 && (
                                            <div className="cms-row__meta">
                                                {p.tags.map((t) => (
                                                    <span className="cms-chip" key={t}>
                                                        #{t}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="cms-row__actions">
                                        {p.published && (
                                            <a className="cms-btn cms-btn--ghost cms-btn--icon" href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" aria-label={`Open ${p.title} on the site`}>
                                                <FiExternalLink />
                                            </a>
                                        )}
                                        <button
                                            type="button"
                                            className="cms-btn cms-btn--ghost cms-btn--icon"
                                            onClick={() => togglePublish(p)}
                                            aria-label={p.published ? `Unpublish ${p.title}` : `Publish ${p.title}`}
                                            title={p.published ? 'Move to drafts' : 'Publish'}
                                        >
                                            {p.published ? <FiEyeOff /> : <FiEye />}
                                        </button>
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
                        {shown.length === 0 && <p className="cms-muted" style={{ padding: 16, margin: 0 }}>Nothing here.</p>}
                    </Card>
                </>
            )}

            <Drawer
                open={editing !== null}
                wide
                title={editing === 'new' ? 'New note' : 'Edit note'}
                onClose={close}
                onSubmit={save}
                footer={
                    <>
                        <span style={{ marginRight: 'auto' }}>
                            <Switch
                                checked={form.published}
                                onChange={(published) => setForm((f) => ({ ...f, published }))}
                                label={form.published ? 'Published' : 'Draft'}
                                note={form.published ? 'Visible on the site' : 'Only you can see it'}
                            />
                        </span>
                        <button type="button" className="cms-btn" onClick={close}>
                            Cancel
                        </button>
                        <button type="submit" className="cms-btn cms-btn--primary" disabled={saving}>
                            {saving && <Spinner />}
                            {form.published ? 'Save and publish' : 'Save draft'}
                        </button>
                    </>
                }
            >
                <div className="cms-grid cms-grid--2">
                    <Field label="Title *" htmlFor="bl-title">
                        <input id="bl-title" className="cms-input" required value={form.title} onChange={setTitle} />
                    </Field>
                    <Field label="Slug *" htmlFor="bl-slug" hint={`Address: /blog/${form.slug || '…'}`}>
                        <input
                            id="bl-slug"
                            className="cms-input cms-mono"
                            required
                            value={form.slug}
                            onChange={(e) => {
                                setSlugTouched(true);
                                setForm((f) => ({ ...f, slug: slugInput(e.target.value) }));
                            }}
                        />
                    </Field>
                    <Field label="Excerpt" htmlFor="bl-excerpt" className="cms-span-2" hint="Shown in the list of notes.">
                        <textarea id="bl-excerpt" className="cms-textarea" rows={2} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} />
                    </Field>
                    <Field label="Tags" htmlFor="bl-tags">
                        <TagInput id="bl-tags" value={form.tags} onChange={(tags) => setForm((f) => ({ ...f, tags }))} placeholder="queues, nginx…" />
                    </Field>
                    <Field label="Cover image">
                        <FileField value={form.coverImage} onChange={(coverImage) => setForm((f) => ({ ...f, coverImage }))} accept="image/*" folder="portfolio/blogs" />
                    </Field>
                </div>
                <div className="cms-editor" style={{ marginTop: 18 }}>
                    <Field label="Content * (Markdown)" htmlFor="bl-content">
                        <textarea
                            id="bl-content"
                            className="cms-textarea cms-textarea--code"
                            required
                            value={form.content}
                            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                            placeholder={'## A heading\n\nWrite with **bold**, *italic*, `code`, lists and [links](https://…).'}
                        />
                    </Field>
                    <div className="cms-field">
                        <span className="cms-label">Preview</span>
                        <div className="cms-preview">{form.content ? renderMarkdown(form.content) : <p className="cms-muted">Start writing to see the preview.</p>}</div>
                    </div>
                </div>
            </Drawer>
        </div>
    );
};

export default ManageBlogs;
