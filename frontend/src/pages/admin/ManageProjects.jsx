import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';

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
    const [projects, setProjects] = useState([]);
    const [editing, setEditing] = useState(null); // null = closed, 'new' or project object
    const [form, setForm] = useState({ ...emptyProject });
    const [techInput, setTechInput] = useState('');
    const [saving, setSaving] = useState(false);

    const fetchProjects = async () => {
        const { data } = await api.get('/projects');
        setProjects(data);
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const openNew = () => {
        setForm({ ...emptyProject });
        setTechInput('');
        setEditing('new');
    };

    const openEdit = (project) => {
        setForm({ ...project });
        setTechInput('');
        setEditing(project);
    };

    const closeModal = () => {
        setEditing(null);
        setForm({ ...emptyProject });
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const addTech = () => {
        if (techInput.trim() && !form.techStack.includes(techInput.trim())) {
            setForm((prev) => ({
                ...prev,
                techStack: [...prev.techStack, techInput.trim()],
            }));
            setTechInput('');
        }
    };

    const removeTech = (tech) => {
        setForm((prev) => ({
            ...prev,
            techStack: prev.techStack.filter((t) => t !== tech),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing === 'new') {
                await api.post('/projects', form);
            } else {
                await api.put(`/projects/${editing._id}`, form);
            }
            await fetchProjects();
            closeModal();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this project?')) return;
        try {
            await api.delete(`/projects/${id}`);
            await fetchProjects();
        } catch (err) {
            alert('Error deleting: ' + err.message);
        }
    };

    const inputClass =
        'w-full bg-dark-700 border border-dark-500 rounded-lg py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors';

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Manage Projects</h1>
                    <p className="text-text-muted text-sm mt-1">{projects.length} projects</p>
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-dark-900 text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all"
                >
                    <FiPlus /> Add Project
                </button>
            </div>

            {/* Project List */}
            <div className="space-y-3">
                {projects.map((project) => (
                    <div
                        key={project._id}
                        className="glass rounded-xl p-5 flex items-center justify-between gap-4 hover:border-primary/20 transition-all"
                    >
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                                <h3 className="font-semibold text-text-primary truncate">{project.title}</h3>
                                {project.featured && (
                                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">
                                        Featured
                                    </span>
                                )}
                                <span className="px-2 py-0.5 bg-dark-600 text-text-muted text-[10px] font-mono rounded">
                                    {project.category}
                                </span>
                            </div>
                            <p className="text-sm text-text-muted truncate">{project.description}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                                {project.techStack?.slice(0, 5).map((tech) => (
                                    <span key={tech} className="px-2 py-0.5 bg-dark-600 text-[10px] text-text-secondary rounded font-mono">
                                        {tech}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => openEdit(project)}
                                className="p-2 rounded-lg hover:bg-dark-600 text-text-muted hover:text-primary transition-colors"
                            >
                                <FiEdit2 />
                            </button>
                            <button
                                onClick={() => handleDelete(project._id)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {editing !== null && (
                <div
                    onClick={closeModal}
                    className="fixed inset-0 z-50 bg-dark-900/80 backdrop-blur-sm flex items-start justify-center p-6 overflow-y-auto"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="glass rounded-2xl w-full max-w-2xl p-8 mt-10 mb-10"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-text-primary">
                                {editing === 'new' ? 'Add Project' : 'Edit Project'}
                            </h2>
                            <button onClick={closeModal} className="text-text-muted hover:text-text-primary">
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-text-secondary text-xs mb-1.5">Title *</label>
                                    <input name="title" value={form.title} onChange={handleChange} required className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-text-secondary text-xs mb-1.5">Category</label>
                                    <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                                        <option value="API">API</option>
                                        <option value="Full-Stack">Full-Stack</option>
                                        <option value="Backend">Backend</option>
                                        <option value="DevOps">DevOps</option>
                                        <option value="CLI">CLI</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-text-secondary text-xs mb-1.5">Description *</label>
                                <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className={inputClass + ' resize-none'} />
                            </div>
                            <div>
                                <label className="block text-text-secondary text-xs mb-1.5">Long Description</label>
                                <textarea name="longDescription" value={form.longDescription} onChange={handleChange} rows={4} className={inputClass + ' resize-none'} />
                            </div>

                            {/* Tech Stack */}
                            <div>
                                <label className="block text-text-secondary text-xs mb-1.5">Tech Stack</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        value={techInput}
                                        onChange={(e) => setTechInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
                                        placeholder="e.g. Node.js"
                                        className={inputClass}
                                    />
                                    <button type="button" onClick={addTech} className="px-4 py-2 bg-dark-600 text-text-secondary rounded-lg hover:text-text-primary transition-colors text-sm shrink-0">
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {form.techStack?.map((tech) => (
                                        <span key={tech} className="flex items-center gap-1.5 px-3 py-1 bg-dark-600 text-xs text-text-secondary rounded-lg font-mono">
                                            {tech}
                                            <button type="button" onClick={() => removeTech(tech)} className="text-text-muted hover:text-red-400">
                                                <FiX className="text-xs" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-text-secondary text-xs mb-1.5">GitHub URL</label>
                                    <input name="githubUrl" value={form.githubUrl} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-text-secondary text-xs mb-1.5">Live URL</label>
                                    <input name="liveUrl" value={form.liveUrl} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-text-secondary text-xs mb-1.5">Image URL</label>
                                    <input name="imageUrl" value={form.imageUrl} onChange={handleChange} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-text-secondary text-xs mb-1.5">Order</label>
                                    <input type="number" name="order" value={form.order} onChange={handleChange} className={inputClass} />
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange} id="featured" className="accent-primary" />
                                <label htmlFor="featured" className="text-text-secondary text-sm">Featured project</label>
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

export default ManageProjects;
