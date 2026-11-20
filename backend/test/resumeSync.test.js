// Runs the résumé sync against an in-memory stand-in for MongoDB, so it needs no
// database or API key: node --test
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Skill from '../models/Skill.js';
import Experience from '../models/Experience.js';
import { applyResume, skillKey, repoKey } from '../services/resumeSync.js';

// Minimal in-memory collections behind the model methods the sync uses.
const stores = new Map();
const fake = (Model) => {
    const rows = () => stores.get(Model.modelName);
    Model.find = async () => [...rows()];
    Model.create = async (data) => {
        const doc = new Model(data);
        rows().push(doc);
        return doc;
    };
    Model.insertMany = async (list) => Promise.all(list.map((d) => Model.create(d)));
    Model.deleteMany = async (filter = {}) => {
        const ids = filter._id?.$in?.map(String);
        stores.set(Model.modelName, ids ? rows().filter((d) => !ids.includes(String(d._id))) : []);
    };
    Model.prototype.save = async function save() {
        await this.validate();
        return this;
    };
};
[Project, Skill, Experience].forEach(fake);

const seed = async (Model, list) => {
    stores.set(Model.modelName, []);
    for (const d of list) await Model.create(d);
};

beforeEach(async () => {
    await seed(Project, [
        { title: 'GeoJobs', description: 'old', githubUrl: 'https://github.com/me/geo-jobs', imageUrl: 'geo.png', featured: true },
        { title: 'Hand-made demo', description: 'kept', source: 'manual' },
        { title: 'Dropped from résumé', description: 'gone', source: 'resume' },
    ]);
    await seed(Skill, [
        { name: 'NodeJS', category: 'Other', proficiency: 90 },
        { name: 'Figma', category: 'Tools', source: 'manual' },
        { name: 'jQuery', category: 'Frontend', source: 'resume' },
    ]);
    await seed(Experience, [{ company: 'Old Co', role: 'Old role' }]);
});

const parsed = {
    summary: '  I build backends.  ',
    experience: [
        { company: 'Bizcompass', role: 'Backend Intern', place: 'Surat', start: 'Sep 2025', end: 'Feb 2026', summary: 's', points: ['a', 'a', 'b'], tags: ['Node.js', 'AWS', 'Mongo', 'x', 'y', 'z'] },
        { company: '', role: 'No company', place: '', start: '', end: '', summary: '', points: [], tags: [] },
    ],
    projects: [
        { title: 'Geo Jobs', description: 'Jobs on a map.', details: 'Scrapes twice a day.', techStack: ['Node.js', 'Redis'], githubUrl: 'https://github.com/me/geo-jobs/', liveUrl: 'not a url', category: 'Full-Stack' },
        { title: 'FormsFlow', description: 'Form backend.', details: '', techStack: ['Express'], githubUrl: '', liveUrl: 'https://forms.example.com', category: 'Full-Stack' },
    ],
    skills: [
        { name: 'Node.js', category: 'Backend' },
        { name: 'PostgreSQL', category: 'Database' },
        { name: 'node js', category: 'Backend' },
    ],
};

test('keys treat spelling variants as the same thing', () => {
    assert.equal(skillKey('Node.js'), skillKey('NodeJS'));
    assert.equal(skillKey('Express.js'), skillKey('Express'));
    assert.notEqual(skillKey('C'), skillKey('C++'));
    assert.equal(repoKey('https://github.com/me/geo-jobs/'), repoKey('http://www.github.com/me/geo-jobs.git'));
});

test('projects: matched ones update, new ones are added, stale synced ones go, manual ones stay', async () => {
    const result = await applyResume(parsed);
    const rows = await Project.find();
    const titles = rows.map((p) => p.title).sort();
    assert.deepEqual(titles, ['FormsFlow', 'GeoJobs', 'Hand-made demo']);

    const geo = rows.find((p) => p.title === 'GeoJobs');
    assert.equal(geo.description, 'Jobs on a map.');
    assert.equal(geo.longDescription, 'Scrapes twice a day.');
    assert.deepEqual([...geo.techStack], ['Node.js', 'Redis']);
    assert.equal(geo.source, 'resume');
    assert.equal(geo.imageUrl, 'geo.png', 'fields the résumé has no say over are kept');
    assert.equal(geo.featured, true);
    assert.equal(geo.liveUrl, '', 'a non-URL is ignored');

    assert.equal(rows.find((p) => p.title === 'Hand-made demo').source, 'manual');
    assert.equal(result.projects.count, 2);
    assert.equal(result.projects.removed, 1);
});

test('skills: merged by name, de-duplicated, stale synced ones removed, manual ones kept', async () => {
    await applyResume(parsed);
    const rows = await Skill.find();
    assert.deepEqual(rows.map((s) => s.name).sort(), ['Figma', 'NodeJS', 'PostgreSQL']);
    const node = rows.find((s) => s.name === 'NodeJS');
    assert.equal(node.category, 'Backend');
    assert.equal(node.proficiency, 90);
    assert.equal(node.source, 'resume');
});

test('experience is replaced and cleaned', async () => {
    const result = await applyResume(parsed);
    const rows = await Experience.find();
    assert.equal(rows.length, 1);
    assert.equal(rows[0].company, 'Bizcompass');
    assert.deepEqual([...rows[0].points], ['a', 'b']);
    assert.equal(rows[0].tags.length, 5);
    assert.equal(result.summary, 'I build backends.');
});

test('an empty section leaves the site as it was', async () => {
    const result = await applyResume({ summary: '', experience: [], projects: [], skills: [] });
    assert.equal((await Project.find()).length, 3);
    assert.equal((await Skill.find()).length, 3);
    assert.equal((await Experience.find()).length, 1);
    assert.ok(result.projects.skipped && result.skills.skipped && result.experience.skipped);
});

test.after(() => mongoose.disconnect());
