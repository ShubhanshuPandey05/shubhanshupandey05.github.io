import { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Card, Field, FileField, PageHeader, SaveBar, Skeleton, errorText, useToast } from '../../components/admin/ui';

const STATS = [
    { key: 'yearsOfExperience', label: 'Years of experience', step: '0.5' },
    { key: 'projectsCompleted', label: 'Projects shipped', step: '1' },
    { key: 'technologiesUsed', label: 'Technologies', step: '1' },
    { key: 'codeCommits', label: 'Commits this year', step: '1' },
];

const fromServer = (data = {}) => ({
    name: data.name || '',
    title: data.title || '',
    subtitle: data.subtitle || '',
    bio: data.bio || '',
    email: data.email || '',
    location: data.location || '',
    profileImage: data.profileImage || '',
    resumeUrl: data.resumeUrl || '',
    stats: Object.fromEntries(STATS.map((s) => [s.key, Number(data.stats?.[s.key]) || 0])),
});

const ManageAbout = () => {
    const toast = useToast();
    const [initial, setInitial] = useState(null);
    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        document.title = 'Profile · Studio';
        let alive = true;
        api.get('/about')
            .then(({ data }) => {
                if (!alive) return;
                const value = fromServer(data);
                setInitial(value);
                setForm(value);
            })
            .catch((error) => toast(`Couldn’t load the profile: ${errorText(error)}`, 'err'));
        return () => {
            alive = false;
        };
    }, [toast]);

    const dirty = !!form && JSON.stringify(form) !== JSON.stringify(initial);
    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
    const setFile = (key) => (url) => setForm((f) => ({ ...f, [key]: url }));
    const setStat = (key) => (e) => setForm((f) => ({ ...f, stats: { ...f.stats, [key]: Number(e.target.value) } }));

    const save = async () => {
        setSaving(true);
        try {
            const { data } = await api.put('/about', form);
            const value = fromServer(data);
            setInitial(value);
            setForm(value);
            toast('Profile saved');
        } catch (error) {
            toast(`Couldn’t save: ${errorText(error)}`, 'err');
        } finally {
            setSaving(false);
        }
    };

    if (!form) {
        return (
            <div>
                <PageHeader eyebrow="Content" title="Profile" />
                <Skeleton height={120} count={3} />
            </div>
        );
    }

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                if (dirty) save();
            }}
        >
            <PageHeader
                eyebrow="Content"
                title="Profile"
                description="Who you are, how to reach you, your résumé and the numbers on the site."
            />

            <Card title="Identity" description="Your title appears in the hero of both designs.">
                <div className="cms-grid cms-grid--2">
                    <Field label="Name" htmlFor="p-name">
                        <input id="p-name" className="cms-input" value={form.name} onChange={set('name')} />
                    </Field>
                    <Field label="Title" htmlFor="p-title" hint="For example: Backend Engineer">
                        <input id="p-title" className="cms-input" value={form.title} onChange={set('title')} />
                    </Field>
                    <Field label="Subtitle" htmlFor="p-subtitle" className="cms-span-2">
                        <input id="p-subtitle" className="cms-input" value={form.subtitle} onChange={set('subtitle')} />
                    </Field>
                    <Field label="Bio" htmlFor="p-bio" className="cms-span-2">
                        <textarea id="p-bio" className="cms-textarea" rows={4} value={form.bio} onChange={set('bio')} />
                    </Field>
                </div>
            </Card>

            <Card title="Contact">
                <div className="cms-grid cms-grid--2">
                    <Field label="Email" htmlFor="p-email" hint="Used for the contact links and the copy button.">
                        <input id="p-email" type="email" className="cms-input" value={form.email} onChange={set('email')} />
                    </Field>
                    <Field label="Location" htmlFor="p-location">
                        <input id="p-location" className="cms-input" value={form.location} onChange={set('location')} />
                    </Field>
                </div>
            </Card>

            <Card title="Files" description="Uploaded to Cloudinary. The résumé page shows the PDF.">
                <div className="cms-grid cms-grid--2">
                    <Field label="Résumé (PDF)">
                        <FileField value={form.resumeUrl} onChange={setFile('resumeUrl')} accept="application/pdf" folder="portfolio/about" kind="pdf" />
                    </Field>
                    <Field label="Profile image">
                        <FileField value={form.profileImage} onChange={setFile('profileImage')} accept="image/*" folder="portfolio/about" />
                    </Field>
                </div>
            </Card>

            <Card title="Numbers" description="The stats in the About section.">
                <div className="cms-grid cms-grid--4">
                    {STATS.map((s) => (
                        <Field key={s.key} label={s.label} htmlFor={`p-${s.key}`}>
                            <input
                                id={`p-${s.key}`}
                                type="number"
                                min="0"
                                step={s.step}
                                className="cms-input"
                                value={form.stats[s.key]}
                                onChange={setStat(s.key)}
                            />
                        </Field>
                    ))}
                </div>
            </Card>

            <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={() => setForm(initial)} />
        </form>
    );
};

export default ManageAbout;
