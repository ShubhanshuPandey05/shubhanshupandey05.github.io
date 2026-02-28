import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { FiSave, FiCheck } from 'react-icons/fi';

const ManageAbout = () => {
    const [form, setForm] = useState({
        name: '',
        title: '',
        subtitle: '',
        bio: '',
        email: '',
        location: '',
        profileImage: '',
        resumeUrl: '',
        stats: {
            yearsOfExperience: 0,
            projectsCompleted: 0,
            technologiesUsed: 0,
            codeCommits: 0,
        },
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.get('/about').then(({ data }) => {
            setForm({
                name: data.name || '',
                title: data.title || '',
                subtitle: data.subtitle || '',
                bio: data.bio || '',
                email: data.email || '',
                location: data.location || '',
                profileImage: data.profileImage || '',
                resumeUrl: data.resumeUrl || '',
                stats: {
                    yearsOfExperience: data.stats?.yearsOfExperience || 0,
                    projectsCompleted: data.stats?.projectsCompleted || 0,
                    technologiesUsed: data.stats?.technologiesUsed || 0,
                    codeCommits: data.stats?.codeCommits || 0,
                },
            });
        });
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('stats.')) {
            const statKey = name.split('.')[1];
            setForm((prev) => ({
                ...prev,
                stats: { ...prev.stats, [statKey]: Number(value) },
            }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put('/about', form);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            alert('Error saving: ' + (err.response?.data?.message || err.message));
        }
        setSaving(false);
    };

    const inputClass =
        'w-full bg-dark-700 border border-dark-500 rounded-lg py-2.5 px-4 text-text-primary text-sm focus:outline-none focus:border-primary transition-colors';

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text-primary">Manage About</h1>
                <p className="text-text-muted text-sm mt-1">
                    Update your personal information displayed on the portfolio.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
                {/* Personal Info */}
                <div className="glass rounded-xl p-6 space-y-5">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                        Personal Info
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-text-secondary text-xs mb-1.5">Name</label>
                            <input name="name" value={form.name} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-text-secondary text-xs mb-1.5">Title</label>
                            <input name="title" value={form.title} onChange={handleChange} className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-text-secondary text-xs mb-1.5">Subtitle</label>
                            <input name="subtitle" value={form.subtitle} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-text-secondary text-xs mb-1.5">Email</label>
                            <input name="email" value={form.email} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-text-secondary text-xs mb-1.5">Location</label>
                            <input name="location" value={form.location} onChange={handleChange} className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-text-secondary text-xs mb-1.5">Bio</label>
                        <textarea
                            name="bio"
                            value={form.bio}
                            onChange={handleChange}
                            rows={4}
                            className={inputClass + ' resize-none'}
                        />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-text-secondary text-xs mb-1.5">Profile Image URL</label>
                            <input name="profileImage" value={form.profileImage} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-text-secondary text-xs mb-1.5">Resume URL</label>
                            <input name="resumeUrl" value={form.resumeUrl} onChange={handleChange} className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="glass rounded-xl p-6 space-y-5">
                    <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                        Stats
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        <div>
                            <label className="block text-text-secondary text-xs mb-1.5">Years Experience</label>
                            <input type="number" name="stats.yearsOfExperience" value={form.stats.yearsOfExperience} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-text-secondary text-xs mb-1.5">Projects</label>
                            <input type="number" name="stats.projectsCompleted" value={form.stats.projectsCompleted} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-text-secondary text-xs mb-1.5">Technologies</label>
                            <input type="number" name="stats.technologiesUsed" value={form.stats.technologiesUsed} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-text-secondary text-xs mb-1.5">Code Commits</label>
                            <input type="number" name="stats.codeCommits" value={form.stats.codeCommits} onChange={handleChange} className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-dark-900 font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 disabled:opacity-50"
                >
                    {saved ? (
                        <>
                            <FiCheck /> Saved!
                        </>
                    ) : saving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-dark-900 border-t-transparent rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <FiSave /> Save Changes
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ManageAbout;
