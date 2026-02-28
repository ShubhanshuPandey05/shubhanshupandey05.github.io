import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';

const emptySkill = {
    name: '',
    category: 'Backend',
    proficiency: 50,
    order: 0,
};

const ManageSkills = () => {
    const [skills, setSkills] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ ...emptySkill });
    const [saving, setSaving] = useState(false);

    const fetchSkills = async () => {
        const { data } = await api.get('/skills');
        setSkills(data);
    };

    useEffect(() => {
        fetchSkills();
    }, []);

    const openNew = () => {
        setForm({ ...emptySkill });
        setEditing('new');
    };

    const openEdit = (skill) => {
        setForm({ ...skill });
        setEditing(skill);
    };

    const closeModal = () => {
        setEditing(null);
        setForm({ ...emptySkill });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: name === 'proficiency' || name === 'order' ? Number(value) : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing === 'new') {
                await api.post('/skills', form);
            } else {
                await api.put(`/skills/${editing._id}`, form);
            }
            await fetchSkills();
            closeModal();
        } catch (err) {
            alert('Error: ' + (err.response?.data?.message || err.message));
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this skill?')) return;
        try {
            await api.delete(`/skills/${id}`);
            await fetchSkills();
        } catch (err) {
            alert('Error deleting: ' + err.message);
        }
    };

    // Group by category
    const grouped = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill);
        return acc;
    }, {});

    const inputClass =
        'w-full bg-dark-700 border border-dark-500 rounded-lg py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors';

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">Manage Skills</h1>
                    <p className="text-text-muted text-sm mt-1">{skills.length} skills</p>
                </div>
                <button
                    onClick={openNew}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-accent text-dark-900 text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all"
                >
                    <FiPlus /> Add Skill
                </button>
            </div>

            {/* Grouped skill list */}
            {Object.entries(grouped).map(([category, catSkills]) => (
                <div key={category} className="mb-8">
                    <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-3">
                        {category}
                    </h2>
                    <div className="space-y-2">
                        {catSkills.map((skill) => (
                            <div
                                key={skill._id}
                                className="glass rounded-xl p-4 flex items-center justify-between gap-4 hover:border-primary/20 transition-all"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium text-text-primary">{skill.name}</span>
                                        <span className="text-xs font-mono text-primary">{skill.proficiency}%</span>
                                    </div>
                                    <div className="mt-2 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                                            style={{ width: `${skill.proficiency}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => openEdit(skill)} className="p-2 rounded-lg hover:bg-dark-600 text-text-muted hover:text-primary transition-colors">
                                        <FiEdit2 />
                                    </button>
                                    <button onClick={() => handleDelete(skill._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-400 transition-colors">
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Modal */}
            {editing !== null && (
                <div onClick={closeModal} className="fixed inset-0 z-50 bg-dark-900/80 backdrop-blur-sm flex items-center justify-center p-6">
                    <div onClick={(e) => e.stopPropagation()} className="glass rounded-2xl w-full max-w-md p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-text-primary">
                                {editing === 'new' ? 'Add Skill' : 'Edit Skill'}
                            </h2>
                            <button onClick={closeModal} className="text-text-muted hover:text-text-primary">
                                <FiX className="text-xl" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-text-secondary text-xs mb-1.5">Name *</label>
                                <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-text-secondary text-xs mb-1.5">Category</label>
                                <select name="category" value={form.category} onChange={handleChange} className={inputClass}>
                                    <option value="Backend">Backend</option>
                                    <option value="Database">Database</option>
                                    <option value="DevOps">DevOps</option>
                                    <option value="Tools">Tools</option>
                                    <option value="Frontend">Frontend</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-text-secondary text-xs mb-1.5">
                                    Proficiency: <span className="text-primary font-mono">{form.proficiency}%</span>
                                </label>
                                <input type="range" name="proficiency" min="0" max="100" value={form.proficiency} onChange={handleChange} className="w-full accent-primary" />
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

export default ManageSkills;
