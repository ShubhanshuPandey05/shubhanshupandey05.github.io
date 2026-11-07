import { useCallback, useEffect, useState } from 'react';
import { FiEdit2, FiExternalLink, FiLink, FiPlus, FiTrash2 } from 'react-icons/fi';
import { FaDev, FaDiscord, FaGithub, FaGlobe, FaInstagram, FaLinkedin, FaTwitter, FaYoutube } from 'react-icons/fa';
import api from '../../utils/api';
import { Card, Drawer, EmptyState, Field, PageHeader, Skeleton, Spinner, errorText, useConfirm, useToast } from '../../components/admin/ui';

const ICONS = [
    { value: 'FaGithub', label: 'GitHub', Icon: FaGithub },
    { value: 'FaLinkedin', label: 'LinkedIn', Icon: FaLinkedin },
    { value: 'FaTwitter', label: 'Twitter', Icon: FaTwitter },
    { value: 'FaDev', label: 'Dev.to', Icon: FaDev },
    { value: 'FaYoutube', label: 'YouTube', Icon: FaYoutube },
    { value: 'FaDiscord', label: 'Discord', Icon: FaDiscord },
    { value: 'FaInstagram', label: 'Instagram', Icon: FaInstagram },
    { value: 'FaGlobe', label: 'Website', Icon: FaGlobe },
];
const iconFor = (value) => ICONS.find((i) => i.value === value)?.Icon || FaGlobe;
const emptySocial = { platform: '', url: '', icon: 'FaGlobe', order: 0 };

const ManageSocials = () => {
    const toast = useToast();
    const confirm = useConfirm();
    const [links, setLinks] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptySocial);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            const { data } = await api.get('/social-links');
            setLinks(data);
        } catch (error) {
            setLinks([]);
            toast(`Couldn’t load links: ${errorText(error)}`, 'err');
        }
    }, [toast]);

    useEffect(() => {
        document.title = 'Social links · Studio';
        load();
    }, [load]);

    const openNew = () => {
        setForm({ ...emptySocial, order: links?.length || 0 });
        setEditing('new');
    };
    const openEdit = (link) => {
        setForm({ ...emptySocial, ...link });
        setEditing(link);
    };
    const close = useCallback(() => setEditing(null), []);
    const set = (key, number = false) => (e) => setForm((f) => ({ ...f, [key]: number ? Number(e.target.value) : e.target.value }));

    // Picking an icon also fills the platform name if it is still empty.
    const pickIcon = (opt) => setForm((f) => ({ ...f, icon: opt.value, platform: f.platform || (opt.value === 'FaGlobe' ? '' : opt.label) }));

    const save = async () => {
        setSaving(true);
        try {
            if (editing === 'new') await api.post('/social-links', form);
            else await api.put(`/social-links/${editing._id}`, form);
            await load();
            toast(editing === 'new' ? `${form.platform} added` : `${form.platform} saved`);
            close();
        } catch (error) {
            toast(`Couldn’t save: ${errorText(error)}`, 'err');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (link) => {
        if (!(await confirm({ title: `Delete ${link.platform}?`, body: 'The link disappears from the site.' }))) return;
        try {
            await api.delete(`/social-links/${link._id}`);
            await load();
            toast(`${link.platform} deleted`);
        } catch (error) {
            toast(`Couldn’t delete: ${errorText(error)}`, 'err');
        }
    };

    return (
        <div>
            <PageHeader
                eyebrow="Content"
                title="Social links"
                description="Shown in the contact section and the footer, in this order."
                actions={
                    <button type="button" className="cms-btn cms-btn--primary" onClick={openNew}>
                        <FiPlus /> Add link
                    </button>
                }
            />

            {links === null ? (
                <Skeleton />
            ) : links.length === 0 ? (
                <EmptyState icon={FiLink} title="No links yet" body="Add GitHub, LinkedIn or anywhere people can find you." />
            ) : (
                <Card bodyClass="">
                    <ul className="cms-list">
                        {links.map((l) => {
                            const Icon = iconFor(l.icon);
                            return (
                                <li className="cms-row" key={l._id}>
                                    <div className="cms-row__media">
                                        <Icon />
                                    </div>
                                    <div className="cms-row__main">
                                        <div className="cms-row__title">
                                            <span>{l.platform}</span>
                                            <span className="cms-badge">#{l.order ?? 0}</span>
                                        </div>
                                        <div className="cms-row__sub cms-mono">{l.url}</div>
                                    </div>
                                    <div className="cms-row__actions">
                                        <a className="cms-btn cms-btn--ghost cms-btn--icon" href={l.url} target="_blank" rel="noreferrer" aria-label={`Open ${l.platform}`}>
                                            <FiExternalLink />
                                        </a>
                                        <button type="button" className="cms-btn cms-btn--ghost cms-btn--icon" onClick={() => openEdit(l)} aria-label={`Edit ${l.platform}`}>
                                            <FiEdit2 />
                                        </button>
                                        <button
                                            type="button"
                                            className="cms-btn cms-btn--ghost cms-btn--icon cms-btn--danger-ghost"
                                            onClick={() => remove(l)}
                                            aria-label={`Delete ${l.platform}`}
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </Card>
            )}

            <Drawer
                open={editing !== null}
                title={editing === 'new' ? 'Add link' : 'Edit link'}
                onClose={close}
                onSubmit={save}
                footer={
                    <>
                        <button type="button" className="cms-btn" onClick={close}>
                            Cancel
                        </button>
                        <button type="submit" className="cms-btn cms-btn--primary" disabled={saving}>
                            {saving && <Spinner />}
                            {editing === 'new' ? 'Add link' : 'Save changes'}
                        </button>
                    </>
                }
            >
                <div className="cms-grid">
                    <Field label="Icon">
                        <div className="cms-icon-grid">
                            {ICONS.map((opt) => (
                                <button type="button" key={opt.value} aria-pressed={form.icon === opt.value} onClick={() => pickIcon(opt)}>
                                    <opt.Icon />
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </Field>
                    <Field label="Platform *" htmlFor="so-platform">
                        <input id="so-platform" className="cms-input" required value={form.platform} onChange={set('platform')} />
                    </Field>
                    <Field label="URL *" htmlFor="so-url">
                        <input id="so-url" type="url" className="cms-input" required placeholder="https://" value={form.url} onChange={set('url')} />
                    </Field>
                    <Field label="Order" htmlFor="so-order" hint="Lower numbers come first.">
                        <input id="so-order" type="number" className="cms-input" value={form.order} onChange={set('order', true)} />
                    </Field>
                </div>
            </Drawer>
        </div>
    );
};

export default ManageSocials;
