import { useCallback, useEffect, useState } from 'react';
import { FiCpu, FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';
import api from '../../utils/api';
import { Card, Drawer, EmptyState, Field, PageHeader, Skeleton, Spinner, errorText, useConfirm, useToast } from '../../components/admin/ui';

const CATEGORIES = ['Backend', 'Database', 'DevOps', 'Tools', 'Frontend', 'Other'];
const emptySkill = { name: '', category: 'Backend', proficiency: 50, order: 0 };

const ManageSkills = () => {
    const toast = useToast();
    const confirm = useConfirm();
    const [skills, setSkills] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptySkill);
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            const { data } = await api.get('/skills');
            setSkills(data);
        } catch (error) {
            setSkills([]);
            toast(`Couldn’t load skills: ${errorText(error)}`, 'err');
        }
    }, [toast]);

    useEffect(() => {
        document.title = 'Skills · Studio';
        load();
    }, [load]);

    const openNew = (category = 'Backend') => {
        setForm({ ...emptySkill, category, order: skills?.length || 0 });
        setEditing('new');
    };
    const openEdit = (skill) => {
        setForm({ ...emptySkill, ...skill });
        setEditing(skill);
    };
    const close = useCallback(() => setEditing(null), []);
    const set = (key, number = false) => (e) => setForm((f) => ({ ...f, [key]: number ? Number(e.target.value) : e.target.value }));

    const save = async () => {
        setSaving(true);
        try {
            if (editing === 'new') await api.post('/skills', form);
            else await api.put(`/skills/${editing._id}`, form);
            await load();
            toast(editing === 'new' ? `${form.name} added` : `${form.name} saved`);
            close();
        } catch (error) {
            toast(`Couldn’t save: ${errorText(error)}`, 'err');
        } finally {
            setSaving(false);
        }
    };

    const remove = async (skill) => {
        if (!(await confirm({ title: `Delete ${skill.name}?`, body: 'It disappears from the stack on the site.' }))) return;
        try {
            await api.delete(`/skills/${skill._id}`);
            await load();
            toast(`${skill.name} deleted`);
        } catch (error) {
            toast(`Couldn’t delete: ${errorText(error)}`, 'err');
        }
    };

    const groups = CATEGORIES.map((c) => ({ category: c, items: (skills || []).filter((s) => (CATEGORIES.includes(s.category) ? s.category : 'Other') === c) })).filter(
        (g) => g.items.length
    );

    return (
        <div>
            <PageHeader
                eyebrow="Content"
                title="Skills"
                description="Grouped by category into the stack section. Proficiency is your own rating."
                actions={
                    <button type="button" className="cms-btn cms-btn--primary" onClick={() => openNew()}>
                        <FiPlus /> Add skill
                    </button>
                }
            />

            {skills === null ? (
                <Skeleton height={140} count={2} />
            ) : skills.length === 0 ? (
                <EmptyState icon={FiCpu} title="No skills yet" body="Add the tools you use." />
            ) : (
                <div className="cms-skillgroups">
                    {groups.map((g) => (
                        <Card
                            key={g.category}
                            title={g.category}
                            description={`${g.items.length} skill${g.items.length === 1 ? '' : 's'}`}
                            bodyClass=""
                            actions={
                                <button type="button" className="cms-btn cms-btn--ghost cms-btn--sm" onClick={() => openNew(g.category)}>
                                    <FiPlus /> Add
                                </button>
                            }
                        >
                            <div style={{ marginTop: 10 }}>
                                {g.items.map((s) => (
                                    <div className="cms-skill" key={s._id}>
                                        <span className="cms-skill__name">{s.name}</span>
                                        <span className="cms-meter" aria-label={`${s.proficiency}%`}>
                                            <span style={{ width: `${s.proficiency}%` }} />
                                        </span>
                                        <span className="cms-skill__pct">{s.proficiency}%</span>
                                        <span className="cms-row__actions">
                                            <button type="button" className="cms-btn cms-btn--ghost cms-btn--icon" onClick={() => openEdit(s)} aria-label={`Edit ${s.name}`}>
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                type="button"
                                                className="cms-btn cms-btn--ghost cms-btn--icon cms-btn--danger-ghost"
                                                onClick={() => remove(s)}
                                                aria-label={`Delete ${s.name}`}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Drawer
                open={editing !== null}
                title={editing === 'new' ? 'Add skill' : 'Edit skill'}
                onClose={close}
                onSubmit={save}
                footer={
                    <>
                        <button type="button" className="cms-btn" onClick={close}>
                            Cancel
                        </button>
                        <button type="submit" className="cms-btn cms-btn--primary" disabled={saving}>
                            {saving && <Spinner />}
                            {editing === 'new' ? 'Add skill' : 'Save changes'}
                        </button>
                    </>
                }
            >
                <div className="cms-grid cms-grid--2">
                    <Field label="Name *" htmlFor="sk-name">
                        <input id="sk-name" className="cms-input" required value={form.name} onChange={set('name')} />
                    </Field>
                    <Field label="Category" htmlFor="sk-category">
                        <select id="sk-category" className="cms-select" value={form.category} onChange={set('category')}>
                            {CATEGORIES.map((c) => (
                                <option key={c}>{c}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label={`Proficiency · ${form.proficiency}%`} htmlFor="sk-prof" className="cms-span-2">
                        <input id="sk-prof" type="range" min="0" max="100" className="cms-range" value={form.proficiency} onChange={set('proficiency', true)} />
                    </Field>
                    <Field label="Order" htmlFor="sk-order" hint="Lower numbers come first.">
                        <input id="sk-order" type="number" className="cms-input" value={form.order} onChange={set('order', true)} />
                    </Field>
                </div>
            </Drawer>
        </div>
    );
};

export default ManageSkills;
