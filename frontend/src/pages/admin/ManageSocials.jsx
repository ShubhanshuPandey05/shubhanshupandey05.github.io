import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';
import {
    FaGithub, FaLinkedin, FaTwitter, FaDev, FaYoutube, FaDiscord, FaInstagram, FaGlobe,
} from 'react-icons/fa';

const iconOptions = [
    { value: 'FaGithub', label: 'GitHub', Icon: FaGithub },
    { value: 'FaLinkedin', label: 'LinkedIn', Icon: FaLinkedin },
    { value: 'FaTwitter', label: 'Twitter', Icon: FaTwitter },
    { value: 'FaDev', label: 'Dev.to', Icon: FaDev },
    { value: 'FaYoutube', label: 'YouTube', Icon: FaYoutube },
    { value: 'FaDiscord', label: 'Discord', Icon: FaDiscord },
    { value: 'FaInstagram', label: 'Instagram', Icon: FaInstagram },
    { value: 'FaGlobe', label: 'Website', Icon: FaGlobe },
];

const iconMap = Object.fromEntries(iconOptions.map((o) => [o.value, o.Icon]));

const emptySocial = { platform: '', url: '', icon: 'FaGlobe', order: 0 };

const ManageSocials = () => {
    const [links, setLinks] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ ...emptySocial });
    const [saving, setSaving] = useState(false);

    const fetchLinks = async () => {
        const { data } = await api.get('/social-links');
        setLinks(data);
    };

    useEffect(() => {
        fetchLinks();
    }, []);

    const openNew = () => {
        setForm({ ...emptySocial });
        setEditing('new');
    };

    const openEdit = (link) => {
        setForm({ ...link });
        setEditing(link);
    };

    const closeModal = () => {
        setEditing(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: name === 'order' ? Number(value) : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing === 'new') {
                await api.post('/social-links', form);
            } else {
                await api.put(`/social-links/${editing._id}`, form);
            }
            await fetchLinks();
            closeModal();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this social link?')) return;
        try {
            await api.delete(`/social-links/${id}`);
            await fetchLinks();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const inputClass =
        'w-full bg-dark-700 border border-dark-500 rounded-lg py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors';

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Manage Social Links</h1>
                    <p className="text-text-muted text-sm mt-1">{links.length} links</p>
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-dark-900 text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all"
                >
                    <FiPlus /> Add Link
                </button>
            </div>

            {/* List */}
            <div className="space-y-3">
                {links.map((link) => {
                    const Icon = iconMap[link.icon] || FaGlobe;
                    return (
                        <div
                            key={link._id}
                            className="glass rounded-xl p-5 flex items-center justify-between gap-4 hover:border-primary/20 transition-all"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                                    <Icon className="text-xl" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-text-primary">{link.platform}</h3>
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-xs text-text-muted hover:text-primary transition-colors font-mono"
                                    >
                                        {link.url}
                                    </a>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => openEdit(link)} className="p-2 rounded-lg hover:bg-dark-600 text-text-muted hover:text-primary transition-colors">
                                    <FiEdit2 />
                                </button>
                                <button onClick={() => handleDelete(link._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors">
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            {editing !== null && (
                <div onClick={closeModal} className="fixed inset-0 z-50 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center p-6">
                    <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl w-full max-w-md p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-text-primary">
                                {editing === 'new' ? 'Add Social Link' : 'Edit Social Link'}
                            </h2>
                            <button onClick={closeModal} className="text-text-muted hover:text-text-primary">
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-text-secondary text-xs mb-1.5">Platform *</label>
                                <input name="platform" value={form.platform} onChange={handleChange} required className={inputClass} placeholder="e.g. GitHub" />
                            </div>
                            <div>
                                <label className="block text-text-secondary text-xs mb-1.5">URL *</label>
                                <input name="url" value={form.url} onChange={handleChange} required className={inputClass} placeholder="https://..." />
                            </div>
                            <div>
                                <label className="block text-text-secondary text-xs mb-1.5">Icon</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {iconOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setForm((prev) => ({ ...prev, icon: opt.value }))}
                                            className={`flex flex-col items-center gap-1 p-3 rounded-lg text-xs transition-all ${form.icon === opt.value
                                                    ? 'bg-primary/10 text-primary border border-primary/30'
                                                    : 'bg-dark-700 text-text-muted hover:text-text-secondary'
                                                }`}
                                        >
                                            <opt.Icon className="text-lg" />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-text-secondary text-xs mb-1.5">Order</label>
                                <input type="number" name="order" value={form.order} onChange={handleChange} className={inputClass} />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-primary to-accent text-dark-900 font-semibold rounded-lg text-sm disabled:opacity-50">
                                    {saving ? 'Saving...' : <><FiSave /> Save</>}
                                </button>
                                <button type="button" onClick={closeModal} className="px-6 py-2.5 glass text-text-secondary rounded-lg text-sm hover:text-text-primary">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageSocials;
